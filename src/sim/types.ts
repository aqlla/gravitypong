import { Tuple } from "../utils/types.js"
import { Dim } from "../vectors/ndim/types.js"
import { Positional } from "./kinetic-body.js"


export type Boundaries<NDim extends Dim> = {
    min: Tuple<NDim>
    max: Tuple<NDim>
}

interface IntervalProcessLoop {
    start(): void
    pause(): void
}

export interface GameLoop extends IntervalProcessLoop {
    update(): void
    entities(): IterableIterator<Positional<Dim>>
}

export interface PhysicsLoop {
    canStart: [boolean, string]
    updatePhysics(dt?: number): void
}


export type SimLoopArgs = {
    timeStepSeconds: number
}