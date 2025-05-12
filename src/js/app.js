/**
 * Main application module
 * @module app
 */

import { validateText, sanitizeText, checkTextSafety } from './utils/textValidation.js';
import {
    calculateBasicMetrics,
    countSyllables,
    calculateFleschReadingEase,
    calculateFleschKincaidGrade,
    calculateColemanLiauIndex,
    determineGradeLevel,
    getReadabilityInterpretation,
    analyzeSentiment,
    analyzeWordFrequency
} from './utils/textAnalysis.js';
import {
    ThemeManager,
    ProgressManager,
    ResultsManager,
    ErrorManager,
    InputManager
} from './utils/uiState.js';

/**
 * Application configuration
 * @constant {Object}
 */
const CONFIG = {
    MAX_TEXT_LENGTH: 100000,
    MIN_TEXT_LENGTH: 10,
    DEBOUNCE_DELAY: 300,
    PROGRESS_STEPS: {
        VALIDATION: 10,
        BASIC_METRICS: 30,
        READABILITY: 50,
        SENTIMENT: 70,
        WORD_FREQUENCY: 90,
        COMPLETE: 100
    }
};

/**
 * Main application class
 */
class TextAnalyzer {
    constructor() {
        this.textarea = document.querySelector('#textInput');
        this.analyzeBtn = document.querySelector('#analyzeBtn');
        this.clearBtn = document.querySelector('#clearBtn');
        this.themeToggle = document.querySelector('#themeToggle');
        this.debounceTimer = null;
        
        this.initialize();
    }
    
    /**
     * Initialize the application
     */
    initialize() {
        // Initialize theme
        ThemeManager.initialize();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initial UI state
        InputManager.setAnalyzeButtonState(false);
        InputManager.updateCharCount('', CONFIG.MAX_TEXT_LENGTH);
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Text input handling
        this.textarea.addEventListener('input', this.handleTextInput.bind(this));
        this.textarea.addEventListener('keydown', this.handleKeyDown.bind(this));
        
        // Button click handlers
        this.analyzeBtn.addEventListener('click', this.handleAnalyze.bind(this));
        this.clearBtn.addEventListener('click', this.handleClear.bind(this));
        this.themeToggle.addEventListener('click', this.handleThemeToggle.bind(this));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));
    }
    
    /**
     * Handle text input with debouncing
     * @param {Event} event - Input event
     */
    handleTextInput(event) {
        const text = event.target.value;
        
        // Update character count
        InputManager.updateCharCount(text, CONFIG.MAX_TEXT_LENGTH);
        
        // Debounce validation
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            const validation = validateText(text);
            InputManager.setAnalyzeButtonState(validation.isValid);
            
            if (!validation.isValid) {
                ErrorManager.showError(validation.message);
            } else {
                ErrorManager.hideError();
            }
        }, CONFIG.DEBOUNCE_DELAY);
    }
    
    /**
     * Handle keydown events in textarea
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        // Ctrl+Enter to analyze
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            this.handleAnalyze();
        }
    }
    
    /**
     * Handle global keyboard shortcuts
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleGlobalKeyDown(event) {
        // Ctrl+Shift+C to clear
        if (event.ctrlKey && event.shiftKey && event.key === 'C') {
            event.preventDefault();
            this.handleClear();
        }
        
        // Ctrl+Shift+T to toggle theme
        if (event.ctrlKey && event.shiftKey && event.key === 'T') {
            event.preventDefault();
            this.handleThemeToggle();
        }
    }
    
    /**
     * Handle analyze button click
     */
    async handleAnalyze() {
        const text = this.textarea.value.trim();
        
        // Validate input
        const validation = validateText(text);
        if (!validation.isValid) {
            ErrorManager.showError(validation.message);
            return;
        }
        
        // Check text safety
        const safetyCheck = checkTextSafety(text);
        if (!safetyCheck.isSafe) {
            ErrorManager.showError(safetyCheck.message);
            return;
        }
        
        // Sanitize text
        const sanitizedText = sanitizeText(text);
        
        try {
            // Show loading state
            ResultsManager.showLoading();
            ProgressManager.show();
            
            // Basic metrics
            ProgressManager.update(CONFIG.PROGRESS_STEPS.VALIDATION);
            const basicMetrics = calculateBasicMetrics(sanitizedText);
            
            // Readability analysis
            ProgressManager.update(CONFIG.PROGRESS_STEPS.BASIC_METRICS);
            const syllableCount = countSyllables(sanitizedText);
            const fleschScore = calculateFleschReadingEase(
                basicMetrics.wordCount,
                basicMetrics.sentenceCount,
                syllableCount
            );
            const fleschKincaidGrade = calculateFleschKincaidGrade(
                basicMetrics.wordCount,
                basicMetrics.sentenceCount,
                syllableCount
            );
            const colemanLiauIndex = calculateColemanLiauIndex(
                basicMetrics.charCount,
                basicMetrics.wordCount,
                basicMetrics.sentenceCount
            );
            
            // Sentiment analysis
            ProgressManager.update(CONFIG.PROGRESS_STEPS.READABILITY);
            const sentiment = analyzeSentiment(sanitizedText);
            
            // Word frequency
            ProgressManager.update(CONFIG.PROGRESS_STEPS.SENTIMENT);
            const wordFreq = analyzeWordFrequency(sanitizedText);
            
            // Update UI
            ProgressManager.update(CONFIG.PROGRESS_STEPS.WORD_FREQUENCY);
            await this.updateResults({
                basicMetrics,
                fleschScore,
                fleschKincaidGrade,
                colemanLiauIndex,
                sentiment,
                wordFreq
            });
            
            // Complete
            ProgressManager.update(CONFIG.PROGRESS_STEPS.COMPLETE);
            
        } catch (error) {
            ErrorManager.showError('An error occurred during analysis. Please try again.');
            console.error('Analysis error:', error);
        } finally {
            ResultsManager.hideLoading();
            ProgressManager.hide();
        }
    }
    
    /**
     * Update results display
     * @param {Object} results - Analysis results
     */
    async updateResults(results) {
        const {
            basicMetrics,
            fleschScore,
            fleschKincaidGrade,
            colemanLiauIndex,
            sentiment,
            wordFreq
        } = results;
        
        // Hide existing results with animation
        await ResultsManager.hideResults();
        
        // Update basic metrics
        ResultsManager.updateMetric('charCount', basicMetrics.charCount);
        ResultsManager.updateMetric('charNoSpacesCount', basicMetrics.charNoSpacesCount);
        ResultsManager.updateMetric('wordCount', basicMetrics.wordCount);
        ResultsManager.updateMetric('sentenceCount', basicMetrics.sentenceCount);
        ResultsManager.updateMetric('paragraphCount', basicMetrics.paragraphCount);
        ResultsManager.updateMetric('avgWordLength', basicMetrics.avgWordLength);
        
        // Update readability metrics
        ResultsManager.updateMetric('fleschScore', fleschScore.toFixed(1));
        ResultsManager.updateMetric('fleschKincaidGrade', fleschKincaidGrade.toFixed(1));
        ResultsManager.updateMetric('colemanLiauIndex', colemanLiauIndex.toFixed(1));
        ResultsManager.updateMetric('gradeLevel', determineGradeLevel(fleschKincaidGrade, colemanLiauIndex));
        ResultsManager.updateMetric('readabilityInterpretation', getReadabilityInterpretation(fleschScore));
        
        // Update sentiment
        ResultsManager.updateMetric('sentiment', sentiment.sentiment);
        ResultsManager.updateMetric('positiveCount', sentiment.positiveCount);
        ResultsManager.updateMetric('negativeCount', sentiment.negativeCount);
        ResultsManager.updateMetric('sentimentScore', sentiment.score);
        
        // Update word frequency
        const wordFreqList = document.querySelector('#wordFreqList');
        if (wordFreqList) {
            wordFreqList.innerHTML = wordFreq
                .map(([word, count]) => `
                    <li class="word-freq-item">
                        <span class="word">${word}</span>
                        <span class="count">${count}</span>
                    </li>
                `)
                .join('');
        }
        
        // Show results with animation
        ResultsManager.showResults();
    }
    
    /**
     * Handle clear button click
     */
    async handleClear() {
        // Clear textarea
        this.textarea.value = '';
        
        // Reset UI state
        InputManager.updateCharCount('', CONFIG.MAX_TEXT_LENGTH);
        InputManager.setAnalyzeButtonState(false);
        ErrorManager.hideError();
        
        // Hide results with animation
        await ResultsManager.hideResults();
    }
    
    /**
     * Handle theme toggle
     */
    handleThemeToggle() {
        const newTheme = ThemeManager.toggle();
        
        // Update button text and icon
        const themeText = this.themeToggle.querySelector('.theme-toggle-text');
        const sunIcon = this.themeToggle.querySelector('.sun-icon');
        const moonIcon = this.themeToggle.querySelector('.moon-icon');
        
        if (themeText && sunIcon && moonIcon) {
            themeText.textContent = newTheme === 'light' ? 'Dark Mode' : 'Light Mode';
            sunIcon.style.display = newTheme === 'light' ? 'none' : 'inline';
            moonIcon.style.display = newTheme === 'dark' ? 'none' : 'inline';
            this.themeToggle.setAttribute('aria-label', `Switch to ${newTheme === 'light' ? 'dark' : 'light'} mode`);
        }
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TextAnalyzer();
}); 