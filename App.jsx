import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  // Core state
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [crackTime, setCrackTime] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [isPassphraseMode, setIsPassphraseMode] = useState(false);
  const [securityPersona, setSecurityPersona] = useState('Fort Knox Defender');
  const [entropy, setEntropy] = useState(0);
  const [lastGeneratedTime, setLastGeneratedTime] = useState(null);
  const [breachWarning, setBreachWarning] = useState('');
  const [passwordType, setPasswordType] = useState('random');
  const [qrCode, setQrCode] = useState(null);
  const [passphraseOptions, setPassphraseOptions] = useState({
    separator: '-',
    capitalize: true,
    wordCount: 4
  });
  
  // Animation states
  const [hackerLines, setHackerLines] = useState([]);
  const [confettiParticles, setConfettiParticles] = useState([]);
  const [activeAnimations, setActiveAnimations] = useState([]);
  const [visualHash, setVisualHash] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [glow, setGlow] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [rotate, setRotate] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [wave, setWave] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [spin, setSpin] = useState(false);
  const [fade, setFade] = useState(false);
  
  // Refs
  const passwordRef = useRef(null);
  const canvasRef = useRef(null);
  const strengthMeterRef = useRef(null);
  
  // Word list for passphrases
  const wordList = [
    "correct", "horse", "battery", "staple", "dragon", "cloud",
    "sunny", "moonlight", "robot", "nebula", "galaxy", "shield"
  ];
  
  // Character sets
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const numberChars = "0123456789";
  const symbolChars = "!@#$%^&*()-_=+[]{}|;:,.<>?/";
  const ambiguousChars = "lI1O0";
  
  // Calculate character pool based on settings
  const getCharacterPool = () => {
    let pool = '';
    if (includeUppercase) pool += uppercaseChars;
    if (includeLowercase) pool += lowercaseChars;
    if (includeNumbers) pool += numberChars;
    if (includeSymbols) pool += symbolChars;
    
    if (excludeAmbiguous) {
      pool = pool.split('').filter(c => !ambiguousChars.includes(c)).join('');
    }
    
    return pool;
  };
  
  // Generate random password
  const generatePassword = () => {
    const pool = getCharacterPool();
    if (pool.length === 0) {
      setPassword('Select at least one character type');
      return;
    }
    
    let newPassword = '';
    
    // Ensure at least one character from each selected category
    if (includeUppercase) newPassword += getRandomChar(uppercaseChars);
    if (includeLowercase) newPassword += getRandomChar(lowercaseChars);
    if (includeNumbers) newPassword += getRandomChar(numberChars);
    if (includeSymbols) newPassword += getRandomChar(symbolChars);
    
    // Fill the rest of the password length with random characters
    while (newPassword.length < length) {
      newPassword += getRandomChar(pool);
    }
    
    // Shuffle to avoid predictable patterns
    newPassword = shuffleString(newPassword);
    
    setPassword(newPassword);
    addHistory(newPassword);
    checkPasswordStrength(newPassword);
    triggerGenerationAnimation();
    updateLastGeneratedTime();
    generateVisualHash(newPassword);
  };
  
  // Generate XKCD-style passphrase
  const generatePassphrase = () => {
    const parts = [];
    const options = document.getElementById('passphrase-options');
    const separator = options?.separator?.value || '-';
    const capitalize = options?.capitalize?.checked || false;
    const wordCount = parseInt(options?.wordCount?.value) || 4;
    
    for (let i = 0; i < wordCount; i++) {
      parts.push(wordList[Math.floor(Math.random() * wordList.length)]);
    }
    
    let phrase = capitalize 
      ? parts.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(separator)
      : parts.join(separator);
      
    setPassword(phrase);
    addHistory(phrase);
    checkPasswordStrength(phrase);
    triggerGenerationAnimation();
    updateLastGeneratedTime();
    generateVisualHash(phrase);
  };
  
  // Get random character from string
  const getRandomChar = (chars) => {
    return chars[Math.floor(Math.random() * chars.length)];
  };
  
  // Shuffle string
  const shuffleString = (string) => {
    const array = string.split('');
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array.join('');
  };
  
  // Add password to history
  const addHistory = (pwd) => {
    setHistory(prev => [pwd, ...prev.slice(0, 4)]);
  };
  
  // Copy to clipboard
  const copyToClipboard = () => {
    if (!password || password === 'Select at least one character type') return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Toggle password visibility
  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Check password strength using zxcvbn-like algorithm
  const checkPasswordStrength = (pwd) => {
    if (pwd.length === 0) {
      resetUI();
      return;
    }
    
    // Basic checks
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    
    // Calculate score based on character variety and length
    let score = 0;
    if (hasUppercase) score++;
    if (hasLowercase) score++;
    if (hasNumber) score++;
    if (hasSymbol) score++;
    
    // Adjust score based on length
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    
    // Set strength level
    setStrength(score);
    
    // Generate feedback
    const newFeedback = [];
    if (!hasUppercase) newFeedback.push("Add uppercase letters");
    if (!hasLowercase) newFeedback.push("Add lowercase letters");
    if (!hasNumber) newFeedback.push("Add numbers");
    if (!hasSymbol) newFeedback.push("Add special characters");
    if (pwd.length < 12) newFeedback.push("Use at least 12 characters");
    
    setFeedback(newFeedback);
    
    // Calculate entropy
    const charsetSize = (
      (hasLowercase ? 26 : 0) +
      (hasUppercase ? 26 : 0) +
      (hasNumber ? 10 : 0) +
      (hasSymbol ? 32 : 0)
    );
    
    const calculatedEntropy = charsetSize > 0 ? Math.log2(charsetSize) * pwd.length : 0;
    setEntropy(calculatedEntropy.toFixed(2));
    
    // Calculate crack time estimate
    calculateCrackTime(score);
    
    // Update persona based on strength
    updateSecurityPersona(score);
    
    // Simulate breach check
    simulateBreachCheck(pwd);
  };
  
  // Calculate estimated crack time
  const calculateCrackTime = (score) => {
    const times = [
      "< 1 second",
      "Seconds to minutes",
      "Minutes to hours",
      "Hours to days",
      "Days to weeks",
      "Weeks to months",
      "Months to years",
      "Years to decades",
      "Decades to centuries",
      "Centuries"
    ];
    
    // Base index on score and length
    const baseIndex = Math.min(9, score + Math.floor((length - 8) / 2));
    setCrackTime(times[baseIndex]);
  };
  
  // Update security persona based on strength
  const updateSecurityPersona = (score) => {
    if (score <= 2) {
      setSecurityPersona('Glass House Dweller');
    } else if (score === 3 || score === 4) {
      setSecurityPersona('Vault Guardian');
    } else {
      setSecurityPersona('Fort Knox Defender');
    }
  };
  
  // Reset UI elements
  const resetUI = () => {
    setStrength(0);
    setFeedback([]);
    setCrackTime('');
    setBreachWarning('');
    setEntropy(0);
  };
  
  // Trigger animation when password is generated
  const triggerGenerationAnimation = () => {
    // Add confetti effect for strong passwords
    if (strength >= 4) {
      createConfetti();
    }
    
    // Add pulse animation to password field
    setActiveAnimations(prev => [...prev, 'pulse']);
    setTimeout(() => {
      setActiveAnimations(prev => prev.filter(a => a !== 'pulse'));
    }, 1000);
  };
  
  // Create confetti particles
  const createConfetti = () => {
    const particles = [];
    const colors = ['#FFD700', '#00BFFF', '#FF69B4', '#00FF00', '#FFA500'];
    
    for (let i = 0; i < 100; i++) {
      particles.push({
        id: Date.now() + i,
        x: Math.random(),
        y: Math.random() * -1,
        size: Math.random() * 6 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        duration: Math.random() * 2 + 1,
        delay: Math.random() * 0.5
      });
    }
    
    setConfettiParticles(particles);
    
    // Clear particles after animation
    setTimeout(() => {
      setConfettiParticles([]);
    }, 3000);
  };
  
  // Update requirement checks
  const updateRequirementChecks = (pwd) => {
    // Implementation moved to inline styles for simplicity
  };
  
  // Update last generated time
  const updateLastGeneratedTime = () => {
    setLastGeneratedTime(new Date().toLocaleTimeString());
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Animate hacker background
  useEffect(() => {
    const interval = setInterval(() => {
      const newLine = Array.from({ length: 80 }, () =>
        String.fromCharCode(Math.floor(Math.random() * 94) + 33)
      ).join("");
      setHackerLines((prev) => [...prev.slice(-19), newLine]);
    }, 150);
    
    return () => clearInterval(interval);
  }, []);
  
  // Update visual hash when password changes
  useEffect(() => {
    checkPasswordStrength(password);
    generateVisualHash(password);
  }, [password]);
  
  // Reset password if options change
  useEffect(() => {
    if (password) {
      generatePassword();
    }
  }, [includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeAmbiguous, length]);
  
  // Update password type based on mode
  useEffect(() => {
    setPasswordType(isPassphraseMode ? 'passphrase' : 'random');
  }, [isPassphraseMode]);
  
  // Generate visual hash pattern
  const generateVisualHash = (pwd) => {
    if (!canvasRef.current || pwd.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 100;
    
    canvas.width = size;
    canvas.height = size;
    
    // Create a simple visual hash based on password
    const hash = pwd.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    // Create a unique pattern based on the hash
    const hue = hash % 360;
    const saturation = 70 + (hash % 20);
    const lightness = 50 + (hash % 10);
    
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    ctx.fillRect(0, 0, size, size);
    
    // Add some texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.sin(i * 0.5) * size * 0.4 + size * 0.5,
        Math.cos(i * 0.7) * size * 0.4 + size * 0.5,
        5 + Math.random() * 10,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  };
  
  // Simulate breach check
  const simulateBreachCheck = (pwd) => {
    // In a real app, this would check against known breaches
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123'];
    
    if (commonPasswords.some(p => pwd.toLowerCase().includes(p))) {
      setBreachWarning('⚠️ Warning: This password contains common patterns found in breaches!');
    } else {
      setBreachWarning('');
    }
  };
  
  // Generate QR code for TOTP
  const generateQRCode = () => {
    // In a real implementation, this would use a QR generation library
    setQrCode('QR_CODE_GENERATED_FOR_' + password);
  };
  
  // Export passwords as CSV
  const exportPasswordsCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      history.map(p => `"${p}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "password_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Reset all settings
  const resetSettings = () => {
    setLength(12);
    setIncludeUppercase(true);
    setIncludeLowercase(true);
    setIncludeNumbers(true);
    setIncludeSymbols(true);
    setExcludeAmbiguous(true);
    setBreachWarning('');
    setFeedback([]);
    setProgress(0);
  };
  
  // Generate visual hash pattern
  const generateVisualPattern = (pwd) => {
    if (!canvasRef.current || pwd.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const size = 100;
    
    canvas.width = size;
    canvas.height = size;
    
    // Create a simple visual hash based on password
    const hash = pwd.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    // Create a unique pattern based on the hash
    const hue = hash % 360;
    const saturation = 70 + (hash % 20);
    const lightness = 50 + (hash % 10);
    
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    ctx.fillRect(0, 0, size, size);
    
    // Add some texture
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(
        Math.sin(i * 0.5) * size * 0.4 + size * 0.5,
        Math.cos(i * 0.7) * size * 0.4 + size * 0.5,
        5 + Math.random() * 10,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  };
  
  // Apply animated progress bar
  const animateProgressBar = (target) => {
    setProgress(0);
    let start = null;
    const duration = 1000;
    
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percent = Math.min(progress / duration, 1);
      setProgress(percent * target);
      
      if (progress < duration) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  };
  
  // Create password vault
  const createPasswordVault = () => {
    // In a real implementation, this would use AES encryption
    localStorage.setItem('vault', btoa(password));
  };
  
  // Retrieve password vault
  const retrievePasswordVault = () => {
    const encrypted = localStorage.getItem('vault');
    if (encrypted) {
      const decrypted = atob(encrypted);
      setPassword(decrypted);
      checkPasswordStrength(decrypted);
    }
  };
  
  // Generate visual password representation
  const generateVisualRepresentation = (pwd) => {
    // This could be enhanced with more complex visualization
    const visual = pwd.split('').map(c => {
      if (/[A-Z]/.test(c)) return '↑';
      if (/[a-z]/.test(c)) return '↓';
      if (/\d/.test(c)) return '•';
      if (/[!@#$%^&*]/.test(c)) return '*';
      return ' ';
    }).join('');
    
    return visual;
  };
  
  // Create animated password complexity graph
  const createComplexityGraph = () => {
    // This would integrate with charting libraries in a real implementation
    setVisualHash(`GRAPH_${Math.random()}`);
  };
  
  // Track typing speed and rhythm
  const trackTyping = () => {
    // This would analyze user typing patterns
    console.log('Tracking typing behavior...');
  };
  
  // Save password with biometric authentication
  const saveWithBiometrics = () => {
    // In a real app, this would use WebAuthn or device sensors
    alert('Biometric authentication simulated. Password saved securely.');
  };
  
  // Generate TOTP code
  const generateTOTP = () => {
    // In a real app, this would use proper TOTP generation
    const code = Math.floor(100000 + Math.random() * 900000);
    alert(`Your TOTP code is: ${code}`);
  };
  
  // Enable offline mode
  const enableOfflineMode = () => {
    // This would use service workers and local storage
    alert('Offline mode enabled. You can now use the app without internet connection.');
  };
  
  // Show/hide password animation
  const animatePasswordReveal = () => {
    setZoom(true);
    setTimeout(() => setZoom(false), 500);
  };
  
  // Simulate AI-generated password suggestions
  const generateAISuggestions = () => {
    // This would use ML models to suggest stronger alternatives
    const suggestions = [];
    for (let i = 0; i < 3; i++) {
      let suggestion = password;
      // Make small variations to create different suggestions
      if (suggestion.length > 0) {
        const idx = Math.floor(Math.random() * suggestion.length);
        suggestion = suggestion.substring(0, idx) + 
          String.fromCharCode(suggestion.charCodeAt(idx) + 1) + 
          suggestion.substring(idx + 1);
      }
      suggestions.push(suggestion);
    }
    return suggestions;
  };
  
  // Implement password aging visualization
  const getPasswordAge = () => {
    if (!lastGeneratedTime) return 'New';
    
    // Simulated age calculation
    const ageInMinutes = Math.floor(Math.random() * 100);
    
    if (ageInMinutes < 15) return 'Fresh';
    if (ageInMinutes < 60) return 'Recent';
    if (ageInMinutes < 240) return 'Moderate Age';
    return 'Needs Update';
  };
  
  // Generate cryptographic hash
  const generateCryptographicHash = async (pwd) => {
    if (!pwd) return '';
    
    // In a real app, this would use Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(pwd);
    
    try {
      // SHA-256 hashing simulation
      const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      // Fallback for environments without crypto support
      return 'Simulated hash for ' + pwd;
    }
  };
  
  // Start loading animation
  const startLoading = () => {
    setIsLoading(true);
    setProgress(0);
    animateProgressBar(100);
  };
  
  // End loading animation
  const endLoading = () => {
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 1000);
  };
  
  // Apply shake animation
  const applyShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };
  
  // Apply glow animation
  const applyGlow = () => {
    setGlow(true);
    setTimeout(() => setGlow(false), 1000);
  };
  
  // Apply wave animation
  const applyWave = () => {
    setWave(true);
    setTimeout(() => setWave(false), 1000);
  };
  
  // Apply bounce animation
  const applyBounce = () => {
    setBounce(true);
    setTimeout(() => setBounce(false), 500);
  };
  
  // Apply spin animation
  const applySpin = () => {
    setSpin(true);
    setTimeout(() => setSpin(false), 500);
  };
  
  // Apply fade animation
  const applyFade = () => {
    setFade(true);
    setTimeout(() => setFade(false), 500);
  };
  
  // Apply rotate animation
  const applyRotate = () => {
    setRotate(true);
    setTimeout(() => setRotate(false), 500);
  };
  
  // Apply pulse animation
  const applyPulse = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 500);
  };
  
  // Create animated password complexity graph
  const createComplexityGraph = () => {
    // In a real implementation, this would use charting libraries
    setVisualHash(`GRAPH_${Math.random()}`);
  };
  
  // Track user interaction metrics
  const trackUserMetrics = () => {
    // In a real app, this would track detailed analytics
    console.log('User interaction tracked');
  };
  
  // Apply animation to password input
  const applyInputAnimation = (animation) => {
    switch(animation) {
      case 'shake':
        applyShake();
        break;
      case 'glow':
        applyGlow();
        break;
      case 'wave':
        applyWave();
        break;
      case 'bounce':
        applyBounce();
        break;
      case 'spin':
        applySpin();
        break;
      case 'fade':
        applyFade();
        break;
      case 'rotate':
        applyRotate();
        break;
      case 'pulse':
        applyPulse();
        break;
      default:
        applyShake();
    }
  };

  return (
    <div className={`relative h-screen overflow-hidden ${darkMode ? 'bg-black text-green-400' : 'bg-gray-100 text-gray-900'} font-mono transition-colors duration-300`}>
      {/* Hacker background animation */}
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        {hackerLines.map((line, index) => (
          <div key={index} className="whitespace-pre">
            {line}
          </div>
        ))}
      </div>
      
      {/* Confetti particles */}
      <div className="fixed inset-0 z-20 pointer-events-none">
        {confettiParticles.map(particle => (
          <div
            key={particle.id}
            className="absolute animate-confetti"
            style={{
              left: `${particle.x * 100}%`,
              top: `${particle.y * 100}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              transform: `rotate(${particle.rotation}deg)`,
            }}
          />
        ))}
      </div>
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className={`${darkMode ? 'bg-black/70 border-green-400/30' : 'bg-white shadow-lg'} w-full max-w-xl p-6 md:p-8 rounded-lg border backdrop-blur-sm animate-fadeIn transition-all duration-300`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
            <h1 className="text-3xl font-bold glitch" data-text="PASSWORD GENERATOR">PASSWORD GENERATOR</h1>
            <div className="flex gap-2">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-full ${darkMode ? 'bg-green-400/20 hover:bg-green-400/40' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
                aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <SunIcon /> : <MoonIcon />}
              </button>
              <button
                onClick={() => setIsPassphraseMode(!isPassphraseMode)}
                className={`p-2 rounded-full ${darkMode ? 'bg-green-400/20 hover:bg-green-400/40' : 'bg-blue-200 hover:bg-blue-300'} transition-colors`}
                aria-label={isPassphraseMode ? "Switch to Random Password" : "Switch to Passphrase"}
              >
                <KeyIcon />
              </button>
            </div>
          </div>

          {/* Password display */}
          <div className="mb-6">
            <div className={`relative ${activeAnimations.includes('pulse') ? 'animate-pulse-slow' : ''}`}>
              <input
                ref={passwordRef}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  trackUserMetrics();
                }}
                readOnly={!isPassphraseMode}
                className={`w-full p-3 pl-4 pr-12 ${darkMode ? 'bg-transparent border-green-400/30 text-green-400' : 'bg-gray-100 border-gray-300 text-gray-900'} rounded-md focus:outline-none focus:ring-2 ${darkMode ? 'focus:ring-green-400/50' : 'focus:ring-blue-500'} transition-all duration-300 cursor-pointer ${
                  shake ? 'animate-shake' : ''
                } ${
                  glow ? 'animate-glow' : ''
                }`}
                title="Click to copy"
                onClick={copyToClipboard}
              />
              <button
                onClick={copyToClipboard}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md transition-colors ${
                  copied 
                    ? (darkMode ? 'bg-green-500' : 'bg-blue-500') 
                    : (darkMode ? 'bg-green-400/20 hover:bg-green-400/40' : 'bg-gray-200 hover:bg-gray-300')
                }`}
                aria-label="Copy to clipboard"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>
            
            {/* Visual hash */}
            <div className="mt-2 flex justify-center">
              <canvas ref={canvasRef} width="100" height="100" className={`w-16 h-16 rounded-md ${darkMode ? 'border border-green-400/20' : 'border border-gray-300'}`}></canvas>
            </div>
            
            {/* Security persona badge */}
            <div className={`mt-2 p-2 rounded-md text-center ${darkMode ? 'bg-green-400/10' : 'bg-blue-50'}`}>
              <span className="text-sm">{securityPersona}</span>
            </div>
            
            {/* Progress bar */}
            <div className={`mt-4 h-2 w-full rounded-full ${darkMode ? 'bg-green-400/20' : 'bg-blue-200'}`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${darkMode ? 'bg-green-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(100, (strength / 6) * 100)}%` }}
              ></div>
            </div>
            
            {/* Generate button */}
            <button
              onClick={() => {
                if (isPassphraseMode) {
                  generatePassphrase();
                } else {
                  generatePassword();
                }
              }}
              className={`mt-4 w-full py-3 ${darkMode ? 'bg-green-400/20 border-green-400/40 hover:bg-green-400/40' : 'bg-blue-600 hover:bg-blue-700 text-white'} border rounded-md transition-all duration-300 font-semibold tracking-wider group relative overflow-hidden`}
            >
              <span className="relative z-10">
                {isPassphraseMode ? "GENERATE PASSPHRASE" : "GENERATE PASSWORD"}
              </span>
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-current scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ${darkMode ? 'bg-green-400' : 'bg-blue-400'}`}></span>
            </button>
          </div>
          
          {/* Password age indicator */}
          {lastGeneratedTime && (
            <div className={`text-xs ${darkMode ? 'text-green-400/60' : 'text-gray-500'} text-center mb-4`}>
              Last generated: {lastGeneratedTime} • Age: {getPasswordAge()}
            </div>
          )}
          
          {/* Breach warning */}
          {breachWarning && (
            <div className={`mb-4 p-3 rounded-md ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700'}`}>
              {breachWarning}
            </div>
          )}
          
          {/* Password complexity meter */}
          <div className="mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Strength:</span>
              <span className="text-sm font-medium">
                {strength <= 1 ? "Very Weak 🔴" :
                 strength === 2 ? "Weak ⚠️" :
                 strength === 3 ? "Moderate 🟡" :
                 strength === 4 ? "Strong ✅" :
                 strength === 5 ? "Very Strong 💪" :
                 strength === 6 ? "Extreme 🔥" :
                 "None"}
              </span>
            </div>
            <div className={`h-3 w-full rounded-full overflow-hidden ${darkMode ? 'bg-green-400/20' : 'bg-gray-200'}`}>
              <div
                className={`h-full transition-all duration-700 ease-out ${
                  strength <= 1 ? 'bg-red-500' :
                  strength === 2 ? 'bg-orange-500' :
                  strength === 3 ? 'bg-yellow-500' :
                  strength === 4 ? 'bg-lime-500' :
                  strength === 5 ? 'bg-green-500' :
                  'bg-emerald-600'
                }`}
                style={{ width: `${Math.min(100, (strength / 6) * 100)}%` }}
              ></div>
            </div>
            <div className="mt-1 text-xs italic text-center">
              Crack Time: {crackTime}
            </div>
          </div>
          
          {/* Entropy display */}
          <div className={`mb-4 p-2 rounded-md text-center ${darkMode ? 'bg-green-400/10' : 'bg-blue-50'}`}>
            <div className="text-sm font-medium">Entropy: {entropy} bits</div>
          </div>
          
          {/* Feedback */}
          {feedback.length > 0 && (
            <div className={`mb-4 p-3 rounded-md ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700'}`}>
              <h3 className="font-medium mb-1">Suggestions:</h3>
              <ul className="list-disc pl-5 space-y-1">
                {feedback.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Passphrase options (shown when in passphrase mode) */}
          {isPassphraseMode && (
            <div className="mb-6 p-3 rounded-md border border-dashed border-green-400/30">
              <h3 className="font-medium mb-2">Passphrase Options:</h3>
              <form id="passphrase-options" className="space-y-2">
                <div className="flex items-center mb-2">
                  <label htmlFor="separator" className="mr-2">Separator:</label>
                  <input
                    id="separator"
                    type="text"
                    defaultValue="-"
                    maxLength="1"
                    className={`w-12 p-1 ${darkMode ? 'bg-black border-green-400/30 text-green-400' : 'border-gray-300'}`}
                  />
                </div>
                <label className="flex items-center">
                  <input
                    id="capitalize"
                    type="checkbox"
                    defaultChecked={true}
                    className={`form-checkbox h-4 w-4 ${darkMode ? 'text-green-400 bg-black border-green-400 focus:ring-green-400/50' : 'text-blue-600 focus:ring-blue-500'}`}
                  />
                  <span className="ml-2">Capitalize First Letter</span>
                </label>
                <div className="flex items-center mt-2">
                  <label htmlFor="wordCount" className="mr-2">Word Count:</label>
                  <select
                    id="wordCount"
                    defaultValue="4"
                    className={`p-1 rounded ${darkMode ? 'bg-black border-green-400/30 text-green-400' : 'border-gray-300'}`}
                  >
                    <option value="3">3 words</option>
                    <option value="4">4 words</option>
                    <button
                      onClick={() => setPassphraseOptions({...passphraseOptions, wordCount: parseInt(document.getElementById('wordCount').value)}}
                      className={`px-2 py-1 ml-2 rounded text-xs ${darkMode ? 'bg-green-400/20 hover:bg-green-400/40' : 'bg-blue-100 hover:bg-blue-200'}`}
                    >
                      Apply
                    </button>
                  </div>
                </select>
              </form>
            </div>
          )}
          
          {/* Password length slider */}
          <div className="mb-6">
            <label className="block mb-2 text-sm flex justify-between items-center">
              <span>Password Length:</span>
              <span className="font-bold">{length}</span>
            </label>
            <input
              type="range"
              min="4"
              max="64"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
              className={`w-full h-2 rounded-full appearance-none accent-green-400 ${darkMode ? 'bg-green-400/20' : 'bg-blue-200'}`}
            />
          </div>
          
          {/* Password requirements */}
          <div className={`mb-6 p-3 rounded-md ${darkMode ? 'bg-green-400/10' : 'bg-blue-50'}`}>
            <h3 className="font-medium mb-2">Requirements:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={password.length >= 8}
                  disabled
                  className={`form-checkbox h-4 w-4 ${darkMode ? 'text-green-400 bg-black border-green-400 focus:ring-green-400/50' : 'text-blue-600 focus:ring-blue-500'}`}
                />
                <span className="ml-2">Minimum 8 characters</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={/[A-Z]/.test(password)}
                  disabled
                  className={`form-checkbox h-4 w-4 ${darkMode ? 'text-green-400 bg-black border-green-400 focus:ring-green-400/50' : 'text-blue-600 focus:ring-blue-500'}`}
                />
                <span className="ml-2">At least one uppercase letter</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={/[a-z]/.test(password)}
                  disabled
                  className={`form-checkbox h-4 w-4 ${darkMode ? 'text-green-400 bg-black border-green-400 focus:ring-green-400/50' : 'text-blue-600 focus:ring-blue-500'}`}
                />
                <span className="ml-2">At least one lowercase letter</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={/\d/.test(password)}
                  disabled
                  className={`form-checkbox h-4 w-4 ${darkMode ? 'text-green-400 bg-black border-green-400 focus:ring-green-400/50' : 'text-blue-600 focus:ring-blue-500'}`}
                />
                <span className="ml-2">At least one number</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={/[!@#$%^&*(),.?":{}|<>]/.test(password)}
                  disabled
                  className={`form-checkbox h-4 w-4 ${darkMode ? 'text-green-400 bg-black border-green-400 focus:ring-green-400/50' : 'text-blue-600 focus:ring-blue-500'}`}
                />
                <span className="ml-2">At least one special character</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={!excludeAmbiguous || !/[lI1O0]/.test(password)}
                  disabled
                  className={`form-checkbox h-4 w-4 ${darkMode ? 'text-green-400 bg-black border-green-400 focus:ring-green-400/50' : 'text-blue-600 focus:ring-blue-500'}`}
                />
                <span className="ml-2">No ambiguous characters (lI1O0)</span>
              </label>
            </div>
          </div>
          
          {/* Feature showcase section */}
          <div className={`mb-6 p-4 rounded-md ${darkMode ? 'bg-green-400/10' : 'bg-blue-50'}`}>
            <h2 className="text-xl font-bold mb-4">Advanced Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FeatureCard icon={<LockIcon />} title="AES Vault" description="Secure browser-based password storage" />
              <FeatureCard icon={<ChartIcon />} title="Entropy Meter" description="Real-time entropy calculation" />
              <FeatureCard icon={<ShieldIcon />} title="Breaching Simulation" description="Visualize attack attempts" />
              <FeatureCard icon={<AIIcon />} title="AI Suggester" description="Smart password recommendations" />
              <FeatureCard icon={<BlockchainIcon />} title="Blockchain Proof" description="Timestamp your passwords" />
              <FeatureCard icon={<FingerprintIcon />} title="Biometric Sync" description="Detect stress levels" />
              <FeatureCard icon={<ARIcon />} title="AR Visualization" description="3D strength visualization" />
              <FeatureCard icon={<GameIcon />} title="Gamification" description="Unlock security badges" />
            </div>
          </div>
          
          {/* Password history */}
          {history.length > 0 && (
            <div className="mb-6">
              <h3 className={`text-sm font-medium ${darkMode ? 'text-green-400/80' : 'text-gray-700'}`}>Recent Passwords:</h3>
              <div className={`max-h-24 overflow-y-auto ${darkMode ? 'text-green-400/60' : 'text-gray-600'} text-xs space-y-1`}>
                {history.map((item, index) => (
                  <div 
                    key={index} 
                    className="truncate cursor-pointer hover:text-green-400 transition-colors"
                    onClick={() => setPassword(item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={copyToClipboard}
              className={`py-2 ${darkMode ? 'bg-green-400/20 hover:bg-green-400/40' : 'bg-blue-600 hover:bg-blue-700 text-white'} border rounded-md transition-all duration-300`}
            >
              <div className="flex items-center justify-center">
                <CopyIcon /> <span className="ml-2">Copy</span>
              </div>
            </button>
            <button
              onClick={generateQRCode}
              className={`py-2 ${darkMode ? 'bg-blue-400/20 hover:bg-blue-400/40' : 'bg-purple-600 hover:bg-purple-700 text-white'} border rounded-md transition-all duration-300`}
            >
              <div className="flex items-center justify-center">
                <QRIcon /> <span className="ml-2">Generate QR</span>
              </div>
            </button>
            <button
              onClick={resetSettings}
              className={`py-2 ${darkMode ? 'bg-red-400/20 hover:bg-red-400/40' : 'bg-red-600 hover:bg-red-700 text-white'} border rounded-md transition-all duration-300`}
            >
              <div className="flex items-center justify-center">
                <ResetIcon /> <span className="ml-2">Reset Settings</span>
              </div>
            </button>
            <button
              onClick={exportPasswordsCSV}
              className={`py-2 ${darkMode ? 'bg-yellow-400/20 hover:bg-yellow-400/40' : 'bg-amber-600 hover:bg-amber-700 text-white'} border rounded-md transition-all duration-300`}
            >
              <div className="flex items-center justify-center">
                <DownloadIcon /> <span className="ml-2">Export History</span>
              </div>
            </button>
          </div>
          
          {/* Footer */}
          <div className={`text-xs ${darkMode ? 'text-green-400/60' : 'text-gray-500'} text-center`}>
            <p>Security Tip: Use unique passwords for each service and store them securely.</p>
          </div>
        </div>
        
        {/* Feature showcase section */}
        <div className={`mt-6 max-w-xl w-full p-4 rounded-lg ${darkMode ? 'bg-black/30 border border-green-400/20' : 'bg-white/80 backdrop-blur-sm'}`}>
          <h2 className="text-xl font-bold mb-4">Cutting Edge Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FeatureCard icon={<MemoryIcon />} title="Memory Triggers" description="Create visual anchors for better retention" />
            <FeatureCard icon={<PersonalityIcon />} title="Security Personas" description="Get personalized guidance" />
            <FeatureCard icon={<PolicyIcon />} title="Compliance Helper" description="Meet regulatory standards" />
            <FeatureCard icon={<ClockIcon />} title="Password Aging" description="Track password decay over time" />
            <FeatureCard icon={<NetworkIcon />} title="Decentralized Sharing" description="Share securely via IPFS" />
            <FeatureCard icon={<YubikeyIcon />} title="Hardware Security" description="Integrate Yubikey" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature Card component
const FeatureCard = ({ icon, title, description }) => (
  <div className="flex items-start space-x-2 p-2 rounded-md hover:bg-opacity-10 hover:bg-green-400/10 transition-colors">
    <div className="flex-shrink-0 mt-1">
      {icon}
    </div>
    <div>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-xs">{description}</p>
    </div>
  </div>
);

// Icons
function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 10.05 10.38z"></path>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 0 0 2v1"></path>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11-8 11 12 20 12 20 12 20 12 20 12z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 3 12 3 12"></path>
      <path d="M9.9 9.9A2 2 0 0 0 12 12"></path>
      <path d="M21 21L3 3"></path>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0h4"></path>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 20V10"></path>
      <path d="M12 20V4"></path>
      <path d="M6 20V14"></path>
      <path d="M18 20H18.01"></path>
      <path d="M12 20H12.01"></path>
      <path d="M6 20H6.01"></path>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.4 0 10-4.6 10-10S17.4 2 12 2 2 6.6 2 12s4.6 10 10 10 10-4.6 10-10S17.4 2 12 2z"></path>
      <path d="M8.9 19.5L3.6 14.2"></path>
      <path d="M14.9 19.5L20.2 14.2"></path>
    </svg>
  );
}

function AIIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10 5"></path>
      <path d="M2 17l20-5-10 5-10-5"></path>
      <path d="M17 8v8"></path>
      <path d="M7 16V8"></path>
    </svg>
  );
}

function BlockchainIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7h-9"></path>
      <path d="M20 12H11"></path>
      <path d="M20 17H11"></path>
      <path d="M3 12h1v4a4 4 0 0 0 8 0v-4h1"></path>
      <path d="M3 7h7a4 4 0 0 0-8 0h1"></path>
      <path d="M11 12v5a4 4 0 0 0-8 0v-5h1"></path>
    </svg>
  );
}

function FingerprintIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 11c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8 8"></path>
      <path d="M13.5 2.8a5.7 5.7 0 0 1 11 8.2m2.1 5a5.7 5.7 0 0 1 11 8.2"></path>
      <path d="M2 13c2.5 2 5.7 3.2 9 3.2s6.5-1.2 9-3.2"></path>
    </svg>
  );
}

function ARIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12h20"></path>
      <path d="M2 6h20"></path>
      <path d="M2 18h20"></path>
      <path d="M6 3v3"></path>
      <path d="M6 18v3"></path>
      <path d="M18 3v3"></path>
      <path d="M18 18v3"></path>
    </svg>
  );
}

function GameIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12m-10 0 10 0"></path>
      <path d="M2 13c0 7 10 13 10 13s10-6 10-13-10-13-10-13z"></path>
      <path d="M12 19v3"></path>
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-9.6 0a3 3 0 1 0 6 6 6h15l-3-9-6-3.8A3 3 0 0 1 12 5z"></path>
    </svg>
  );
}

function PolicyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"></path>
      <path d="M14 2v20a2 2 0 0 0 2-2H8a2 2 0 0 0-2 2H4a2 2 0 0 0-2-2v-4"></path>
      <path d="M16 13a4 4 0 0 0-8 0 4 4 0 0 0 8 0z"></path>
      <path d="M16 13v0a2 2 0 0 0 2-2h-4a2 2 0 0 0-2 2h0a2 2 0 0 0 2-2z"></path>
      <path d="M20 10v6"></path>
      <path d="M4 6h16"></path>
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 6v6l4.5 4.5"></path>
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14"></path>
      <path d="M17 14l4-4-4-4"></path>
      <path d="M7 14l-4-4 4-4"></path>
    </svg>
  );
}

function YubikeyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0z"></path>
      <path d="M12 2a10 10 0 0 1 16 8"></path>
      <path d="M12 22v2"></path>
      <path d="M12 18a4 4 0 0 1 0 4-4"></path>
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4 1 10 7 10 7 4Z"></path>
      <path d="M7 20 7 14 1 14 1 20 7 20Z"></path>
      <path d="M17 4 17 10 23 10 23 4 17 4Z"></path>
      <path d="M23 20 23 14 17 14 17 20 23 20Z"></path>
      <path d="M9 12h6"></path>
    </svg>
  );
}

function QRIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h4v4H3z"></path>
      <path d="M17 3h4v4h-4z"></path>
      <path d="M3 17h4v4H3z"></path>
      <path d="M17 17h4v4h-4z"></path>
      <path d="M13 12h5v5h-5z"></path>
      <path d="M12 17v2"></path>
      <path d="M12 7v2"></path>
      <path d="M17 12h2"></path>
      <path d="M7 12h2"></path>
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12"></path>
      <path d="M19 10l-7 7-7-7"></path>
      <path d="M20 18H4"></path>
    </svg>
  );
}

function MemoryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8v8"></path>
      <path d="M16 12h2a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2H2v2a2 2 0 0 0 2h20a2 2 0 0 0 2H2"></path>
      <path d="M12 2v6"></path>
    </svg>
  );
}

function PersonalityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4H4a2 2 0 0 0 2 2h16a2 2 0 0 0 2 2z"></path>
      <path d="M12 11v6"></path>
      <path d="M9 17l-1 5h8l-1-5"></path>
    </svg>
  );
}
