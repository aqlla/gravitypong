import { GameLoopBase } from "./gameloop.js";
import { Vec2 } from "./vector.js";
import { clamp } from "./util.js";


function scale(value: number, max: number, min: number): number {
    return (value * (max - min)) + min;
}

type CollisionPair = {
    b1: IBody,
    b2: IBody
}

function updateAcceleration1(bodies: IBody[]) {
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

function bodysInCollisionsList(collisions: CollisionPair[], body1, body2): boolean {
    let found = false;
    for (const { b1, b2 } of collisions) {
        if (found) break;
        found = b1.id === body1.id || b2.id === body1.id || b1.id === body2.id || b2.id === body2.id;
    }
    return found
}

function updateAcceleration2(bodies: BodyList) {
    const DISTANCE_SCALE = 50000;
    const DISTANCE_MIN = 1;

    const collisions: CollisionPair[] = []; 
    const bodiesArr = Array.from(bodies);

    for (const [ i, bod1 ] of bodiesArr.entries()) {
        for (let j = i + 1; j < bodiesArr.length; j++) {
            const b1 = bod1[1];
            const b2 = bodiesArr[j][1];
            
            // calculate distance scalar and acc delta factor
            const r: Vec2 = b2.pos.sub(b1.pos);
            const distanceSquared = r.magnitudeSquared;
            const distance = Math.sqrt(distanceSquared) * DISTANCE_SCALE;
            // console.log(distance)
            
            if (distance < (b1.r + b2.r) * 4000 && !bodysInCollisionsList(collisions, b1, b2)) {
                // collide
                b1.acc = Vec2.zero;
                b2.acc = Vec2.zero;
                collisions.push({ b1, b2 });
            } else {
                const accFactor = r.div(clamp(distanceSquared) * distance);

                // get acceleration delta for each body
                const dAcc1 = accFactor.mul(b2.m);
                const dAcc2 = accFactor.mul(b1.m)
    
                b1.acc = b1.acc.add(dAcc1);
                b2.acc = b2.acc.sub(dAcc2);
            }
        }
    }

    for (const { b1, b2 } of collisions) {
        const stat = b1.static || b2.static;

        const newBody = new DynamicBody({
            m: b1.m + b2.m,
            pos: stat? Vec2.zero : (b1.m > b2.m ? b1.pos : b2.pos), //Vec2.mid(b1.pos, b2.pos),
            vel: stat? Vec2.zero : DynamicBody.collisionMomentum(b1, b2),
            static: stat
        });

        // console.log("Collision:");
        // console.log("old:");
        // console.log([b1, b2]);
        // console.log("new:");
        // console.log(newBody);
        

        bodies.delete(b1.id);
        bodies.delete(b2.id);
        bodies.set(newBody.id, newBody);
    }
}

interface IBody {
    m: number;
    r: number;
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;
    readonly id: number,
    readonly static: boolean
    // readonly momentum: Vec2,
}

type DynamicBodyCtorArgs = {
    m?: number,
    r?: number,
    pos: Vec2,
    vel?: Vec2,
    acc?: Vec2,
    static?: boolean
}

export class DynamicBody implements IBody {
    m: number;
    r: number;
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;
    static: boolean;

    private static idIncrementor = 1; 
    public id: number = 0;
    
    constructor(args: DynamicBodyCtorArgs) {
        this.m = args.m ?? DynamicBody.getRandomMass();
        this.r = args.r ?? DynamicBody.getRadiusFromMass(this.m);
        this.vel = args.vel ?? Vec2.zero;
        this.acc = args.acc ?? Vec2.zero;
        this.pos = args.pos;
        this.static = args.static ?? false;

        this.id = DynamicBody.idIncrementor++;

        console.log({
            'id': this.id,
            'm': this.m,
            'r': this.r,
            // 'p': this.pos.toString(),
            // 'v': this.vel.toString(),
            // 'a': this.acc.toString()
        })
    }

    public static collisionMomentum(b1: IBody, b2: IBody): Vec2 {
        const mSum = b1.m + b2.m;
        // const vx = (b1.m * b1.vel.x + b2.m * b2.vel.x) / mSum;
        // const vy = (b1.m * b1.vel.y + b2.m * b2.vel.y) / mSum;
        const momentum1 = b1.vel.mul(b1.m / mSum);
        const momentum2 = b2.vel.mul(b2.m / mSum);

        return momentum1.add(momentum2);
    }

    public static getRadiusFromMass(mass: number, scaled: boolean = true): number {
        // just volume formula
        const raw_radius = Math.cbrt((3 * mass) / (4 * Math.PI));

        if (scaled) {
            return raw_radius * (DynamicBody.max_radius / DynamicBody.raw_max_radius)
        } else {
            return raw_radius;
        }
    }

    public static getRandomMass(max = DynamicBody.max_mass, min = DynamicBody.min_mass): number {
        const uniform = Math.random();
        const beta_left = (uniform < 0.5) ? 2*uniform : 2*(1-uniform);
        return scale(beta_left, max, min);
    }

    // 100.000.000x 
    public static get max_mass(): number {
        return 500000000;
    }

    public static get min_mass(): number {
        return 1;
    }

    public static get max_radius(): number {
        return 24;
    }

    public static get min_radius(): number {
        return 8;
    }

    public static get raw_max_radius(): number {
        return DynamicBody.getRadiusFromMass(DynamicBody.max_mass, false);
    }

    // public get momentum(): Vec2 {
    //     return Vec2(...[this.m * ])
    // }

    public integrate(dt: number) {
        if (this.static) {
            this.pos = Vec2.zero;
            this.vel = Vec2.zero;
        } else {
            this.pos.add(this.vel.mul(dt), true);
            this.vel.add(this.acc.mul(dt), true);       
        }
        
        this.acc = Vec2.zero;
    }
} 

type BodyList = Map<number, DynamicBody>;

export class Simulation extends GameLoopBase {
    private static instance: Simulation;
    private bodies: BodyList = new Map<number, DynamicBody>();

    private constructor() { 
        super({ timeStep: 0.05 });
    }

    public static getInstance(n: number): Simulation {
        if (!Simulation.instance) {
            Simulation.instance = new Simulation();

            // Sun
            Simulation.instance.addBody(new DynamicBody({
                m: DynamicBody.max_mass * 5000,
                pos: new Vec2(0, 0),
            }));

            for (let i = 0; i < n; i++) {
                const pos = Simulation.getRandomPos();
                const distanceFromOrigin = pos.magnitudeSquared;

                const body = new DynamicBody({ 
                    pos: pos,
                    vel: new Vec2(pos.y / distanceFromOrigin * 500000, -pos.x / distanceFromOrigin * 500000),
                })

                Simulation.instance.addBody(body);
            }
        }

        return Simulation.instance;
    }

    public get drawables(): BodyList {
        return this.bodies;
    }

    // 100.000.000x 
    public static get max_pos(): number {
        return 800;
    }

    public static get min_pos(): number {
        return -800;
    }

    public static getRandomPos(max = Simulation.max_pos, min = Simulation.min_pos): Vec2 {
        let x = scale(Math.random(), max, min);
        let y = scale(Math.random(), max, min);

        if (x < 0) {
            x -= 500;
        } else {
            x += 4000;
        }

        if (y < 0) {
            y -= 3000;
        } else {
            y += 4500;
        }

        return new Vec2(x, y);
    }

    public addBody(body: DynamicBody) {
        this.bodies.set(body.id, body);
    }

    public update() {
        updateAcceleration2(this.bodies);
        this.updateDerivatives();
    }

    public updateDerivatives() {
        for (const b of this.bodies.values()) {
            b.integrate(this.timeStepSec);
        }
    }

    public get bodyCount(): number {
        return this.bodies.size;
    }

}
