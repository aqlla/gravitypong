import { Take } from "./util"; 
import { FixedArray } from "fixed-array";

const VectorComponentLabels = ["x", "y", "z", "w"] as const

declare function getComponents(): readonly ["x", "y", "z", "w"]

/**
 * Represents permissible object keys in TypeScript: `string`, `number`, or `symbol`.
 */
type TKey = string | number | symbol;

/**
 * A readonly version of a TypeScript `Record` with key `K` and type `T`.
 */
type ReadonlyRecord<K extends TKey, T> = Readonly<Record<K, T>>;

/**
 * Splits an array or tuple type `Source` into two parts: the first `N` elements and the rest.
 * Uses recursion with an accumulator to collect elements until the specified number `N` is reached.
 * 
 * @typeParam Source - The source array or tuple type to split.
 * @typeParam N - The number of elements to take for the first part of the split.
 * @typeParam Accumulator - An internal accumulator for recursion; users should not provide this.
 * @returns A tuple of `[Accumulator, Source]`, where `Accumulator` contains the first `N` elements, and `Source` is the rest.
 */
type Split<Source, N extends number, Accumulator extends readonly any[] = readonly []> 
    = Accumulator['length'] extends N 
        ? [Accumulator, Source] 
        : Source extends readonly [infer First, ...infer Rest] 
            ? Split<readonly [...Rest], N, readonly [...Accumulator, First]> 
            : [Accumulator, Source];

/**
 * Extracts the first `N` elements from an array or tuple type `T`.
 * 
 * @typeParam T - The source array or tuple type.
 * @typeParam N - The number of elements to take.
 * @returns The first `N` elements of `T`.
 */
type Take<T extends readonly any[], N extends number> 
    = Split<T, N>[0];

/**
 * Drops the first `N` elements from an array or tuple type `T`, returning the rest.
 * 
 * @typeParam T - The source array or tuple type.
 * @typeParam N - The number of elements to drop.
 * @returns The remainder of `T` after dropping the first `N` elements.
 */
type Drop<T extends readonly any[], N extends number> 
    = Split<T, N>[1];

/**
 * Generates a tuple type of labels for N-dimensional vector components, limited to dimensions "x", "y", "z", "w".
 * 
 * @typeParam N - The dimension number, determining how many labels to generate.
 * @returns A tuple of labels corresponding to the dimensions of the vector.
 */
type NDimVectorComponentLabels<N extends number> 
    = Take<readonly ["x", "y", "z", "w"], N>;

/**
 * Maps the labels for an N-dimensional vector's components to numeric values, creating a readonly structure.
 * 
 * @typeParam N - The dimension of the vector, which dictates the component labels used.
 * @returns A readonly record mapping each component label to a number.
 */
type NDimVectorComponents<N extends number> 
    = ReadonlyRecord<NDimVectorComponentLabels<N>[number], number>;


type NV2 = NDimVectorComponents<2>

/**
 * Represents an N-dimensional vector with type-safe component management.
 * Allows for the creation and manipulation of vectors with a predefined number of dimensions.
 * 
 * @typeParam NDim - The dimension of the vector, influencing the available component labels.
 */
class NDimVector<NDim extends number> {
    /**
     * Stores the vector's components in a readonly record to prevent modification.
     * @private
     */
    private readonly _components: Readonly<NDimVectorComponents<NDim>>;

    /**
     * Initializes a new instance of an N-dimensional vector with the specified components.
     * Components are deeply frozen to ensure immutability.
     * 
     * @param components - The components of the vector.
     */
    constructor(components: NDimVectorComponents<NDim>) {
        this._components = Object.freeze(components);
        Object.defineProperties(this, Object.getOwnPropertyDescriptors(this._components));
    }

    /**
     * Provides read-only access to the vector's components.
     * 
     * @returns The components of the vector as a readonly record.
     */
    public get components(): Readonly<NDimVectorComponents<NDim>> {
        return this._components;
    }

    /**
     * A factory method for creating instances of `NDimVector` with the specified components.
     * Ensures type safety and immutability of the vector components.
     * 
     * @typeParam N - The dimension number of the vector to create.
     * @param components - The components of the N-dimensional vector.
     * @returns An instance of `NDimVector` with the specified components, casted to the appropriate dimension and component structure.
     */
    public static make<N extends number>(components: NDimVectorComponents<N>): 
            InstanceType<typeof NDimVector<N>> & NDimVectorComponents<N> {
        return new NDimVector<N>(components) as NDimVectorComponents<N> & InstanceType<typeof NDimVector<N>>;
    } 
}


let d2 = NDimVector.make<2>({x: 1, y: 2})


