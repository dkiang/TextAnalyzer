/**
 * UI state management utilities
 * @module utils/uiState
 */

/**
 * Theme management
 */
export const ThemeManager = {
    STORAGE_KEY: 'text-analyzer-theme',
    
    /**
     * Initialize theme based on user preference or system setting
     */
    initialize() {
        const savedTheme = localStorage.getItem(this.STORAGE_KEY);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.setTheme(theme);
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            if (!localStorage.getItem(this.STORAGE_KEY)) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    },
    
    /**
     * Set the current theme
     * @param {string} theme - 'light' or 'dark'
     */
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.STORAGE_KEY, theme);
    },
    
    /**
     * Toggle between light and dark themes
     * @returns {string} The new theme
     */
    toggle() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        return newTheme;
    }
};

/**
 * Progress bar management
 */
export const ProgressManager = {
    /**
     * Show and initialize progress bar
     */
    show() {
        const container = document.querySelector('.progress-container');
        const bar = document.querySelector('.progress-bar');
        if (container && bar) {
            container.style.display = 'block';
            bar.style.width = '0%';
        }
    },
    
    /**
     * Update progress bar
     * @param {number} percent - Progress percentage (0-100)
     */
    update(percent) {
        const bar = document.querySelector('.progress-bar');
        if (bar) {
            bar.style.width = `${Math.min(100, Math.max(0, percent))}%`;
        }
    },
    
    /**
     * Hide progress bar
     */
    hide() {
        const container = document.querySelector('.progress-container');
        if (container) {
            container.style.display = 'none';
        }
    }
};

/**
 * Results display management
 */
export const ResultsManager = {
    /**
     * Show loading state
     */
    showLoading() {
        const spinner = document.querySelector('.loading-spinner');
        const results = document.querySelector('.results');
        if (spinner && results) {
            spinner.style.display = 'block';
            results.style.display = 'none';
        }
    },
    
    /**
     * Hide loading state
     */
    hideLoading() {
        const spinner = document.querySelector('.loading-spinner');
        if (spinner) {
            spinner.style.display = 'none';
        }
    },
    
    /**
     * Show results with animation
     */
    showResults() {
        const results = document.querySelector('.results');
        if (results) {
            results.style.display = 'block';
            results.classList.add('fade-in');
            
            // Animate metrics sequentially
            const metrics = results.querySelectorAll('.metric');
            metrics.forEach((metric, index) => {
                setTimeout(() => {
                    metric.classList.add('slide-in');
                }, index * 100);
            });
        }
    },
    
    /**
     * Hide results with animation
     * @returns {Promise} Resolves when animation is complete
     */
    hideResults() {
        return new Promise(resolve => {
            const results = document.querySelector('.results');
            if (results) {
                results.classList.add('fade-out');
                results.addEventListener('animationend', () => {
                    results.style.display = 'none';
                    results.classList.remove('fade-out');
                    resolve();
                }, { once: true });
            } else {
                resolve();
            }
        });
    },
    
    /**
     * Update a specific metric value
     * @param {string} metricId - The ID of the metric element
     * @param {string|number} value - The new value
     */
    updateMetric(metricId, value) {
        const element = document.querySelector(`#${metricId} .metric-value`);
        if (element) {
            element.textContent = value;
            element.classList.add('highlight');
            setTimeout(() => {
                element.classList.remove('highlight');
            }, 1000);
        }
    }
};

/**
 * Error handling management
 */
export const ErrorManager = {
    /**
     * Show error message
     * @param {string} message - Error message to display
     */
    showError(message) {
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            errorElement.setAttribute('role', 'alert');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    },
    
    /**
     * Hide error message
     */
    hideError() {
        const errorElement = document.querySelector('.error-message');
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.removeAttribute('role');
        }
    }
};

/**
 * Input validation management
 */
export const InputManager = {
    /**
     * Update character count display
     * @param {string} text - Current input text
     * @param {number} maxLength - Maximum allowed length
     */
    updateCharCount(text, maxLength) {
        const countElement = document.querySelector('.char-count');
        if (countElement) {
            const currentLength = text.length;
            countElement.textContent = `${currentLength}/${maxLength}`;
            
            // Update color based on length
            if (currentLength > maxLength * 0.9) {
                countElement.classList.add('warning');
            } else {
                countElement.classList.remove('warning');
            }
        }
    },
    
    /**
     * Enable/disable analyze button
     * @param {boolean} enabled - Whether the button should be enabled
     */
    setAnalyzeButtonState(enabled) {
        const button = document.querySelector('#analyzeBtn');
        if (button) {
            button.disabled = !enabled;
            button.setAttribute('aria-disabled', !enabled);
        }
    }
}; 