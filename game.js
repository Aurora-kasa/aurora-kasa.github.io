// 获取 DOM 元素
const outputDiv = document.getElementById('output');
const inputField = document.getElementById('command-input');

// ==========================================================
// 1. C++ 全局变量 转换为 JavaScript 全局状态对象
// ==========================================================
let gameState = {
    Your: 6,
    Other: 6,
    Yourmoney: 0.0,
    daojuname: ["放大镜", "手铐", "小刀", "烟", "饮料"],
    daoju: [0, 0, 0, 0, 0], // 你的道具数量
    daoju1: [0, 0, 0, 0, 0], // 恶魔的道具数量
    shi: 0, // 实弹数
    kong: 0, // 空弹数
    q: [], // 弹匣 (1=实, 2=空)
    T: 0, // 回合数
    Hurt: 1, // 伤害加成
    shoukao_you: false, // 你是否使用手铐
    shoukaoemo: false, // 恶魔是否使用手铐
    Know: 0, // 恶魔是否知道下一发子弹 (1=实, 2=空)
    // ... 更多变量
};

// ==========================================================
// 2. I/O 函数重写: printf/cout/scanf 转换为 print/input
// ==========================================================

// 模拟 printf 和 cout
function print(text) {
    // 使用 innerHTML 来添加内容，模拟命令行输出
    // <br> 模拟换行
    // text.replace(/\n/g, '<br>') 处理文本中的换行
    outputDiv.innerHTML += text.replace(/\n/g, '<br>') + '<br>';
    // 自动滚动到底部
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

// 模拟 Sleep (在网页端使用延迟是异步的，这里简化处理)
function wait(ms = 500) {
    // 网页中不能使用 Sleep 来暂停整个程序，而是使用 setTimeout/Promise。
    // 为了简化，我们暂时不模拟等待时间，而是立即输出。
    print("...");
}

// ==========================================================
// 3. 核心 C++ 函数 转换为 JavaScript 函数
// ==========================================================

// 模拟 C++ 的 Rand 函数
function Rand(x, y) {
    return Math.floor(Math.random() * (y - x + 1)) + x;
}

// 示例：重写 build_gun 函数
function build_gun() {
    let { shi, kong, q, daoju, daoju1, daojuname } = gameState;
    
    kong = Rand(1, 5);
    shi = Rand(1, 5);
    q.length = 0; // 清空弹匣
    
    print(`${shi}发实弹,${kong}发空弹`);
    
    // 弹匣装弹逻辑 (需要使用 JavaScript 的数组操作重写 C++ 逻辑)
    let a1 = kong, a2 = shi;
    for (let i = 0; i < kong + shi; i++) {
        let sum = Rand(1, a1 + a2);
        if (sum <= a1) {
            a1--;
            q.push(2); // 2: 空弹
        } else {
            a2--;
            q.push(1); // 1: 实弹
        }
    }
    // C++ 中 qlen 是计数，JavaScript 可以直接用 q.length
    
    // 道具发放逻辑 (也需要重写)
    // ... (省略复杂的道具发放逻辑)

    print("--- 请按 Enter 开始回合 ---");
    gameState.shi = shi;
    gameState.kong = kong;
    // ... 更新其他 gameState
}

// 示例：重写 Timeyou 函数
function Timeyou(command) {
    let { Your, Other, shi, kong, daojuname, daoju } = gameState;
    
    // 1. 显示状态 (C++ 中的大量 printf/cout)
    print(`你的生命:${Your}/6\n恶魔生命:${Other}/6`);
    print(`剩余实弹数:${shi} 剩余空弹数:${kong}`);
    print("你现在拥有的道具:");
    daoju.forEach((count, index) => {
        print(`${daojuname[index]}${count}个`);
    });

    // 2. 提示和接收输入 (这是最关键的转换)
    if (!command) {
        print("\n你要\n1.向恶魔开枪\n2.向自己开枪\n3.使用放大镜...\n");
        return; // 等待用户输入
    }
    
    const x = parseInt(command);

    if (isNaN(x) || x < 1 || x > 7) {
        print("输入不合法\n");
        return;
    }
    
    // 3. 游戏逻辑 (C++ 的 if/else 结构)
    if (x === 1) {
        // ... (重写向恶魔开枪的逻辑)
        print("你决定向恶魔开枪");
        // 检查弹匣 q
        // 更新 shi/kong, Other, Yourmoney, T, shoukao_you 等
        // 调用 IsOver()
    } else if (x === 2) {
        // ... (重写向自己开枪的逻辑)
    } else if (x === 3) {
        // ... (重写使用道具的逻辑)
    }
    
    // 4. 回合结束，切换到恶魔回合
    // gameState.T++;
    // Timeother(); 
}

// ... 您需要重写所有的函数：IsOver, Timeother, fightyou, fightemo, Play 等。

// ==========================================================
// 4. 网页输入处理循环
// ==========================================================

// 当前游戏状态，用于控制输入应该做什么
let gamePhase = 'INIT';

function processCommand(command) {
    // 清除输入框
    inputField.value = '';
    
    // 将用户输入的命令显示到输出区
    print(`> ${command}`);

    if (gamePhase === 'INIT') {
        // 游戏模式选择 (单人/双人)
        const mode = parseInt(command);
        if (mode === 1) {
            print("你选择了单人模式。");
            gamePhase = 'START_RULES';
            print("准备好参与恶魔的游戏吗？\n1.好的\n2.没问题\n");
        } else if (mode === 2) {
            print("双人模式尚未实现。请选择 1.");
            print("请选择你想要的模式：\n1.单人\n2.双人（此模式中，生命值为4，道具补给为2）\n");
        } else {
            print("输入不合法，请重新输入 1 或 2。");
        }
    } else if (gamePhase === 'START_RULES') {
        // 规则确认
        // ... 省略规则确认逻辑
        gamePhase = 'PLAYING';
        build_gun();
    } else if (gamePhase === 'PLAYING') {
        // 游戏进行中：根据当前回合处理输入
        if (gameState.T % 2 === 0) {
            Timeyou(command); // 玩家回合
            // 检查是否应该切换到恶魔回合
            if (gameState.T % 2 !== 0) { 
                 // 使用 setTimeout 模拟恶魔思考时间
                 setTimeout(Timeother, 2000); 
            }
        } else {
            // 恶魔回合不需要玩家输入，直接跳过
            print("现在是恶魔的回合，请稍候...");
        }
    }
}

// 监听用户按下 Enter 键
inputField.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        const command = inputField.value.trim();
        if (command) {
            // 阻止默认的 Enter 行为（如提交表单）
            event.preventDefault(); 
            processCommand(command);
        }
    }
});

// 游戏启动
print("请选择你想要的模式：\n1.单人\n2.双人（此模式中，生命值为4，道具补给为2）\n");
gamePhase = 'INIT';
