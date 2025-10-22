// game-over.js
const finalScoreElement = document.getElementById('final-score');
finalScoreElement.textContent = localStorage.getItem('finalScore');  // 假设分数存储在 local
