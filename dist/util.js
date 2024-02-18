export function maxOf(...ns) {
    return Math.max(...ns);
}
export function clamp(n, min = Number.EPSILON) {
    return maxOf(n, min);
}
