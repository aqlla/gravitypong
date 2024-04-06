const height = window.innerHeight
const width = window.innerWidth

let dark, red

window["sim"] = window["sim"] || null

function setup() {
    frameRate(20);
    createCanvas(width, height);
    dark = color(65);
    red = color("red");
}        

function draw() {
    if (sim) {
        background(229);

        if (sim.bodies) {
            document.getElementById("count").textContent = sim.bodies.size;
            document.getElementById("framerate").textContent = sim.framerate;

            for (const b of sim.entities()) {
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