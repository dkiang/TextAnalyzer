/**
 * Text validation and sanitization utilities
 * @module utils/textValidation
 */

/**
 * Maximum allowed text length
 * @constant {number}
 */
export const MAX_TEXT_LENGTH = 100000;

/**
 * Minimum text length for meaningful analysis
 * @constant {number}
 */
export const MIN_TEXT_LENGTH = 10;

/**
 * Regular expression for detecting URLs
 * @constant {RegExp}
 */
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

/**
 * Regular expression for detecting HTML tags
 * @constant {RegExp}
 */
const HTML_TAG_REGEX = /<[^>]*>/g;

/**
 * Regular expression for detecting special characters
 * @constant {RegExp}
 */
const SPECIAL_CHARS_REGEX = /[^\w\s.,!?-]/g;

/**
 * Validates text input
 * @param {string} text - The text to validate
 * @returns {Object} Validation result with status and message
 */
export function validateText(text) {
    if (!text) {
        return {
            isValid: false,
            message: 'Please enter some text to analyze.'
        };
    }

    if (text.length < MIN_TEXT_LENGTH) {
        return {
            isValid: false,
            message: `Text is too short. Minimum length is ${MIN_TEXT_LENGTH} characters.`
        };
    }

    if (text.length > MAX_TEXT_LENGTH) {
        return {
            isValid: false,
            message: `Text is too long. Maximum length is ${MAX_TEXT_LENGTH} characters.`
        };
    }

    return {
        isValid: true,
        message: ''
    };
}

/**
 * Sanitizes text input
 * @param {string} text - The text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
    if (!text) return '';

    return text
        .replace(HTML_TAG_REGEX, '') // Remove HTML tags
        .replace(URL_REGEX, '') // Remove URLs
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
}

/**
 * Checks if text contains potentially harmful content
 * @param {string} text - The text to check
 * @returns {Object} Result with status and message
 */
export function checkTextSafety(text) {
    const containsUrls = URL_REGEX.test(text);
    const containsHtml = HTML_TAG_REGEX.test(text);
    const containsSpecialChars = SPECIAL_CHARS_REGEX.test(text);

    if (containsUrls || containsHtml) {
        return {
            isSafe: false,
            message: 'Text contains potentially unsafe content (URLs or HTML tags).'
        };
    }

    if (containsSpecialChars) {
        return {
            isSafe: true,
            message: 'Text contains special characters that may affect analysis accuracy.'
        };
    }

    return {
        isSafe: true,
        message: ''
    };
}

/**
 * Normalizes text for analysis
 * @param {string} text - The text to normalize
 * @returns {string} Normalized text
 */
export function normalizeText(text) {
    return text
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/[.,!?]+/g, '.')
        .trim();
}

/**
 * Truncates text to a maximum length
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = MAX_TEXT_LENGTH) {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
} 