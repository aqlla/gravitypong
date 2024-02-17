"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gravitypong_1 = require("./gravitypong");
const s = gravitypong_1.Simulation.getInstance();
s.addBody(new gravitypong_1.DynamicBody(1000, 10));
s.addBody(new gravitypong_1.DynamicBody(10, 4, new gravitypong_1.Vec2(100, 0), new gravitypong_1.Vec2(10, 5)));
s.run();
