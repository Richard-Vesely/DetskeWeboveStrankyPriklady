// Color Catch Game

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;
const PADDLE_Y = CANVAS_HEIGHT - 40;
const ORB_RADIUS = 15;
const ORB_COLORS = ['red', 'green', 'blue', 'yellow'];
const COLOR_CYCLE_TIME = 5000; // ms
const ORB_SPAWN_INTERVAL = 800; // ms
const INITIAL_FALL_SPEED = 2; // px/frame
const SPEED_INCREASE_INTERVAL = 10000; // ms
const SPEED_INCREASE_AMOUNT = 0.5;
const MAX_LIVES = 3;

// Game state
let paddleX = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
let paddleColorIndex = 0;
let paddleColor = ORB_COLORS[paddleColorIndex];
let leftPressed = false;
let rightPressed = false;
let orbs = [];
let score = 0;
let lives = MAX_LIVES;
let fallSpeed = INITIAL_FALL_SPEED;
let lastSpeedIncrease = Date.now();
let gameOver = false;

// HUD elements
const scoreDiv = document.getElementById('score');
const livesDiv = document.getElementById('lives');

// Paddle color cycling
setInterval(() => {
  paddleColorIndex = (paddleColorIndex + 1) % ORB_COLORS.length;
  paddleColor = ORB_COLORS[paddleColorIndex];
}, COLOR_CYCLE_TIME);

// Orb spawning
function spawnOrb() {
  if (gameOver) return;
  const x = ORB_RADIUS + Math.random() * (CANVAS_WIDTH - 2 * ORB_RADIUS);
  const color = ORB_COLORS[Math.floor(Math.random() * ORB_COLORS.length)];
  orbs.push({ x, y: -ORB_RADIUS, color });
}
setInterval(spawnOrb, ORB_SPAWN_INTERVAL);

// Controls
function keyDownHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    rightPressed = true;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    leftPressed = true;
  }
}
function keyUpHandler(e) {
  if (e.key === 'Right' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    rightPressed = false;
  } else if (e.key === 'Left' || e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    leftPressed = false;
  }
}
document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);

// Game loop
function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Draw paddle
  ctx.fillStyle = paddleColor;
  ctx.fillRect(paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(paddleX, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);

  // Draw orbs
  for (const orb of orbs) {
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, ORB_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = orb.color;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.closePath();
  }
}

function update() {
  if (gameOver) return;

  // Move paddle
  if (leftPressed) {
    paddleX -= 7;
    if (paddleX < 0) paddleX = 0;
  }
  if (rightPressed) {
    paddleX += 7;
    if (paddleX > CANVAS_WIDTH - PADDLE_WIDTH) paddleX = CANVAS_WIDTH - PADDLE_WIDTH;
  }

  // Move orbs
  for (const orb of orbs) {
    orb.y += fallSpeed;
  }

  // Collision detection
  for (let i = orbs.length - 1; i >= 0; i--) {
    const orb = orbs[i];
    // Check if orb is at paddle level
    if (
      orb.y + ORB_RADIUS >= PADDLE_Y &&
      orb.y - ORB_RADIUS <= PADDLE_Y + PADDLE_HEIGHT &&
      orb.x + ORB_RADIUS >= paddleX &&
      orb.x - ORB_RADIUS <= paddleX + PADDLE_WIDTH
    ) {
      if (orb.color === paddleColor) {
        score++;
      } else {
        lives--;
        if (lives <= 0) {
          lives = 0;
          gameOver = true;
          setTimeout(() => alert('Game Over! Your score: ' + score), 100);
        }
      }
      orbs.splice(i, 1);
      continue;
    }
    // Remove orbs that fall off screen
    if (orb.y - ORB_RADIUS > CANVAS_HEIGHT) {
      orbs.splice(i, 1);
    }
  }

  // Increase fall speed over time
  if (Date.now() - lastSpeedIncrease > SPEED_INCREASE_INTERVAL) {
    fallSpeed += SPEED_INCREASE_AMOUNT;
    lastSpeedIncrease = Date.now();
  }

  // Update HUD
  scoreDiv.textContent = 'Score: ' + score;
  livesDiv.textContent = 'Lives: ' + lives;
}

function gameLoop() {
  update();
  draw();
  if (!gameOver) {
    requestAnimationFrame(gameLoop);
  }
}

gameLoop(); 