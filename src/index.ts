import { MakeDrawable, Shape, Drawable } from './ui-adapter.js';
import { Simulation as GravitySim } from './simulation.js';
import { Vec2 } from './vector.js';
import { MassiveBody } from './body.js';
import { GameLoop } from 'gameloop.js';
import { TODO } from 'util.js';

import P5 from "p5";
// import "p5/lib/addons/p5.dom";


window["Simulation"] = GravitySim;
window["Vec2"] = Vec2;


const DrawableBody = MakeDrawable(Shape.Circle, "#666666")(MassiveBody)
const d = new DrawableBody({ pos: Vec2.zero })

function testDrawable(p: Drawable) {
  console.log("testDrawable")
  console.log(p.color)
  console.log(p.shape)
}

testDrawable(d)


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
class WebViewController implements GameLoopController<GravitySim> {
  game: GravitySim
  config: {} = {}

  constructor() {
    this.game = GravitySim.instance({ n: 1000 });
  }


}


class ScratchGameViewController {
  private game: GameLoop
  private view: TODO
  private config: TODO

  private canvas?: TODO
  private frameRate?: number
  
  // Should probably be a singleton, class is just for encapsulation/ns
  private constructor() {
    this.game = GravitySim.instance({ n: 1000 })
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
