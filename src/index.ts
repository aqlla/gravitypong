import { NewSim as Sim } from './sim/newsim.js';
import { GameLoop } from './sim/types.js';
import { TODO } from './utils/types.js';

import P5 from "p5";


function bindOutput(elementId: string) {
  const el: HTMLElement | null = document.getElementById(elementId);
  function _wrapper(target: any, _context: any) {
      function _decorated(this: any, ...args: any[]) {
          const result = target.call(this, ...args);
          if (el) {
              el.innerText = result.toString();
          }
      }
  }
}

window["Simulation"] = Sim;

interface GameLoopController<TGame extends GameLoop> {
  config: {}
  game: TGame
}

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
  private game: GameLoop
  private view: TODO
  private config: TODO

  private canvas?: TODO
  private frameRate?: number
  
  // Should probably be a singleton, class is just for encapsulation/ns
  private constructor() {
    this.game = Sim.instance({ 
      n: 50,
      timeStepSeconds: 0.1,
      bounds: [1000, window.innerWidth]
     })
  }

  public setupCanvas(p5: P5) {
    p5.frameRate(20);
    p5.createCanvas(window.innerWidth, 1000);
  }

  private sketch(p5: P5) {
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

  public start() {
    this.game.start();
  }

  private bindHudItems() {
    const hudSections = {
      // config/controls have overlap, need to think more
      "config": {},
      "telemetry": {},
      "controls": {}
    }
  }

  // Apply configuration changes to current game.
  public updateConfiguration() {}
  
  // Basic I/O
  public bindKeyPress() {}
  public bindValueElement() {}
  public bindInputElement() {}


  
  private bindConfigSetting(settingKey: TODO, htmlElement: TODO) {}
  private localStorage() {}


}
