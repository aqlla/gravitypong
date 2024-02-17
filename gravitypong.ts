

interface IOrderedPair<TNum extends number = number> {
    x: TNum;
    y: TNum;
}

function maxOf(...ns: number[]): number {
    return Math.max(...ns);
}

function clamp(n: number, min: number = Number.EPSILON): number {
    return maxOf(n, min);
}

type VectorMathOperand = Vec2 | number | [number, number];

type NDimFn<TLhs = VectorMathOperand, TRhs = VectorMathOperand, TReturn = VectorMathOperand> 
    = (lhs: TLhs, rhs: TRhs) => TReturn; 

type VectorFn<TLhs = VectorMathOperand, TRhs = VectorMathOperand> 
    = NDimFn<TLhs, TRhs, [number, number]>;

type ScalarFn<TLhs = VectorMathOperand, TRhs 
    = VectorMathOperand> = NDimFn<TLhs, TRhs, number>;
    
export class Vec2 {
    private components: [number, number];

    constructor(x: number, y: number) {
        this.components = [x, y];
    }

    get x(): number {
        return this.components[0];
    }
    
    private set x(val: number) {
        this.components[0] = val;
    }

    get y(): number {
        return this.components[1];
    }

    private set y(val: number) {
        this.components[1] = val;
    }

    // I dont know how to deal with state change and side effects anymore... imperative philosophy is kinda icky
    private applyArithmetic<TOther = Vec2 | number>(
            fn: (lhs: Vec2, rhs: TOther) => [number, number], 
            other: TOther, 
            update: boolean = false): Vec2 {

        const components = fn(this, other);

        if (update) {
            [this.x, this.y] = components;
            return this;
        } else {
            return new Vec2(...components);
        }
    }

    public add(other: Vec2, update: boolean = false): Vec2 {
        const fn: VectorFn<Vec2, Vec2>
            = (l, r) => [l.x + r.x, l.y + r.y];
        return this.applyArithmetic(fn, other, update);
    }

    public sub(other: Vec2, update: boolean = false): Vec2 {
        const fn: VectorFn<Vec2, Vec2>
            = (l, r) => [l.x - r.x, l.y - r.y];
        return this.applyArithmetic(fn, other, update);
    }

    public mul(other: number, update: boolean = false): Vec2 {
        const fn: VectorFn<Vec2, number>
            = (l, r) => [l.x * r, l.y * r];
        return this.applyArithmetic(fn, other, update);
    }

    public div(other: number, update: boolean = false): Vec2 {
        const fn: VectorFn<Vec2, number>
            = (l, r) => [l.x / r, l.y / r];
        return this.applyArithmetic(fn, other, update);
    }

    public cross(other: Vec2): number {
        return this.x * other.y - this.y * other.x
    }

    public dot(other: Vec2): number {
        return this.x * other.x + this.y * other.y
    }

    public eq(other: Vec2): boolean {
        return this.x == other.x && this.y == other.y;
    }

    get magnitudeSquared(): number {
        return this.x ** 2 + this.y ** 2;
    }

    get magnitude(): number {
        return Math.sqrt(this.magnitudeSquared);
    }

    static get zero(): Vec2 {
        return new Vec2(0, 0);
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

    constructor(m: number, r: number, pos: Vec2 = Vec2.zero, vel: Vec2 = Vec2.zero) {
        this.m = m;
        this.radius = r;
        this.pos = pos;
        this.vel = vel;
        this.acc = Vec2.zero;
    }
    
    public integrate(dt: number) {
        this.pos.add(this.vel.mul(dt), true);
        this.vel.add(this.acc.mul(dt), true);
        this.acc = Vec2.zero;

        console.log([this.pos.x, this.pos.y]);
    }
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

export class Simulation {
    private static instance: Simulation;
    private bodies: DynamicBody[] = [];
    private startTime: number;
    private timeStepSec = 1;

    private constructor() { 
        this.startTime = Date.now();
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

    public run() {
        setInterval(this.update, this.timeStepSec * 1000);
    }

    public update() {
        updateAcceleration2(this.bodies);
    }

    public updateDerivatives() {
        for (const b of this.bodies)
            b.integrate(this.timeStepSec);
    }

    public get bodyCount(): number {
        return this.bodies.length;
    }

    public get elapsedMs(): number {
        return Date.now() - this.startTime;
    }
}