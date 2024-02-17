export class Vec2 {
    components;
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
