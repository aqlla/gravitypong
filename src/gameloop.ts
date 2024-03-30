import { Drawable } from "ui-adapter"
import { Configurable } from "./util"

interface IntervalProcessLoop {
    start(): void
    pause(): void
    resume(): void
}

export interface GameLoop extends IntervalProcessLoop {
    update(): void
    drawables: Drawable[]
}


export type GameLoopParams = {
    timeStep: number
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
export abstract class SimLoop implements GameLoop, Configurable {
    protected timerId?: ReturnType<typeof setInterval>
    protected timeStepSec: number
    protected startTime: number

    protected _isRunning: boolean = false
    protected _isStarted: boolean = false
    
    constructor(args: GameLoopParams) {
        this.timeStepSec = args.timeStep
        this.startTime = Date.now()
    }

    public start() {
        this.timerId = setInterval(() => {
            this.update()
            this._isRunning = false
        }, this.timeStepSec * 1000)
        this._isStarted = true
    }

    public pause() {
        if (this.timerId !== null) {
            clearInterval(this.timerId)
            this.timerId = undefined
            this._isRunning = true
        }
    }

    public resume() {
        if (this.timerId === null) {
            this.start()
            this._isRunning = false            
        }
    }

    public togglePause(): boolean {
        if (this._isRunning) {
            this.pause()
        } else {
            this.resume()
        }
        return this.isRunning
    }

    public get config() {
        return {}
    }

    public get isRunning(): boolean {
        return this._isRunning
    }

    public get isStarted(): boolean {
        return this._isStarted
    }

    public abstract update() 
    public abstract get drawables(): Drawable[]

    public get elapsed(): number {
        return Date.now() - this.startTime
    }
}