
export function scale(value: number, max: number, min: number): number {
    return (value * (max - min)) + min;
}

export function clamp(n: number, min: number = Number.EPSILON * 10): number {
    return Math.max(n, min);
}


export type Length<T extends any[]> =
    T extends { length: infer L } ? L : never

export type BuildTuple<L extends number, T extends any[] = []> =
    T extends { length: L } ? T : BuildTuple<L, [...T, any]>

export type Add<A extends number, B extends number> =
    Length<[...BuildTuple<A>, ...BuildTuple<B>]>

export type Subtract<A extends number, B extends number> =
    BuildTuple<A> extends [...(infer U), ...BuildTuple<B>] 
        ? Length<U>
        : never

export type TupleSplit<Source, N extends number, Accumulator extends readonly any[] = readonly []> =
    Accumulator['length'] extends N 
        ? [Accumulator, Source] 
        : Source extends readonly [infer First, ...infer Rest] 
            ? TupleSplit<readonly [...Rest], N, readonly [...Accumulator, First]> 
            : [Accumulator, Source]

export type Take<T extends readonly any[], N extends number> =
    TupleSplit<T, N>[0]

export type Drop<T extends readonly any[], N extends number> =
    TupleSplit<T, N>[1]

export function take<T extends readonly any[], N extends number>(arr: readonly [...T], end: N) {
    return arr.slice(0, end) as readonly any[] as Take<T, N>;
}



export type Either<T1, T2> = [T1 | null, T2 | null]

export type Result<T, E> = Either<T, E>

export const Err = <E extends Error>(error: E): Result<null, E> => [null, error]
export const Ok = <T>(result: T | null): Result<T, null> => [result, null]

export const isErr = <T, E>(result: Result<T, E>): result is [null, E] => 
    result[0] === null && result[1] !== null

export const isOk = <T, E>(result: Result<T, E>): result is [T, null] => 
    result[0] !== null && result[1] === null





export type TODO = any

const raise = (msg: string): never => {
    throw new Error(msg);
}


export interface Configurable {
    readonly config: { [key: string]: unknown }
}



