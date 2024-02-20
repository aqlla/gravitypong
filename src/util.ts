
export function maxOf(...ns: number[]): number {
    return Math.max(...ns);
}

export function clamp(n: number, min: number = Number.EPSILON * 1000): number {
    return maxOf(n, min);
}