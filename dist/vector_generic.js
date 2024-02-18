// export type TVector2 extends Vec2GenericBase<TNum>
export class Vec2GenericBase {
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
    get id() {
        return this;
    }
    // I dont know how to deal with state change and side effects anymore... imperative philosophy is kinda icky
    applyArithmetic(fn, //(lhs: Vec2GenericBase<TNum>, rhs: TOther) => [TNum, TNum], 
    self, other, update = false) {
        const components = fn(self, other);
        if (update) {
            [this.x, this.y] = components;
            return this;
        }
        else {
            return new Vec2GenericBase(...components);
        }
    }
    eq(other) {
        return this.x == other.x && this.y == other.y;
    }
}
