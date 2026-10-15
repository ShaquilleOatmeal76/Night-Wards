const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const path = [
    { x: 0, y: 90 },
    { x: 240, y: 90 },
    { x: 240, y: 630 },
    { x: 1200, y: 630 },
    { x: 1200, y: 270 },
    { x: 720, y: 270 },
    { x: 720, y: 900 },
    { x: 1920, y: 900 }
];
 
const creature = {
    x: path[0].x,
    y: path[0].y,
    speed: 60,
    target: 1
};
let lastTime = performance.now();


function draw() {
    ctx.fillStyle = "darkslategray";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "red";
    ctx.lineWidth = 40;
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y)
    }


    ctx.lineJoin = "round";
    ctx.stroke();
    ctx.fillStyle = "yellow"
    ctx.fillRect(creature.x - 15, creature.y - 15, 30, 30)
}

function update(dt) {
    if (creature.target >= path.length) return;

    const target = path[creature.target];
    const dx = target.x - creature.x;
    const dy = target.y - creature.y;
    const distance = Math.hypot(dx, dy);

    const step = creature.speed * dt;

    if (distance <= step) {
        creature.x = target.x;
        creature.y = target.y;
        creature.target += 1;
    } else {
        creature.x += (dx / distance) * step;
        creature.y += (dy / distance) * step;
    }
}

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);