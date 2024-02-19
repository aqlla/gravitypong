import { GameLoopBase } from "./gameloop.js";
import { Vec2 } from "./vector.js";
import { clamp } from "./util.js";

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

function updateAcceleration2(bodies: IBody[]) {
    for (const [i, b1] of bodies.entries()) {
        for (let j = i + 1; j < bodies.length; j++) {
            const b2 = bodies[j];

            // calculate distance scalar and acc delta factor
            const r: Vec2 = b2.pos.sub(b1.pos);
            const magSq = r.magnitudeSquared;
            const mag = Math.sqrt(magSq);
            const accFactor = r.div(clamp(magSq) * mag);

            // get acceleration delta for each body
            const dAcc1 = accFactor.mul(b2.m);
            const dAcc2 = accFactor.mul(b1.m)

            b1.acc = b1.acc.add(dAcc1);
            b2.acc = b2.acc.sub(dAcc2);
        }
    }
}

interface IBody {
    m: number;
    r: number;
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;
}

function scale(value: number, max: number, min: number): number {
    return (value * (max - min)) + min;
}

type DynamicBodyCtorArgs = {
    m?: number,
    r?: number,
    pos: Vec2,
    vel?: Vec2,
    acc?: Vec2,
}

export class DynamicBody implements IBody {
    m: number;
    r: number;
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;
    
    constructor(args: DynamicBodyCtorArgs) {
        this.m = args.m ?? DynamicBody.getRandomMass();
        this.r = args.r ?? DynamicBody.getRadiusFromMass(this.m);
        this.vel = args.vel ?? Vec2.zero;
        this.acc = args.acc ?? Vec2.zero;
        this.pos = args.pos;

        console.log();
        console.log('----------------------------------------')
        console.log({
            'm': this.m,
            'r': this.r,
            'p': this.pos.toString(),
            'v': this.vel.toString(),
            'a': this.acc.toString()
        })
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
        return scale(Math.random(), max, min);
    }

    // 100.000.000x 
    public static get max_mass(): number {
        return 100000000;
    }

    public static get min_mass(): number {
        return 1;
    }

    public static get max_radius(): number {
        return 100;
    }

    public static get min_radius(): number {
        return 1;
    }

    public static get raw_max_radius(): number {
        return DynamicBody.getRadiusFromMass(DynamicBody.max_mass, false);
    }

    public integrate(dt: number) {
        this.pos.add(this.vel.mul(dt), true);
        this.vel.add(this.acc.mul(dt), true);
        this.acc = Vec2.zero;
    }
}

export class Simulation extends GameLoopBase {
    private static instance: Simulation;
    private bodies: DynamicBody[] = [];

    private constructor() { 
        super({ timeStep: 0.1 });
    }

    public static getInstance(n: number): Simulation {
        if (!Simulation.instance) {
            Simulation.instance = new Simulation();

            for (let i = 0; i < n; i++) {
                const body = new DynamicBody({ 
                    pos: Simulation.getRandomPos() 
                })

                Simulation.instance.addBody(body);
            }
        }

        return Simulation.instance;
    }

    public get drawables(): any[] {
        return this.bodies;
    }

    // 100.000.000x 
    public static get max_pos(): number {
        return 1000;
    }

    public static get min_pos(): number {
        return -1000;
    }

    public static getRandomPos(max = Simulation.max_pos, min = Simulation.min_pos): Vec2 {
        return new Vec2(scale(Math.random(), max, min), scale(Math.random(), max, min));
    }

    public addBody(body: DynamicBody) {
        this.bodies.push(body);
    }

    public update() {
        updateAcceleration2(this.bodies);
        this.updateDerivatives();
    }

    public updateDerivatives() {
        for (const b of this.bodies)
            b.integrate(this.timeStepSec);
    }

    public get bodyCount(): number {
        return this.bodies.length;
    }

}