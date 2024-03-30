export var Shape;
(function (Shape) {
    Shape[Shape["Circle"] = 0] = "Circle";
    Shape[Shape["Square"] = 1] = "Square";
    Shape[Shape["Triangle"] = 2] = "Triangle";
    Shape[Shape["Rectangle"] = 3] = "Rectangle";
})(Shape || (Shape = {}));
export function MakeDrawable(shape, color) {
    return (target) => {
        return class extends target {
            shape;
            color;
            constructor(...args) {
                super(...args);
                this.shape = shape;
                this.color = color;
            }
        };
    };
}
export function injectDrawable(shape, color) {
    return (target) => {
        Object.defineProperties(target, {
            shape: {
                value: shape,
                writable: false,
                configurable: false
            },
            color: {
                value: color,
                writable: false,
                configurable: false
            }
        });
        return target;
    };
}
