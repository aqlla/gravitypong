import { Vec2GenericBase } from "./vector_generic.js";
export class Vec2 extends Vec2GenericBase {
    add(other, update = false) {
        const fn = (l, r) => [l.x + r.x, l.y + r.y];
        return this.applyArithmetic(fn, this, other, update);
    }
    sub(other, update = false) {
        const fn = (l, r) => [l.x - r.x, l.y - r.y];
        return this.applyArithmetic(fn, this, other, update);
    }
    mul(other, update = false) {
        const fn = (l, r) => [l.x * r, l.y * r];
        return this.applyArithmetic(fn, this, other, update);
    }
    div(other, update = false) {
        const fn = (l, r) => [l.x / r, l.y / r];
        return this.applyArithmetic(fn, this, other, update);
    }
    cross(other) {
        return this.x * other.y - this.y * other.x;
    }
    dot(other) {
        return this.x * other.x + this.y * other.y;
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
    toString() {
        return "[" + this.x + ", " + this.y + "]";
    }
}
