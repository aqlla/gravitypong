function maxOf(...ns) {
    return Math.max(...ns);
}
function clamp(n, min = Number.EPSILON) {
    return maxOf(n, min);
}
export class Vec2 {
    constructor(x, y) {
        this.components = [x, y];
    }
    get x() {
        return this.components[0];
    }
    set x(val) {
        this.components[0] = val;
    }
    get y() {
        return this.components[1];
    }
    set y(val) {
        this.components[1] = val;
    }
    // I dont know how to deal with state change and side effects anymore... imperative philosophy is kinda icky
    applyArithmetic(fn, other, update = false) {
        const components = fn(this, other);
        if (update) {
            [this.x, this.y] = components;
            return this;
        }
        else {
            return new Vec2(...components);
        }
    }
    add(other, update = false) {
        const fn = (l, r) => [l.x + r.x, l.y + r.y];
        return this.applyArithmetic(fn, other, update);
    }
    sub(other, update = false) {
        const fn = (l, r) => [l.x - r.x, l.y - r.y];
        return this.applyArithmetic(fn, other, update);
    }
    mul(other, update = false) {
        const fn = (l, r) => [l.x * r, l.y * r];
        return this.applyArithmetic(fn, other, update);
    }
    div(other, update = false) {
        const fn = (l, r) => [l.x / r, l.y / r];
        return this.applyArithmetic(fn, other, update);
    }
    cross(other) {
        return this.x * other.y - this.y * other.x;
    }
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
    eq(other) {
        return this.x == other.x && this.y == other.y;
    }
    get magnitudeSquared() {
        return this.x ** 2 + this.y ** 2;
    }
    get magnitude() {
        return Math.sqrt(this.magnitudeSquared);
    }
    static get zero() {
        return new Vec2(0, 0);
    }
}
export class DynamicBody {
    constructor(m, r, pos = Vec2.zero, vel = Vec2.zero) {
        this.m = m;
        this.radius = r;
        this.pos = pos;
        this.vel = vel;
        this.acc = Vec2.zero;
    }
    integrate(dt) {
        this.pos.add(this.vel.mul(dt), true);
        this.vel.add(this.acc.mul(dt), true);
        this.acc = Vec2.zero;
        console.log([this.pos.x, this.pos.y]);
    }
}
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
export class Simulation {
    constructor() {
        this.bodies = [];
        this.timeStepSec = 0.0001;
        this.startTime = Date.now();
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
    run() {
        setInterval(this.update, this.timeStepSec * 1000);
    }
    update() {
        updateAcceleration2(this.bodies);
    }
    updateDerivatives() {
        for (const b of this.bodies)
            b.integrate(this.timeStepSec);
    }
    get bodyCount() {
        return this.bodies.length;
    }
    get elapsedMs() {
        return Date.now() - this.startTime;
    }
}
