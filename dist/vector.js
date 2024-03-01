import { Vec2GenericBase } from "./vector_generic.js";
export class Vec2 extends Vec2GenericBase {
    constructor() {
        super(...arguments);
        this._mag = 0;
        this._magSquared = 0;
    }
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
    static mid(lhs, rhs) {
        return new Vec2(...[(lhs.x + rhs.x) / 2, (lhs.y + rhs.y) / 2]);
    }
    cross(other) {
        return this.x * other.y - this.y * other.x;
    }
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
    get unit() {
        return this.div(this.magnitude);
    }
    get theta() {
        return Math.atan2(this.y, this.x);
    }
    get magnitudeSquared() {
        if (this._magSquared === 0)
            this._magSquared = (this.x ** 2 + this.y ** 2);
        return this._magSquared;
    }
    get magnitude() {
        if (this._mag === 0)
            this._mag = Math.sqrt(this.magnitudeSquared);
        return this._mag;
    }
    static get zero() {
        return new Vec2(0, 0);
    }
}
