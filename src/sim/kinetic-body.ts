import { SerialIdentifiable } from "../utils/util.js"
import { scale } from "../utils/math.js"
import { NDimVector } from "../vectors/ndim/nvector.js"
import { Dim } from "vectors/ndim/types.js"


export interface Positional<NDim extends Dim> {
    readonly pos: NDimVector<NDim>
}

interface KineticBody<NDim extends Dim> extends Positional<NDim> {
    m: number
    r: number
    vel: NDimVector<NDim>
    acc: NDimVector<NDim>    
    // readonly momentum: Vec2
}

export interface SimulationBody<NDim extends Dim> extends KineticBody<NDim>, SerialIdentifiable {
    readonly isStatic: boolean
}

type DynamicBodyCtorArgs<NDim extends Dim> = { dimensions: NDim } & Partial<SimulationBody<NDim>>

type NVec2 = NDimVector<2>

// @Drawable(Shape.Circle, "#666666")
export class MassiveBody<NDim extends Dim> implements SimulationBody<NDim>, SerialIdentifiable {
    m: number
    r: number
    pos: NDimVector<NDim>
    vel: NDimVector<NDim>
    acc: NDimVector<NDim>

    dimensions: Readonly<NDim>
    
    private static idIncrementor = 1 
    private _id: number = 0
    protected _static: boolean = false

    constructor(args: DynamicBodyCtorArgs<NDim>) {
        this.dimensions = args.dimensions
        this.m = args.m ?? MassiveBody.getRandomMass()
        this.r = args.r ?? MassiveBody.getRadiusFromMass(this.m)
        this.vel = args.vel ?? this.zeroVector
        this.acc = args.acc ?? this.zeroVector
        this.pos = args.pos ?? this.zeroVector

        this._static = args.isStatic ?? false
        this._id = MassiveBody.idIncrementor++
    }

    public get zeroVector(): NDimVector<NDim> {
        return new NDimVector<NDim>(0, 0)
    }

    public get momentum(): NDimVector<NDim> {
        return this.vel.mul(this.m)
    }

    public get id(): number {
        return this._id
    }

    public eq(other: SimulationBody<NDim>): boolean {
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

    public static collisionMomentum<N extends Dim>(b1: SimulationBody<N>, b2: SimulationBody<N>): NDimVector<N> {
        const mSum = b1.m + b2.m
        // const vx = (b1.m * b1.vel.x + b2.m * b2.vel.x) / mSum
        // const vy = (b1.m * b1.vel.y + b2.m * b2.vel.y) / mSum
        const momentum1 = b1.vel.mul(b1.m / mSum)
        const momentum2 = b2.vel.mul(b2.m / mSum)
        return momentum1.add(momentum2)
    }

    public static nCollisionMomentum<N extends Dim>(bodies: SimulationBody<N>[]): NDimVector<N> {
        // TODO: find better way to get zero vector without cheating like this...
        const zeroVector = new NDimVector<N>(0, 0)

        const totalMass = bodies.reduce((acc, b) => acc + b.m, 0)
        return bodies.reduce(
            (acc, b) => acc.add(b.vel.mul(b.m / totalMass)), zeroVector)
    }

    public integrate(dt: number) {
        if (this.isStatic) {
            this.pos = this.zeroVector
            this.vel = this.zeroVector
        } else {
            this.pos = this.pos.add(this.vel.mul(dt))
            this.vel = this.vel.add(this.acc.mul(dt))       
        }
        
        this.acc = this.zeroVector
    }

    public toString(): string {
        return `id: ${this.id}\n m: ${this.m}\n r: ${this.r}\n pos: ${this.pos} vel: ${this.vel}`
    }
} 
