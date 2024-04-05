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
    startTime;
    lastUpdateTime = 0;
    timeStepSeconds = 0.1;
    framerate = 0;
    _isRunning = false;
    static _instance;
    static minimumIntervalMs = 2;
    constructor() {
        this.startTime = performance.now();
    }
    get initialized() {
        return !SimLoop._instance;
    }
    get canStart() {
        switch (true) {
            case !this.initialized:
                return [false, "NewSim.instance must be initialized."];
            case this.running:
                return [false, "Simulation already running."];
            default:
                return [true, "good to go"];
        }
    }
    start() {
        const [canStart, failMsg] = this.canStart;
        if (canStart) {
            this.lastUpdateTime = performance.now();
            this._isRunning = true;
            this.update();
        }
        else {
            console.error("FAILED TO START");
            console.info(failMsg);
        }
    }
    update() {
        if (this.running) {
            const now = performance.now();
            const deltaTimeMs = now - this.lastUpdateTime;
            const deltaTimeSec = deltaTimeMs / 1000;
            this.framerate = 1 / deltaTimeSec;
            this.lastUpdateTime = now;
            this.updatePhysics(deltaTimeSec);
            const timeout = deltaTimeMs > SimLoop.minimumIntervalMs ? 0 : SimLoop.minimumIntervalMs;
            setTimeout(() => this.update(), timeout);
        }
        else {
            this.lastUpdateTime = 0;
        }
    }
    pause() {
        if (this.running) {
            this._isRunning = false;
        }
    }
    togglePause() {
        if (this.running) {
            this.pause();
        }
        else {
            this.start();
        }
        return this.running;
    }
    get config() {
        return {};
    }
    get running() {
        return this._isRunning;
    }
    get elapsed() {
        return performance.now() - this.startTime;
    }
}
