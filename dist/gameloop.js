/**
 * Abstract class for basic game or simulation operation.
 *
 * Performs the following process loop with a giver interval between iterations:
 * - Listen for & apply input
 * - Run game update
 * - Render frame? - (maybe do this async separately)
 *
 */
export class SimLoop {
    timerId;
    timeStepSec;
    startTime;
    _isRunning = false;
    _isStarted = false;
    constructor(args) {
        this.timeStepSec = args.timeStep;
        this.startTime = Date.now();
    }
    start() {
        this.timerId = setInterval(() => {
            this.update();
            this._isRunning = false;
        }, this.timeStepSec * 1000);
        this._isStarted = true;
    }
    pause() {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = undefined;
            this._isRunning = true;
        }
    }
    resume() {
        if (this.timerId === null) {
            this.start();
            this._isRunning = false;
        }
    }
    togglePause() {
        if (this._isRunning) {
            this.pause();
        }
        else {
            this.resume();
        }
        return this.isRunning;
    }
    get config() {
        return {};
    }
    get isRunning() {
        return this._isRunning;
    }
    get isStarted() {
        return this._isStarted;
    }
    get elapsed() {
        return Date.now() - this.startTime;
    }
}
