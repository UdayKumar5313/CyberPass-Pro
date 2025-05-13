let passwordHistory = [];
const commonPasswords = ['password', '123456', '123456789', '12345678', '1234567', '12345', '1234567890', '1234', 'qwerty', 'abc123'];

function generatePassword() {
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
        updateBackgroundColor(passphrase.trim());
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

    typeWriterEffect(password);
    calculateEntropy(password);
    calculateCrackTime(password);
    checkCommonPassword(password);
    saveToHistory(password);
    updateBackgroundColor(password);
}

function typeWriterEffect(text) {
    const passwordInput = document.getElementById('password');
    passwordInput.value = '';
    passwordInput.classList.add('typewriter');
    let i = 0;
    const typing = setInterval(() => {
        if (i < text.length) {
            passwordInput.value += text.charAt(i);
            createRippleEffect(passwordInput, text.charAt(i));
            i++;
        } else {
            clearInterval(typing);
            passwordInput.classList.remove('typewriter');
        }
    }, 100);
}

function createRippleEffect(input, char) {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');
    input.parentNode.appendChild(ripple);

    // Position the ripple at the cursor
    const rect = input.getBoundingClientRect();
    ripple.style.left = `${rect.left + window.scrollX}px`;
    ripple.style.top = `${rect.top + window.scrollY}px`;

    // Special effects for special characters
    if (/[!@#$%^&*()_+~`|}{[\]:;?><,./-=]/.test(char)) {
        createFireworkEffect(ripple);
    }

    setTimeout(() => {
        ripple.remove();
    }, 1000);
}

function createFireworkEffect(element) {
    const firework = document.createElement('div');
    firework.classList.add('firework');
    element.appendChild(firework);

    setTimeout(() => {
        firework.remove();
    }, 1000);
}

function updateStrengthMeter(password) {
    let strength = 0;
    if (password.length >= 12) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    const strengthMeter = document.getElementById('strength');
    const width = (strength / 5) * 100;
    strengthMeter.style.width = `${width}%`;

    if (width < 40) {
        strengthMeter.style.backgroundColor = '#ff4444';
    } else if (width < 80) {
        strengthMeter.style.backgroundColor = '#ffbb33';
    } else {
        strengthMeter.style.backgroundColor = '#0f0';
    }

    // Trigger particle effects based on strength increase
    if (width > 80) {
        createParticles();
    }
}

function showOptions(type) {
    document.getElementById('password-options').style.display = 'none';
    document.getElementById('passphrase-options').style.display = 'none';
    document.getElementById('pin-options').style.display = 'none';

    if (type === 'password') {
        document.getElementById('password-options').style.display = 'flex';
    } else if (type === 'passphrase') {
        document.getElementById('passphrase-options').style.display = 'flex';
    } else if (type === 'pin') {
        document.getElementById('pin-options').style.display = 'flex';
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

function loadHistory() {
    const storedHistory = localStorage.getItem('passwordHistory');
    if (storedHistory) {
        passwordHistory = JSON.parse(storedHistory);
        updateHistoryDisplay();
    }
}

function regenerateLastPassword() {
    if (passwordHistory.length > 0) {
        const lastPassword = passwordHistory[0].password;
        document.getElementById('password').value = lastPassword;
        calculateEntropy(lastPassword);
        calculateCrackTime(lastPassword);
        checkCommonPassword(lastPassword);
    } else {
        showPopup('No password history available!');
    }
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
    if (passwordHistory.length > 0) {
        const passwords = passwordHistory.map(item => `${item.timestamp}: ${item.password}`).join('\n');
        showPopup(`Password Vault:\n${passwords}`);
    } else {
        showPopup('Password Vault is empty!');
    }
}

function simulateBreachScan() {
    const password = document.getElementById('password').value;
    if (password) {
        const entropy = calculateEntropy(password);
        const strength = (entropy / Math.log2(Math.pow(94, password.length))) * 100;
        let message = `Breach Scan Simulation:\nPassword: ${password}\nEntropy: ${entropy.toFixed(2)} bits\nStrength: ${strength.toFixed(2)}%`;
        if (strength < 50) {
            message += '\nWarning: Password is weak!';
        } else if (strength < 80) {
            message += '\nNote: Password is moderate.';
        } else {
            message += '\nNote: Password is strong!';
        }
        showPopup(message);
    } else {
        showPopup('No password to simulate breach scan!');
    }
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

function createJapaneseLetterFallingAnimation() {
    const letters = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";
    const background = document.querySelector('.background-animation');
    const letterCount = 100;

    for (let i = 0; i < letterCount; i++) {
        const letter = document.createElement('div');
        letter.classList.add('japanese-letter');
        letter.textContent = letters[Math.floor(Math.random() * letters.length)];
        letter.style.left = Math.random() * 100 + 'vw';
        letter.style.top = -10 + 'px';
        letter.style.animationDuration = (Math.random() * 5 + 5) + 's';
        letter.style.animationDelay = Math.random() * 5 + 's';
        background.appendChild(letter);
    }
}

function createParticles() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 3 + 1,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1,
            color: `hsl(${Math.random() * 60 + 100}, 100%, 50%)`
        });
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();

            particle.x += particle.speedX;
            particle.y += particle.speedY;

            if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
        });
        requestAnimationFrame(drawParticles);
    }

    drawParticles();
}

function updateBackgroundColor(password) {
    const strength = calculateEntropy(password);
    const hue = Math.min(120, strength * 3); // Scale strength to hue (0-120)
    document.body.style.backgroundColor = `hsl(${hue}, 100%, 10%)`;
}

function generateSVGPattern(password) {
    // Simple hash function to generate a seed for the SVG pattern
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        hash = password.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Use the hash to generate a simple SVG pattern
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", `hsl(${hash % 360}, 100%, 50%)`);
    svg.appendChild(rect);

    // Add some circles based on the hash
    for (let i = 0; i < 10; i++) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", `${(hash % 100) + i * 10}%`);
        circle.setAttribute("cy", `${(hash % 100) + i * 10}%`);
        circle.setAttribute("r", `${(hash % 50) / 10}%`);
        circle.setAttribute("fill", `hsl(${(hash + i * 36) % 360}, 100%, 50%)`);
        svg.appendChild(circle);
    }

    document.body.style.backgroundImage = `url('data:image/svg+xml;utf8,${encodeURIComponent(svg.outerHTML)}')`;
}

window.onload = function() {
    createJapaneseLetterFallingAnimation();
    loadHistory();
    adjustCanvasSize();
};

window.onresize = function() {
    adjustCanvasSize();
};

function adjustCanvasSize() {
    const canvas = document.getElementById('particle-canvas');
    const container = document.querySelector('.container');
    canvas.width = container.offsetWidth;
    canvas.height = 100;
}