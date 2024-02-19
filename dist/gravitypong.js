import { GameLoopBase } from "./gameloop.js";
import { Vec2 } from "./vector.js";
import { clamp } from "./util.js";
function updateAcceleration1(bodies) {
    for (const [i, b1] of bodies.entries()) {
        for (const [j, b2] of bodies.entries()) {
            if (j != i) {
                const p1 = b1.pos;
                const p2 = b2.pos;
                const m2 = b2.m;
                // calculate distance scalar and acceleration delta
                const r = p2.sub(p1);
                const magSq = r.magnitudeSquared;
                const mag = Math.sqrt(magSq);
                const dAcc = r.mul(m2 / (clamp(magSq) * mag));
                b1.acc = b1.acc.add(dAcc);
            }
        }
    }
}
function updateAcceleration2(bodies) {
    for (const [i, b1] of bodies.entries()) {
        for (let j = i + 1; j < bodies.length; j++) {
            const b2 = bodies[j];
            // calculate distance scalar and acc delta factor
            const r = b2.pos.sub(b1.pos);
            const magSq = r.magnitudeSquared;
            const mag = Math.sqrt(magSq);
            const accFactor = r.div(clamp(magSq) * mag);
            // get acceleration delta for each body
            const dAcc1 = accFactor.mul(b2.m);
            const dAcc2 = accFactor.mul(b1.m);
            b1.acc = b1.acc.add(dAcc1);
            b2.acc = b2.acc.sub(dAcc2);
        }
    }
}
function scale(value, max, min) {
    return (value * (max - min)) + min;
}
export class DynamicBody {
    constructor(args) {
        this.m = args.m ?? DynamicBody.getRandomMass();
        this.r = args.r ?? DynamicBody.getRadiusFromMass(this.m);
        this.vel = args.vel ?? Vec2.zero;
        this.acc = args.acc ?? Vec2.zero;
        this.pos = args.pos;
    }
    static getRadiusFromMass(mass) {
        // just volume formula
        return Math.cbrt((3 * mass) / (4 * Math.PI));
    }
    static getRandomMass(max = DynamicBody.max_mass, min = DynamicBody.min_mass) {
        return scale(Math.random(), max, min);
    }
    // 100.000.000x 
    static get max_mass() {
        return 100000000;
    }
    static get min_mass() {
        return 1;
    }
    integrate(dt) {
        this.pos.add(this.vel.mul(dt), true);
        this.vel.add(this.acc.mul(dt), true);
        this.acc = Vec2.zero;
    }
}
export class Simulation extends GameLoopBase {
    constructor() {
        super({ timeStep: 0.1 });
        this.bodies = [];
    }
    static getInstance(n) {
        if (!Simulation.instance) {
            Simulation.instance = new Simulation();
            for (let i = 0; i < n; i++) {
                const body = new DynamicBody({
                    pos: Simulation.getRandomPos()
                });
                Simulation.instance.addBody(body);
            }
        }
        return Simulation.instance;
    }
    get drawables() {
        return this.bodies;
    }
    // 100.000.000x 
    static get max_pos() {
        return 1000;
    }
    static get min_pos() {
        return -1000;
    }
    static getRandomPos(max = Simulation.max_pos, min = Simulation.min_pos) {
        return new Vec2(scale(Math.random(), max, min), scale(Math.random(), max, min));
    }
    addBody(body) {
        this.bodies.push(body);
    }
    update() {
        updateAcceleration2(this.bodies);
        this.updateDerivatives();
    }
    updateDerivatives() {
        for (const b of this.bodies)
            b.integrate(this.timeStepSec);
    }
    get bodyCount() {
        return this.bodies.length;
    }
}
