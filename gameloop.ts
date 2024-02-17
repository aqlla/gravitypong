
interface IntervalProcessLoop {
    start(): void;
    pause(): void;
    resume(): void;
}

interface GameLoop extends IntervalProcessLoop {
    update(): void;
    render(): void;
}

export class GameLoopBase implements GameLoop {
    protected timerId: ReturnType<typeof setInterval> | null = null;
    protected timeStepSec: number;

    constructor(timeStepSec: number) {
        this.timeStepSec = timeStepSec;
    }

    public start() {
        this.timerId = setInterval(() => this.update(), this.timeStepSec * 1000);
    }
    public pause() {
        if (this.timerId !== null)
            clearInterval(this.timerId);
    }

    public resume() {
        if (this.timerId === null)
            this.start()
    }

    public update() {
        throw new Error("Method not implemented.");
    }

    public render() {
        throw new Error("Method not implemented.");
    }
}