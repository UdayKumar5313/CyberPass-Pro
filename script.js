document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const label = document.getElementById('passwordLabel');

    passwordInput.addEventListener('focus', () => {
        label.style.transform = "translateY(-20px) scale(0.8)";
        label.style.color = "#4361ee";
    });

    passwordInput.addEventListener('blur', () => {
        if (!passwordInput.value) {
            label.style.transform = "translateY(0) scale(1)";
            label.style.color = "#aaa";
        }
    });
});

let passwordHistory = [];
const commonPasswords = ['password', '123456', '123456789', '12345678', '1234567', '12345', '1234567890', '1234', 'qwerty', 'abc123'];

function generatePassword() {
    const loader = document.getElementById('generationLoader');
    loader.style.display = 'flex';

    const type = document.querySelector('input[name="type"]:checked').value;
    const length = document.getElementById('length').value;
    const uppercase = document.getElementById('uppercase') ? document.getElementById('uppercase').checked : false;
    const lowercase = document.getElementById('lowercase') ? document.getElementById('lowercase').checked : false;
    const numbers = document.getElementById('numbers') ? document.getElementById('numbers').checked : false;
    const symbols = document.getElementById('symbols') ? document.getElementById('symbols').checked : false;
    const includeWords = document.getElementById('include-words') ? document.getElementById('include-words').checked : false;
    const includeDigits = document.getElementById('include-digits') ? document.getElementById('include-digits').checked : false;
    const excludeSimilar = document.getElementById('exclude-similar').checked;

    let allowedChars = '';
    if (type === 'password') {
        if (uppercase) allowedChars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
        if (lowercase) allowedChars += 'abcdefghijkmnopqrstuvwxyz';
        if (numbers) allowedChars += '23456789';
        if (symbols) allowedChars += '!@#$%^&*()_+~`|}{[]\\:;?><,./-=';
    } else if (type === 'passphrase') {
        const words = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'honeydew'];
        let passphrase = '';
        for (let i = 0; i < length; i++) {
            passphrase += words[Math.floor(Math.random() * words.length)] + ' ';
        }
        document.getElementById('password').value = passphrase.trim();
        calculateEntropy(passphrase.trim());
        calculateCrackTime(passphrase.trim());
        checkCommonPassword(passphrase.trim());
        saveToHistory(passphrase.trim());
        loader.style.display = 'none';
        return;
    } else if (type === 'pin') {
        allowedChars += '0123456789';
    }

    if (excludeSimilar) {
        allowedChars = allowedChars.replace(/[il1Lo0O]/g, '');
    }

    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allowedChars.length);
        password += allowedChars[randomIndex];
    }

    document.getElementById('password').value = password;
    updateStrengthMeter(password);
    const entropy = calculateEntropy(password);
    const uniquenessScore = calculateUniquenessScore(password);
    const crackTimeScore = calculateCrackTimeScore(password);
    createRadarChart(password.length, entropy, uniquenessScore, crackTimeScore);
    calculateCrackTime(password);
    checkCommonPassword(password);
    saveToHistory(password);
    loader.style.display = 'none';
}

function calculateUniquenessScore(password) {
    const uniqueChars = new Set(password).size;
    const totalChars = password.length;
    return (uniqueChars / totalChars) * 100;
}

function calculateCrackTimeScore(password) {
    const entropy = calculateEntropy(password);
    const maxEntropy = Math.log2(Math.pow(94, password.length)); // Assuming 94 possible characters
    return (entropy / maxEntropy) * 100;
}

function updateStrengthMeter(password) {
    let strength = 0;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengthMeter = document.getElementById('strength');
    const strengthPercentage = (strength / 5) * 100;

    // Use GSAP to animate the strength meter
    gsap.fromTo("#strength",
        { width: "0%" },
        { width: `${strengthPercentage}%`, duration: 0.7, ease: "elastic.out(1, 0.5)" }
    );

    if (strengthPercentage < 40) {
        strengthMeter.style.backgroundColor = '#ff4444';
    } else if (strengthPercentage < 80) {
        strengthMeter.style.backgroundColor = '#ffbb33';
    } else {
        strengthMeter.style.backgroundColor = '#0f0';
    }
}

function showOptions(type) {
    document.getElementById('password-options').style.display = 'none';
    document.getElementById('passphrase-options').style.display = 'none';
    document.getElementById('pin-options').style.display = 'none';
    document.getElementById('phonetic-options').style.display = 'none';

    if (type === 'password') {
        document.getElementById('password-options').style.display = 'flex';
    } else if (type === 'passphrase') {
        document.getElementById('passphrase-options').style.display = 'flex';
    } else if (type === 'pin') {
        document.getElementById('pin-options').style.display = 'flex';
    } else if (type === 'phonetic') {
        document.getElementById('phonetic-options').style.display = 'flex';
    }
}

function calculateEntropy(password) {
    const charsetSize = getCharsetSize(password);
    const entropy = Math.log2(Math.pow(charsetSize, password.length));
    document.getElementById('entropy').textContent = entropy.toFixed(2);
    return entropy;
}

function getCharsetSize(password) {
    let charset = new Set(password.split(''));
    return charset.size;
}

function calculateCrackTime(password) {
    const charsetSize = getCharsetSize(password);
    const entropy = Math.log2(Math.pow(charsetSize, password.length));
    const guessesPerSecond = 1e12; // 1 trillion guesses per second
    const crackTimeSeconds = Math.pow(2, entropy) / guessesPerSecond;
    const crackTimeCenturies = crackTimeSeconds / (60 * 60 * 24 * 365 * 100);

    let crackTimeText;
    if (crackTimeSeconds < 1) {
        crackTimeText = `${(crackTimeSeconds * 1000).toFixed(2)} milliseconds`;
    } else if (crackTimeSeconds < 60) {
        crackTimeText = `${crackTimeSeconds.toFixed(2)} seconds`;
    } else if (crackTimeSeconds < 3600) {
        crackTimeText = `${(crackTimeSeconds / 60).toFixed(2)} minutes`;
    } else if (crackTimeSeconds < 86400) {
        crackTimeText = `${(crackTimeSeconds / 3600).toFixed(2)} hours`;
    } else if (crackTimeSeconds < 31536000) {
        crackTimeText = `${(crackTimeSeconds / 86400).toFixed(2)} days`;
    } else if (crackTimeSeconds < 3153600000) {
        crackTimeText = `${(crackTimeSeconds / 31536000).toFixed(2)} years`;
    } else {
        crackTimeText = `${crackTimeCenturies.toFixed(2)} centuries`;
    }

    document.getElementById('crack-time').textContent = crackTimeText;
}

function checkCommonPassword(password) {
    const warningElement = document.getElementById('common-password-warning');
    if (commonPasswords.includes(password.toLowerCase())) {
        warningElement.textContent = 'Warning: This password is commonly used and easily guessable!';
    } else {
        warningElement.textContent = '';
    }
}

function createRadarChart(length, entropy, uniquenessScore, crackTimeScore) {
    const ctx = document.getElementById('entropyChart').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Length', 'Entropy', 'Uniqueness', 'Crack Time'],
            datasets: [{
                data: [length, entropy, uniquenessScore, crackTimeScore],
                backgroundColor: 'rgba(67, 97, 238, 0.2)',
                borderColor: '#4361ee'
            }]
        },
        options: {
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100
                }
            }
        }
    });
}

function saveToHistory(password) {
    const timestamp = new Date().toLocaleString();
    const historyItem = { password, timestamp };
    passwordHistory.unshift(historyItem);
    if (passwordHistory.length > 5) {
        passwordHistory.pop();
    }
    localStorage.setItem('passwordHistory', JSON.stringify(passwordHistory));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('password-history-list');
    historyList.innerHTML = '';
    passwordHistory.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.timestamp}: ${item.password}`;
        historyList.appendChild(listItem);
    });
}

function saveToArchive() {
    const password = document.getElementById('password').value;
    if (password) {
        showPopup('Password saved to archive!');
    } else {
        showPopup('No password to save!');
    }
}

function generateQRCode() {
    const password = document.getElementById('password').value;
    if (password) {
        const qrcodeDiv = document.getElementById('qrcode');
        qrcodeDiv.innerHTML = '';
        new QRCode(qrcodeDiv, {
            text: password,
            width: 128,
            height: 128,
            colorDark: "#0f0",
            colorLight: "#000",
        });
        qrcodeDiv.style.display = 'block';
    } else {
        showPopup('No password to generate QR code!');
    }
}

function openPasswordVault() {
    showPopup('Password Vault: ' + passwordHistory.map(item => item.password).join(', '));
}

function simulateBreachScan() {
    showPopup('Simulating Breach Scan...');
}

function transferData() {
    showPopup('Data Transfer initiated...');
}

function showPopup(message) {
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = message;
    popup.style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}
