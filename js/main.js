const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const VERSION = "v0.2.2";
let gameState = "title";

const titleScreen = document.getElementById("title-screen");
const startButton = document.getElementById("start-button");
document.getElementById("version").textContent = VERSION;

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

const creatures = [];

function spawnCreature() {
    creatures.push({
        x: path[0].x,
        y: path[0].y,
        speed: 60,
        target: 1,
        color: "#d9d6cf",
        health: 5,
        alive: true
    });
}

const towers = [];
const projectiles = [];
let spawnTimer = 0;

function updateSpawning(dt) {
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
        spawnCreature();
        spawnTimer = 2;
    }
}

let lastTime = performance.now();

const COLORS = {
    background: "#14100d",
    road: "#4a3424",
    tower: "#b8642a",
    light: "#f2efe6",
    range: "rgba(242, 239, 230, 0.15)",
    projectile: "#e8a04a"
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

    for (let i = 0; i < towers.length; i++) {
        const tower = towers[i];

        ctx.fillStyle = COLORS.range;
        ctx.beginPath();
        ctx.arc(tower.x, tower.y, tower.range, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = COLORS.tower;
        ctx.fillRect(tower.x - 20, tower.y - 20, 40, 40);
    }

    for (let i = 0; i < creatures.length; i++) {
        const creature = creatures[i];
        ctx.fillStyle = creature.color;
        ctx.fillRect(creature.x - 15, creature.y - 15, 30, 30);
    }

    ctx.fillStyle = COLORS.projectile;
    for (let i = 0; i < projectiles.length; i++) {
        const projectile = projectiles[i];
        ctx.beginPath();
        ctx.arc(projectile.x, projectile.y, 6, 0, Math.PI * 2);
        ctx.fill();
    }
}

function update(dt) {
    updateSpawning(dt);
    updateTowers(dt);
    updateProjectiles(dt);
    updateCreatures(dt);
}

function findTarget(tower) {
    for (let i = 0; i < creatures.length; i++) {
        const creature = creatures[i];
        const distance = Math.hypot(creature.x - tower.x, creature.y - tower.y);

        if (creature.alive && distance <= tower.range) {
            return creature;
        }
    }
    return null;
}

function updateTowers(dt) {
    for (let i = 0; i < towers.length; i++) {
        const tower = towers[i];
        tower.target = findTarget(tower);

        tower.cooldown -= dt;
        if (tower.target && tower.cooldown <= 0) {
            projectiles.push({
                x: tower.x,
                y: tower.y,
                target: tower.target,
                speed: 600,
                damage: tower.damage
            });
            tower.cooldown = tower.fireDelay;
        }
    }
}

function updateProjectiles(dt) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];

        if (!projectile.target.alive) {
            projectiles.splice(i, 1);
            continue;
        }

        const dx = projectile.target.x - projectile.x;
        const dy = projectile.target.y - projectile.y;
        const distance = Math.hypot(dx, dy);
        const step = projectile.speed * dt;

        if (distance <= step) {
            projectile.target.health -= projectile.damage;
            if (projectile.target.health <= 0) {
                projectile.target.alive = false;
            }
            projectiles.splice(i, 1);
        } else {
            projectile.x += (dx / distance) * step;
            projectile.y += (dy / distance) * step;
        }
    }
}

function updateCreatures(dt) {
    for (let i = creatures.length - 1; i >= 0; i--) {
        const creature = creatures[i];

        if (!creature.alive) {
            creatures.splice(i, 1);
            continue;
        }

        moveCreature(creature, dt);

        if (creature.target >= path.length) {
            creatures.splice(i, 1);   // reached the settlement (lives come in v0.2.4)
        }
    }
}

function moveCreature(creature, dt) {
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
    towers.push({
        x: x,
        y: y,
        range: 200,
        target: null,
        damage: 1,
        fireDelay: 0.8,
        cooldown: 0
    });
}

canvas.addEventListener("click", handleClick);

function startGame() {
    gameState = "playing";
    titleScreen.classList.add("hidden");
}

startButton.addEventListener("click", startGame);

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;

    if (gameState === "playing") {
        update(dt);
    }
    draw();
    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);