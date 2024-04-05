import { NDimVector, Dim, add, sub, NVecLike } from "../vectors/ndim/index.js"
import { MassiveBody } from "./kinetic-body.js"
import { SimLoop } from "./gameloop.js"
import { Tuple } from "../utils/types.js"
import { scale } from "../utils/math.js"
import { Vector2 } from "../vectors/vector2.js"
import { Boundaries, SimLoopArgs } from "./types.js"

type NDim = 2
const dimensions: NDim = 2


export type SimArgs = SimLoopArgs & {
    n: number
    bounds: Tuple<NDim>
    timeStep?: number
}

export class NewSim extends SimLoop {
    public readonly bodies = new Map<number, MassiveBody<NDim>>()

    private bounds: Boundaries<NDim> = {min: [0, 0], max: [500, 500]}
    private margin = 75
    private creationMargin = 100
    private _oobCount: number = 0 


    private constructor(args: SimArgs) {
        super()
        this.bounds.max = args.bounds
        this.makeTestBodies(args.n ?? 50)
    }

    public get canStart(): [boolean, string] {
        switch (true) {
            case this.bodies.size < 1:
                return [false, "No bodies, nothing to simulate."]
            default:
                return super.canStart
        }
    }

    public static instance(args: SimArgs): NewSim {
        if (!NewSim._instance)
            NewSim._instance = new NewSim(args)
        return NewSim._instance! as NewSim
    }


    makeTestBodies(n: number) {
        const maxV = 100
        const creationBounds = this.getMarginBounds(this.creationMargin)

        for (let i = 0; i < n; i++) {
            this.addBody(new MassiveBody<NDim>({
                dimensions: dimensions,
                pos: this.getRandomPos(creationBounds.max, creationBounds.min),
                vel: this.getRandomPos([maxV, maxV], [-maxV, -maxV]),
                r: 8
            }))
        }
    }

    getRandomPos(max: Tuple<NDim> = this.bounds.max, min: Tuple<NDim> = this.bounds.min): NDimVector<NDim> {
        const x = scale(Math.random(), max[0], min[0])
        const y = scale(Math.random(), max[1], min[1])
        return new NDimVector<NDim>(x, y)
    }

    public updatePhysics(dt: number): void {
        for (const [id, body] of this.bodies.entries()) {
            this.repulsiveBoundaries(body)
            this.separation(body)
            this.cohesion(body)
            this.alignment(body)
            this.speedLimit(body)
        }

        for (const b of this.entities())
            b.integrate(dt)
    }

    // Boids Rules
    separation(body: MassiveBody<NDim>) {
        const separationFactor = 50
        const visionRange = 50

        let accumulator = Vector2.zero as NDimVector<NDim>

        for (const b of this.entities()) {
            if (b.id !== body.id) {
                const distanceVec = body.pos.sub(b.pos)
                const distance = distanceVec.magnitude
                if (distance < visionRange) {
                    // accumulator = accumulator.add(b.pos)
                    accumulator = accumulator.add(distanceVec.div(distance))
                }
            }
        }

        const separationForce = accumulator.mul(separationFactor)
        body.vel = body.vel.add(separationForce)
        return body
    }

    alignment(body: MassiveBody<NDim>) {
        const alignmentFactor = 0.01
        const visionRange = 200
        const fov = 270

        let neighbors = 0
        let accumulator = Vector2.zero as NDimVector<NDim>

        for (const b of this.entities()) {
            if (b.id !== body.id) {
                const distance = b.pos.sub(body.pos).magnitude
                if (distance < visionRange) {
                    accumulator = accumulator.add(b.vel)
                    neighbors++
                }
            }
        }

        if (neighbors) {
            const average = accumulator.div(neighbors)
            const aligningForce = average.sub(body.vel).mul(alignmentFactor)
            body.vel = body.vel.add(aligningForce)
        }

        return body
    }

    cohesion(body: MassiveBody<NDim>) {
        const cohesionFactor = 0.5
        const visionRange = 250
        const fov = 270

        let neighbors = 0
        let accumulator = Vector2.zero as NDimVector<NDim>

        for (const b of this.entities()) {
            if (b.id !== body.id) {
                const distance = b.pos.sub(body.pos).magnitude
                if (distance < visionRange) {
                    accumulator = accumulator.add(b.pos)
                    neighbors++
                }
            }
        }

        if (neighbors) {
            const average = accumulator.div(neighbors)
            const centeringForce = average.sub(body.pos).mul(cohesionFactor)
            body.vel = body.vel.add(centeringForce)
        }

        return body
    }

    // Basic Rules 
    repulsiveBoundaries(body: MassiveBody<NDim>): MassiveBody<NDim> {
        const turnFactor = 1.5
        this.forDims(d => {
            if (body.pos[d] < this.margin)
                body.vel[d] += turnFactor
            else if (body.pos[d] > (this.bounds.max[d] - this.margin))
                body.vel[d] -= turnFactor
        })

        return body
    }

    speedLimit(body: MassiveBody<NDim>) {
        const maxSpeed = 120
        const speed = body.vel.magnitude
        if (speed > maxSpeed)
            body.vel = body.vel.div(speed).mul(maxSpeed)
        return body
    }

    wrapWorldBoundaries(body: MassiveBody<NDim>) {
        if (body.pos[0] <= 0) {
            body.pos = new NDimVector<NDim>(this.bounds.max[0], body.pos[1])
        } else if (body.pos[0] >= this.bounds.max[0]) {
            body.pos = new NDimVector<NDim>(this.bounds.min[0], body.pos[1])
        }

        if (body.pos[1] <= 0) {
            body.pos = new NDimVector<NDim>(body.pos[0], this.bounds.max[1])
            
        } else if (body.pos[1] >= this.bounds.max[1]) {
            body.pos = new NDimVector<NDim>(body.pos[0], this.bounds.min[1])
        }
    }

    forDims(fn) {
        for (let d = 0; d < dimensions; d++) {
            fn(d)
        }
    }

    getMarginBounds(margin: number): Boundaries<NDim> {
        return {
            max: this.bounds.max.map(x => x - this.creationMargin) as Tuple<NDim>,
            min: this.bounds.min.map(x => x + this.creationMargin) as Tuple<NDim>
        }
    }

    private isOob(pos: NVecLike<NDim>): boolean {
        const min = this.bounds.min
        const max = this.bounds.max
        
        for (let i = 0; i < dimensions; i++) {
            if (pos[i] <= min[i] || pos[i] >= max[i]) {
                return true
            }
        }

        return false
    }

    public *entities(): IterableIterator<MassiveBody<NDim>> {
        for (const [_, b] of Array.from(this.bodies))
            yield b
    }

    public addBody(body: MassiveBody<NDim>) {
        this.bodies.set(body.id, body)
    }

    public get oobCount(): number {
        return this._oobCount
    }
}