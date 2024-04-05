import { NewSim as Sim } from './sim/newsim.js';
function bindOutput(elementId) {
    const el = document.getElementById(elementId);
    function _wrapper(target, _context) {
        function _decorated(...args) {
            const result = target.call(this, ...args);
            if (el) {
                el.innerText = result.toString();
            }
        }
    }
}
window["Simulation"] = Sim;
/**
 * Manages IO for the app.
 *
 * Figuring out how to implement this... The app is too small to justify a
 * front-end framework
 *
 * Notes: In this project, it must:
 *  - render simulation
 *  - direct input to simulation
 *  - display, and store persistent configuration and allow input to edit
 *    configuration values
 */
// class WebViewController implements GameLoopController<GravitySim> {
//   game: GravitySim
//   config: {} = {}
//   constructor() {
//     this.game = GravitySim.instance({ n: 1000 });
//   }
// }
class ScratchGameViewController {
    game;
    view;
    config;
    canvas;
    frameRate;
    // Should probably be a singleton, class is just for encapsulation/ns
    constructor() {
        this.game = Sim.instance({
            n: 50,
            timeStepSeconds: 0.1,
            bounds: [1000, window.innerWidth]
        });
    }
    setupCanvas(p5) {
        p5.frameRate(20);
        p5.createCanvas(window.innerWidth, 1000);
    }
    sketch(p5) {
        p5.background(200);
        const c = p5.color(65);
        p5.fill(c);
        if (this.game) {
            // document.getElementById("count").textContent = this.game.bodyCount;
            // document.getElementById("framerate").textContent = s.framerate;
            // for (const b of .bodies.values()) {
            //   p5.circle(
            //     b.pos.x / 20 + 500, 
            //     b.pos.y / 20 + 500, 
            //     Math.max(2, b.r / 24));
            // }
        }
    }
    start() {
        this.game.start();
    }
    bindHudItems() {
        const hudSections = {
            // config/controls have overlap, need to think more
            "config": {},
            "telemetry": {},
            "controls": {}
        };
    }
    // Apply configuration changes to current game.
    updateConfiguration() { }
    // Basic I/O
    bindKeyPress() { }
    bindValueElement() { }
    bindInputElement() { }
    bindConfigSetting(settingKey, htmlElement) { }
    localStorage() { }
}
