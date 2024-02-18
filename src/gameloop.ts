
interface IntervalProcessLoop {
    start(): void;
    pause(): void;
    resume(): void;
}

interface GameLoop extends IntervalProcessLoop {
    update(): void;
    render(): void;
}


export type GameLoopParams = {
    timeStep: number;
}

export class GameLoopBase implements GameLoop {
    protected timerId: ReturnType<typeof setInterval> | null = null;
    protected timeStepSec: number;
    protected startTime: number;
    private _processList: (() => void)[] = [
        this.update,
        // this.render
    ];
    
    constructor(args: GameLoopParams) {
        this.timeStepSec = args.timeStep;
        this.startTime = Date.now();
    }

    public start() {
        this.timerId = setInterval(() => {
            for (const fn of this._processList)
                fn.call(this);
        }, this.timeStepSec * 1000);
    }
    public pause() {
        if (this.timerId !== null) {
            clearInterval(this.timerId);
            this.timerId = null;
        }
    }

    public resume() {
        if (this.timerId === null)
            this.start()
    }

    public update() {
        throw new Error("[GameLoopBase.update]: Method not implemented.");
    }

    public render() {
        throw new Error("[GameLoopBase.render]: Method not implemented.");
    }


    public get elapsed(): number {
        return Date.now() - this.startTime;
    }
}