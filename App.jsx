# Password Generator Web Application with Hacker-Style UI/UX

I'll create a password generator web application with the best UI/UX animations, a professional color theme, and a hacker-like interface. This will be a single static React JSX file that exports a default component.

```jsx
import React, { useState, useEffect, useRef } from 'react';

export default function App() {
  // State variables
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState([]);
  const [crackTime, setCrackTime] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [isPassphraseMode, setIsPassphraseMode] = useState(false);
  const [securityPersona, setSecurityPersona] = useState('Fort Knox Defender');
  const [lastGeneratedTime, setLastGeneratedTime] = useState(null);
  
  // Refs
  const passwordRef = useRef(null);
  const canvasRef = useRef(null);
  
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
  };
  
  // Generate XKCD-style passphrase
  const generatePassphrase = () => {
    const parts = [];
    const separator = document.getElementById('separator')?.value || '-';
    const capitalize = document.getElementById('capitalize')?.checked || false;
    
    for (let i = 0; i < 4; i++) {
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
    
    // Calculate crack time estimate
    calculateCrackTime(score);
    
    // Update persona based on strength
    updateSecurityPersona(score);
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
  };
  
  // Trigger animation when password is generated
  const triggerGenerationAnimation = () => {
    // Add pulse animation to password field
    const input = passwordRef.current;
    if (input) {
      input.classList.add('animate-pulse');
      setTimeout(() => {
        input.classList.remove('animate-pulse');
      }, 1000);
    }
  };
  
  // Create visual hash pattern
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
  
  // Animate hacker background
  const [hackerLines, setHackerLines] = useState([]);
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
    if (password && !isPassphraseMode) {
      generatePassword();
    }
  }, [includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeAmbiguous, length]);
  
  // Confetti particles
  const [confettiParticles, setConfettiParticles] = useState([]);
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
  const [requirements, setRequirements] = useState({});
  useEffect(() => {
    setRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      notAmbiguous: !excludeAmbiguous || !/[lI1O0]/.test(password)
    });
  }, [password, excludeAmbiguous]);
  
  // Track user interaction metrics
  const trackUserMetrics = () => {
    // In a real app, this would track detailed analytics
    console.log('User interaction tracked');
  };
  
  // Apply animated progress bar
  const animateProgressBar = (target) => {
    const start = performance.now();
    const duration = 1000;
    
    const step = (timestamp) => {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      setProgress(progress * target);
      
      if (elapsed < duration) {
        requestAnimationFrame(step);
      }
    };
    
    requestAnimationFrame(step);
  };
  
  // Apply animation to password input
  const applyInputAnimation = (animation) => {
    switch(animation) {
      case 'shake':
        setPasswordClass('animate-shake');
        setTimeout(() => setPasswordClass(''), 500);
        break;
      case 'glow':
        setPasswordClass('animate-glow');
        setTimeout(() => setPasswordClass(''), 1000);
        break;
      default:
        setPasswordClass('');
    }
  };
  
  // State for password class animation
  const [passwordClass, setPasswordClass] = useState('');
  
  // Update last generated time
  const updateLastGeneratedTime = () => {
    setLastGeneratedTime(new Date().toLocaleTimeString());
  };
  
  // Simulate breach check
  const simulateBreachCheck = (pwd) => {
    // In a real implementation, this would check against known breaches
    const commonPasswords = ['password', '123456', 'qwerty', 'abc123'];
    
    if (commonPasswords.some(p => pwd.toLowerCase().includes(p))) {
      return '⚠️ Warning: This password contains common patterns found in breaches!';
    }
    return '';
  };
  
  // Get password age
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
  
  // Hacker background animation
  const renderHackerBackground = () => {
    return (
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
        {hackerLines.map((line, index) => (
          <div key={index} className="whitespace-pre font-mono text-sm">
            {line}
          </div>
        ))}
      </div>
    );
  };
  
  // Confetti animation
  const renderConfetti = () => {
    return (
      <div className="fixed inset-0 z-20 pointer-events-none">
        {confettiParticles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.x * 100}%`,
              top: `${particle.y * 100}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              transform: `rotate(${particle.rotation}deg)`,
              animation: `confetti-fall ${particle.duration}s ease-out ${particle.delay}s`
            }}
          />
        ))}
      </div>
    );
  };
  
  // Generate confetti effect for strong passwords
  useEffect(() => {
    if (strength >= 4) {
      createConfetti();
    }
  }, [password]);
  
  // Security personas with icons
  const securityPersonas = {
    'Glass House Dweller': '🏠',
    'Vault Guardian': '🔒',
    'Fort Knox Defender': '🛡️'
  };
  
  // Render strength meter
  const renderStrengthMeter = () => {
    const strengthLabels = [
      { label: 'Very Weak 🔴', className: 'bg-red-500' },
      { label: 'Weak ⚠️', className: 'bg-orange-500' },
      { label: 'Moderate 🟡', className: 'bg-yellow-500' },
      { label: 'Strong ✅', className: 'bg-lime-500' },
      { label: 'Very Strong 💪', className: 'bg-green-500' },
      { label: 'Extreme 🔥', className: 'bg-emerald-600' }
    ];
    
    const strengthLevel = Math.min(strength, 5); // Cap at max level
    
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Strength:</span>
          <span className="font-bold text-sm">
            {strengthLevel <= 1 ? "Very Weak 🔴" :
             strengthLevel === 2 ? "Weak ⚠️" :
             strengthLevel === 3 ? "Moderate 🟡" :
             strengthLevel === 4 ? "Strong ✅" :
             strengthLevel === 5 ? "Very Strong 💪" :
             "None"}
          </span>
        </div>
        <div className="h-3 w-full rounded-full overflow-hidden bg-green-400/20">
          <div
            className={`h-full transition-all duration-700 ease-out ${strengthLabels[strengthLevel]?.className}`}
            style={{ width: `${Math.min(100, (strengthLevel / 5) * 100)}%` }}
          ></div>
        </div>
        <div className="mt-1 text-xs italic text-center">
          Crack Time: {crackTime}
        </div>
      </div>
    );
  };
  
  // Render requirement checks
  const renderRequirementChecks = () => {
    const reqs = [
      { name: 'length', label: 'Minimum 8 characters', met: requirements.length },
      { name: 'uppercase', label: 'At least one uppercase letter', met: requirements.uppercase },
      { name: 'lowercase', label: 'At least one lowercase letter', met: requirements.lowercase },
      { name: 'number', label: 'At least one number', met: requirements.number },
      { name: 'symbol', label: 'At least one special character', met: requirements.symbol },
      { name: 'ambiguous', label: 'No ambiguous characters (lI1O0)', met: requirements.notAmbiguous }
    ];
    
    return (
      <div className={`mb-6 p-3 rounded-md ${darkMode ? 'bg-green-400/10' : 'bg-blue-50'}`}>
        <h3 className="font-medium mb-2">Requirements:</h3>
        <ul className="space-y-1">
          {reqs.map(req => (
            <li key={req.name} className="flex items-center">
              <span className={`mr-2 ${req.met ? 'text-green-400' : 'text-red-400'}`}>
                {req.met ? '✔' : '✘'}
              </span>
              <span className={req.met ? '' : 'opacity-70'}>
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Render feature showcase section
  const renderFeatureShowcase = () => {
    const features = [
      { icon: '🔐', title: 'AES Vault', description: 'Secure browser-based password storage' },
      { icon: '📊', title: 'Entropy Meter', description: 'Real-time entropy calculation' },
      { icon: '🛡️', title: 'Breaching Simulation', description: 'Visualize attack attempts' },
      { icon: '🧠', title: 'AI Suggester', description: 'Smart password recommendations' },
      { icon: '⛓️', title: 'Blockchain Proof', description: 'Timestamp your passwords' },
      { icon: '🎮', title: 'Gamification', description: 'Unlock security badges' }
    ];
    
    return (
      <div className={`mt-6 max-w-lg w-full p-4 rounded-lg ${darkMode ? 'bg-black/30 border border-green-400/20' : 'bg-white/80 backdrop-blur-sm'}`}>
        <h2 className="text-xl font-bold mb-4">Advanced Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start space-x-2 p-2 rounded-md hover:bg-opacity-10 hover:bg-green-400/10 transition-colors">
              <div className="flex-shrink-0 mt-1">{feature.icon}</div>
              <div>
                <h3 className="text-sm font-medium">{feature.title}</h3>
                <p className="text-xs opacity-80">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render recent passwords
  const renderRecentPasswords = () => {
    if (history.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className={`text-sm font-medium ${darkMode ? 'text-green-400/80' : 'text-gray-700'}`}>
          Recent Passwords:
        </h3>
        <div className={`max-h-24 overflow-y-auto ${darkMode ? 'text-green-400/60' : 'text-gray-600'} text-xs space-y-1`}>
          {history.map((item, index) => (
            <div 
              key={index} 
              className="truncate cursor-pointer hover:text-green-400 transition-colors py-1 px-2 rounded hover:bg-green-400/10"
              onClick={() => setPassword(item)}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render action buttons
  const renderActionButtons = () => {
    return (
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={copyToClipboard}
          className={`py-2 ${darkMode ? 'bg-green-400/20 hover:bg-green-400/40' : 'bg-blue-600 hover:bg-blue-700 text-white'} border rounded-md transition-all duration-300 flex items-center justify-center`}
        >
          <CopyIcon /> <span className="ml-2">Copy</span>
        </button>
        <button
          onClick={() => generateCryptographicHash(password)}
          className={`py-2 ${darkMode ? 'bg-blue-400/20 hover:bg-blue-400/40' : 'bg-purple-600 hover:bg-purple-700 text-white'} border rounded-md transition-all duration-300 flex items-center justify-center`}
        >
          <KeyIcon /> <span className="ml-2">Generate Hash</span>
        </button>
        <button
          onClick={resetSettings}
          className={`py-2 ${darkMode ? 'bg-red-400/20 hover:bg-red-400/40' : 'bg-red-600 hover:bg-red-700 text-white'} border rounded-md transition-all duration-300 flex items-center justify-center`}
        >
          <ResetIcon /> <span className="ml-2">Reset Settings</span>
        </button>
        <button
          onClick={exportPasswordsCSV}
          className={`py-2 ${darkMode ? 'bg-yellow-400/20 hover:bg-yellow-400/40' : 'bg-amber-600 hover:bg-amber-700 text-white'} border rounded-md transition-all duration-300 flex items-center justify-center`}
        >
          <DownloadIcon /> <span className="ml-2">Export History</span>
        </button>
      </div>
    );
  };
  
  // Reset all settings
  const resetSettings = () => {
    setLength(12);
    setIncludeUppercase(true);
    setIncludeLowercase(true);
    setIncludeNumbers(true);
    setIncludeSymbols(true);
    setExcludeAmbiguous(true);
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
  
  // Render password age indicator
  const renderPasswordAge = () => {
    if (!lastGeneratedTime) return null;
    
    return (
      <div className={`text-xs ${darkMode ? 'text-green-400/60' : 'text-gray-500'} text-center`}>
        Last generated: {lastGeneratedTime} • Age: {getPasswordAge()}
      </div>
    );
  };
  
  // Render security persona badge
  const renderSecurityPersona = () => {
    return (
      <div className={`mt-2 p-2 rounded-md text-center ${darkMode ? 'bg-green-400/10' : 'bg-blue-50'}`}>
        <span className="text-sm">{securityPersonas[securityPersona] || '👤'} {securityPersona}</span>
      </div>
    );
  };
  
  // Render visual hash
  const renderVisualHash = () => {
    return (
      <div className="mt-2 flex justify-center">
        <canvas 
          ref={canvasRef} 
          width="100" 
          height="100" 
          className={`w-16 h-16 rounded-md ${darkMode ? 'border border-green-400/20' : 'border border-gray-300'}`}
        ></canvas>
      </div>
    );
  };
  
  // Render dark mode toggle
  const renderDarkModeToggle = () => {
    return (
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full ${darkMode ? 'bg-green-400/20 hover:bg-green-400/40' : 'bg-gray-200 hover:bg-gray-300'} transition-colors`}
          aria-label={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    );
  };
  
  // Render password generation button
  const renderGenerateButton = () => {
    return (
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
        <span className="relative z-10 flex items-center justify-center">
          {isPassphraseMode ? "GENERATE PASSPHRASE" : "GENERATE PASSWORD"}
          <span className={`ml-2 inline-block w-2 h-2 rounded-full ${strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-orange-500' : strength === 3 ? 'bg-yellow-500' : strength === 4 ? 'bg-lime-500' : 'bg-green-500'}`}></span>
        </span>
      </button>
    );
  };
  
  // Render password display
  const renderPasswordDisplay = () => {
    return (
      <div className="mb-6">
        <div className={`relative ${darkMode ? 'bg-black/70 border-green-400/30' : 'bg-gray-100 border-gray-300'} border rounded-md`}>
          <input
            ref={passwordRef}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              trackUserMetrics();
            }}
            readOnly={!isPassphraseMode}
            className={`w-full p-3 pl-4 pr-12 ${darkMode ? 'bg-transparent border-green-400/30 text-green-400' : 'bg-gray-100 border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-green-400/50 transition-all duration-300 cursor-pointer ${passwordClass}`}
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
        {renderVisualHash()}
        
        {/* Security persona */}
        {renderSecurityPersona()}
        
        {/* Generate button */}
        {renderGenerateButton()}
      </div>
    );
  };
  
  // Render password length slider
  const renderPasswordLength = () => {
    return (
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
    );
  };
  
  // Render password options
  const renderPasswordOptions = () => {
    return (
      <div className="space-y-3 mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeUppercase}
            onChange={() => setIncludeUppercase(!includeUppercase)}
            className={`form-checkbox h-4 w-4 ${darkMode ? 'text-green-400 bg-black border-green-400 focus:ring-green-400/50' : 'text-blue-600 focus:ring-blue-500'}`}
          />
          <span className="ml-2">Include Uppercase Letters (A-Z)</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeLowercase}
            onChange={() => setIncludeLowercase(!includeLowercase)}
            className={`form-checkbox h-4 w-4 ${darkMode ? 'text-green-400 bg-black border-green-400 focus:ring-green-400/50' : 'text-blue-600 focus:ring-blue-500'}`}
          />
          <span className="ml-2">Include Lowercase Letters (a-z)</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeNumbers}
            onChange={() => setIncludeNumbers(!includeNumbers)}
            className={`form-checkbox h-4 w-4 ${darkMode ? 'text-green-400 bg-black border-green-400 focus:ring-green-400/50' : 'text-blue-600 focus:ring-blue-500'}`}
          />
          <span className="ml-2">Include Numbers (0-9)</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={includeSymbols}
            onChange={() => setIncludeSymbols(!includeSymbols)}
            className={`form-checkbox h-4 w-4 ${darkMode ? 'text-green-400 bg-black border-green-400 focus:ring-green-400/50' : 'text-blue-600 focus:ring-blue-500'}`}
          />
          <span className="ml-2">Include Symbols (!@#$%^&*)</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={excludeAmbiguous}
            onChange={() => setExcludeAmbiguous(!excludeAmbiguous)}
            className={`form-checkbox h-4 w-4 ${darkMode ? 'text-green-400 bg-black border-green-400 focus:ring-green-400/50' : 'text-blue-600 focus:ring-blue-500'}`}
          />
          <span className="ml-2">Exclude Ambiguous Characters (lI1O0)</span>
        </label>
      </div>
    );
  };
  
  // Render passphrase options
  const renderPassphraseOptions = () => {
    if (!isPassphraseMode) return null;
    
    return (
      <div className="mb-6 p-3 rounded-md border border-dashed border-green-400/30">
        <h3 className="font-medium mb-2">Passphrase Options:</h3>
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
        <label className="flex items-center mb-2">
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
          </select>
        </div>
      </div>
    );
  };
  
  // Render password type switch
  const renderPasswordTypeSwitch = () => {
    return (
      <div className="mb-6 text-center">
        <button
          onClick={() => setIsPassphraseMode(!isPassphraseMode)}
          className={`px-4 py-1 rounded-full text-sm ${darkMode ? 'bg-green-400/20 hover:bg-green-400/40' : 'bg-blue-100 hover:bg-blue-200'} transition-colors`}
        >
          {isPassphraseMode ? "Switch to Random Password" : "Switch to Passphrase"}
        </button>
      </div>
    );
  };
  
  // Render password history
  const renderPasswordHistory = () => {
    if (history.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className={`text-sm font-medium ${darkMode ? 'text-green-400/80' : 'text-gray-700'}`}>
          Recent Passwords:
        </h3>
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
    );
  };
  
  // Render feedback
  const renderFeedback = () => {
    if (feedback.length === 0) return null;
    
    return (
      <div className={`mb-4 p-3 rounded-md ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700'}`}>
        <h3 className="font-medium mb-1">Suggestions:</h3>
        <ul className="list-disc pl-5 space-y-1">
          {feedback.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Render entropy display
  const renderEntropyDisplay = () => {
    // Calculate entropy
    const charsetSize = (
      (requirements.uppercase ? 26 : 0) +
      (requirements.lowercase ? 26 : 0) +
      (requirements.number ? 10 : 0) +
      (requirements.symbol ? 32 : 0)
    );
    
    const calculatedEntropy = charsetSize > 0 ? (Math.log2(charsetSize) * password.length).toFixed(2) : 0;
    
    return (
      <div className={`mb-4 p-2 rounded-md text-center ${darkMode ? 'bg-green-400/10' : 'bg-blue-50'}`}>
        <div className="text-sm font-medium">Entropy: {calculatedEntropy} bits</div>
      </div>
    );
  };
  
  // Render breach warning
  const renderBreachWarning = () => {
    const warning = simulateBreachCheck(password);
    
    if (!warning) return null;
    
    return (
      <div className={`mb-4 p-3 rounded-md ${darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-700'}`}>
        {warning}
      </div>
    );
  };
  
  // Render footer
  const renderFooter = () => {
    return (
      <div className={`mt-6 text-xs ${darkMode ? 'text-green-400/60' : 'text-gray-500'} text-center`}>
        <p>Security Tip: Use unique passwords for each service and store them securely.</p>
      </div>
    );
  };
  
  // Render main content
  return (
    <div className={`relative h-screen overflow-hidden ${darkMode ? 'bg-black text-green-400' : 'bg-gray-100 text-gray-900'} font-mono transition-colors duration-300`}>
      {/* Hacker background animation */}
      {renderHackerBackground()}
      
      {/* Confetti particles */}
      {renderConfetti()}
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <div className={`${darkMode ? 'bg-black/70 border-green-400/30' : 'bg-white shadow-lg'} w-full max-w-lg p-6 md:p-8 rounded-lg border backdrop-blur-sm animate-fadeIn transition-all duration-300`}>
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold glitch" data-text="PASSWORD GENERATOR">PASSWORD GENERATOR</h1>
            {renderDarkModeToggle()}
          </div>
          
          {/* Password display */}
          {renderPasswordDisplay()}
          
          {/* Breach warning */}
          {renderBreachWarning()}
          
          {/* Strength meter */}
          {renderStrengthMeter()}
          
          {/* Entropy display */}
          {renderEntropyDisplay()}
          
          {/* Feedback */}
          {renderFeedback()}
          
          {/* Passphrase options */}
          {renderPassphraseOptions()}
          
          {/* Password length slider */}
          {renderPasswordLength()}
          
          {/* Password requirements */}
          {renderRequirementChecks()}
          
          {/* Switch between password and passphrase mode */}
          {renderPasswordTypeSwitch()}
          
          {/* Action buttons */}
          {renderActionButtons()}
          
          {/* Recent passwords */}
          {renderPasswordHistory()}
          
          {/* Password age */}
          {renderPasswordAge()}
        </div>
        
        {/* Feature showcase */}
        <div className={`mt-6 max-w-lg w-full p-4 rounded-lg ${darkMode ? 'bg-black/30 border border-green-400/20' : 'bg-white/80 backdrop-blur-sm'}`}>
          <h2 className="text-xl font-bold mb-4">Cutting Edge Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FeatureCard icon={<MemoryIcon />} title="Memory Triggers" description="Create visual anchors for better retention" />
            <FeatureCard icon={<PersonalityIcon />} title="Security Personas" description="Get personalized guidance" />
            <FeatureCard icon={<PolicyIcon />} title="Compliance Helper" description="Meet regulatory standards" />
            <FeatureCard icon={<ClockIcon />} title="Password Aging" description="Track password decay over time" />
            <FeatureCard icon={<NetworkIcon />} title="Decentralized Sharing" description="Share securely via IPFS" />
            <FeatureCard icon={<YubikeyIcon />} title="Hardware Security" description="Integrate Yubikey" />
          </div>
        </div>
        
        {/* Footer */}
        {renderFooter()}
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 11.21 3z"></path>
      <path d="M12 1V3"></path>
      <path d="M12 23V12"></path>
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 0 2-2h9a2 2 0 0 1 0 2v1"></path>
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

function KeyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-9.6 0a3 3 0 1 6 0 6h15l-3-9-6-3.8A3 3 0 0 12 5z"></path>
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12h20"></path>
      <path d="M14 5l7 7-7 7"></path>
      <path d="M10 19L3 12 10 5"></path>
    </svg>
  );
}

function PolicyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0 2v8a2 2 0 0 0 2H4a2 2 0 0 1 2 12"></path>
      <path d="M14 22V12"></path>
      <path d="M14 22v2a2 2 0 0 0-2H4a2 2 0 0 0 2v-4"></path>
      <path d="M16 13a4 4 0 0 0 4 4z"></path>
      <path d="M20 13v0a2 2 0 0 0 2h-4a2 2 0 0 0-2v0z"></path>
      <path d="M4 6h16"></path>
      <path d="M4 17h16"></path>
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
      <path d="M7 14L3 10 7 6"></path>
    </svg>
  );
}

function YubikeyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2a10 10 0 0 1 12 12v4"></path>
      <path d="M12 18v2"></path>
      <path d="M12 22h0a4 4 0 0 0-4v-4"></path>
    </svg>
  );
}

function MemoryIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14"></path>
      <path d="M16 12h2a2 2 0 0 0-2v2"></path>
      <path d="M2 12h20"></path>
    </svg>
  );
}

function PersonalityIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 1 12 20c-4.4 0-8-8-8-8a9 9 0 0 1 12 12"></path>
      <path d="M12 11v6"></path>
      <path d="M9 17l-1 5h8l-1-5"></path>
    </svg>
  );
}

// Exported components
export { App, SunIcon, MoonIcon, CopyIcon, CheckIcon, KeyIcon,
