import { Vec2 } from "./vector.js";
import { scale } from "./util.js";
import { Drawable, Shape, MakeDrawable, Positional } from "./ui-adapter.js";

export interface Identafiable<T> {
    readonly id: T
    eq(other: Identafiable<T>): boolean
}

export interface SerialIdentifiable extends Identafiable<number> {}

interface IBodyBase extends Positional {
    m: number
    r: number
    pos: Vec2
    vel: Vec2
    acc: Vec2    
}

export interface IBody extends IBodyBase, SerialIdentifiable {
    readonly isStatic: boolean
    // readonly momentum: Vec2
}

type DynamicBodyCtorArgs = {
    m?: number
    r?: number
    pos: Vec2
    vel?: Vec2
    acc?: Vec2
    isStatic?: boolean
}

// @Drawable(Shape.Circle, "#666666")
export class MassiveBody implements IBody, SerialIdentifiable, Positional {
    m: number
    r: number
    pos: Vec2
    vel: Vec2
    acc: Vec2
    
    private static idIncrementor = 1 
    private _id: number = 0
    protected _static: boolean = false

    constructor(args: DynamicBodyCtorArgs) {
        this.m = args.m ?? MassiveBody.getRandomMass()
        this.r = args.r ?? MassiveBody.getRadiusFromMass(this.m)
        this.vel = args.vel ?? Vec2.zero
        this.acc = args.acc ?? Vec2.zero
        this.pos = args.pos

        this._static = args.isStatic ?? false
        this._id = MassiveBody.idIncrementor++
    }

    public get momentum(): Vec2 {
        return this.vel.mul(this.m)
    }

    public get id(): number {
        return this._id
    }

    public eq(other: IBody): boolean {
        return this.id == other.id
    }

    public get isStatic(): boolean {
        return this._static
    }

    // 100.000.000x 
    public static get max_mass(): number {
        return 50000000
    }

    public static get min_mass(): number {
        return 100000
    }

    public static get max_radius(): number {
        return 32
    }

    public static get min_radius(): number {
        return 8
    }

    public static get raw_max_radius(): number {
        return MassiveBody.getRadiusFromMass(MassiveBody.max_mass, false)
    }

    public static getRadiusFromMass(mass: number, scaled: boolean = true): number {
        // just volume formula
        const raw_radius = Math.cbrt((3 * mass) / (4 * Math.PI))

        if (scaled) {
            return raw_radius * (MassiveBody.max_radius / MassiveBody.raw_max_radius)
        } else {
            return raw_radius
        }
    }

    public static getRandomMass(max = MassiveBody.max_mass, min = MassiveBody.min_mass): number {
        const uniform = Math.random()
        let mass = uniform
        // const beta_left = (uniform < 0.5) ? 2 * uniform : 2 * (1-uniform)
        if (uniform > 0.999) {
            mass *= 1000
        } else if (uniform > 0.99) {
            mass *= 100
        } else if (uniform > 0.75) {
            mass *= 10
        }
        
        return scale(mass, max, min)
    }

    public static collisionMomentum(b1: IBody, b2: IBody): Vec2 {
        const mSum = b1.m + b2.m
        // const vx = (b1.m * b1.vel.x + b2.m * b2.vel.x) / mSum
        // const vy = (b1.m * b1.vel.y + b2.m * b2.vel.y) / mSum
        const momentum1 = b1.vel.mul(b1.m / mSum)
        const momentum2 = b2.vel.mul(b2.m / mSum)
        return momentum1.add(momentum2)
    }

    public static nCollisionMomentum(bodies: IBody[]): Vec2 {
        const totalMass = bodies.reduce((acc, b) => acc + b.m, 0)
        return bodies.reduce(
            (acc, b) => acc.add(b.vel.mul(b.m / totalMass)), Vec2.zero)
    }

    public integrate(dt: number) {
        if (this.isStatic) {
            this.pos = Vec2.zero
            this.vel = Vec2.zero
        } else {
            this.pos.add(this.vel.mul(dt), true)
            this.vel.add(this.acc.mul(dt), true)       
        }
        
        this.acc = Vec2.zero
    }

    public toString(): string {
        return `id: ${this.id}\n m: ${this.m}\n r: ${this.r}\n pos: ${this.pos} vel: ${this.vel}`
    }
} 
