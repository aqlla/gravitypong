const VectorComponentLabels = ["x", "y", "z", "w"];
class NDimVector {
    _components;
    constructor(components) {
        this._components = Object.freeze(components);
        Object.defineProperties(this, Object.getOwnPropertyDescriptors(this.components));
    }
    get components() {
        return this._components;
    }
    static make(components) {
        return new NDimVector(components);
    }
}
let d2 = NDimVector.make({ x: 1, y: 2 });
export {};
