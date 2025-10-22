// 星域长剑：零重力逃生 - 核心游戏逻辑
// 彻底移除了 Firebase 相关的认证和数据存储代码，专注于游戏本身。

// ===================================
// 1. 游戏配置和全局变量
// ===================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startModal = document.getElementById('start-modal');
const gameOverModal = document.getElementById('game-over-modal');
const scoreDisplay = document.getElementById('score-display');
const finalScoreDisplay = document.getElementById('final-score');
const hpBar = document.getElementById('hp-bar');
const energyBar = document.getElementById('energy-bar');

const START_HP = 100;
const MAX_ENERGY = 100;
const PLAYER_SIZE = 30;
const PLAYER_THRUST = 0.5;
const DRAG_FACTOR = 0.98; // 模拟零重力中的轻微阻力
const ENEMY_SPEED = 2;
const ASTEROID_SPEED = 1.5;
const ENERGY_COST_THRUST = 0.8;
const ENERGY_REGEN = 0.2;

let gameState = {
    isPaused: true,
    isRunning: false,
    score: 0,
    playerHP: START_HP,
    playerEnergy: MAX_ENERGY,
    lastTime: 0
};

let player = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: PLAYER_SIZE / 2,
};

let entities = []; // 存储所有障碍物和敌人

// ===================================
// 2. 游戏对象类 (简化版)
// ===================================

/**
 * 抽象游戏实体类
 */
class Entity {
    constructor(x, y, radius, color, type) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.type = type; // 'asteroid', 'enemy', 'powerup'
        this.vx = 0;
        this.vy = 0;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }
}

/**
 * 障碍物生成器
 */
function spawnObstacle() {
    const edge = Math.floor(Math.random() * 4); // 0: Top, 1: Right, 2: Bottom, 3: Left
    let x, y, vx, vy;
    const radius = Math.random() * 20 + 10;
    const speed = Math.random() * 1 + ASTEROID_SPEED;

    switch (edge) {
        case 0: // Top
            x = Math.random() * canvas.width;
            y = -radius;
            vx = (player.x - x) * 0.005; // 略微导向玩家
            vy = speed;
            break;
        case 1: // Right
            x = canvas.width + radius;
            y = Math.random() * canvas.height;
            vx = -speed;
            vy = (player.y - y) * 0.005;
            break;
        case 2: // Bottom
            x = Math.random() * canvas.width;
            y = canvas.height + radius;
            vx = (player.x - x) * 0.005;
            vy = -speed;
            break;
        case 3: // Left
            x = -radius;
            y = Math.random() * canvas.height;
            vx = speed;
            vy = (player.y - y) * 0.005;
            break;
    }

    entities.push(new Entity(x, y, radius, '#a3a3a3', 'asteroid'));
}

// ===================================
// 3. 游戏核心逻辑
// ===================================

/**
 * 初始化游戏状态和画布
 */
function initGame() {
    // 设置玩家初始位置
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.vx = 0;
    player.vy = 0;

    // 重置状态
    gameState.score = 0;
    gameState.playerHP = START_HP;
    gameState.playerEnergy = MAX_ENERGY;
    gameState.isRunning = true;
    gameState.isPaused = false;
    entities = [];
    
    // 隐藏模态框
    startModal.classList.add('hidden');
    gameOverModal.classList.add('hidden');

    updateUI();

    // 重新启动游戏循环
    gameState.lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

/**
 * 碰撞检测
 */
function checkCollision() {
    for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];
        const dx = player.x - entity.x;
        const dy = player.y - entity.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.radius + entity.radius) {
            // 碰撞发生
            if (entity.type === 'asteroid') {
                gameState.playerHP -= 10;
                // 移除被撞击的实体
                entities.splice(i, 1);
            }
            updateUI();
            
            if (gameState.playerHP <= 0) {
                endGame();
            }
        }
    }
}

/**
 * 更新游戏状态
 */
function update(deltaTime) {
    if (gameState.isPaused || !gameState.isRunning) return;

    // 1. 更新玩家位置 (零重力物理)
    player.vx *= DRAG_FACTOR;
    player.vy *= DRAG_FACTOR;
    player.x += player.vx;
    player.y += player.vy;

    // 边界检测：环绕效果
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;

    // 2. 能量恢复
    if (gameState.playerEnergy < MAX_ENERGY) {
        gameState.playerEnergy = Math.min(MAX_ENERGY, gameState.playerEnergy + ENERGY_REGEN * deltaTime / 100);
    }

    // 3. 更新实体
    for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];
        entity.update();

        // 移除屏幕外的实体
        if (entity.x < -entity.radius * 2 || entity.x > canvas.width + entity.radius * 2 ||
            entity.y < -entity.radius * 2 || entity.y > canvas.height + entity.radius * 2) {
            entities.splice(i, 1);
            gameState.score += 1; // 成功躲避加分
        }
    }

    // 4. 生成新实体 (简单计时器)
    if (Math.random() < 0.05) { // 调整生成概率
        spawnObstacle();
    }

    // 5. 碰撞检测
    checkCollision();

    // 6. 更新 UI
    updateUI();
}

/**
 * 渲染游戏画面
 */
function draw() {
    // 清空画布
    ctx.fillStyle = '#0b111e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制星星 (背景)
    ctx.fillStyle = 'white';
    for (let i = 0; i < 50; i++) {
        const starX = Math.random() * canvas.width;
        const starY = Math.random() * canvas.height;
        ctx.fillRect(starX, starY, 1, 1);
    }

    // 绘制实体 (障碍物)
    entities.forEach(entity => entity.draw());

    // 绘制玩家
    ctx.fillStyle = '#fcd34d'; // 黄色/琥珀色
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
}

/**
 * 游戏主循环
 */
function gameLoop(currentTime) {
    const deltaTime = currentTime - gameState.lastTime;
    gameState.lastTime = currentTime;

    update(deltaTime);
    draw();

    if (gameState.isRunning) {
        requestAnimationFrame(gameLoop);
    }
}

/**
 * 结束游戏
 */
function endGame() {
    gameState.isRunning = false;
    gameOverModal.classList.remove('hidden');
    finalScoreDisplay.textContent = gameState.score;
}

/**
 * 更新用户界面
 */
function updateUI() {
    scoreDisplay.textContent = gameState.score;
    hpBar.style.width = `${Math.max(0, gameState.playerHP)}%`;
    hpBar.style.backgroundColor = gameState.playerHP > 25 ? '#10b981' : '#dc2626'; // 健康或危险颜色
    energyBar.style.width = `${Math.max(0, gameState.playerEnergy)}%`;
}

/**
 * 调整画布大小以适应容器
 */
function resizeCanvas() {
    const container = canvas.parentElement;
    // 使用容器的 clientWidth 和 clientHeight 来设置 canvas 尺寸
    // 由于我们在 CSS 中设置了 aspect-ratio，这里获取实际渲染尺寸
    canvas.width = container.clientWidth;
    // 保持 16:9 比例 (或从 CSS 获取实际高度)
    canvas.height = canvas.width * (9 / 16); 

    // 重置玩家位置，防止出界
    if (gameState.isRunning) {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
    }
}


// ===================================
// 4. 事件监听器和输入处理
// ===================================

let keys = {};

// 键盘按下/抬起事件
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    handleThrust();
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

/**
 * 处理玩家推力输入
 */
function handleThrust() {
    if (gameState.isPaused || !gameState.isRunning) return;

    let appliedThrust = false;
    const cost = ENERGY_COST_THRUST;

    if (gameState.playerEnergy >= cost) {
        if (keys['w'] || keys['W'] || keys['ArrowUp']) {
            player.vy -= PLAYER_THRUST;
            appliedThrust = true;
        }
        if (keys['s'] || keys['S'] || keys['ArrowDown']) {
            player.vy += PLAYER_THRUST;
            appliedThrust = true;
        }
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) {
            player.vx -= PLAYER_THRUST;
            appliedThrust = true;
        }
        if (keys['d'] || keys['D'] || keys['ArrowRight']) {
            player.vx += PLAYER_THRUST;
            appliedThrust = true;
        }
    }

    // 消耗能量
    if (appliedThrust) {
        gameState.playerEnergy = Math.max(0, gameState.playerEnergy - cost);
    }
}

// UI 按钮监听
document.getElementById('start-game-button').addEventListener('click', initGame);
document.getElementById('restart-game-button').addEventListener('click', initGame);
document.getElementById('pause-button').addEventListener('click', () => {
    if (gameState.isRunning) {
        gameState.isPaused = !gameState.isPaused;
        document.getElementById('pause-button').textContent = gameState.isPaused ? '继续任务' : '暂停/继续';
        if (!gameState.isPaused) {
            gameState.lastTime = performance.now(); // 重置时间以防止跳帧
            requestAnimationFrame(gameLoop);
        }
    }
});

// 窗口大小变化时调整画布
window.addEventListener('resize', resizeCanvas);


// ===================================
// 5. 启动点
// ===================================

// 在文档完全加载后执行初始化
window.onload = function() {
    resizeCanvas(); // 首次设置画布尺寸
    // 游戏从 Start Modal 状态开始，等待用户点击
    startModal.classList.remove('hidden');
    gameState.isPaused = true;
};
