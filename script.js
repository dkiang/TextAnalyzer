// Constants
const MAX_TEXT_LENGTH = 100000; // Maximum text length to prevent performance issues
const DEBOUNCE_DELAY = 300; // Delay for debouncing text input

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
let analyzeBtn, clearBtn, results, textInput, loadingSpinner, errorMessage, charCountDisplay;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    setupAccessibility();
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
}

// Setup event listeners
function setupEventListeners() {
    analyzeBtn.addEventListener('click', handleAnalyze);
    clearBtn.addEventListener('click', handleClear);
    textInput.addEventListener('input', debounce(handleTextInput, DEBOUNCE_DELAY));
    textInput.addEventListener('keydown', handleKeyPress);
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

// Handle text analysis
async function handleAnalyze() {
    const text = textInput.value.trim();
    
    if (!validateInput(text)) {
        return;
    }
    
    try {
        setLoading(true);
        await analyzeText(text);
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

// Analyze text
async function analyzeText(text) {
    // Show results container
    results.style.display = 'block';
    
    // Calculate and update basic metrics
    updateBasicMetrics(text);
    
    // Calculate and update reading level metrics
    updateReadingMetrics(text);
    
    // Calculate and update sentiment analysis
    updateSentimentAnalysis(text);
    
    // Calculate and update word frequency
    updateWordFrequency(text);
}

// Update basic metrics
function updateBasicMetrics(text) {
    const metrics = calculateBasicMetrics(text);
    
    // Update DOM with metrics
    Object.entries(metrics).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
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

// Update reading metrics
function updateReadingMetrics(text) {
    const words = text.match(/\b\w+\b/g) || [];
    const sentences = text.split(/[.!?]+\s*/).filter(Boolean);
    const totalSyllables = countSyllables(text);
    
    const fleschScore = calculateFleschReadingEase(words.length, sentences.length, totalSyllables);
    const fleschKincaidGrade = calculateFleschKincaidGrade(words.length, sentences.length, totalSyllables);
    const colemanLiauIndex = calculateColemanLiauIndex(text.length, words.length, sentences.length);
    const gradeLevel = determineGradeLevel(fleschKincaidGrade, colemanLiauIndex);
    
    // Update DOM
    document.getElementById('fleschScore').textContent = fleschScore.toFixed(1);
    document.getElementById('fleschKincaidGrade').textContent = fleschKincaidGrade.toFixed(1);
    document.getElementById('colemanLiauIndex').textContent = colemanLiauIndex.toFixed(1);
    document.getElementById('gradeLevel').textContent = gradeLevel;
    document.getElementById('readabilityInterpretation').textContent = 
        getReadabilityInterpretation(fleschScore);
}

// Update sentiment analysis
function updateSentimentAnalysis(text) {
    const wordList = text.toLowerCase().match(/\b\w+\b/g) || [];
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of wordList) {
        if (positiveWords.includes(word)) positiveCount++;
        if (negativeWords.includes(word)) negativeCount++;
    }
    
    // Update DOM
    document.getElementById('positiveWords').textContent = positiveCount;
    document.getElementById('negativeWords').textContent = negativeCount;
    
    const sentimentIndicator = document.getElementById('sentimentIndicator');
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
}

// Update word frequency analysis
function updateWordFrequency(text) {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    const wordFreq = {};
    
    // Count word frequency
    words.forEach(word => {
        if (word.length > 2) { // Ignore very short words
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });
    
    // Sort by frequency
    const sortedWords = Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10); // Top 10 words
    
    // Update DOM
    const wordFreqContainer = document.getElementById('wordFrequency');
    if (wordFreqContainer) {
        wordFreqContainer.innerHTML = sortedWords
            .map(([word, count]) => `<div class="metric">
                <div class="metric-title">${word}</div>
                <div>${count} occurrences</div>
            </div>`)
            .join('');
    }
}

// Handle clear button
function handleClear() {
    textInput.value = '';
    results.style.display = 'none';
    hideError();
    updateCharCount(0);
    textInput.focus();
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