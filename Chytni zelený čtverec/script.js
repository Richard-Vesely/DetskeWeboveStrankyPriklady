const square = document.getElementById('square');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('start-btn');
const gameContainer = document.getElementById('game-container');
const livesEl = document.getElementById('lives');

let score = 0;
let timeLeft = 10;
let gameActive = false;
let timerInterval;
let lives = 3;

function getRandomPosition() {
    const containerRect = gameContainer.getBoundingClientRect();
    const squareSize = 60;
    const maxLeft = containerRect.width - squareSize;
    const maxTop = containerRect.height - squareSize;
    const left = Math.random() * maxLeft;
    const top = Math.random() * maxTop;
    return { left, top };
}

function moveSquare() {
    const pos = getRandomPosition();
    square.style.left = pos.left + 'px';
    square.style.top = pos.top + 'px';
}

function startGame() {
    score = 0;
    timeLeft = 10;
    lives = 3;
    gameActive = true;
    scoreEl.textContent = score;
    timerEl.textContent = timeLeft;
    livesEl.textContent = lives;
    startBtn.disabled = true;
    square.style.display = 'block';
    moveSquare();
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    square.style.display = 'none';
    startBtn.disabled = false;
    alert('Konec hry! Tvé skóre: ' + score);
}

square.addEventListener('click', () => {
    if (!gameActive) return;
    score++;
    scoreEl.textContent = score;
    moveSquare();
});

gameContainer.addEventListener('click', (e) => {
    if (!gameActive) return;
    // Pokud kliknu na čtverec, neodečítám život (to řešíme v handleru níže)
    if (e.target === square) return;
    lives--;
    livesEl.textContent = lives;
    // Bliknutí červeně
    gameContainer.classList.add('blink-red');
    setTimeout(() => {
        gameContainer.classList.remove('blink-red');
    }, 200);
    if (lives <= 0) {
        endGame();
    }
});

startBtn.addEventListener('click', startGame); 