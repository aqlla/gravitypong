import { TODO, Take } from "../lib/types.js"
import { Configurable } from "../lib/util.js"
import { Boundaries, GameLoop, PhysicsLoop } from "./types.js"
import { Dim, Dims } from "../lib/vectors/ndim/types.js"
import { Positional } from "./kinetic-body.js"


type SimSettings = {
    minTimeoutMs: number

    // to keep a constant time step, for complex simulation that can't be 
    // performed in real time.
    overrideTimeStepMs?: number
}

type BoundedSimSettings<NDim extends Dim> = {
    bounds: Boundaries<NDim>
    margin?: number
}

type KineticSimSettings<NDim extends Dims<3>> = SimSettings & {
    population: number
    dimensions: NDim
}

type SimpleRuleSettings = {
    coefficient: number
    range: number
}

type BoidsSimSettings<NDim extends Dims<3>> = KineticSimSettings<NDim> & BoundedSimSettings<NDim> & {
    speedLimit?: number
    separationFactor?: number
    alignmentFactor?: number
    cohesionFactor?: number
    boundaryRepulsionFactor?: number
}

/**
 * Abstract class for basic game or simulation operation.
 * 
 * Performs the following process loop with a giver interval between iterations:
 * - Listen for & apply input
 * - Run game update
 * - Render frame? - (maybe do this async separately)
 * 
 */
export abstract class SimLoop implements GameLoop, Configurable, PhysicsLoop {
    protected static _instance?: SimLoop
    protected static _isRunning: boolean = false

    protected settings: Record<string, TODO> = {}
    protected startTimeMs: number
    protected lastUpdateTimeMs: number = 0
    protected minInterval: number = 2

    public framerate: number = 0;

    constructor() {
        this.settings = {
            'minTimeout': 2,
        }

        this.startTimeMs = performance.now()
    }


    public abstract updatePhysics(dt?: number): void
    public abstract entities(): IterableIterator<Positional<Dim>>


    public get config() {
        return this.settings
    }

    public get initialized(): boolean {
        return !SimLoop._instance
    }

    public get canStart(): [boolean, string] {
        switch (true) {
            case !this.initialized:
                return [false, "NewSim.instance must be initialized."]
            case this.running:
                return [false, "Simulation already running."]
            default:
                return [true, "good to go"]
        }
    }

    public start() {
        const [canStart, failMsg] = this.canStart

        if (canStart) {
            this.lastUpdateTimeMs = performance.now()
            SimLoop._isRunning = true
            this.update()
        } else {
            console.error("FAILED TO START")
            console.info(failMsg)
        }

    }

    public update(): void {
        if (this.running) {
            const now = performance.now()
            const deltaTimeMs = now - this.lastUpdateTimeMs
            const deltaTimeSec = deltaTimeMs / 1000;

            this.framerate = 1 / deltaTimeSec
            this.lastUpdateTimeMs = now
            this.updatePhysics(deltaTimeSec)

            const timeout = deltaTimeMs > this.minInterval ? 0 : this.minInterval
            setTimeout(() => this.update(), timeout)
        } else {
            this.lastUpdateTimeMs = 0
        }
    }

    public pause() {
        if (this.running) {
            SimLoop._isRunning = false
        }
    }

    public togglePause(): boolean {
        if (this.running) {
            this.pause()
        } else {
            this.start()
        }
        return this.running
    }

    public get running(): boolean {
        return SimLoop._isRunning
    }

    public get elapsed(): number {
        return performance.now() - this.startTimeMs
    }
}