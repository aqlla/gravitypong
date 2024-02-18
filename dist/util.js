"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clamp = exports.maxOf = void 0;
function maxOf(...ns) {
    return Math.max(...ns);
}
exports.maxOf = maxOf;
function clamp(n, min = Number.EPSILON) {
    return maxOf(n, min);
}
exports.clamp = clamp;
