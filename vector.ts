export interface IOrderedPair<TNum extends number = number> {
    x: TNum;
    y: TNum;
}

export type VectorMathOperand = Vec2 | number | [number, number];

export type NDimFn<TLhs = VectorMathOperand, TRhs = VectorMathOperand, TReturn = VectorMathOperand> 
    = (lhs: TLhs, rhs: TRhs) => TReturn; 

export type VectorFn<TLhs = VectorMathOperand, TRhs = VectorMathOperand> 
    = NDimFn<TLhs, TRhs, [number, number]>;

export type ScalarFn<TLhs = VectorMathOperand, TRhs 
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