
export function maxOf(...ns: number[]): number {
    return Math.max(...ns);
}

export function clamp(n: number, min: number = Number.EPSILON * 10): number {
    return maxOf(n, min);
}