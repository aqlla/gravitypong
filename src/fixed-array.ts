type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift' | number

export type FixedArray<T, N extends number, TArray extends readonly T[] = [T, ...Array<T>]> 
    = Pick<TArray, Exclude<keyof TArray, ArrayLengthMutationKeys>>
    & {
        readonly length: N
        [I: number]: T
        [Symbol.iterator]: () => IterableIterator<T>
    }


