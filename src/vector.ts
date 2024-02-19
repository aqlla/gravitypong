import { Vec2GenericBase, VectorFn, VectorMathOperand } from "./vector_generic.js";

    
export class Vec2 extends Vec2GenericBase<number> {

    public add(other: Vec2, update: boolean = false): Vec2 {
        const fn: VectorFn<Vec2, Vec2>
            = (l, r) => [l.x + r.x, l.y + r.y];
        return this.applyArithmetic(fn, this, other, update);
    }

    public sub(other: Vec2, update: boolean = false): Vec2 {
        const fn: VectorFn<Vec2, Vec2>
            = (l, r) => [l.x - r.x, l.y - r.y];
        return this.applyArithmetic(fn, this, other, update);
    }

    public mul(other: number, update: boolean = false): Vec2 {
        const fn: VectorFn<Vec2, number>
            = (l, r) => [l.x * r, l.y * r];
        return this.applyArithmetic(fn, this, other, update);
    }

    public div(other: number, update: boolean = false): Vec2 {
        const fn: VectorFn<Vec2, number>
            = (l, r) => [l.x / r, l.y / r];
        return this.applyArithmetic(fn, this, other, update);
    }

    public static mid(lhs: Vec2, rhs: Vec2): Vec2 {
        return new Vec2(...[(lhs.x + rhs.x) / 2, (lhs.y + rhs.y) / 2])
    }

    public get theta(): number {
        return Math.atan2(this.y, this.x);
    }

    public cross(other: Vec2): number {
        return this.x * other.y - this.y * other.x
    }

    public dot(other: Vec2): number {
        return this.x * other.x + this.y * other.y
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