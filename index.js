// index.js

function startGame() {
    window.location.href = 'game.html';  // 跳转到游戏页面
}

function showInstructions() {
    document.getElementById('instructions').style.display = 'block';
}

function hideInstructions() {
    document.getElementById('instructions').style.display = 'none';
}
