// game.js

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverElement = document.getElementById('gameOver');
const finalScore = document.getElementById('final-score');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
let spaceship = { x: canvas.width / 2, y: canvas.height - 120, width: 60, height: 60, speed: 7, dx: 0 };
let asteroids = [];
let particles = [];

// 游戏循环
function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    generateAsteroids();
    drawSpaceship();
    drawAsteroids();

    score++;

    scoreElement.textContent = `Score: ${score}`;
    requestAnimationFrame(gameLoop);
}

// 游戏结束处理
function endGame() {
    gameOver = true;
    finalScore.textContent = score;
    gameOverElement.classList.remove('hidden');
}

// 返回首页
function goHome() {
    window.location.href = 'index.html';
}

// 重新开始
function restartGame() {
    score = 0;
    gameOver = false;
    asteroids = [];
    spaceship.x = canvas.width / 2;
    spaceship.y = canvas.height - 120;
    gameOverElement.classList.add('hidden');
    gameLoop();
}

// 生成陨石
function generateAsteroids() {
    if (Math.random() < 0.02) {
        let size = Math.random() * 30 + 30;
        let speed = Math.random() * 3 + 2;
        let x = Math.random() * (canvas.width - size);
        asteroids.push({
            x: x,
            y: -size,
            size: size,
            speed: speed
        });
    }
}

// 绘制飞船
function drawSpaceship() {
    spaceship.x += spaceship.dx;
    if (spaceship.x < 0) spaceship.x = 0;
    if (spaceship.x + spaceship.width > canvas.width) spaceship.x = canvas.width - spaceship.width;
    ctx.fillStyle = 'yellow';
    ctx.fillRect(spaceship.x, spaceship.y, spaceship.width, spaceship.height);
}

// 绘制陨石
function drawAsteroids() {
    ctx.fillStyle = 'gray';
    asteroids.forEach((asteroid, index) => {
        asteroid.y += asteroid.speed;
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
        ctx.fill();
        
        // 碰撞检测
        if (spaceship.x < asteroid.x + asteroid.size && spaceship.x + spaceship.width > asteroid.x - asteroid.size &&
            spaceship.y < asteroid.y + asteroid.size && spaceship.y + spaceship.height > asteroid.y - asteroid.size) {
            endGame();
        }

        if (asteroid.y > canvas.height) asteroids.splice(index, 1);
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') spaceship.dx = -spaceship.speed;
    if (e.key === 'ArrowRight') spaceship.dx = spaceship.speed;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') spaceship.dx = 0;
});

gameLoop();

