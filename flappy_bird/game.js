// Get the canvas and its context
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart');

// Game settings
const settings = {
    gravity: 0.5,
    flap: -8,
    birdSize: 30,
    pipeWidth: 60,
    pipeGap: 200,
    pipeSpacing: 300,
    speed: 2,
    groundHeight: 50
};

// Game state
let gameRunning = false;
let score = 0;

// Bird object
const bird = {
    x: canvas.width / 3,
    y: canvas.height / 2,
    width: settings.birdSize,
    height: settings.birdSize,
    velocity: 0,
    
    // Draw the bird on the canvas
    draw: function() {
        ctx.fillStyle = '#FFD700'; // Gold color for the bird
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird's eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(this.x + 8, this.y - 5, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Bird's beak
        ctx.fillStyle = '#FF6347'; // Tomato color
        ctx.beginPath();
        ctx.moveTo(this.x + 15, this.y);
        ctx.lineTo(this.x + 25, this.y - 5);
        ctx.lineTo(this.x + 25, this.y + 5);
        ctx.fill();
    },
    
    // Update the bird's position based on gravity
    update: function() {
        // Apply gravity
        this.velocity += settings.gravity;
        this.y += this.velocity;
        
        // Floor collision
        if (this.y + this.height / 2 > canvas.height - settings.groundHeight) {
            this.y = canvas.height - settings.groundHeight - this.height / 2;
            this.velocity = 0;
            gameOver();
        }
        
        // Ceiling collision
        if (this.y - this.height / 2 < 0) {
            this.y = this.height / 2;
            this.velocity = 0;
        }
    },
    
    // Make the bird flap (jump)
    flap: function() {
        this.velocity = settings.flap;
    }
};

// Array to store pipes
let pipes = [];
let pipeTimer = 0;

// Create a new pipe
function createPipe() {
    // Randomly place the gap between pipes
    const gapPosition = Math.random() * (canvas.height - settings.pipeGap - settings.groundHeight - 100) + 50;
    
    // Create top and bottom pipes
    pipes.push({
        x: canvas.width,
        topHeight: gapPosition,
        bottomY: gapPosition + settings.pipeGap,
        width: settings.pipeWidth,
        passed: false
    });
}

// Update and draw pipes
function updatePipes() {
    // Add new pipes periodically
    pipeTimer++;
    if (pipeTimer >= settings.pipeSpacing / settings.speed) {
        createPipe();
        pipeTimer = 0;
    }
    
    // Loop through all pipes
    for (let i = pipes.length - 1; i >= 0; i--) {
        // Move pipes to the left
        pipes[i].x -= settings.speed;
        
        // Draw top pipe
        ctx.fillStyle = '#3CB371'; // MediumSeaGreen
        ctx.fillRect(pipes[i].x, 0, pipes[i].width, pipes[i].topHeight);
        
        // Draw bottom pipe
        const bottomHeight = canvas.height - pipes[i].bottomY - settings.groundHeight;
        ctx.fillRect(pipes[i].x, pipes[i].bottomY, pipes[i].width, bottomHeight);
        
        // Check for collisions
        if (checkCollision(bird, pipes[i])) {
            gameOver();
            return;
        }
        
        // Check if bird passed the pipe
        if (!pipes[i].passed && pipes[i].x + pipes[i].width < bird.x) {
            pipes[i].passed = true;
            score++;
            scoreElement.textContent = `Score: ${score}`;
        }
        
        // Remove pipes that are off-screen
        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
        }
    }
}

// Check for collision between bird and pipe
function checkCollision(bird, pipe) {
    // Calculate bird boundaries as a circle
    const birdLeft = bird.x - bird.width / 2;
    const birdRight = bird.x + bird.width / 2;
    const birdTop = bird.y - bird.height / 2;
    const birdBottom = bird.y + bird.height / 2;
    
    // Check collision with top pipe
    if (
        birdRight > pipe.x &&
        birdLeft < pipe.x + pipe.width &&
        birdTop < pipe.topHeight
    ) {
        return true;
    }
    
    // Check collision with bottom pipe
    if (
        birdRight > pipe.x &&
        birdLeft < pipe.x + pipe.width &&
        birdBottom > pipe.bottomY
    ) {
        return true;
    }
    
    return false;
}

// Initialize the game
function init() {
    // Reset game state
    gameRunning = true;
    score = 0;
    scoreElement.textContent = `Score: ${score}`;
    pipes = [];
    pipeTimer = 0;
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    
    // Start the game loop
    gameLoop();
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background (sky)
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw pipes
    updatePipes();
    
    // Draw ground
    ctx.fillStyle = '#8B4513'; // SaddleBrown color
    ctx.fillRect(0, canvas.height - settings.groundHeight, canvas.width, settings.groundHeight);
    
    // Update and draw the bird
    bird.update();
    bird.draw();
    
    // Request the next frame
    requestAnimationFrame(gameLoop);
}

// Handle game over
function gameOver() {
    gameRunning = false;
    restartButton.style.display = 'inline-block';
}

// Event listeners
document.addEventListener('keydown', function(e) {
    // Space bar to flap
    if (e.code === 'Space') {
        if (!gameRunning) {
            init();
            restartButton.style.display = 'none';
        } else {
            bird.flap();
        }
        e.preventDefault(); // Prevent scrolling when pressing space
    }
});

restartButton.addEventListener('click', function() {
    init();
    restartButton.style.display = 'none';
});

// Initialize the game when the page loads
window.addEventListener('load', function() {
    // Draw the start screen
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - settings.groundHeight, canvas.width, settings.groundHeight);
    
    // Draw the bird
    bird.draw();
    
    // Display start message
    ctx.fillStyle = '#000';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Press SPACE to Start', canvas.width / 2, canvas.height / 2 - 50);
}); 