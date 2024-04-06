/**
 * Throws an error with a given message. Used for exceptional cases where normal execution cannot continue.
 *
 * @param msg - The error message.
 * @returns never
 * @throws {Error} Throws an error with the provided message.
 */
const raise = (msg) => {
    throw new Error(msg);
};
export {};
