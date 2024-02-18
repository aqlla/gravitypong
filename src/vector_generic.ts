export interface IOrderedPair<TNum = number> {
    x: TNum;
    y: TNum;
}

export type VectorMathOperand<TNum = number, TVec2 = Vec2GenericBase<TNum>> = TVec2 | TNum | [TNum, TNum];

export type NDimFn<TLhs extends VectorMathOperand<TNum>, TRhs extends VectorMathOperand<TNum>, TReturn extends VectorMathOperand<TNum>, TNum = number> 
    = (lhs: TLhs, rhs: TRhs) => TReturn; 

export type VectorFn<TLhs extends VectorMathOperand<TNum>, TRhs extends VectorMathOperand<TNum>, TNum = number> 
    = NDimFn<TLhs, TRhs, [TNum, TNum], TNum>;

export type ScalarFn<TLhs extends Vec2GenericBase<TNum>, TRhs extends VectorMathOperand<TNum>, TNum = number> 
    = NDimFn<TLhs, TRhs, TNum, TNum>;

// export type TVector2 extends Vec2GenericBase<TNum>
    
    
export class Vec2GenericBase<TNum = number> implements IOrderedPair<TNum> {
    private components: [TNum, TNum];

    constructor(x: TNum, y: TNum) {
        this.components = [x, y];
    }

    get x(): TNum {
        return this.components[0];
    }
    
    protected set x(val: TNum) {
        this.components[0] = val;
    }

    get y(): TNum {
        return this.components[1];
    }

    protected set y(val: TNum) {
        this.components[1] = val;
    }

    public get id(): Vec2GenericBase<TNum> {
        return this
    }

    // I dont know how to deal with state change and side effects anymore... imperative philosophy is kinda icky
    protected applyArithmetic<TThis extends Vec2GenericBase<TNum>, TOther extends VectorMathOperand<TNum>>(
            fn: VectorFn<TThis, TOther, TNum>, //(lhs: Vec2GenericBase<TNum>, rhs: TOther) => [TNum, TNum], 
            self: TThis,
            other: TOther, 
            update: boolean = false): Vec2GenericBase<TNum> {

        const components = fn(self, other);

        if (update) {
            [this.x, this.y] = components;
            return this;
        } else {
            return new Vec2GenericBase<TNum>(...components);
        }
    }

   

    public eq(other: Vec2GenericBase<TNum>): boolean {
        return this.x == other.x && this.y == other.y;
    }
}