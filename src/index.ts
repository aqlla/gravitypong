import { HtmlAttribute, HTMLElementConfig } from './ui/dom/types.js';
import { NewSim as Simulation } from './sim/newsim.js';
import P5 from "p5"

window["Simulation"] = Simulation;


const $$ = document.getElementById
const $in = (id) => document.getElementById(id) as HTMLInputElement

const ruleProps = [
    'coefficient', 'range', 'enabled']

const upperIndex = (s: string, i: number) => s.replace(s[i], s[i].toUpperCase())
const upperFirst = s => upperIndex(s, 0)

const elementNotFound = (id: string): DOMException =>
    new DOMException(`Cound not find element with id ${id}`)


const domo = {
    make: <TElement extends HTMLElement>
        (tag: keyof HTMLElementTagNameMap, attributes: HTMLElementConfig): TElement => {
        const el = document.createElement(tag) as TElement
        for (const [k, v] of Object.entries(attributes)) {
            if (k === 'classList') {
                el.className = v.join(" ")
            }
        }
        return el
    }
}


const createConfigListItem = (parentId: string) => {
    const parent = $$(parentId)
    if (!parent) throw elementNotFound(parentId)

}

const bindRuleConfigProperties = (object: any, ruleName: string) => {
    const ps = ruleProps.map(p => ruleName + upperFirst(p))
    console.log(ps)
    ps.forEach(p => bindInputToProperty(object, p, p))
}


const bindInputToProperty = <T, K extends keyof T>(object: T, propName: K, elementId: string) => {
    const element = $in(elementId)
    // element.value = object[propName] as any
    element?.addEventListener('input', (e: Event) => {
        const newValue = (e.target as HTMLInputElement).value
        object[propName] = newValue as any
        console.log("new: " + newValue)
    })
}



export const initSim = () => {
    const s = Simulation.instance({
        population: 100,
        timeStepSeconds: 0.1,
        bounds: [window.innerWidth, window.innerHeight],
    });

    document.addEventListener("keypress", (event: KeyboardEvent) => {
        if (event.key === " ") {
            s.togglePause()
        }
    })

    const item = domo.make('div', {
        classList: ['list-item', 'flex-col']
    })

    console.log(item)
    const cfgDiv = document.getElementById('config')! as Node
    // cfgDiv.insertBefore(item, cfgDiv)
    // cfgDiv.insertBefore(item, cfgDiv)
    cfgDiv.appendChild(item)
    cfgDiv.appendChild(item)
    cfgDiv.appendChild(item)

    window["sim"] = s
    window["margin"] = s.margin

    bindRuleConfigProperties(s, 'separation')
    bindRuleConfigProperties(s, 'alignment')
    bindRuleConfigProperties(s, 'cohesion')
}

document.body.onload = initSim;



class InputBoundProperty { }
