// Canvas setup
const canvas = document.getElementById('fireworksCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to full window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initialize canvas size
resizeCanvas();

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Track mouse state and position
let isMouseDown = false;
let clickStartTime = 0;
let mouseX = 0;
let mouseY = 0;
let particles = [];
let chargeParticles = []; // For the charging effect

// Constants for firework behavior
const GRAVITY = 0.1;
const MIN_PARTICLES = 50;
const MAX_PARTICLES = 200;
const MIN_VELOCITY = 2;
const MAX_VELOCITY = 5;
const MIN_SIZE = 2;
const MAX_SIZE = 4;
const PARTICLE_LIFE = 100;
const MIN_HOLD_TIME = 100; // milliseconds
const MAX_HOLD_TIME = 7000; // 7 seconds for max size and auto-explosion

// Pink and purple color palette for the charging effect
const CHARGE_COLORS = [
    '#FF80AB', '#FF4081', '#F50057', '#C51162', // Pink shades
    '#EA80FC', '#E040FB', '#D500F9', '#AA00FF', // Purple shades
    '#FFD8E6', '#FFB6C1', '#FFC0CB', '#FF69B4'  // Light pink shades
];

// Class to represent a single particle in the firework
class Particle {
    constructor(x, y, color, size, velocity, gravity) {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.color = color;
        this.size = size;
        this.velocity = velocity;
        this.gravity = gravity;
        this.life = PARTICLE_LIFE;
        this.alpha = 1;
    }

    update() {
        // Apply velocity
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Apply gravity
        this.velocity.y += this.gravity;
        
        // Decrease life
        this.life--;
        
        // Fade out
        this.alpha = this.life / PARTICLE_LIFE;
        
        return this.life > 0;
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

// Class for the magical charging effect particles
class ChargeParticle {
    constructor(x, y, baseAngle, distanceFromCenter, orbitSpeed, size, color) {
        this.baseAngle = baseAngle;
        this.angle = baseAngle;
        this.distanceFromCenter = distanceFromCenter;
        this.orbitSpeed = orbitSpeed;
        this.size = size;
        this.color = color;
        this.pulseSpeed = 0.05 + Math.random() * 0.1;
        this.pulseAmount = 0.5 + Math.random() * 0.5;
        this.sparkle = Math.random() > 0.7;
        this.sparkleRate = 0.1 + Math.random() * 0.2;
        this.sparklePhase = Math.random() * Math.PI * 2;
    }

    update(x, y, holdTimeRatio) {
        // Update orbit angle
        this.angle += this.orbitSpeed;
        
        // Calculate growth factor - start small and grow over time
        const growthFactor = 0.2 + holdTimeRatio * 0.8;
        
        // Adjust distance based on hold time (start very small)
        this.currentDistance = this.distanceFromCenter * growthFactor;
        
        // Calculate position based on current mouse position
        this.x = x + Math.cos(this.angle) * this.currentDistance;
        this.y = y + Math.sin(this.angle) * this.currentDistance;
        
        // Pulsing size effect - also affected by growth
        this.currentSize = this.size * growthFactor * (1 + Math.sin(Date.now() * this.pulseSpeed) * this.pulseAmount);
    }

    draw() {
        // Add glow effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.currentSize * 2
        );
        
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.6, this.color + '80'); // 50% opacity
        gradient.addColorStop(1, this.color + '00');  // 0% opacity
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Main circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Add sparkle effect to some particles
        if (this.sparkle) {
            const sparkleOpacity = (Math.sin(Date.now() * this.sparkleRate + this.sparklePhase) + 1) / 2;
            
            if (sparkleOpacity > 0.7) {
                ctx.fillStyle = '#FFFFFF';
                ctx.globalAlpha = sparkleOpacity;
                
                // Sparkle shape
                ctx.beginPath();
                const sparkleSize = this.currentSize * 0.5;
                for (let i = 0; i < 4; i++) {
                    const angle = i * Math.PI / 2;
                    const x1 = this.x + Math.cos(angle) * sparkleSize * 2;
                    const y1 = this.y + Math.sin(angle) * sparkleSize * 2;
                    const x2 = this.x + Math.cos(angle + Math.PI/4) * sparkleSize;
                    const y2 = this.y + Math.sin(angle + Math.PI/4) * sparkleSize;
                    
                    if (i === 0) {
                        ctx.moveTo(x1, y1);
                    } else {
                        ctx.lineTo(x1, y1);
                    }
                    ctx.lineTo(x2, y2);
                }
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }
    }
}

// Generate a random color
function getRandomColor() {
    const colors = [
        '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
        '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', 
        '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', 
        '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Get a random charge color (pinks/purples)
function getRandomChargeColor() {
    return CHARGE_COLORS[Math.floor(Math.random() * CHARGE_COLORS.length)];
}

// Create the magical charging effect
function createChargingEffect(x, y) {
    chargeParticles = [];
    
    // Create orbiting particles
    const numOrbits = 3; // Number of orbital rings
    const particlesPerOrbit = 5; // Base number of particles per ring
    
    for (let orbit = 0; orbit < numOrbits; orbit++) {
        const orbitDistance = 20 + orbit * 15; // Increasing distance for each orbit
        const particleCount = particlesPerOrbit + orbit * 2;
        const orbitSpeed = 0.03 - orbit * 0.005; // Outer orbits move slower
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const size = 3 - orbit * 0.5; // Smaller particles in outer orbits
            
            chargeParticles.push(new ChargeParticle(
                x, y,
                angle,
                orbitDistance,
                orbitSpeed,
                size,
                getRandomChargeColor()
            ));
        }
    }
}

// Create firework explosion
function createFirework(x, y, holdTime) {
    // Calculate scale factor based on hold time
    const holdTimeRatio = Math.min(1, (holdTime - MIN_HOLD_TIME) / (MAX_HOLD_TIME - MIN_HOLD_TIME));
    const particleCount = Math.floor(MIN_PARTICLES + holdTimeRatio * (MAX_PARTICLES - MIN_PARTICLES));
    
    // Generate multiple colors for this explosion
    const color1 = getRandomColor();
    const color2 = getRandomColor();
    const color3 = getRandomColor();
    const colors = [color1, color2, color3];
    
    // Create particles in a circular explosion
    for (let i = 0; i < particleCount; i++) {
        // Random angle and velocity
        const angle = Math.random() * Math.PI * 2;
        const velocityMagnitude = MIN_VELOCITY + Math.random() * (MAX_VELOCITY - MIN_VELOCITY) * (1 + holdTimeRatio);
        
        // Create particle
        const particle = new Particle(
            x,
            y,
            colors[Math.floor(Math.random() * colors.length)],
            MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE) * (1 + holdTimeRatio),
            {
                x: Math.cos(angle) * velocityMagnitude,
                y: Math.sin(angle) * velocityMagnitude
            },
            GRAVITY
        );
        
        particles.push(particle);
    }
    
    // Clear charging particles
    chargeParticles = [];
}

// Handle mouse events
canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    clickStartTime = Date.now();
    mouseX = e.clientX;
    mouseY = e.clientY;
    createChargingEffect(mouseX, mouseY);
});

canvas.addEventListener('mouseup', (e) => {
    if (isMouseDown) {
        const holdTime = Date.now() - clickStartTime;
        if (holdTime >= MIN_HOLD_TIME) {
            createFirework(mouseX, mouseY, holdTime);
        }
        isMouseDown = false;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }
});

// Touch support for mobile devices
canvas.addEventListener('touchstart', (e) => {
    isMouseDown = true;
    clickStartTime = Date.now();
    mouseX = e.touches[0].clientX;
    mouseY = e.touches[0].clientY;
    createChargingEffect(mouseX, mouseY);
    e.preventDefault();
});

canvas.addEventListener('touchend', (e) => {
    if (isMouseDown) {
        const holdTime = Date.now() - clickStartTime;
        if (holdTime >= MIN_HOLD_TIME) {
            createFirework(mouseX, mouseY, holdTime);
        }
        isMouseDown = false;
    }
    e.preventDefault();
});

canvas.addEventListener('touchmove', (e) => {
    if (isMouseDown) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }
    e.preventDefault();
});

// Animation loop
function animate() {
    // Create semi-transparent background for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles = particles.filter(particle => {
        const isAlive = particle.update();
        if (isAlive) {
            particle.draw();
        }
        return isAlive;
    });
    
    // Visual feedback for click and hold
    if (isMouseDown) {
        const currentTime = Date.now();
        const holdTime = currentTime - clickStartTime;
        
        // Check if we should auto-explode after 7 seconds
        if (holdTime >= MAX_HOLD_TIME) {
            createFirework(mouseX, mouseY, MAX_HOLD_TIME);
            isMouseDown = false;
        } else if (holdTime >= MIN_HOLD_TIME) {
            const holdTimeRatio = Math.min(1, (holdTime - MIN_HOLD_TIME) / (MAX_HOLD_TIME - MIN_HOLD_TIME));
            
            // Growth factor for the central circle - start small
            const growthFactor = 0.2 + holdTimeRatio * 0.8;
            
            // Draw main charging circle
            const radius = (10 + holdTimeRatio * 25) * growthFactor;
            const pulseAmount = Math.sin(Date.now() * 0.01) * 3 * growthFactor;
            
            // Glowing center
            const gradient = ctx.createRadialGradient(
                mouseX, mouseY, 0,
                mouseX, mouseY, radius * 1.5
            );
            
            gradient.addColorStop(0, 'rgba(255, 64, 129, 0.8)');
            gradient.addColorStop(0.6, 'rgba(255, 64, 129, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 64, 129, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, radius + pulseAmount, 0, Math.PI * 2);
            ctx.fill();
            
            // Update and draw charging particles, passing in current mouse position
            chargeParticles.forEach(particle => {
                particle.update(mouseX, mouseY, holdTimeRatio);
                particle.draw();
            });
            
            // Add magical sparkles occasionally
            if (Math.random() > 0.7) {
                for (let i = 0; i < 2; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * radius;
                    
                    particles.push(new Particle(
                        mouseX + Math.cos(angle) * distance,
                        mouseY + Math.sin(angle) * distance,
                        getRandomChargeColor(),
                        1 + Math.random() * 2,
                        {
                            x: (Math.random() - 0.5) * 1.5,
                            y: (Math.random() - 0.5) * 1.5 - 1 // Slight upward bias
                        },
                        GRAVITY * 0.1
                    ));
                }
            }
        }
    }
    
    requestAnimationFrame(animate);
}

// Start animation
animate(); 