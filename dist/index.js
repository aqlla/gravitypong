import { NewSim as Simulation } from './sim/newsim.js';
// import P5 from "p5";
// import "p5/lib/addons/p5.dom";
// const toggleClass = (id, classname) =>
//     document.getElementById(id)!.classList.toggle(classname)
const $$ = document.getElementById;
const $in = (id) => document.getElementById(id);
const ruleProps = [
    'coefficient', 'range', 'enabled'
];
const upperIndex = (s, i) => s.replace(s[i], s[i].toUpperCase());
const upperFirst = s => upperIndex(s, 0);
const elementNotFound = (id) => new DOMException(`Cound not find element with id ${id}`);
const createConfigListItem = (parentId) => {
    const parent = $$(parentId);
    if (!parent)
        throw elementNotFound(parentId);
};
const bindRuleConfigProperties = (object, ruleName) => {
    const ps = ruleProps.map(p => ruleName + upperFirst(p));
    console.log(ps);
    ps.forEach(p => bindInputToProperty(object, p, p));
};
const bindInputToProperty = (object, propName, elementId) => {
    const element = $in(elementId);
    // element.value = object[propName] as any
    element?.addEventListener('input', (e) => {
        const newValue = e.target.value;
        object[propName] = newValue;
        console.log("new: " + newValue);
    });
};
export const initSim = () => {
    const height = window.innerHeight;
    const width = window.innerWidth;
    let dark, red;
    const sim = Simulation.instance({
        population: 100,
        timeStepSeconds: 0.1,
        bounds: [window.innerWidth, window.innerHeight],
    });
    // const sketch = (p5: P5) => {
    //     p5.setup = () => {
    //         p5.frameRate(20);
    //         p5.createCanvas(width, height);
    //         dark = p5.color(65);
    //         red = p5.color("red");
    //     }
    //     function draw() {
    //         if (sim) {
    //             p5.background(229);
    //             if (sim.bodies) {
    //                 document.getElementById("count")!.textContent = sim.bodies.size.toString();
    //                 document.getElementById("framerate")!.textContent = sim.framerate.toString();
    //                 for (const b of sim.entities()) {
    //                     if (b.id % 20 == 0) p5.fill(red)
    //                     else p5.fill(dark)
    //                     p5.circle(
    //                         b.pos.components[0],
    //                         b.pos.components[1],
    //                         Math.max(2, b.r));
    //                 }
    //                 p5.noFill();
    //                 p5.rect(sim.margin, sim.margin, width - 2 * sim.margin, height - 2 * sim.margin)
    //             }
    //         }
    //     }
    // }
    document.addEventListener("keypress", (event) => {
        if (event.key === " ") {
            sim.togglePause();
        }
    });
    window["sim"] = sim;
    window["margin"] = sim.margin;
    bindRuleConfigProperties(sim, 'separation');
    bindRuleConfigProperties(sim, 'alignment');
    bindRuleConfigProperties(sim, 'cohesion');
};
document.body.onload = initSim;
class InputBoundProperty {
}
