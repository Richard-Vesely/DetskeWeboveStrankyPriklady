class Pet {
    constructor(type) {
        this.type = type;
        this.hunger = 100;
        this.happiness = 100;
        this.cleanliness = 100;
        this.timer = null;
        this.mood = 'happy'; // happy, medium, sad
        this.updateImage();
    }

    updateImage() {
        const petImg = document.getElementById('pet-image');
        petImg.src = `images/${this.type}_${this.mood}.png`;
    }

    updateStatus() {
        this.hunger = Math.max(0, this.hunger - 5);
        this.happiness = Math.max(0, this.happiness - 3);
        this.cleanliness = Math.max(0, this.cleanliness - 2);
        this.updateUI();
        this.updateMood();
    }

    feed() {
        this.hunger = Math.min(100, this.hunger + 30);
        this.updateUI();
        this.showFeedingAnimation();
        this.updateMood();
    }

    play() {
        this.happiness = Math.min(100, this.happiness + 25);
        this.hunger = Math.max(0, this.hunger - 10);
        this.updateUI();
        this.showPlayingAnimation();
        this.updateMood();
    }

    clean() {
        this.cleanliness = Math.min(100, this.cleanliness + 40);
        this.updateUI();
        this.showCleaningAnimation();
        this.updateMood();
    }

    updateUI() {
        // Aktualizace procentuálních hodnot
        document.getElementById('hunger-level').textContent = `${this.hunger}%`;
        document.getElementById('happiness-level').textContent = `${this.happiness}%`;
        document.getElementById('cleanliness-level').textContent = `${this.cleanliness}%`;
        
        // Aktualizace tříd pro vizuální indikaci stavů
        this.updateEmotionClass('hunger-emotion', this.hunger);
        this.updateEmotionClass('happiness-emotion', this.happiness);
        this.updateEmotionClass('cleanliness-emotion', this.cleanliness);
    }
    
    updateEmotionClass(elementId, value) {
        const element = document.getElementById(elementId);
        element.classList.remove('low', 'medium', 'high');
        
        if (value < 30) {
            element.classList.add('low');
        } else if (value < 70) {
            element.classList.add('medium');
        } else {
            element.classList.add('high');
        }
    }
    
    updateMood() {
        const petImg = document.getElementById('pet-image');
        petImg.classList.remove('happy-pet');
        
        // Použití průměrného stavu mazlíčka pro určení celkové nálady
        const averageStatus = (this.hunger + this.happiness + this.cleanliness) / 3;
        
        // Určení nové nálady
        let newMood;
        if (averageStatus < 30) {
            newMood = 'sad';
        } else if (averageStatus < 70) {
            newMood = 'medium';
        } else {
            newMood = 'happy';
            petImg.classList.add('happy-pet');
        }
        
        // Pokud se nálada změnila, aktualizuj obrázek
        if (this.mood !== newMood) {
            this.mood = newMood;
            this.updateImage();
        }
    }
    
    showFeedingAnimation() {
        const petImg = document.getElementById('pet-image');
        petImg.style.transform = 'scale(1.1)';
        setTimeout(() => {
            petImg.style.transform = 'scale(1)';
        }, 500);
    }
    
    showPlayingAnimation() {
        const petImg = document.getElementById('pet-image');
        petImg.style.transform = 'rotate(5deg)';
        setTimeout(() => {
            petImg.style.transform = 'rotate(-5deg)';
        }, 250);
        setTimeout(() => {
            petImg.style.transform = 'rotate(0)';
        }, 500);
    }
    
    showCleaningAnimation() {
        const petImg = document.getElementById('pet-image');
        petImg.style.filter = 'brightness(1.2)';
        setTimeout(() => {
            petImg.style.filter = 'none';
        }, 500);
    }

    startGame() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => this.updateStatus(), 5000);
    }
}

let currentPet = null;

document.querySelectorAll('.pet-option').forEach(option => {
    option.addEventListener('click', () => {
        const petType = option.dataset.pet;
        currentPet = new Pet(petType);
        
        document.querySelector('.pet-selection').style.display = 'none';
        document.querySelector('.pet-care').style.display = 'block';
        
        currentPet.startGame();
    });
});

document.getElementById('feed').addEventListener('click', () => {
    if (currentPet) currentPet.feed();
});

document.getElementById('play').addEventListener('click', () => {
    if (currentPet) currentPet.play();
});

document.getElementById('clean').addEventListener('click', () => {
    if (currentPet) currentPet.clean();
}); 