

const height = window.innerHeight
const width = window.innerWidth
let margin = 0

let s = null;
let pause = false;

let dark, red

function initSim() {
    if (!s) {
        const Simulation = window["Simulation"];

        if (Simulation) {
            s = Simulation.instance({
                n: 100,
                timeStepSeconds: 0.1,
                bounds: [width, height],
            });
            margin = s.margin
            s.start();

            document.addEventListener("keypress", (event) => {
                if (event.key === " ") {
                    s.togglePause()
                    pause = s.running
                }
            }); 
        }
    } 
}

function setup() {
    frameRate(20);
    createCanvas(width, height);
    

    dark = color(65);
    red = color("red");

}        

function draw() {
    if (!s) initSim()

    if (s && s.running) {
        background(229);

        if (s.bodies) {
            document.getElementById("count").textContent = s.bodies.size;
            document.getElementById("framerate").textContent = s.framerate;

            for (const b of s.entities()) {
                if (b.id % 20 == 0) fill(red)
                else fill(dark)
                circle(
                    b.pos.components[0], 
                    b.pos.components[1], 
                    Math.max(2, b.r));
            }

            noFill();

            rect(margin, margin, width - 2 * margin, height - 2 * margin)
        }
    }
    
}

const toggleClass = (id, classname) => 
    document.getElementById(id).classList.toggle(classname)