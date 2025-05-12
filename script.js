// Constants
const MAX_TEXT_LENGTH = 100000; // Maximum text length to prevent performance issues
const DEBOUNCE_DELAY = 300; // Delay for debouncing text input
const THEME_STORAGE_KEY = 'textAnalyzerTheme'; // Key for storing theme preference

// Word lists for sentiment analysis
const positiveWords = [
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific',
    'outstanding', 'superb', 'brilliant', 'awesome', 'fabulous', 'spectacular',
    'perfect', 'delightful', 'pleasant', 'happy', 'joyful', 'love', 'like', 'beautiful',
    'best', 'better', 'impressive', 'positive', 'recommended', 'worth', 'helpful',
    'success', 'successful', 'succeed', 'pleased', 'enjoy', 'enjoyed', 'glad', 'thrilled'
];

const negativeWords = [
    'bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointing', 'disappointed',
    'worst', 'waste', 'useless', 'difficult', 'hard', 'ugly', 'boring', 'annoying',
    'hate', 'dislike', 'negative', 'problem', 'issue', 'fail', 'failed', 'failure',
    'wrong', 'error', 'mistake', 'concern', 'worried', 'worry', 'sad', 'unhappy',
    'unfortunate', 'trouble', 'unreliable', 'frustrating', 'frustration', 'frustrate'
];

// DOM Elements
let analyzeBtn, clearBtn, results, textInput, loadingSpinner, errorMessage, charCountDisplay, themeToggle;
let progressContainer, progressBar;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    setupAccessibility();
    initializeTheme();
});

// Initialize DOM elements
function initializeElements() {
    analyzeBtn = document.getElementById('analyzeBtn');
    clearBtn = document.getElementById('clearBtn');
    results = document.getElementById('results');
    textInput = document.getElementById('textInput');
    loadingSpinner = document.getElementById('loadingSpinner');
    errorMessage = document.getElementById('errorMessage');
    charCountDisplay = document.getElementById('charCountDisplay');
    themeToggle = document.getElementById('themeToggle');
    progressContainer = document.getElementById('progressContainer');
    progressBar = document.getElementById('progressBar');
}

// Setup event listeners
function setupEventListeners() {
    analyzeBtn.addEventListener('click', handleAnalyze);
    clearBtn.addEventListener('click', handleClear);
    textInput.addEventListener('input', debounce(handleTextInput, DEBOUNCE_DELAY));
    textInput.addEventListener('keydown', handleKeyPress);
    themeToggle.addEventListener('click', toggleTheme);
}

// Setup accessibility features
function setupAccessibility() {
    // Add ARIA labels
    textInput.setAttribute('aria-label', 'Text input for analysis');
    analyzeBtn.setAttribute('aria-label', 'Analyze text');
    clearBtn.setAttribute('aria-label', 'Clear text and results');
    
    // Add tooltips
    addTooltips();
}

// Add tooltips to metrics
function addTooltips() {
    const tooltips = {
        'charCount': 'Total number of characters in the text',
        'charNoSpacesCount': 'Total number of characters excluding spaces',
        'wordCount': 'Total number of words in the text',
        'sentenceCount': 'Total number of sentences in the text',
        'paragraphCount': 'Total number of paragraphs in the text',
        'avgWordLength': 'Average length of words in the text',
        'fleschScore': 'Score indicating how easy the text is to read (0-100)',
        'fleschKincaidGrade': 'Grade level required to understand the text',
        'colemanLiauIndex': 'Grade level based on characters and sentences',
        'gradeLevel': 'Approximate US grade level required to understand the text'
    };

    for (const [id, tooltip] of Object.entries(tooltips)) {
        const element = document.getElementById(id);
        if (element) {
            element.setAttribute('data-tooltip', tooltip);
            element.setAttribute('role', 'tooltip');
        }
    }
}

// Handle text analysis with progress
async function handleAnalyze() {
    const text = textInput.value.trim();
    
    if (!validateInput(text)) {
        return;
    }
    
    try {
        setLoading(true);
        showProgress();
        await analyzeText(text);
        hideProgress();
    } catch (error) {
        showError('An error occurred while analyzing the text. Please try again.');
        console.error('Analysis error:', error);
    } finally {
        setLoading(false);
    }
}

// Validate input text
function validateInput(text) {
    if (text.length === 0) {
        showError('Please enter some text to analyze.');
        return false;
    }
    
    if (text.length > MAX_TEXT_LENGTH) {
        showError(`Text is too long. Maximum length is ${MAX_TEXT_LENGTH} characters.`);
        return false;
    }
    
    hideError();
    return true;
}

// Show progress bar
function showProgress() {
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';
    
    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 90) {
            clearInterval(interval);
            progress = 90;
        }
        updateProgress(progress);
    }, 200);
    
    // Store interval ID for cleanup
    progressContainer.dataset.intervalId = interval;
}

// Update progress bar
function updateProgress(progress) {
    progressBar.style.width = `${Math.min(progress, 100)}%`;
}

// Hide progress bar
function hideProgress() {
    updateProgress(100);
    setTimeout(() => {
        progressContainer.style.display = 'none';
        progressBar.style.width = '0%';
        if (progressContainer.dataset.intervalId) {
            clearInterval(parseInt(progressContainer.dataset.intervalId));
        }
    }, 500);
}

// Analyze text with animations
async function analyzeText(text) {
    // Show results container with animation
    results.style.display = 'block';
    setTimeout(() => results.classList.add('visible'), 50);
    
    // Calculate and update metrics with staggered animations
    const metrics = [
        () => updateBasicMetrics(text),
        () => updateReadingMetrics(text),
        () => updateSentimentAnalysis(text),
        () => updateWordFrequency(text)
    ];
    
    for (let i = 0; i < metrics.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        metrics[i]();
    }
}

// Update basic metrics with animation
function updateBasicMetrics(text) {
    const metrics = calculateBasicMetrics(text);
    
    Object.entries(metrics).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            animateValue(element, 0, value, 500);
        }
    });
}

// Calculate basic metrics
function calculateBasicMetrics(text) {
    const words = text.match(/\b\w+\b/g) || [];
    const sentences = text.split(/[.!?]+\s*/).filter(Boolean);
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean);
    
    return {
        charCount: text.length,
        charNoSpacesCount: text.replace(/\s/g, '').length,
        wordCount: words.length,
        sentenceCount: sentences.length,
        paragraphCount: paragraphs.length,
        avgWordLength: words.length > 0 ? 
            (text.replace(/\s/g, '').length / words.length).toFixed(2) : 0
    };
}

// Animate numeric value
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const animate = () => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            element.textContent = typeof end === 'number' ? end.toFixed(2) : end;
        } else {
            element.textContent = typeof current === 'number' ? current.toFixed(2) : Math.round(current);
            requestAnimationFrame(animate);
        }
    };
    
    requestAnimationFrame(animate);
}

// Update reading metrics with animation
function updateReadingMetrics(text) {
    const words = text.match(/\b\w+\b/g) || [];
    const sentences = text.split(/[.!?]+\s*/).filter(Boolean);
    const totalSyllables = countSyllables(text);
    
    const fleschScore = calculateFleschReadingEase(words.length, sentences.length, totalSyllables);
    const fleschKincaidGrade = calculateFleschKincaidGrade(words.length, sentences.length, totalSyllables);
    const colemanLiauIndex = calculateColemanLiauIndex(text.length, words.length, sentences.length);
    const gradeLevel = determineGradeLevel(fleschKincaidGrade, colemanLiauIndex);
    
    // Animate metrics
    animateValue(document.getElementById('fleschScore'), 0, fleschScore, 500);
    animateValue(document.getElementById('fleschKincaidGrade'), 0, fleschKincaidGrade, 500);
    animateValue(document.getElementById('colemanLiauIndex'), 0, colemanLiauIndex, 500);
    
    // Update grade level and interpretation with fade
    const gradeElement = document.getElementById('gradeLevel');
    const interpretationElement = document.getElementById('readabilityInterpretation');
    
    gradeElement.style.opacity = '0';
    interpretationElement.style.opacity = '0';
    
    setTimeout(() => {
        gradeElement.textContent = gradeLevel;
        interpretationElement.textContent = getReadabilityInterpretation(fleschScore);
        gradeElement.style.opacity = '1';
        interpretationElement.style.opacity = '1';
    }, 250);
}

// Update sentiment analysis with animation
function updateSentimentAnalysis(text) {
    const wordList = text.toLowerCase().match(/\b\w+\b/g) || [];
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of wordList) {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
    }
    
    // Animate counts
    animateValue(document.getElementById('positiveWords'), 0, positiveCount, 500);
    animateValue(document.getElementById('negativeWords'), 0, negativeCount, 500);
    
    // Update sentiment indicator with animation
    const sentimentIndicator = document.getElementById('sentimentIndicator');
    sentimentIndicator.style.opacity = '0';
    
    setTimeout(() => {
        sentimentIndicator.classList.remove('positive', 'neutral', 'negative');
        
        if (positiveCount > negativeCount) {
            sentimentIndicator.classList.add('positive');
            sentimentIndicator.textContent = 'Positive';
        } else if (negativeCount > positiveCount) {
            sentimentIndicator.classList.add('negative');
            sentimentIndicator.textContent = 'Negative';
        } else {
            sentimentIndicator.classList.add('neutral');
            sentimentIndicator.textContent = 'Neutral';
        }
        
        sentimentIndicator.style.opacity = '1';
    }, 250);
}

// Update word frequency with animation
function updateWordFrequency(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = {};
    
    words.forEach(word => {
        if (word.length > 2) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });
    
    const sortedWords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    const wordFreqContainer = document.getElementById('wordFrequency');
    if (wordFreqContainer) {
        wordFreqContainer.innerHTML = sortedWords
            .map(([word, count], index) => `
                <div class="metric" style="animation-delay: ${index * 50}ms">
                    <div class="metric-title">${word}</div>
                    <div class="metric-value">${count} occurrences</div>
                </div>
            `)
            .join('');
    }
}

// Handle clear button with animation
function handleClear() {
    // Fade out results
    results.style.opacity = '0';
    results.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        textInput.value = '';
        results.style.display = 'none';
        results.style.opacity = '1';
        results.style.transform = 'translateY(0)';
        hideError();
        updateCharCount(0);
        textInput.focus();
    }, 300);
}

// Handle text input
function handleTextInput() {
    const text = textInput.value;
    updateCharCount(text.length);
    
    if (text.length > MAX_TEXT_LENGTH) {
        showError(`Text is too long. Maximum length is ${MAX_TEXT_LENGTH} characters.`);
    } else {
        hideError();
    }
}

// Update character count display
function updateCharCount(count) {
    if (charCountDisplay) {
        charCountDisplay.textContent = `${count}/${MAX_TEXT_LENGTH}`;
        charCountDisplay.className = count > MAX_TEXT_LENGTH ? 'error' : '';
    }
}

// Handle key press events
function handleKeyPress(event) {
    if (event.ctrlKey && event.key === 'Enter') {
        handleAnalyze();
    }
}

// Set loading state
function setLoading(isLoading) {
    analyzeBtn.disabled = isLoading;
    loadingSpinner.style.display = isLoading ? 'block' : 'none';
    if (isLoading) {
        analyzeBtn.setAttribute('aria-busy', 'true');
    } else {
        analyzeBtn.removeAttribute('aria-busy');
    }
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    errorMessage.setAttribute('role', 'alert');
}

// Hide error message
function hideError() {
    errorMessage.style.display = 'none';
    errorMessage.removeAttribute('role');
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Syllable counting functions
function countSyllables(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    return words.reduce((count, word) => count + countSyllablesInWord(word), 0);
}

function countSyllablesInWord(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
}

// Reading level calculation functions
function calculateFleschReadingEase(wordCount, sentenceCount, syllableCount) {
    if (wordCount === 0 || sentenceCount === 0) return 0;
    return 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
}

function calculateFleschKincaidGrade(wordCount, sentenceCount, syllableCount) {
    if (wordCount === 0 || sentenceCount === 0) return 0;
    return 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
}

function calculateColemanLiauIndex(charCount, wordCount, sentenceCount) {
    if (wordCount === 0 || sentenceCount === 0) return 0;
    const L = (charCount / wordCount) * 100;
    const S = (sentenceCount / wordCount) * 100;
    return 0.0588 * L - 0.296 * S - 15.8;
}

function determineGradeLevel(fleschKincaidGrade, colemanLiauIndex) {
    const averageGrade = (fleschKincaidGrade + colemanLiauIndex) / 2;
    const roundedGrade = Math.round(averageGrade);
    
    if (roundedGrade <= 0) return 'Kindergarten';
    if (roundedGrade >= 13) return 'College level';
    return roundedGrade + getOrdinalSuffix(roundedGrade) + ' grade';
}

function getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
}

function getReadabilityInterpretation(score) {
    if (score >= 90) return 'Very easy to read. Easily understood by an average 11-year-old student.';
    if (score >= 80) return 'Easy to read. Conversational English for consumers.';
    if (score >= 70) return 'Fairly easy to read.';
    if (score >= 60) return 'Plain English. Easily understood by 13- to 15-year-old students.';
    if (score >= 50) return 'Fairly difficult to read.';
    if (score >= 30) return 'Difficult to read. Best understood by college graduates.';
    return 'Very difficult to read. Best understood by university graduates.';
}

// Initialize theme from storage or system preference
function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (prefersDark) {
        setTheme('dark');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

// Toggle between light and dark themes
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

// Set the theme and update UI
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    
    // Update theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    const sunIcon = themeToggle.querySelector('.sun-icon');
    const moonIcon = themeToggle.querySelector('.moon-icon');
    const themeText = themeToggle.querySelector('.theme-toggle-text');
    
    if (theme === 'dark') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
        themeText.textContent = 'Light Mode';
        themeToggle.setAttribute('aria-label', 'Switch to light mode');
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
        themeText.textContent = 'Dark Mode';
        themeToggle.setAttribute('aria-label', 'Switch to dark mode');
    }
} 