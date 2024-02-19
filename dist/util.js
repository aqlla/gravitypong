export function maxOf(...ns) {
    return Math.max(...ns);
}
export function clamp(n, min = Number.EPSILON * 10) {
    return maxOf(n, min);
}
