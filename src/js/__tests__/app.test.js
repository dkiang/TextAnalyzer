/**
 * Unit tests for main application module
 * @module app.test
 */

import { TextAnalyzer } from '../app.js';
import { validateText, sanitizeText, checkTextSafety } from '../utils/textValidation.js';
import {
    calculateBasicMetrics,
    countSyllables,
    calculateFleschReadingEase,
    calculateFleschKincaidGrade,
    calculateColemanLiauIndex,
    analyzeSentiment,
    analyzeWordFrequency
} from '../utils/textAnalysis.js';
import {
    ThemeManager,
    ProgressManager,
    ResultsManager,
    ErrorManager,
    InputManager
} from '../utils/uiState.js';

// Mock dependencies
jest.mock('../utils/textValidation.js');
jest.mock('../utils/textAnalysis.js');
jest.mock('../utils/uiState.js');

// Mock DOM elements
document.body.innerHTML = `
    <textarea id="textInput"></textarea>
    <button id="analyzeBtn"></button>
    <button id="clearBtn"></button>
    <button id="themeToggle">
        <span class="theme-toggle-text">Dark Mode</span>
        <svg class="sun-icon"></svg>
        <svg class="moon-icon"></svg>
    </button>
    <div class="results">
        <div id="charCount" class="metric">
            <span class="metric-value">0</span>
        </div>
        <div id="wordFreqList"></div>
    </div>
`;

describe('TextAnalyzer Application', () => {
    let app;
    
    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Reset DOM
        document.querySelector('#textInput').value = '';
        document.querySelector('#analyzeBtn').disabled = false;
        document.querySelector('#clearBtn').disabled = false;
        document.querySelector('.results').style.display = 'none';
        
        // Mock successful validation
        validateText.mockReturnValue({ isValid: true, message: '' });
        sanitizeText.mockImplementation(text => text);
        checkTextSafety.mockReturnValue({ isSafe: true, message: '' });
        
        // Mock analysis results
        calculateBasicMetrics.mockReturnValue({
            charCount: 100,
            charNoSpacesCount: 80,
            wordCount: 20,
            sentenceCount: 5,
            paragraphCount: 2,
            avgWordLength: '4.0'
        });
        
        countSyllables.mockReturnValue(30);
        calculateFleschReadingEase.mockReturnValue(75.5);
        calculateFleschKincaidGrade.mockReturnValue(6.5);
        calculateColemanLiauIndex.mockReturnValue(7.2);
        analyzeSentiment.mockReturnValue({
            sentiment: 'positive',
            positiveCount: 5,
            negativeCount: 2,
            score: 3
        });
        analyzeWordFrequency.mockReturnValue([
            ['the', 10],
            ['and', 5],
            ['is', 3]
        ]);
        
        // Create app instance
        app = new TextAnalyzer();
    });
    
    describe('Initialization', () => {
        test('initializes theme manager', () => {
            expect(ThemeManager.initialize).toHaveBeenCalled();
        });
        
        test('sets up event listeners', () => {
            const textarea = document.querySelector('#textInput');
            const analyzeBtn = document.querySelector('#analyzeBtn');
            const clearBtn = document.querySelector('#clearBtn');
            const themeToggle = document.querySelector('#themeToggle');
            
            // Simulate events
            textarea.dispatchEvent(new Event('input'));
            analyzeBtn.dispatchEvent(new Event('click'));
            clearBtn.dispatchEvent(new Event('click'));
            themeToggle.dispatchEvent(new Event('click'));
            
            // Verify handlers were called
            expect(validateText).toHaveBeenCalled();
            expect(ThemeManager.toggle).toHaveBeenCalled();
        });
        
        test('sets initial UI state', () => {
            expect(InputManager.setAnalyzeButtonState).toHaveBeenCalledWith(false);
            expect(InputManager.updateCharCount).toHaveBeenCalledWith('', expect.any(Number));
        });
    });
    
    describe('Text Input Handling', () => {
        test('validates input on change', () => {
            const textarea = document.querySelector('#textInput');
            textarea.value = 'Test input';
            textarea.dispatchEvent(new Event('input'));
            
            // Wait for debounce
            jest.advanceTimersByTime(300);
            
            expect(validateText).toHaveBeenCalledWith('Test input');
            expect(InputManager.setAnalyzeButtonState).toHaveBeenCalledWith(true);
        });
        
        test('shows error for invalid input', () => {
            validateText.mockReturnValue({ isValid: false, message: 'Invalid input' });
            
            const textarea = document.querySelector('#textInput');
            textarea.value = 'Invalid';
            textarea.dispatchEvent(new Event('input'));
            
            // Wait for debounce
            jest.advanceTimersByTime(300);
            
            expect(ErrorManager.showError).toHaveBeenCalledWith('Invalid input');
            expect(InputManager.setAnalyzeButtonState).toHaveBeenCalledWith(false);
        });
        
        test('handles keyboard shortcuts', () => {
            const textarea = document.querySelector('#textInput');
            
            // Ctrl+Enter to analyze
            textarea.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                ctrlKey: true
            }));
            
            expect(validateText).toHaveBeenCalled();
        });
    });
    
    describe('Analysis', () => {
        test('performs full analysis on valid input', async () => {
            const textarea = document.querySelector('#textInput');
            textarea.value = 'Valid input text for analysis.';
            
            await app.handleAnalyze();
            
            // Verify validation and safety checks
            expect(validateText).toHaveBeenCalledWith('Valid input text for analysis.');
            expect(checkTextSafety).toHaveBeenCalled();
            expect(sanitizeText).toHaveBeenCalled();
            
            // Verify analysis steps
            expect(calculateBasicMetrics).toHaveBeenCalled();
            expect(countSyllables).toHaveBeenCalled();
            expect(calculateFleschReadingEase).toHaveBeenCalled();
            expect(calculateFleschKincaidGrade).toHaveBeenCalled();
            expect(calculateColemanLiauIndex).toHaveBeenCalled();
            expect(analyzeSentiment).toHaveBeenCalled();
            expect(analyzeWordFrequency).toHaveBeenCalled();
            
            // Verify UI updates
            expect(ProgressManager.show).toHaveBeenCalled();
            expect(ProgressManager.update).toHaveBeenCalledTimes(5);
            expect(ProgressManager.hide).toHaveBeenCalled();
            expect(ResultsManager.showLoading).toHaveBeenCalled();
            expect(ResultsManager.hideLoading).toHaveBeenCalled();
            expect(ResultsManager.showResults).toHaveBeenCalled();
        });
        
        test('handles analysis errors', async () => {
            calculateBasicMetrics.mockImplementation(() => {
                throw new Error('Analysis failed');
            });
            
            const textarea = document.querySelector('#textInput');
            textarea.value = 'Valid input text.';
            
            await app.handleAnalyze();
            
            expect(ErrorManager.showError).toHaveBeenCalledWith(
                'An error occurred during analysis. Please try again.'
            );
            expect(ProgressManager.hide).toHaveBeenCalled();
            expect(ResultsManager.hideLoading).toHaveBeenCalled();
        });
        
        test('rejects unsafe input', async () => {
            checkTextSafety.mockReturnValue({
                isSafe: false,
                message: 'Potentially harmful content detected'
            });
            
            const textarea = document.querySelector('#textInput');
            textarea.value = 'Unsafe input';
            
            await app.handleAnalyze();
            
            expect(ErrorManager.showError).toHaveBeenCalledWith(
                'Potentially harmful content detected'
            );
            expect(calculateBasicMetrics).not.toHaveBeenCalled();
        });
    });
    
    describe('Clear Functionality', () => {
        test('clears input and resets UI', async () => {
            const textarea = document.querySelector('#textInput');
            textarea.value = 'Some text';
            
            await app.handleClear();
            
            expect(textarea.value).toBe('');
            expect(InputManager.updateCharCount).toHaveBeenCalledWith('', expect.any(Number));
            expect(InputManager.setAnalyzeButtonState).toHaveBeenCalledWith(false);
            expect(ErrorManager.hideError).toHaveBeenCalled();
            expect(ResultsManager.hideResults).toHaveBeenCalled();
        });
    });
    
    describe('Theme Toggle', () => {
        test('toggles theme and updates UI', () => {
            ThemeManager.toggle.mockReturnValue('dark');
            
            app.handleThemeToggle();
            
            expect(ThemeManager.toggle).toHaveBeenCalled();
            
            const themeText = document.querySelector('.theme-toggle-text');
            const sunIcon = document.querySelector('.sun-icon');
            const moonIcon = document.querySelector('.moon-icon');
            
            expect(themeText.textContent).toBe('Light Mode');
            expect(sunIcon.style.display).toBe('inline');
            expect(moonIcon.style.display).toBe('none');
        });
    });
}); 