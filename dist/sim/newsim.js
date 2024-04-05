import { NDimVector } from "../vectors/ndim/index.js";
import { MassiveBody } from "./kinetic-body.js";
import { SimLoop } from "./gameloop.js";
import { scale } from "../utils/math.js";
import { Vector2 } from "../vectors/vector2.js";
const dimensions = 2;
export class NewSim extends SimLoop {
    bodies = new Map();
    bounds = { min: [0, 0], max: [500, 500] };
    margin = 75;
    creationMargin = 100;
    _oobCount = 0;
    constructor(args) {
        super();
        this.bounds.max = args.bounds;
        this.makeTestBodies(args.n ?? 50);
    }
    get canStart() {
        switch (true) {
            case this.bodies.size < 1:
                return [false, "No bodies, nothing to simulate."];
            default:
                return super.canStart;
        }
    }
    static instance(args) {
        if (!NewSim._instance)
            NewSim._instance = new NewSim(args);
        return NewSim._instance;
    }
    makeTestBodies(n) {
        const maxV = 100;
        const creationBounds = this.getMarginBounds(this.creationMargin);
        for (let i = 0; i < n; i++) {
            this.addBody(new MassiveBody({
                dimensions: dimensions,
                pos: this.getRandomPos(creationBounds.max, creationBounds.min),
                vel: this.getRandomPos([maxV, maxV], [-maxV, -maxV]),
                r: 8
            }));
        }
    }
    getRandomPos(max = this.bounds.max, min = this.bounds.min) {
        const x = scale(Math.random(), max[0], min[0]);
        const y = scale(Math.random(), max[1], min[1]);
        return new NDimVector(x, y);
    }
    updatePhysics(dt) {
        for (const [id, body] of this.bodies.entries()) {
            this.repulsiveBoundaries(body);
            this.separation(body);
            this.cohesion(body);
            this.alignment(body);
            this.speedLimit(body);
        }
        for (const b of this.entities())
            b.integrate(dt);
    }
    // Boids Rules
    separation(body) {
        const separationFactor = 50;
        const visionRange = 50;
        let accumulator = Vector2.zero;
        for (const b of this.entities()) {
            if (b.id !== body.id) {
                const distanceVec = body.pos.sub(b.pos);
                const distance = distanceVec.magnitude;
                if (distance < visionRange) {
                    // accumulator = accumulator.add(b.pos)
                    accumulator = accumulator.add(distanceVec.div(distance));
                }
            }
        }
        const separationForce = accumulator.mul(separationFactor);
        body.vel = body.vel.add(separationForce);
        return body;
    }
    alignment(body) {
        const alignmentFactor = 0.01;
        const visionRange = 200;
        const fov = 270;
        let neighbors = 0;
        let accumulator = Vector2.zero;
        for (const b of this.entities()) {
            if (b.id !== body.id) {
                const distance = b.pos.sub(body.pos).magnitude;
                if (distance < visionRange) {
                    accumulator = accumulator.add(b.vel);
                    neighbors++;
                }
            }
        }
        if (neighbors) {
            const average = accumulator.div(neighbors);
            const aligningForce = average.sub(body.vel).mul(alignmentFactor);
            body.vel = body.vel.add(aligningForce);
        }
        return body;
    }
    cohesion(body) {
        const cohesionFactor = 0.5;
        const visionRange = 250;
        const fov = 270;
        let neighbors = 0;
        let accumulator = Vector2.zero;
        for (const b of this.entities()) {
            if (b.id !== body.id) {
                const distance = b.pos.sub(body.pos).magnitude;
                if (distance < visionRange) {
                    accumulator = accumulator.add(b.pos);
                    neighbors++;
                }
            }
        }
        if (neighbors) {
            const average = accumulator.div(neighbors);
            const centeringForce = average.sub(body.pos).mul(cohesionFactor);
            body.vel = body.vel.add(centeringForce);
        }
        return body;
    }
    // Basic Rules 
    repulsiveBoundaries(body) {
        const turnFactor = 1.5;
        this.forDims(d => {
            if (body.pos[d] < this.margin)
                body.vel[d] += turnFactor;
            else if (body.pos[d] > (this.bounds.max[d] - this.margin))
                body.vel[d] -= turnFactor;
        });
        return body;
    }
    speedLimit(body) {
        const maxSpeed = 120;
        const speed = body.vel.magnitude;
        if (speed > maxSpeed)
            body.vel = body.vel.div(speed).mul(maxSpeed);
        return body;
    }
    wrapWorldBoundaries(body) {
        if (body.pos[0] <= 0) {
            body.pos = new NDimVector(this.bounds.max[0], body.pos[1]);
        }
        else if (body.pos[0] >= this.bounds.max[0]) {
            body.pos = new NDimVector(this.bounds.min[0], body.pos[1]);
        }
        if (body.pos[1] <= 0) {
            body.pos = new NDimVector(body.pos[0], this.bounds.max[1]);
        }
        else if (body.pos[1] >= this.bounds.max[1]) {
            body.pos = new NDimVector(body.pos[0], this.bounds.min[1]);
        }
    }
    forDims(fn) {
        for (let d = 0; d < dimensions; d++) {
            fn(d);
        }
    }
    getMarginBounds(margin) {
        return {
            max: this.bounds.max.map(x => x - this.creationMargin),
            min: this.bounds.min.map(x => x + this.creationMargin)
        };
    }
    isOob(pos) {
        const min = this.bounds.min;
        const max = this.bounds.max;
        for (let i = 0; i < dimensions; i++) {
            if (pos[i] <= min[i] || pos[i] >= max[i]) {
                return true;
            }
        }
        return false;
    }
    *entities() {
        for (const [_, b] of Array.from(this.bodies))
            yield b;
    }
    addBody(body) {
        this.bodies.set(body.id, body);
    }
    get oobCount() {
        return this._oobCount;
    }
}
