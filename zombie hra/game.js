class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        this.score = 0;
        
        // Hráč
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            size: 20,
            speed: 5,
            health: 100,
            medicine: 0
        };
        
        // Herní objekty
        this.zombies = [];
        this.medicines = [];
        this.thrownMedicines = [];
        
        // Ovládání
        this.keys = {};
        this.mouseX = 0;
        this.mouseY = 0;
        
        // Nastavení
        this.zombieSpawnRate = 120; // každých 120 frameů
        this.medicineSpawnRate = 180; // každých 180 frameů
        this.frameCount = 0;
        
        this.setupEventListeners();
        this.updateUI();
    }
    
    setupEventListeners() {
        // Klávesnice
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // Házení léků
            if (e.code === 'Space' && this.player.medicine > 0) {
                this.throwMedicine();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // Myš pro směr házení
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
        });
        
        // Tlačítka
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
    }
    
    startGame() {
        this.gameRunning = true;
        this.gameLoop();
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('restartBtn').style.display = 'inline-block';
        document.getElementById('gameOver').style.display = 'none';
    }
    
    restartGame() {
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height / 2;
        this.player.health = 100;
        this.player.medicine = 0;
        this.score = 0;
        this.zombies = [];
        this.medicines = [];
        this.thrownMedicines = [];
        this.frameCount = 0;
        this.gameRunning = true;
        this.updateUI();
        document.getElementById('restartBtn').style.display = 'none';
        document.getElementById('gameOver').style.display = 'none';
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        this.update();
        this.draw();
        this.frameCount++;
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        this.updatePlayer();
        this.updateZombies();
        this.updateMedicines();
        this.updateThrownMedicines();
        this.spawnZombies();
        this.spawnMedicines();
        this.checkCollisions();
        
        if (this.player.health <= 0) {
            this.gameOver();
        }
    }
    
    updatePlayer() {
        // Pohyb hráče
        if (this.keys['w'] || this.keys['arrowup']) {
            this.player.y = Math.max(this.player.size, this.player.y - this.player.speed);
        }
        if (this.keys['s'] || this.keys['arrowdown']) {
            this.player.y = Math.min(this.canvas.height - this.player.size, this.player.y + this.player.speed);
        }
        if (this.keys['a'] || this.keys['arrowleft']) {
            this.player.x = Math.max(this.player.size, this.player.x - this.player.speed);
        }
        if (this.keys['d'] || this.keys['arrowright']) {
            this.player.x = Math.min(this.canvas.width - this.player.size, this.player.x + this.player.speed);
        }
    }
    
    updateZombies() {
        this.zombies.forEach(zombie => {
            // Zombie se pohybuje směrem k hráči
            const dx = this.player.x - zombie.x;
            const dy = this.player.y - zombie.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                zombie.x += (dx / distance) * zombie.speed;
                zombie.y += (dy / distance) * zombie.speed;
            }
            
            // Zombie se otáčí směrem k hráči
            zombie.angle = Math.atan2(dy, dx);
        });
    }
    
    updateMedicines() {
        // Léky se pomalu otáčí
        this.medicines.forEach(medicine => {
            medicine.rotation += 0.02;
        });
    }
    
    updateThrownMedicines() {
        this.thrownMedicines.forEach((medicine, index) => {
            medicine.x += medicine.vx;
            medicine.y += medicine.vy;
            
            // Odstranění léků, které opustily obrazovku
            if (medicine.x < 0 || medicine.x > this.canvas.width || 
                medicine.y < 0 || medicine.y > this.canvas.height) {
                this.thrownMedicines.splice(index, 1);
            }
        });
    }
    
    spawnZombies() {
        if (this.frameCount % this.zombieSpawnRate === 0) {
            const side = Math.floor(Math.random() * 4);
            let x, y;
            
            switch(side) {
                case 0: // horní
                    x = Math.random() * this.canvas.width;
                    y = -30;
                    break;
                case 1: // pravá
                    x = this.canvas.width + 30;
                    y = Math.random() * this.canvas.height;
                    break;
                case 2: // dolní
                    x = Math.random() * this.canvas.width;
                    y = this.canvas.height + 30;
                    break;
                case 3: // levá
                    x = -30;
                    y = Math.random() * this.canvas.height;
                    break;
            }
            
            this.zombies.push({
                x: x,
                y: y,
                size: 25,
                speed: 1 + Math.random() * 2,
                angle: 0,
                isHealed: false
            });
        }
    }
    
    spawnMedicines() {
        if (this.frameCount % this.medicineSpawnRate === 0) {
            this.medicines.push({
                x: Math.random() * (this.canvas.width - 40) + 20,
                y: Math.random() * (this.canvas.height - 40) + 20,
                size: 15,
                rotation: 0
            });
        }
    }
    
    throwMedicine() {
        if (this.player.medicine <= 0) return;
        
        this.player.medicine--;
        
        // Směr házení směrem k myši
        const dx = this.mouseX - this.player.x;
        const dy = this.mouseY - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            this.thrownMedicines.push({
                x: this.player.x,
                y: this.player.y,
                size: 12,
                vx: (dx / distance) * 8,
                vy: (dy / distance) * 8
            });
        }
        
        this.updateUI();
    }
    
    checkCollisions() {
        // Hráč sbírá léky
        this.medicines.forEach((medicine, index) => {
            const dx = this.player.x - medicine.x;
            const dy = this.player.y - medicine.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.size + medicine.size) {
                this.player.medicine++;
                this.medicines.splice(index, 1);
                this.updateUI();
            }
        });
        
        // Zombie útočí na hráče
        this.zombies.forEach(zombie => {
            if (zombie.isHealed) return;
            
            const dx = this.player.x - zombie.x;
            const dy = this.player.y - zombie.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.size + zombie.size) {
                this.player.health -= 0.5;
                this.updateUI();
            }
        });
        
        // Házené léky léčí zombíky
        this.thrownMedicines.forEach((medicine, medicineIndex) => {
            this.zombies.forEach(zombie => {
                if (zombie.isHealed) return;
                
                const dx = medicine.x - zombie.x;
                const dy = medicine.y - zombie.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < zombie.size + medicine.size) {
                    zombie.isHealed = true;
                    this.thrownMedicines.splice(medicineIndex, 1);
                    this.score += 100;
                    this.updateUI();
                    
                    // Vyléčený zombie zmizí po chvíli
                    setTimeout(() => {
                        const index = this.zombies.indexOf(zombie);
                        if (index > -1) {
                            this.zombies.splice(index, 1);
                        }
                    }, 2000);
                }
            });
        });
    }
    
    draw() {
        // Vymazání canvasu
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Mřížka na pozadí
        this.drawGrid();
        
        // Vykreslení hráče
        this.drawPlayer();
        
        // Vykreslení zombíků
        this.zombies.forEach(zombie => this.drawZombie(zombie));
        
        // Vykreslení léků
        this.medicines.forEach(medicine => this.drawMedicine(medicine));
        
        // Vykreslení házených léků
        this.thrownMedicines.forEach(medicine => this.drawThrownMedicine(medicine));
    }
    
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawPlayer() {
        this.ctx.fillStyle = '#4ecdc4';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Oči
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x - 8, this.player.y - 8, 4, 0, Math.PI * 2);
        this.ctx.arc(this.player.x + 8, this.player.y - 8, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x - 8, this.player.y - 8, 2, 0, Math.PI * 2);
        this.ctx.arc(this.player.x + 8, this.player.y - 8, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawZombie(zombie) {
        if (zombie.isHealed) {
            // Vyléčený zombie - zelený
            this.ctx.fillStyle = '#2ecc71';
        } else {
            // Normální zombie - červený
            this.ctx.fillStyle = '#e74c3c';
        }
        
        this.ctx.beginPath();
        this.ctx.arc(zombie.x, zombie.y, zombie.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Oči
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(zombie.x - 10, zombie.y - 10, 5, 0, Math.PI * 2);
        this.ctx.arc(zombie.x + 10, zombie.y - 10, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(zombie.x - 10, zombie.y - 10, 3, 0, Math.PI * 2);
        this.ctx.arc(zombie.x + 10, zombie.y - 10, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ústa
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(zombie.x, zombie.y + 5, 8, 0, Math.PI);
        this.ctx.stroke();
        
        if (zombie.isHealed) {
            // Křížek pro vyléčené
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(zombie.x - 8, zombie.y - 8);
            this.ctx.lineTo(zombie.x + 8, zombie.y + 8);
            this.ctx.moveTo(zombie.x + 8, zombie.y - 8);
            this.ctx.lineTo(zombie.x - 8, zombie.y + 8);
            this.ctx.stroke();
        }
    }
    
    drawMedicine(medicine) {
        this.ctx.save();
        this.ctx.translate(medicine.x, medicine.y);
        this.ctx.rotate(medicine.rotation);
        
        // Léky - bílé pilulky s červeným křížkem
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(-medicine.size/2, -medicine.size/2, medicine.size, medicine.size);
        
        this.ctx.strokeStyle = '#e74c3c';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-medicine.size/2, 0);
        this.ctx.lineTo(medicine.size/2, 0);
        this.ctx.moveTo(0, -medicine.size/2);
        this.ctx.lineTo(0, medicine.size/2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawThrownMedicine(medicine) {
        this.ctx.fillStyle = '#f39c12';
        this.ctx.beginPath();
        this.ctx.arc(medicine.x, medicine.y, medicine.size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Stín
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(medicine.x + 2, medicine.y + 2, medicine.size, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    updateUI() {
        document.getElementById('medicine-count').textContent = this.player.medicine;
        document.getElementById('health').textContent = Math.max(0, Math.floor(this.player.health));
        document.getElementById('score').textContent = this.score;
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'block';
        document.getElementById('restartBtn').style.display = 'inline-block';
    }
}

// Spuštění hry
document.addEventListener('DOMContentLoaded', () => {
    new Game();
}); 