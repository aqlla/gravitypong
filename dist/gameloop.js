export class GameLoopBase {
    constructor(args) {
        this.timerId = null;
        this._processList = [
            this.update,
            // this.render
        ];
        this.timeStepSec = args.timeStep;
        this.startTime = Date.now();
    }
    start() {
        this.timerId = setInterval(() => {
            for (const fn of this._processList)
                fn.call(this);
        }, this.timeStepSec * 1000);
    }
    pause() {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }
    resume() {
        if (this.timerId === null)
            this.start();
    }
    update() {
        throw new Error("[GameLoopBase.update]: Method not implemented.");
    }
    render() {
        throw new Error("[GameLoopBase.render]: Method not implemented.");
    }
    get elapsed() {
        return Date.now() - this.startTime;
    }
}
