const canvas = document.getElementById('magicCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to window size
function resizeCanvas() {
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 40;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Drawing state
let isDrawing = false;
let lastX = 0;
let lastY = 0;
let hue = 0;
let colorOffset = 0;

// Brush properties
let brushIndex = 0;
let currentBrush;
let currentWidth = getRandomWidth();
let brushHistory = [];

// Random width generator
function getRandomWidth() {
    return Math.floor(Math.random() * 30) + 5;
}

// Color effect generators
const colorEffects = [
    // Duha
    (offset) => `hsl(${(hue + offset) % 360}, 100%, 50%)`,
    // Pastelové barvy
    (offset) => `hsl(${(hue + offset) % 360}, 70%, 80%)`,
    // Neonové barvy
    (offset) => `hsl(${(hue + offset) % 360}, 100%, 60%)`,
    // Metalické barvy
    (offset) => `hsl(${(hue + offset) % 360}, 50%, 50%)`
];

function getRandomColorEffect() {
    return colorEffects[Math.floor(Math.random() * colorEffects.length)];
}

// Define all brush types
const brushTypes = [
    // Klasický štětec
    {
        name: "Klasický štětec",
        draw: (ctx, x1, y1, x2, y2) => {
            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const steps = Math.floor(distance / 2);
            
            for (let i = 0; i < steps; i++) {
                const t = i / steps;
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 1, y + 1);
                ctx.strokeStyle = getRandomColorEffect()(colorOffset + t * 50);
                ctx.stroke();
            }
        },
        setup: (ctx) => {
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    },
    // Tečkovaný štětec
    {
        name: "Tečkovaný štětec",
        draw: (ctx, x1, y1, x2, y2) => {
            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const steps = Math.floor(distance / 10);
            for (let i = 0; i < steps; i++) {
                const t = i / steps;
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                ctx.beginPath();
                ctx.arc(x, y, currentWidth / 4, 0, Math.PI * 2);
                ctx.fillStyle = getRandomColorEffect()(colorOffset + t * 30);
                ctx.fill();
            }
        },
        setup: (ctx) => {}
    },
    // Hvězdičkový štětec
    {
        name: "Hvězdičkový štětec",
        draw: (ctx, x1, y1, x2, y2) => {
            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const steps = Math.floor(distance / 20);
            for (let i = 0; i < steps; i++) {
                const t = i / steps;
                const x = x1 + (x2 - x1) * t;
                const y = y1 + (y2 - y1) * t;
                ctx.fillStyle = getRandomColorEffect()(colorOffset + t * 20);
                drawStar(ctx, x, y, currentWidth / 2, currentWidth / 4, 5);
            }
        },
        setup: (ctx) => {}
    },
    // Spirálový štětec
    {
        name: "Spirálový štětec",
        draw: (ctx, x1, y1, x2, y2) => {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const steps = Math.floor(distance / 5);
            
            for (let i = 0; i < steps; i++) {
                const t = i / steps;
                const radius = currentWidth * (1 - t);
                const x = x1 + (x2 - x1) * t + Math.cos(angle + t * 10) * radius;
                const y = y1 + (y2 - y1) * t + Math.sin(angle + t * 10) * radius;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fillStyle = getRandomColorEffect()(colorOffset + t * 40);
                ctx.fill();
            }
        },
        setup: (ctx) => {}
    },
    // Vlnkový štětec
    {
        name: "Vlnkový štětec",
        draw: (ctx, x1, y1, x2, y2) => {
            const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            const steps = Math.floor(distance / 2);
            const angle = Math.atan2(y2 - y1, x2 - x1);
            
            for (let i = 0; i < steps; i++) {
                const t = i / steps;
                const wave = Math.sin(t * 20) * currentWidth / 2;
                const x = x1 + (x2 - x1) * t + Math.cos(angle + Math.PI/2) * wave;
                const y = y1 + (y2 - y1) * t + Math.sin(angle + Math.PI/2) * wave;
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2);
                ctx.fillStyle = getRandomColorEffect()(colorOffset + t * 25);
                ctx.fill();
            }
        },
        setup: (ctx) => {}
    }
];

// Helper function to draw a star
function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
}

// Select a random brush and add to history
function selectRandomBrush() {
    const randomIndex = Math.floor(Math.random() * brushTypes.length);
    currentBrush = brushTypes[randomIndex];
    brushHistory.push(currentBrush);
    brushIndex = brushHistory.length - 1;
    
    // Update color
    hue = (hue + 30) % 360;
    colorOffset = Math.random() * 360;
    
    // Setup
    currentBrush.setup(ctx);
    
    // Display brush name
    updateBrushInfo();
}

// Go back to previous brush
function selectPreviousBrush() {
    if (brushHistory.length > 1 && brushIndex > 0) {
        brushIndex--;
        currentBrush = brushHistory[brushIndex];
        currentBrush.setup(ctx);
        
        // Update color
        hue = (hue + 15) % 360;
        colorOffset = Math.random() * 360;
        
        // Display brush name
        updateBrushInfo();
    }
}

// Display current brush info
function updateBrushInfo() {
    const infoElement = document.getElementById('brushInfo');
    if (infoElement) {
        infoElement.textContent = `Nástroj: ${currentBrush.name} (${brushIndex + 1}/${brushHistory.length})`;
    }
}

// Drawing functions
function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
    
    // Only update color values, not brush type
    hue = (hue + 5) % 360;
}

function draw(e) {
    if (!isDrawing) return;
    
    currentBrush.draw(ctx, lastX, lastY, e.offsetX, e.offsetY);
    [lastX, lastY] = [e.offsetX, e.offsetY];
    hue = (hue + 0.5) % 360;
}

function stopDrawing() {
    isDrawing = false;
}

// Event listeners
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'c') {
        selectRandomBrush();
    } else if (e.key.toLowerCase() === 'x') {
        selectPreviousBrush();
    }
});

// Touch support
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX - rect.left,
        clientY: touch.clientY - rect.top
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX - rect.left,
        clientY: touch.clientY - rect.top
    });
    canvas.dispatchEvent(mouseEvent);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    const mouseEvent = new MouseEvent('mouseup', {});
    canvas.dispatchEvent(mouseEvent);
});

// Initialize first brush
selectRandomBrush(); 