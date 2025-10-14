document.addEventListener('DOMContentLoaded', function() {
    // Get references to DOM elements
    const messageInput = document.getElementById('message');
    const codeKeyInput = document.getElementById('codeKey');
    const encodeBtn = document.getElementById('encodeBtn');
    const decodeBtn = document.getElementById('decodeBtn');
    const resultElement = document.getElementById('result');

    // Czech characters mapping
    const czechAlphabet = 'aábcčdďeéěfghiíjklmnňoópqrřsštťuúůvwxyýzž';
    const czechAlphabetUpper = czechAlphabet.toUpperCase();
    
    // Create maps for Czech character handling
    const czechToIndex = new Map();
    const indexToCzech = new Map();
    const czechToIndexUpper = new Map();
    const indexToCzechUpper = new Map();
    
    // Initialize maps
    for (let i = 0; i < czechAlphabet.length; i++) {
        czechToIndex.set(czechAlphabet[i], i);
        indexToCzech.set(i, czechAlphabet[i]);
        czechToIndexUpper.set(czechAlphabetUpper[i], i);
        indexToCzechUpper.set(i, czechAlphabetUpper[i]);
    }

    // Add event listeners to buttons
    encodeBtn.addEventListener('click', function() {
        processMessage(true);
    });

    decodeBtn.addEventListener('click', function() {
        processMessage(false);
    });

    // Function to process the message (encode or decode)
    function processMessage(isEncoding) {
        const message = messageInput.value;
        let codeKey = codeKeyInput.value.toLowerCase();
        
        // Validate inputs
        if (!message) {
            resultElement.textContent = "Prosím, zadej zprávu!";
            return;
        }
        
        if (!codeKey) {
            resultElement.textContent = "Prosím, zadej tajný klíč!";
            return;
        }
        
        // Filter code key to only include Czech letters
        codeKey = filterCzechLetters(codeKey);
        
        if (!codeKey) {
            resultElement.textContent = "Tvůj tajný klíč musí obsahovat alespoň jedno písmeno!";
            return;
        }
        
        // Process the message
        const result = transformMessage(message, codeKey, isEncoding);
        resultElement.textContent = result;
    }

    // Function to filter to keep only Czech letters
    function filterCzechLetters(text) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            if (czechToIndex.has(text[i])) {
                result += text[i];
            }
        }
        return result;
    }

    // Function to transform the message (encode or decode)
    function transformMessage(message, codeKey, isEncoding) {
        let result = '';
        let keyIndex = 0;
        const alphabetLength = czechAlphabet.length;
        
        // Process each character in the message
        for (let i = 0; i < message.length; i++) {
            const char = message[i];
            
            // Check if the character is a Czech letter
            if (czechToIndex.has(char)) {
                // Lowercase letter
                const letterIndex = czechToIndex.get(char);
                
                // Get the corresponding key letter
                const keyChar = codeKey[keyIndex % codeKey.length];
                const keyShift = czechToIndex.get(keyChar);
                
                // Calculate new letter index
                let newLetterIndex;
                if (isEncoding) {
                    // For encoding: add the shift
                    newLetterIndex = (letterIndex + keyShift) % alphabetLength;
                } else {
                    // For decoding: subtract the shift
                    newLetterIndex = (letterIndex - keyShift + alphabetLength) % alphabetLength;
                }
                
                // Convert back to a letter
                result += indexToCzech.get(newLetterIndex);
                keyIndex++; // Move to the next key character
            } 
            else if (czechToIndexUpper.has(char)) {
                // Uppercase letter
                const letterIndex = czechToIndexUpper.get(char);
                
                // Get the corresponding key letter
                const keyChar = codeKey[keyIndex % codeKey.length];
                const keyShift = czechToIndex.get(keyChar);
                
                // Calculate new letter index
                let newLetterIndex;
                if (isEncoding) {
                    // For encoding: add the shift
                    newLetterIndex = (letterIndex + keyShift) % alphabetLength;
                } else {
                    // For decoding: subtract the shift
                    newLetterIndex = (letterIndex - keyShift + alphabetLength) % alphabetLength;
                }
                
                // Convert back to a letter (uppercase)
                result += indexToCzechUpper.get(newLetterIndex);
                keyIndex++; // Move to the next key character
            } 
            else {
                // Non-alphabetic characters remain unchanged
                result += char;
            }
        }
        
        return result;
    }

    // Add fun animation when buttons are clicked
    function addButtonAnimation(button) {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    }
    
    addButtonAnimation(encodeBtn);
    addButtonAnimation(decodeBtn);
}); 