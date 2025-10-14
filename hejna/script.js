// Get the canvas and its context
const canvas = document.getElementById('simulation');
const ctx = canvas.getContext('2d');

// Set canvas size to match its display size
function resizeCanvas() {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

// Simulation parameters (will be updated from UI)
let params = {
    numBoids: 100,
    separationForce: 0.05,
    alignmentForce: 0.05,
    cohesionForce: 0.05,
    perceptionRadius: 50,
    maxSpeed: 4,
    scareRadius: 100,
    scareFactor: 1,
    scareEffect: 2000 // Duration of scare effect in ms
};

// Scare point - where the user clicked
let scarePoint = null;
let scareTime = 0;

// Boid class
class Boid {
    constructor() {
        this.position = new Vector(
            Math.random() * canvas.width,
            Math.random() * canvas.height
        );
        this.velocity = Vector.random2D();
        this.velocity.setMag(Math.random() * 2 + 2);
        this.acceleration = new Vector(0, 0);
        this.size = 5; // Size of the arrow/boid
    }
    
    // Apply forces based on Reynolds' rules
    flock(boids) {
        // Calculate the three forces
        const separation = this.separate(boids);
        const alignment = this.align(boids);
        const cohesion = this.cohere(boids);
        
        // Apply forces with their respective weights
        separation.mult(params.separationForce);
        alignment.mult(params.alignmentForce);
        cohesion.mult(params.cohesionForce);
        
        // Add forces to acceleration
        this.acceleration.add(separation);
        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        
        // Apply scare force if scarePoint exists and is recent
        if (scarePoint && Date.now() - scareTime < params.scareEffect) {
            const scare = this.getScareForce(scarePoint);
            scare.mult(params.scareFactor);
            this.acceleration.add(scare);
        }
    }
    
    // Separation: steer to avoid crowding local flockmates
    separate(boids) {
        const steeringForce = new Vector(0, 0);
        let total = 0;
        
        for (const other of boids) {
            // Calculate distance with periodic boundary conditions
            const d = this.distanceTo(other);
            
            // Check if the boid is within perception radius and not the current boid
            if (other !== this && d < params.perceptionRadius) {
                // Calculate steering force away from neighbor
                const diff = Vector.sub(this.position, other.position);
                diff.normalize();
                diff.div(d); // Weight by distance (closer boids have stronger effect)
                steeringForce.add(diff);
                total++;
            }
        }
        
        // Average the steering force
        if (total > 0) {
            steeringForce.div(total);
            steeringForce.setMag(params.maxSpeed);
            steeringForce.sub(this.velocity);
        }
        
        return steeringForce;
    }
    
    // Alignment: steer towards the average heading of local flockmates
    align(boids) {
        const averageVelocity = new Vector(0, 0);
        let total = 0;
        
        for (const other of boids) {
            // Calculate distance with periodic boundary conditions
            const d = this.distanceTo(other);
            
            // Check if the boid is within perception radius and not the current boid
            if (other !== this && d < params.perceptionRadius) {
                averageVelocity.add(other.velocity);
                total++;
            }
        }
        
        // Calculate steering force towards average velocity
        if (total > 0) {
            averageVelocity.div(total);
            averageVelocity.setMag(params.maxSpeed);
            averageVelocity.sub(this.velocity);
        }
        
        return averageVelocity;
    }
    
    // Cohesion: steer to move toward the average position of local flockmates
    cohere(boids) {
        const averagePosition = new Vector(0, 0);
        let total = 0;
        
        for (const other of boids) {
            // Calculate distance with periodic boundary conditions
            const d = this.distanceTo(other);
            
            // Check if the boid is within perception radius and not the current boid
            if (other !== this && d < params.perceptionRadius) {
                // We need to get the closest position considering periodic boundaries
                const closestPos = this.getClosestPosition(other.position);
                averagePosition.add(closestPos);
                total++;
            }
        }
        
        // Calculate steering force towards average position
        if (total > 0) {
            averagePosition.div(total);
            const desired = Vector.sub(averagePosition, this.position);
            desired.setMag(params.maxSpeed);
            desired.sub(this.velocity);
            return desired;
        }
        
        return new Vector(0, 0);
    }
    
    // Calculate scare force (away from scare point)
    getScareForce(point) {
        const force = new Vector(0, 0);
        const d = this.distanceToPoint(point);
        
        if (d < params.scareRadius) {
            // Calculate direction away from scare point
            const diff = Vector.sub(this.position, point);
            diff.normalize();
            diff.div(d / 10); // Stronger when closer
            force.add(diff);
            
            // Set magnitude based on distance
            const magnitude = map(d, 0, params.scareRadius, params.maxSpeed * 2, 0);
            force.setMag(magnitude);
        }
        
        return force;
    }
    
    // Update position based on velocity and acceleration
    update() {
        // Update velocity based on acceleration
        this.velocity.add(this.acceleration);
        
        // Limit velocity to max speed
        this.velocity.limit(params.maxSpeed);
        
        // Update position based on velocity
        this.position.add(this.velocity);
        
        // Apply periodic boundary conditions
        this.edges();
        
        // Reset acceleration for next frame
        this.acceleration.mult(0);
    }
    
    // Handle edges with periodic boundary conditions
    edges() {
        if (this.position.x > canvas.width) this.position.x = 0;
        if (this.position.x < 0) this.position.x = canvas.width;
        if (this.position.y > canvas.height) this.position.y = 0;
        if (this.position.y < 0) this.position.y = canvas.height;
    }
    
    // Calculate distance to another boid considering periodic boundaries
    distanceTo(other) {
        const closestPos = this.getClosestPosition(other.position);
        return Vector.dist(this.position, closestPos);
    }
    
    // Calculate distance to a point considering periodic boundaries
    distanceToPoint(point) {
        const closestPos = this.getClosestPosition(point);
        return Vector.dist(this.position, closestPos);
    }
    
    // Get the closest position considering periodic boundaries
    getClosestPosition(otherPos) {
        // Calculate the direct position
        const direct = new Vector(otherPos.x, otherPos.y);
        
        // Calculate positions with wrapping
        const candidates = [
            direct,
            new Vector(otherPos.x - canvas.width, otherPos.y),
            new Vector(otherPos.x + canvas.width, otherPos.y),
            new Vector(otherPos.x, otherPos.y - canvas.height),
            new Vector(otherPos.x, otherPos.y + canvas.height),
            new Vector(otherPos.x - canvas.width, otherPos.y - canvas.height),
            new Vector(otherPos.x + canvas.width, otherPos.y - canvas.height),
            new Vector(otherPos.x - canvas.width, otherPos.y + canvas.height),
            new Vector(otherPos.x + canvas.width, otherPos.y + canvas.height)
        ];
        
        // Find the closest candidate
        let closestDist = Infinity;
        let closest = direct;
        
        for (const candidate of candidates) {
            const d = Vector.dist(this.position, candidate);
            if (d < closestDist) {
                closestDist = d;
                closest = candidate;
            }
        }
        
        return closest;
    }
    
    // Draw the boid as a blue arrow
    draw() {
        ctx.fillStyle = 'rgba(52, 152, 219, 0.9)';
        ctx.strokeStyle = 'rgba(41, 128, 185, 1)';
        ctx.lineWidth = 1;
        
        // Calculate the arrow shape based on velocity direction
        const angle = Math.atan2(this.velocity.y, this.velocity.x);
        
        ctx.save();
        ctx.translate(this.position.x, this.position.y);
        ctx.rotate(angle);
        
        // Draw arrow shape
        ctx.beginPath();
        ctx.moveTo(this.size * 2, 0);
        ctx.lineTo(-this.size, this.size);
        ctx.lineTo(-this.size, -this.size);
        ctx.closePath();
        
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
    }
}

// Vector class for 2D vector operations
class Vector {
    constructor(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    
    // Get vector magnitude
    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    
    // Add another vector
    add(v) {
        if (v instanceof Vector) {
            this.x += v.x;
            this.y += v.y;
        } else {
            this.x += v;
            this.y += v;
        }
        return this;
    }
    
    // Subtract another vector
    sub(v) {
        if (v instanceof Vector) {
            this.x -= v.x;
            this.y -= v.y;
        } else {
            this.x -= v;
            this.y -= v;
        }
        return this;
    }
    
    // Multiply by scalar
    mult(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }
    
    // Divide by scalar
    div(n) {
        if (n !== 0) {
            this.x /= n;
            this.y /= n;
        }
        return this;
    }
    
    // Normalize the vector (set magnitude to 1)
    normalize() {
        const mag = this.mag();
        if (mag !== 0) {
            this.div(mag);
        }
        return this;
    }
    
    // Set the magnitude
    setMag(n) {
        return this.normalize().mult(n);
    }
    
    // Limit magnitude to max value
    limit(max) {
        if (this.mag() > max) {
            this.setMag(max);
        }
        return this;
    }
    
    // Static methods
    
    // Create a vector from angle
    static fromAngle(angle) {
        return new Vector(Math.cos(angle), Math.sin(angle));
    }
    
    // Create a random 2D unit vector
    static random2D() {
        const angle = Math.random() * Math.PI * 2;
        return Vector.fromAngle(angle);
    }
    
    // Vector subtraction
    static sub(v1, v2) {
        return new Vector(v1.x - v2.x, v1.y - v2.y);
    }
    
    // Calculate distance between two vectors
    static dist(v1, v2) {
        return Math.sqrt(Math.pow(v2.x - v1.x, 2) + Math.pow(v2.y - v1.y, 2));
    }
}

// Utility function for mapping values from one range to another
function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}

// Array to store all boids
let boids = [];

// Initialize the simulation
function initSimulation() {
    boids = [];
    for (let i = 0; i < params.numBoids; i++) {
        boids.push(new Boid());
    }
}

// Update simulation state
function update() {
    // Apply flocking behavior
    for (const boid of boids) {
        boid.flock(boids);
    }
    
    // Update positions
    for (const boid of boids) {
        boid.update();
    }
}

// Draw the simulation
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all boids
    for (const boid of boids) {
        boid.draw();
    }
    
    // Draw scare point if active
    if (scarePoint && Date.now() - scareTime < params.scareEffect) {
        const alpha = map(Date.now() - scareTime, 0, params.scareEffect, 0.8, 0);
        ctx.beginPath();
        ctx.arc(scarePoint.x, scarePoint.y, params.scareRadius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(231, 76, 60, ${alpha})`;
        ctx.fill();
    }
}

// Animation loop
function animate() {
    resizeCanvas();
    update();
    draw();
    requestAnimationFrame(animate);
}

// Update UI parameter displays
function updateParameterDisplays() {
    document.getElementById('numBoidsValue').textContent = params.numBoids;
    document.getElementById('separationForceValue').textContent = params.separationForce;
    document.getElementById('alignmentForceValue').textContent = params.alignmentForce;
    document.getElementById('cohesionForceValue').textContent = params.cohesionForce;
    document.getElementById('perceptionRadiusValue').textContent = params.perceptionRadius;
    document.getElementById('maxSpeedValue').textContent = params.maxSpeed;
    document.getElementById('scareRadiusValue').textContent = params.scareRadius;
    document.getElementById('scareFactorValue').textContent = params.scareFactor;
    document.getElementById('scareEffectValue').textContent = params.scareEffect;
}

// Setup UI controls
function setupControls() {
    // Number of boids
    document.getElementById('numBoids').addEventListener('input', function() {
        params.numBoids = parseInt(this.value);
        document.getElementById('numBoidsValue').textContent = params.numBoids;
    });
    
    // Separation force
    document.getElementById('separationForce').addEventListener('input', function() {
        params.separationForce = parseFloat(this.value);
        document.getElementById('separationForceValue').textContent = params.separationForce;
    });
    
    // Alignment force
    document.getElementById('alignmentForce').addEventListener('input', function() {
        params.alignmentForce = parseFloat(this.value);
        document.getElementById('alignmentForceValue').textContent = params.alignmentForce;
    });
    
    // Cohesion force
    document.getElementById('cohesionForce').addEventListener('input', function() {
        params.cohesionForce = parseFloat(this.value);
        document.getElementById('cohesionForceValue').textContent = params.cohesionForce;
    });
    
    // Perception radius
    document.getElementById('perceptionRadius').addEventListener('input', function() {
        params.perceptionRadius = parseInt(this.value);
        document.getElementById('perceptionRadiusValue').textContent = params.perceptionRadius;
    });
    
    // Max speed
    document.getElementById('maxSpeed').addEventListener('input', function() {
        params.maxSpeed = parseInt(this.value);
        document.getElementById('maxSpeedValue').textContent = params.maxSpeed;
    });
    
    // Scare radius
    document.getElementById('scareRadius').addEventListener('input', function() {
        params.scareRadius = parseInt(this.value);
        document.getElementById('scareRadiusValue').textContent = params.scareRadius;
    });
    
    // Scare factor
    document.getElementById('scareFactor').addEventListener('input', function() {
        params.scareFactor = parseFloat(this.value);
        document.getElementById('scareFactorValue').textContent = params.scareFactor;
    });
    
    // Scare effect duration
    document.getElementById('scareEffect').addEventListener('input', function() {
        params.scareEffect = parseInt(this.value);
        document.getElementById('scareEffectValue').textContent = params.scareEffect;
    });
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', function() {
        initSimulation();
    });
    
    // Click to scare
    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        scarePoint = new Vector(x, y);
        scareTime = Date.now();
    });
}

// Initialize the application when the page loads
window.addEventListener('load', function() {
    resizeCanvas();
    initSimulation();
    setupControls();
    updateParameterDisplays();
    animate();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
}); 