"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gravitypong_js_1 = require("./gravitypong.js");
const vector_js_1 = require("./vector.js");
const s = gravitypong_js_1.Simulation.getInstance();
s.addBody(new gravitypong_js_1.DynamicBody(1000, 10));
s.addBody(new gravitypong_js_1.DynamicBody(10, 4, new vector_js_1.Vec2(100, 0), new vector_js_1.Vec2(10, 5)));
console.log(s);
s.start();
