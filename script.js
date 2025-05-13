// DOM Elements
const passwordDisplay = document.getElementById('password-display');
const copyBtn = document.getElementById('copy-btn');
const strengthMeter = document.getElementById('strength-meter');
const strengthLabel = document.getElementById('strength-label');
const crackTime = document.getElementById('crack-time');
const feedback = document.getElementById('feedback');
const history = document.getElementById('history');

// Options
const lengthSlider = document.getElementById('password-length');
const lengthValue = document.getElementById('length-value');
const uppercaseCheckbox = document.getElementById('uppercase');
const lowercaseCheckbox = document.getElementById('lowercase');
const numbersCheckbox = document.getElementById('numbers');
const symbolsCheckbox = document.getElementById('symbols');
const excludeAmbiguousCheckbox = document.getElementById('exclude-ambiguous');

// State
let currentLength = parseInt(lengthSlider.value);
let passwordHistory = [];

// Character sets
const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
const numberChars = "0123456789";
const symbolChars = "!@#$%^&*()-_=+[]{}|;:,.<>?/";
const ambiguousChars = "lI1O0";

// Update UI
function updateUI(password) {
    if (!password) {
        password = passwordDisplay.value;
    }
    
    // Calculate strength
    const result = zxcvbn(password);
    const score = result.score;
    const levels = [
        { label: "Very Weak 🔴", className: "strength-meter-very-weak" },
        { label: "Weak 🔴", className: "strength-meter-weak" },
        { label: "Moderate 🟡", className: "strength-meter-moderate" },
        { label: "Strong ✅", className: "strength-meter-strong" },
        { label: "Very Strong 💪", className: "strength-meter-very-strong" }
    ];
    
    // Update strength meter
    const percentage = ((score + 1) / 5) * 100;
    strengthMeter.style.width = `${percentage}%`;
    
    // Remove all strength classes
    strengthMeter.className = 'h-full';
    strengthMeter.classList.add(levels[score].className);
    strengthLabel.textContent = levels[score].label;
    
    // Update crack time
    crackTime.textContent = `Estimated crack time: ${result.crack_times_display.offline_fast_hashing_1e10_per_second}`;
    
    // Update feedback
    feedback.innerHTML = '';
    if (result.feedback.suggestions.length > 0) {
        result.feedback.suggestions.forEach(suggestion => {
            const li = document.createElement('li');
            li.className = 'flex items-center';
            li.innerHTML = `<span class="text-yellow-500 mr-2">⚠️</span> ${suggestion}`;
            feedback.appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.className = 'text-green-500 flex items-center';
        li.innerHTML = '<span class="text-green-500 mr-2">✅</span> Great job! Your password is strong.';
        feedback.appendChild(li);
    }
}

// Generate password
function generatePassword() {
    let chars = '';
    if (uppercaseCheckbox.checked) chars += uppercaseChars;
    if (lowercaseCheckbox.checked) chars += lowercaseChars;
    if (numbersCheckbox.checked) chars += numberChars;
    if (symbolsCheckbox.checked) chars += symbolChars;

    if (excludeAmbiguousCheckbox.checked) {
        chars = chars.split('').filter(c => !ambiguousChars.includes(c)).join('');
    }

    if (chars.length === 0) {
        passwordDisplay.value = 'Select at least one character type';
        return;
    }

    let newPassword = '';

    // Ensure at least one of each selected category
    if (uppercaseCheckbox.checked) newPassword += getRandomChar(uppercaseChars);
    if (lowercaseCheckbox.checked) newPassword += getRandomChar(lowercaseChars);
    if (numbersCheckbox.checked) newPassword += getRandomChar(numberChars);
    if (symbolsCheckbox.checked) newPassword += getRandomChar(symbolChars);

    while (newPassword.length < currentLength) {
        newPassword += getRandomChar(chars);
    }

    newPassword = shuffleString(newPassword);
    passwordDisplay.value = newPassword;
    
    addHistory(newPassword);
    updateUI(newPassword);
}

// Generate XKCD-style passphrase
function generatePassphrase() {
    const wordList = [
        "correct", "horse", "battery", "staple", "dragon", "cloud",
        "sunny", "moonlight", "robot", "nebula", "galaxy", "shield"
    ];

    const separator = "-";
    const capitalize = true;
    const wordCount = 4;

    let words = [];
    for (let i = 0; i < wordCount; i++) {
        let word = wordList[Math.floor(Math.random() * wordList.length)];
        if (capitalize && word.length > 0) {
            word = word.charAt(0).toUpperCase() + word.slice(1);
        }
        words.push(word);
    }

    let phrase = words.join(separator);
    passwordDisplay.value = phrase;
    
    addHistory(phrase);
    updateUI(phrase);
}

// Helper functions
function getRandomChar(characters) {
    return characters[Math.floor(Math.random() * characters.length)];
}

function shuffleString(string) {
    const array = string.split('');
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
}

function addHistory(password) {
    if (password && !password.startsWith("Select")) {
        passwordHistory.unshift(password);
        passwordHistory = [...new Set(passwordHistory)].slice(0, 5);
        
        history.innerHTML = '';
        passwordHistory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'truncate cursor-pointer hover:text-blue-500 transition-colors py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800';
            div.textContent = item;
            div.addEventListener('click', () => {
                passwordDisplay.value = item;
                updateUI(item);
            });
            history.appendChild(div);
        });
    }
}

// Event Listeners
document.getElementById('generate-btn').addEventListener('click', generatePassword);
document.getElementById('passphrase-btn').addEventListener('click', generatePassphrase);
document.getElementById('copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(passwordDisplay.value).then(() => {
        const btn = document.getElementById('copy-btn');
        btn.textContent = '✅ Copied!';
        setTimeout(() => btn.textContent = '📋', 2000);
    });
});

lengthSlider.addEventListener('input', (e) => {
    currentLength = parseInt(e.target.value);
    lengthValue.textContent = currentLength;
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    currentLength = parseInt(lengthSlider.value);
    lengthValue.textContent = currentLength;
    generatePassword();
});
