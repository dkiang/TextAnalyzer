/**
 * Unit tests for UI state management utilities
 * @module utils/uiState.test
 */

import {
    ThemeManager,
    ProgressManager,
    ResultsManager,
    ErrorManager,
    InputManager
} from '../uiState.js';

// Mock DOM elements
document.body.innerHTML = `
    <div class="progress-container" style="display: none;">
        <div class="progress-bar" style="width: 0%;"></div>
    </div>
    <div class="loading-spinner" style="display: none;"></div>
    <div class="results" style="display: none;">
        <div id="charCount" class="metric">
            <span class="metric-value">0</span>
        </div>
        <div id="wordFreqList"></div>
    </div>
    <div class="error-message"></div>
    <textarea id="textInput"></textarea>
    <div class="char-count"></div>
    <button id="analyzeBtn"></button>
    <button id="themeToggle">
        <span class="theme-toggle-text">Dark Mode</span>
        <svg class="sun-icon"></svg>
        <svg class="moon-icon"></svg>
    </button>
`;

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn(key => store[key]),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        clear: () => {
            store = {};
        }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

describe('UI State Management', () => {
    beforeEach(() => {
        // Reset DOM
        document.querySelector('.progress-container').style.display = 'none';
        document.querySelector('.progress-bar').style.width = '0%';
        document.querySelector('.loading-spinner').style.display = 'none';
        document.querySelector('.results').style.display = 'none';
        document.querySelector('.error-message').textContent = '';
        document.querySelector('.error-message').classList.remove('show');
        document.querySelector('#textInput').value = '';
        document.querySelector('.char-count').textContent = '';
        document.querySelector('#analyzeBtn').disabled = false;
        document.querySelector('#themeToggle').setAttribute('aria-label', '');
        
        // Reset localStorage
        localStorageMock.clear();
        
        // Reset matchMedia mock
        window.matchMedia.mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }));
    });
    
    describe('ThemeManager', () => {
        test('initializes with system preference when no saved theme', () => {
            window.matchMedia.mockImplementation(query => ({
                matches: query === '(prefers-color-scheme: dark)',
                media: query,
                addEventListener: jest.fn(),
            }));
            
            ThemeManager.initialize();
            
            expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
            expect(localStorage.getItem).toHaveBeenCalledWith(ThemeManager.STORAGE_KEY);
            expect(localStorage.setItem).toHaveBeenCalledWith(ThemeManager.STORAGE_KEY, 'dark');
        });
        
        test('initializes with saved theme preference', () => {
            localStorageMock.getItem.mockReturnValue('light');
            
            ThemeManager.initialize();
            
            expect(document.documentElement.getAttribute('data-theme')).toBe('light');
            expect(localStorage.getItem).toHaveBeenCalledWith(ThemeManager.STORAGE_KEY);
        });
        
        test('toggles theme correctly', () => {
            document.documentElement.setAttribute('data-theme', 'light');
            
            const newTheme = ThemeManager.toggle();
            
            expect(newTheme).toBe('dark');
            expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
            expect(localStorage.setItem).toHaveBeenCalledWith(ThemeManager.STORAGE_KEY, 'dark');
        });
    });
    
    describe('ProgressManager', () => {
        test('shows progress bar', () => {
            ProgressManager.show();
            
            const container = document.querySelector('.progress-container');
            const bar = document.querySelector('.progress-bar');
            
            expect(container.style.display).toBe('block');
            expect(bar.style.width).toBe('0%');
        });
        
        test('updates progress bar', () => {
            ProgressManager.update(50);
            
            const bar = document.querySelector('.progress-bar');
            expect(bar.style.width).toBe('50%');
        });
        
        test('clamps progress values', () => {
            ProgressManager.update(-10);
            expect(document.querySelector('.progress-bar').style.width).toBe('0%');
            
            ProgressManager.update(150);
            expect(document.querySelector('.progress-bar').style.width).toBe('100%');
        });
        
        test('hides progress bar', () => {
            ProgressManager.hide();
            
            const container = document.querySelector('.progress-container');
            expect(container.style.display).toBe('none');
        });
    });
    
    describe('ResultsManager', () => {
        test('shows loading state', () => {
            ResultsManager.showLoading();
            
            const spinner = document.querySelector('.loading-spinner');
            const results = document.querySelector('.results');
            
            expect(spinner.style.display).toBe('block');
            expect(results.style.display).toBe('none');
        });
        
        test('hides loading state', () => {
            ResultsManager.hideLoading();
            
            const spinner = document.querySelector('.loading-spinner');
            expect(spinner.style.display).toBe('none');
        });
        
        test('shows results with animation', () => {
            ResultsManager.showResults();
            
            const results = document.querySelector('.results');
            expect(results.style.display).toBe('block');
            expect(results.classList.contains('fade-in')).toBe(true);
        });
        
        test('updates metric value', () => {
            ResultsManager.updateMetric('charCount', '42');
            
            const value = document.querySelector('#charCount .metric-value');
            expect(value.textContent).toBe('42');
            expect(value.classList.contains('highlight')).toBe(true);
        });
    });
    
    describe('ErrorManager', () => {
        test('shows error message', () => {
            ErrorManager.showError('Test error');
            
            const errorElement = document.querySelector('.error-message');
            expect(errorElement.textContent).toBe('Test error');
            expect(errorElement.classList.contains('show')).toBe(true);
            expect(errorElement.getAttribute('role')).toBe('alert');
        });
        
        test('hides error message', () => {
            ErrorManager.hideError();
            
            const errorElement = document.querySelector('.error-message');
            expect(errorElement.classList.contains('show')).toBe(false);
            expect(errorElement.getAttribute('role')).toBeNull();
        });
    });
    
    describe('InputManager', () => {
        test('updates character count', () => {
            InputManager.updateCharCount('Hello', 100);
            
            const countElement = document.querySelector('.char-count');
            expect(countElement.textContent).toBe('5/100');
            expect(countElement.classList.contains('warning')).toBe(false);
        });
        
        test('shows warning for long text', () => {
            InputManager.updateCharCount('a'.repeat(91), 100);
            
            const countElement = document.querySelector('.char-count');
            expect(countElement.classList.contains('warning')).toBe(true);
        });
        
        test('updates analyze button state', () => {
            InputManager.setAnalyzeButtonState(false);
            
            const button = document.querySelector('#analyzeBtn');
            expect(button.disabled).toBe(true);
            expect(button.getAttribute('aria-disabled')).toBe('true');
            
            InputManager.setAnalyzeButtonState(true);
            expect(button.disabled).toBe(false);
            expect(button.getAttribute('aria-disabled')).toBe('false');
        });
    });
}); 