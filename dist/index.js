"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gravitypong_1 = require("./gravitypong");
const vector_1 = require("./vector");
const s = gravitypong_1.Simulation.getInstance();
s.addBody(new gravitypong_1.DynamicBody(1000, 10));
s.addBody(new gravitypong_1.DynamicBody(10, 4, new vector_1.Vec2(100, 0), new vector_1.Vec2(10, 5)));
console.log(s);
s.start();
