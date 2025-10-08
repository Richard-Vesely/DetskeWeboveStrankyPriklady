class KeyWriter {
    constructor() {
        this.level = 1;
        this.score = 0;
        this.timeLeft = 120; // Zvýšený čas na 2 minuty
        this.isPlaying = false;
        this.timer = null;
        this.currentText = '';
        this.consecutiveCorrect = 0; // Počítadlo správných odpovědí v řadě
        
        // DOM elements
        this.levelElement = document.getElementById('level');
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.targetTextElement = document.getElementById('target-text');
        this.userInputElement = document.getElementById('user-input');
        this.startButton = document.getElementById('start-button');
        this.restartButton = document.getElementById('restart-button');
        this.gameOverElement = document.getElementById('game-over');
        this.finalLevelElement = document.getElementById('final-level');
        this.finalScoreElement = document.getElementById('final-score');

        // Bind event listeners
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());
        this.userInputElement.addEventListener('input', () => this.checkInput());
    }

    generateRandomText() {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        // Začínáme s kratšími sekvencemi a pomaleji je prodlužujeme
        const length = Math.min(2 + Math.floor(this.level / 3), 8);
        let text = '';
        for (let i = 0; i < length; i++) {
            text += letters[Math.floor(Math.random() * letters.length)];
        }
        return text;
    }

    updateDisplay() {
        this.levelElement.textContent = this.level;
        this.timerElement.textContent = this.timeLeft;
        this.scoreElement.textContent = this.score;
    }

    startGame() {
        this.isPlaying = true;
        this.startButton.style.display = 'none';
        this.restartButton.style.display = 'inline-block';
        this.gameOverElement.style.display = 'none';
        this.userInputElement.value = '';
        this.userInputElement.focus();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);

        this.generateNewText();
    }

    restartGame() {
        this.level = 1;
        this.score = 0;
        this.timeLeft = 120;
        this.consecutiveCorrect = 0;
        this.updateDisplay();
        this.startGame();
    }

    generateNewText() {
        this.currentText = this.generateRandomText();
        this.targetTextElement.textContent = this.currentText;
        this.userInputElement.value = '';
    }

    checkInput() {
        if (!this.isPlaying) return;

        const userInput = this.userInputElement.value;
        
        if (userInput === this.currentText) {
            // Správná odpověď
            this.consecutiveCorrect++;
            this.score += this.level * 5; // Méně bodů za level
            
            // Level up pouze po 3 správných odpovědích v řadě
            if (this.consecutiveCorrect >= 3) {
                this.level++;
                this.consecutiveCorrect = 0;
            }
            
            this.generateNewText();
        } else if (userInput.length === this.currentText.length) {
            // Špatná odpověď
            this.consecutiveCorrect = 0;
            // Level down pouze pokud jsme nad levelem 1
            if (this.level > 1) {
                this.level--;
            }
            this.generateNewText();
        }
        
        this.updateDisplay();
    }

    endGame() {
        this.isPlaying = false;
        clearInterval(this.timer);
        this.finalLevelElement.textContent = this.level;
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.style.display = 'block';
        this.userInputElement.value = '';
        this.targetTextElement.textContent = '';
    }
}

// Initialize the game
const game = new KeyWriter(); 