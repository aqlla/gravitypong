import { NewSim as Simulation } from './sim/newsim.js';
window["Simulation"] = Simulation;
const $$ = document.getElementById;
const $in = (id) => document.getElementById(id);
const ruleProps = [
    'coefficient', 'range', 'enabled'
];
const upperIndex = (s, i) => s.replace(s[i], s[i].toUpperCase());
const upperFirst = s => upperIndex(s, 0);
const elementNotFound = (id) => new DOMException(`Cound not find element with id ${id}`);
const domo = {
    make: (tag, attributes) => {
        const el = document.createElement(tag);
        for (const [k, v] of Object.entries(attributes)) {
            if (k === 'classList') {
                el.className = v.join(" ");
            }
        }
        return el;
    }
};
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
    const s = Simulation.instance({
        population: 100,
        timeStepSeconds: 0.1,
        bounds: [window.innerWidth, window.innerHeight],
    });
    document.addEventListener("keypress", (event) => {
        if (event.key === " ") {
            s.togglePause();
        }
    });
    const item = domo.make('div', {
        classList: ['list-item', 'flex-col']
    });
    console.log(item);
    const cfgDiv = document.getElementById('config');
    // cfgDiv.insertBefore(item, cfgDiv)
    // cfgDiv.insertBefore(item, cfgDiv)
    cfgDiv.appendChild(item);
    cfgDiv.appendChild(item);
    cfgDiv.appendChild(item);
    window["sim"] = s;
    window["margin"] = s.margin;
    bindRuleConfigProperties(s, 'separation');
    bindRuleConfigProperties(s, 'alignment');
    bindRuleConfigProperties(s, 'cohesion');
};
document.body.onload = initSim;
class InputBoundProperty {
}
