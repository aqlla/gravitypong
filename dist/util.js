export function scale(value, max, min) {
    return (value * (max - min)) + min;
}
export function clamp(n, min = Number.EPSILON * 10) {
    return Math.max(n, min);
}
export const Err = (error) => [null, error];
export const Ok = (result) => [result, null];
export const isErr = (result) => result[0] === null && result[1] !== null;
export const isOk = (result) => result[0] !== null && result[1] === null;
