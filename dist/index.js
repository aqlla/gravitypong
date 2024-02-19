import { Simulation, DynamicBody } from './gravitypong.js';
import { Vec2 } from './vector.js';
const s = Simulation.getInstance();
window["sim"] = s;
s.addBody(new DynamicBody(1000, 10));
s.addBody(new DynamicBody(10, 4, new Vec2(100, 0), new Vec2(10, 5)));
console.log(s);
s.start();
