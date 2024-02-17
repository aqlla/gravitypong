export class GameLoopBase {
    timerId = null;
    timeStepSec;
    constructor(timeStepSec) {
        this.timeStepSec = timeStepSec;
    }
    start() {
        this.timerId = setInterval(() => this.update(), this.timeStepSec * 1000);
    }
    pause() {
        if (this.timerId !== null)
            clearInterval(this.timerId);
    }
    resume() {
        if (this.timerId === null)
            this.start();
    }
    update() {
        throw new Error("Method not implemented.");
    }
    render() {
        throw new Error("Method not implemented.");
    }
}
