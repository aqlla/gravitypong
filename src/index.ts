import { HtmlAttribute, HtmlAttributeConfig } from './ui/dom/types.js';
import { NewSim as Simulation } from './sim/newsim.js';
import P5 from "p5"
import { group } from 'console';

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
        (tag: keyof HTMLElementTagNameMap, attributes: HtmlAttributeConfig): TElement => {
        const el = document.createElement(tag) as TElement
        for (const [k, v] of Object.entries(attributes)) {
            if (k === 'classList') {
                el.className = v
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


class FuConfigGroup extends HTMLElement {
    static classNames = {
        group: 'config-group list-item flex-col',
        title: 'title center prevent-select',
        body: 'body flex-row',
        left: 'left flex-col',
        content: 'content-main flex-col',
        input: 'input flex-col',
    }

    addAllConfigGroups_doStuff() {
        const parent = this.getParent('config')
        const sepGroup = this.makeBoidsForceConfigGroup('separation')
        parent.appendChild(sepGroup)
    }

    getParent(parentId) {
        return document.getElementById(parentId)! as Node
    }

    makeBoidsForceConfigGroup = (force: string) => {
        const group = this.makeConfigGroup(force)
        const body = group.querySelector('.body')
        return group
    }

    makeConfigGroup = (title: string) => {
        const groupEl = domo.make('div', { class: FuConfigGroup.classNames['group'] })
        const titleEl = domo.make('div', { class: FuConfigGroup.classNames['title'] })
        const bodyEl = domo.make('div', { class: FuConfigGroup.classNames['body'] })
        titleEl.innerText = title
        groupEl.appendChild(titleEl)
        groupEl.appendChild(bodyEl)
        return groupEl
    }
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

    window["sim"] = s
    window["margin"] = s.margin

    bindRuleConfigProperties(s, 'separation')
    bindRuleConfigProperties(s, 'alignment')
    bindRuleConfigProperties(s, 'cohesion')
}

document.body.onload = initSim;



class InputBoundProperty { }
