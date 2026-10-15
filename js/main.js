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
    target: 1,
    color: "#d9d6cf"
};

const towers = [];

let lastTime = performance.now();

const COLORS = {
    background: "#14100d",
    road: "#4a3424",
    tower: "#b8642a",
    light: "#f2efe6"
};


function draw() {
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = COLORS.road;
    ctx.lineWidth = 40;
    ctx.beginPath();
    for (let i = 0; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y)
    }

    ctx.lineJoin = "round";
    ctx.stroke();

    for (let i=0; i < towers.length; i++) {
        const tower = towers[i];
        ctx.fillStyle = COLORS.tower;
        ctx.fillRect(tower.x - 20, tower.y - 20, 40, 40);
    }

    ctx.fillStyle = creature.color
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

function handleClick(event) {
    const x = event.offsetX * (canvas.width / canvas.clientWidth);
    const y = event.offsetY * (canvas.height / canvas.clientHeight);
    towers.push({x: x, y: y});
} 

canvas.addEventListener("click", handleClick);

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);