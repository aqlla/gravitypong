import { NewSim as Simulation } from './sim/newsim.js';

import P5 from "p5";
import "p5/lib/addons/p5.dom";


const toggleClass = (id, classname) =>
    document.getElementById(id)!.classList.toggle(classname)


const $$ = document.getElementById
const $in = (id) => document.getElementById(id) as HTMLInputElement

const ruleProps = [
    'coefficient', 'range', 'enabled']

const upperIndex = (s: string, i: number) => s.replace(s[i], s[i].toUpperCase())
const upperFirst = s => upperIndex(s, 0)

const elementNotFound = (id: string): DOMException =>
    new DOMException(`Cound not find element with id ${id}`)


const createConfigListItem = (parentId: string) => {
    const parent = $$(parentId)
    if (!parent) throw elementNotFound(parentId)

}

const bindRuleConfigProperties = (
    object: any, ruleName: string) => {
    const ps = ruleProps.map(p => ruleName + upperFirst(p))
    console.log(ps)
    ps.forEach(p => bindInputToProperty(object, p, p))
}


const bindInputToProperty = <T, K extends keyof T>(
    object: T, propName: K, elementId: string) => {
    const element = $in(elementId)
    // element.value = object[propName] as any
    element?.addEventListener('input', (e: Event) => {
        const newValue = (e.target as HTMLInputElement).value
        object[propName] = newValue as any
        console.log("new: " + newValue)
    })
}


export const initSim = () => {
    const height = window.innerHeight
    const width = window.innerWidth
    let dark, red

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

    document.addEventListener("keypress", (event: KeyboardEvent) => {
        if (event.key === " ") {
            sim.togglePause()
        }
    })

    bindRuleConfigProperties(sim, 'separation')
    bindRuleConfigProperties(sim, 'alignment')
    bindRuleConfigProperties(sim, 'cohesion')
}

document.body.onload = initSim;



class InputBoundProperty { }
