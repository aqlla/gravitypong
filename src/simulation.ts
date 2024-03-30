import { SimLoop } from "./gameloop.js";
import { Vec2 } from "./vector.js";
import { clamp, scale } from "./util.js";
import { MassiveBody, IBody } from "./body.js";
import { Drawable, MakeDrawable, Shape, injectDrawable } from "ui-adapter.js";


class SerialMap<TVal = IBody> extends Map<number, TVal> {
    private _keys: number[] = [];

    public nextKey(currentKey: number): number {
        let cursor: number = currentKey;
        while (!this.has(++cursor));
        return cursor;
    }

    public set(k: number, v: TVal): this {
        this._keys.push(k);
        return super.set(k, v);
    }

    public delete(k: number): boolean {
        if (k === this._keys[this._keys.length - 1])
            this._keys.pop();
        else {
            const index = this._keys.indexOf(k);
            this._keys.splice(index, 1);
        }
        return super.delete(k);
    }
}

function getCollisionWith(collisions: IBody[][], b1: IBody, b2: IBody): IBody[] | null {
    for (const c of collisions) {
        for (const b of c) {
            if (b.eq(b1) || b.eq(b2)) {
                return c;
            }
        }
    }
    return null;
}


type BodyList = Map<number, MassiveBody>;

type InitialConditions = {
    scenerio?: string
    scenerioOptions?: any
}

type SimulationArgs = {
    n: number
    sun?: boolean
    initVelocity?: number
}

function bindOutput(elementId: string) {
    const el: HTMLElement | null = document.getElementById(elementId);
    function _wrapper(target: any, _context: any) {
        function _decorated(this: any, ...args: any[]) {
            const result = target.call(this, ...args);
            if (el) {
                el.innerText = result.toString();
            }
        }
    }
}

export class Simulation extends SimLoop {
    private static _instance: Simulation;
    private bodies: BodyList = new Map<number, MassiveBody>();
    private framerate: number = 0;

    private constructor(args: SimulationArgs) { 
        super({ timeStep: 0.01 });

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
                vel: new Vec2(
                    pos.y  / distanceFromOrigin * 300000, 
                    -pos.x / distanceFromOrigin * 300000),
            })

            this.addBody(body);
        }
    }

    public static instance(args: SimulationArgs): Simulation {
        if (!Simulation._instance)
            Simulation._instance = new Simulation(args);
        return Simulation._instance;
    }

    public update() {
        const startMs = Date.now();
        this.updateAcceleration2(this.bodies);
        const elapsedMs = Date.now() - startMs;
        this.framerate = 1000 / elapsedMs;
        this.updateDerivatives();
    }

    private updateDerivatives() {
        for (const b of this.bodies.values()) {
            b.integrate(this.timeStepSec);
        }
    }
    
    public updateAcceleration2(bodies: BodyList) {
        const DISTANCE_SCALE = 6500;
        const DISTANCE_MIN = 1;
    
        const collisions: IBody[][] = []; 
        const collidedIds: number[] = [];
    
        const bodyKeys = Array.from(bodies.keys());
    
    
        for (const [i, k] of bodyKeys.entries()) {
            const b1 = bodies.get(k)!
            
            for (let j = i + 1; j < bodyKeys.length; j++) {
                const k2 = bodyKeys[j]
                const b2 = bodies.get(k2)
    
                if (!b2) continue
                
                // calculate distance scalar and acc delta factor
                const r: Vec2 = b2.pos.sub(b1.pos)
                const distance = r.magnitude * DISTANCE_SCALE
                const distanceSquared = r.magnitudeSquared
                
                if (distance < (b1.r + b2.r) * 400) {
    
                    // collide 
                    // b1.acc = Vec2.zero;
                    // b2.acc = Vec2.zero;
                    const coll = getCollisionWith(collisions, b1, b2)
                    collidedIds.push(b1.id, b2.id)
    
                    if (coll !== null) {
                        if (coll.includes(b1)) {
                            coll.push(b2)
                        } else if (coll.includes(b2)) {
                            coll.push(b1)
                        } else {
                            console.log("wut")
                        }
                    } else {
                        collisions.push([b1, b2])
                    }
                } else {
                    // (m2 / mag^3) * r   || (r / mag^3) * m2
                    //  (16 / 8) * 32     ||  (32 / 8) * 16
                    //      64            ||       64
                    const accFactor = r.div(distanceSquared * distance) //.add(r.div(distanceSquared * distanceSquared));
    
                    // get acceleration delta for each body
                    if (!b1.isStatic) {
                        const dAcc1 = accFactor.mul(b2.m)
                        b1.acc.add(dAcc1, true)
                    }
    
                    if (!b2.isStatic) {
                        const dAcc2 = accFactor.mul(b1.m)
                        b2.acc.sub(dAcc2, true)
                    }
                }
            }
        }
    
        if (collisions.length) {
            // console.log(`${collisions.length} collisions`);
            // console.log(collisions)
            // console.log(bodies.size)
            this.handleCollisions(collisions, bodies)
        }
    }
    
    private centerOfMass(bodies: IBody[]): Vec2 {
        const [b1, ...bs] = [...bodies];

        if (b1 === undefined) {
            return Vec2.zero
        } else if (bs.length === 0) {
            return b1.pos
        } else {
            let mass = b1.m
            const moment = b1.pos.mul(mass)

            for (const b of bs) {
                mass += b.m
                moment.add(b.pos.mul(b.m), true)
            }

            return moment.div(mass)
        }
    }
    
    private handleCollisions(collisionLists: IBody[][], bodies: BodyList) {
        for (const coll of collisionLists) {
            // check if any are static
            const staticBody = coll.find(b => b.isStatic)
            const isStatic = staticBody !== undefined
            const mass = coll.reduce((acc, b) => acc + b.m, 0)
    
            const newBody = new MassiveBody({
                m: mass,
                pos: isStatic? Vec2.zero : this.centerOfMass(coll),
                vel: isStatic? Vec2.zero : MassiveBody.nCollisionMomentum(coll),
                isStatic: isStatic
            });
    
            for (const b of coll)
                bodies.delete(b.id)
            bodies.set(newBody.id, newBody);
        }
    }

    public static getRandomPos(max = Simulation.max_pos, min = Simulation.min_pos): Vec2 {
        let x = scale(Math.random(), max, min);
        let y = scale(Math.random(), max, min);

        if (x < 0) {
            x -= 500;
        } else {
            x += 2000;
        }

        if (y < 0) {
            y -= 2500;
        } else {
            y += 500;
        }

        return new Vec2(x, y);
    }

    public addBody(body: MassiveBody) {
        this.bodies.set(body.id, body);
    }

    public get bodyCount(): number {
        return this.bodies.size;
    }

    public get drawables(): Drawable[] {
        return Array.from(this.bodies.values()).map(injectDrawable(Shape.Circle, '#666666'));
    }

    // 100.000.000x 
    public static get max_pos(): number {
        return 2000;
    }

    public static get min_pos(): number {
        return -2000;
    }

}


