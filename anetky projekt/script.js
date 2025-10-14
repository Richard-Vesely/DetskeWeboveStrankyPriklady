document.addEventListener('DOMContentLoaded', () => {
    const dog = document.getElementById('dog');
    const bone = document.getElementById('bone');
    const throwButton = document.getElementById('throwBone');
    const scoreElement = document.getElementById('score');
    let score = 0;
    let isBoneThrown = false;

    // Reset bone position
    function resetBone() {
        bone.style.left = '50%';
        bone.style.top = '0';
        isBoneThrown = false;
    }

    // Throw the bone
    throwButton.addEventListener('click', () => {
        if (!isBoneThrown) {
            isBoneThrown = true;
            let position = 0;
            const fallInterval = setInterval(() => {
                position += 5;
                bone.style.top = position + 'px';
                
                // Check if bone reached the dog
                if (position >= 200) {
                    clearInterval(fallInterval);
                    dog.classList.add('jumping');
                    score++;
                    scoreElement.textContent = score;
                    
                    // Reset after animation
                    setTimeout(() => {
                        dog.classList.remove('jumping');
                        resetBone();
                    }, 500);
                }
            }, 20);
        }
    });

    // Initialize bone position
    resetBone();
}); 