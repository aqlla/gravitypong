"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Simulation = exports.DynamicBody = void 0;
const gameloop_1 = require("./gameloop");
const vector_1 = require("./vector");
const util_1 = require("./util");
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
                const dAcc = r.mul(m2 / ((0, util_1.clamp)(magSq) * mag));
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
            const accFactor = r.div((0, util_1.clamp)(magSq) * mag);
            // get acceleration delta for each body
            const dAcc1 = accFactor.mul(b2.m);
            const dAcc2 = accFactor.mul(b1.m);
            b1.acc = b1.acc.add(dAcc1);
            b2.acc = b2.acc.sub(dAcc2);
        }
    }
}
class DynamicBody {
    constructor(m, r, pos = vector_1.Vec2.zero, vel = vector_1.Vec2.zero) {
        this.m = m;
        this.radius = r;
        this.pos = pos;
        this.vel = vel;
        this.acc = vector_1.Vec2.zero;
    }
    integrate(dt) {
        this.pos.add(this.vel.mul(dt), true);
        this.vel.add(this.acc.mul(dt), true);
        this.acc = vector_1.Vec2.zero;
    }
}
exports.DynamicBody = DynamicBody;
class Simulation extends gameloop_1.GameLoopBase {
    constructor() {
        super({ timeStep: 0.1 });
        this.bodies = [];
    }
    static getInstance() {
        if (!Simulation.instance) {
            Simulation.instance = new Simulation();
        }
        return Simulation.instance;
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
exports.Simulation = Simulation;
