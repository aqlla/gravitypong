import { Simulation, DynamicBody, Vec2 } from './gravitypong.js';


const s = Simulation.getInstance();

s.addBody(new DynamicBody(1000, 10))
s.addBody(new DynamicBody(10, 4, new Vec2(100, 0), new Vec2(10, 5)));

console.log(s);
// s.run();