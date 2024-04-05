
/**
 * Throws an error with a given message. Used for exceptional cases where normal execution cannot continue.
 *
 * @param msg - The error message.
 * @returns never
 * @throws {Error} Throws an error with the provided message.
 */
const raise = (msg: string): never => {
    throw new Error(msg);
};

/**
 * Represents an object that can be configured with a set of options.
 */
export interface Configurable {
    readonly config: { [key: string]: unknown };
}

/**
 * Describes an object that has a unique identifier and can be compared for equality.
 *
 * @typeParam T - The type of the identifier.
 */
export interface Identafiable<T> {
    readonly id: T;
    eq(other: Identafiable<T>): boolean;
}

/**
 * Specialization of `Identafiable` for serially numbered identifiers.
 */
export interface SerialIdentifiable extends Identafiable<number> {}
