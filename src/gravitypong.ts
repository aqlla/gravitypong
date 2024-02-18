import { GameLoopBase } from "./gameloop.js";
import { Vec2 } from "./vector.js";
import { clamp } from "./util.js";
import p5 from "p5";

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
    radius: number;
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;
}

export class DynamicBody {
    m: number;
    radius: number;
    pos: Vec2;
    vel: Vec2;
    acc: Vec2;

    private _dbg_step = 0;

    constructor(m: number, r: number, pos: Vec2 = Vec2.zero, vel: Vec2 = Vec2.zero) {
        this.m = m;
        this.radius = r;
        this.pos = pos;
        this.vel = vel;
        this.acc = Vec2.zero;
    }

    private dbg(message: string) {
        if (this._dbg_step++ === 10) {
            console.log(message);
            this._dbg_step = 0;
        }
    }
    
    public integrate(dt: number) {
        this.pos.add(this.vel.mul(dt), true);
        this.vel.add(this.acc.mul(dt), true);
        this.acc = Vec2.zero;

        this.dbg(this.pos.toString());
    }
}

export class Simulation extends GameLoopBase {
    private static instance: Simulation;
    private bodies: DynamicBody[] = [];

    private constructor() { 
        super({ timeStep: 0.1 });
    }

    public static getInstance(): Simulation {
        if (!Simulation.instance) {
            Simulation.instance = new Simulation();
        }

        return Simulation.instance;
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