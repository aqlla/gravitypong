import { GameLoopBase } from "./gameloop.js";
import { Vec2 } from "./vector.js";
import { scale } from "./util.js";
import { MassiveBody } from "./body.js";
class SerialMap extends Map {
    constructor() {
        super(...arguments);
        this._keys = [];
    }
    nextKey(currentKey) {
        let cursor = currentKey;
        while (!this.has(++cursor))
            ;
        return cursor;
    }
    set(k, v) {
        this._keys.push(k);
        return super.set(k, v);
    }
    delete(k) {
        if (k === this._keys[this._keys.length - 1])
            this._keys.pop();
        else {
            const index = this._keys.indexOf(k);
            this._keys.splice(index, 1);
        }
        return super.delete(k);
    }
}
function getCollisionWith(collisions, b1, b2) {
    for (const c of collisions) {
        for (const b of c) {
            if (b.eq(b1) || b.eq(b2)) {
                return c;
            }
        }
    }
    return null;
}
function bindOutput(elementId) {
    const el = document.getElementById(elementId);
    function _wrapper(target, _context) {
        function _decorated(...args) {
            const result = target.call(this, ...args);
            if (el) {
                el.innerText = result.toString();
            }
        }
    }
}
export class Simulation extends GameLoopBase {
    constructor(args) {
        super({ timeStep: 0.01 });
        this.bodies = new Map();
        this.framerate = 0;
        // Sun
        if (args.sun ?? false) {
            this.addBody(new MassiveBody({
                m: MassiveBody.max_mass * 10000,
                pos: new Vec2(0, 0),
                isStatic: true,
            }));
        }
        for (let i = 0; i < args.n; i++) {
            const pos = Simulation.getRandomPos();
            const distanceFromOrigin = pos.magnitudeSquared;
            const body = new MassiveBody({
                pos: pos,
                vel: new Vec2(pos.y / distanceFromOrigin * 300000, -pos.x / distanceFromOrigin * 300000),
            });
            this.addBody(body);
        }
    }
    static getInstance(args) {
        if (!Simulation.instance)
            Simulation.instance = new Simulation(args);
        return Simulation.instance;
    }
    updateAcceleration2(bodies) {
        const DISTANCE_SCALE = 6500;
        const DISTANCE_MIN = 1;
        const collisions = [];
        const collidedIds = [];
        const bodyKeys = Array.from(bodies.keys());
        for (const [i, k] of bodyKeys.entries()) {
            const b1 = bodies.get(k);
            for (let j = i + 1; j < bodyKeys.length; j++) {
                const k2 = bodyKeys[j];
                const b2 = bodies.get(k2);
                if (!b2)
                    continue;
                // calculate distance scalar and acc delta factor
                const r = b2.pos.sub(b1.pos);
                const distance = r.magnitude * DISTANCE_SCALE;
                const distanceSquared = r.magnitudeSquared;
                if (distance < (b1.r + b2.r) * 400) {
                    // collide 
                    // b1.acc = Vec2.zero;
                    // b2.acc = Vec2.zero;
                    const coll = getCollisionWith(collisions, b1, b2);
                    collidedIds.push(b1.id, b2.id);
                    if (coll !== null) {
                        if (coll.includes(b1)) {
                            coll.push(b2);
                        }
                        else if (coll.includes(b2)) {
                            coll.push(b1);
                        }
                        else {
                            console.log("wut");
                        }
                    }
                    else {
                        collisions.push([b1, b2]);
                    }
                }
                else {
                    // (m2 / mag^3) * r   || (r / mag^3) * m2
                    //  (16 / 8) * 32     ||  (32 / 8) * 16
                    //      64            ||       64
                    const accFactor = r.div(distanceSquared * distance); //.add(r.div(distanceSquared * distanceSquared));
                    // get acceleration delta for each body
                    if (!b1.isStatic) {
                        const dAcc1 = accFactor.mul(b2.m);
                        b1.acc.add(dAcc1, true);
                    }
                    if (!b2.isStatic) {
                        const dAcc2 = accFactor.mul(b1.m);
                        b2.acc.sub(dAcc2, true);
                    }
                }
            }
        }
        if (collisions.length) {
            // console.log(`${collisions.length} collisions`);
            // console.log(collisions)
            // console.log(bodies.size)
            this.handleCollisions(collisions, bodies);
        }
    }
    centerOfMass(bodies) {
        const [b1, ...bs] = [...bodies];
        if (b1 === undefined) {
            return Vec2.zero;
        }
        else if (bs.length === 0) {
            return b1.pos;
        }
        else {
            let mass = b1.m;
            const moment = b1.pos.mul(mass);
            for (const b of bs) {
                mass += b.m;
                moment.add(b.pos.mul(b.m), true);
            }
            return moment.div(mass);
        }
    }
    handleCollisions(collisionLists, bodies) {
        for (const coll of collisionLists) {
            // check if any are static
            const staticBody = coll.find(b => b.isStatic);
            const isStatic = staticBody !== undefined;
            const mass = coll.reduce((acc, b) => acc + b.m, 0);
            const newBody = new MassiveBody({
                m: mass,
                pos: isStatic ? Vec2.zero : this.centerOfMass(coll),
                vel: isStatic ? Vec2.zero : MassiveBody.nCollisionMomentum(coll),
                isStatic: isStatic
            });
            for (const b of coll)
                bodies.delete(b.id);
            bodies.set(newBody.id, newBody);
        }
    }
    static getRandomPos(max = Simulation.max_pos, min = Simulation.min_pos) {
        let x = scale(Math.random(), max, min);
        let y = scale(Math.random(), max, min);
        if (x < 0) {
            x -= 500;
        }
        else {
            x += 2000;
        }
        if (y < 0) {
            y -= 2500;
        }
        else {
            y += 500;
        }
        return new Vec2(x, y);
    }
    addBody(body) {
        this.bodies.set(body.id, body);
    }
    update() {
        const startMs = Date.now();
        this.updateAcceleration2(this.bodies);
        const elapsedMs = Date.now() - startMs;
        this.framerate = 1000 / elapsedMs;
        this.updateDerivatives();
    }
    updateDerivatives() {
        for (const b of this.bodies.values()) {
            b.integrate(this.timeStepSec);
        }
    }
    get bodyCount() {
        return this.bodies.size;
    }
    get drawables() {
        return this.bodies;
    }
    // 100.000.000x 
    static get max_pos() {
        return 2000;
    }
    static get min_pos() {
        return -2000;
    }
}
