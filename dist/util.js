export function maxOf(...ns) {
    return Math.max(...ns);
}
export function clamp(n, min = Number.EPSILON * 100) {
    return maxOf(n, min);
}
