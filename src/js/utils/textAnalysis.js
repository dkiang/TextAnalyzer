/**
 * Text analysis utilities
 * @module utils/textAnalysis
 */

import { normalizeText } from './textValidation.js';

/**
 * Word lists for sentiment analysis
 * @constant {Object}
 */
const SENTIMENT_WORDS = {
    positive: [
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'terrific',
        'outstanding', 'superb', 'brilliant', 'awesome', 'fabulous', 'spectacular',
        'perfect', 'delightful', 'pleasant', 'happy', 'joyful', 'love', 'like', 'beautiful',
        'best', 'better', 'impressive', 'positive', 'recommended', 'worth', 'helpful',
        'success', 'successful', 'succeed', 'pleased', 'enjoy', 'enjoyed', 'glad', 'thrilled'
    ],
    negative: [
        'bad', 'terrible', 'awful', 'horrible', 'poor', 'disappointing', 'disappointed',
        'worst', 'waste', 'useless', 'difficult', 'hard', 'ugly', 'boring', 'annoying',
        'hate', 'dislike', 'negative', 'problem', 'issue', 'fail', 'failed', 'failure',
        'wrong', 'error', 'mistake', 'concern', 'worried', 'worry', 'sad', 'unhappy',
        'unfortunate', 'trouble', 'unreliable', 'frustrating', 'frustration', 'frustrate'
    ]
};

/**
 * Calculates basic text metrics
 * @param {string} text - The text to analyze
 * @returns {Object} Basic metrics
 */
export function calculateBasicMetrics(text) {
    const normalizedText = normalizeText(text);
    const words = normalizedText.match(/\b\w+\b/g) || [];
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

/**
 * Counts syllables in a word
 * @param {string} word - The word to count syllables for
 * @returns {number} Number of syllables
 */
function countSyllablesInWord(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    
    const syllables = word.match(/[aeiouy]{1,2}/g);
    return syllables ? syllables.length : 1;
}

/**
 * Counts total syllables in text
 * @param {string} text - The text to count syllables for
 * @returns {number} Total number of syllables
 */
export function countSyllables(text) {
    const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
    return words.reduce((count, word) => count + countSyllablesInWord(word), 0);
}

/**
 * Calculates Flesch Reading Ease score
 * @param {number} wordCount - Number of words
 * @param {number} sentenceCount - Number of sentences
 * @param {number} syllableCount - Number of syllables
 * @returns {number} Flesch Reading Ease score
 */
export function calculateFleschReadingEase(wordCount, sentenceCount, syllableCount) {
    if (wordCount === 0 || sentenceCount === 0) return 0;
    return 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (syllableCount / wordCount);
}

/**
 * Calculates Flesch-Kincaid Grade Level
 * @param {number} wordCount - Number of words
 * @param {number} sentenceCount - Number of sentences
 * @param {number} syllableCount - Number of syllables
 * @returns {number} Flesch-Kincaid Grade Level
 */
export function calculateFleschKincaidGrade(wordCount, sentenceCount, syllableCount) {
    if (wordCount === 0 || sentenceCount === 0) return 0;
    return 0.39 * (wordCount / sentenceCount) + 11.8 * (syllableCount / wordCount) - 15.59;
}

/**
 * Calculates Coleman-Liau Index
 * @param {number} charCount - Number of characters
 * @param {number} wordCount - Number of words
 * @param {number} sentenceCount - Number of sentences
 * @returns {number} Coleman-Liau Index
 */
export function calculateColemanLiauIndex(charCount, wordCount, sentenceCount) {
    if (wordCount === 0 || sentenceCount === 0) return 0;
    const L = (charCount / wordCount) * 100;
    const S = (sentenceCount / wordCount) * 100;
    return 0.0588 * L - 0.296 * S - 15.8;
}

/**
 * Determines grade level based on readability scores
 * @param {number} fleschKincaidGrade - Flesch-Kincaid Grade Level
 * @param {number} colemanLiauIndex - Coleman-Liau Index
 * @returns {string} Grade level description
 */
export function determineGradeLevel(fleschKincaidGrade, colemanLiauIndex) {
    const averageGrade = (fleschKincaidGrade + colemanLiauIndex) / 2;
    const roundedGrade = Math.round(averageGrade);
    
    if (roundedGrade <= 0) return 'Kindergarten';
    if (roundedGrade >= 13) return 'College level';
    return roundedGrade + getOrdinalSuffix(roundedGrade) + ' grade';
}

/**
 * Gets ordinal suffix for a number
 * @param {number} num - The number
 * @returns {string} Ordinal suffix
 */
function getOrdinalSuffix(num) {
    const j = num % 10;
    const k = num % 100;
    
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
}

/**
 * Gets readability interpretation
 * @param {number} score - Flesch Reading Ease score
 * @returns {string} Interpretation
 */
export function getReadabilityInterpretation(score) {
    if (score >= 90) return 'Very easy to read. Easily understood by an average 11-year-old student.';
    if (score >= 80) return 'Easy to read. Conversational English for consumers.';
    if (score >= 70) return 'Fairly easy to read.';
    if (score >= 60) return 'Plain English. Easily understood by 13- to 15-year-old students.';
    if (score >= 50) return 'Fairly difficult to read.';
    if (score >= 30) return 'Difficult to read. Best understood by college graduates.';
    return 'Very difficult to read. Best understood by university graduates.';
}

/**
 * Analyzes sentiment of text
 * @param {string} text - The text to analyze
 * @returns {Object} Sentiment analysis results
 */
export function analyzeSentiment(text) {
    const wordList = normalizeText(text).match(/\b\w+\b/g) || [];
    let positiveCount = 0;
    let negativeCount = 0;
    
    for (const word of wordList) {
        if (SENTIMENT_WORDS.positive.includes(word)) positiveCount++;
        if (SENTIMENT_WORDS.negative.includes(word)) negativeCount++;
    }
    
    const sentiment = positiveCount > negativeCount ? 'positive' :
                     negativeCount > positiveCount ? 'negative' : 'neutral';
    
    return {
        sentiment,
        positiveCount,
        negativeCount,
        score: positiveCount - negativeCount
    };
}

/**
 * Analyzes word frequency in text
 * @param {string} text - The text to analyze
 * @param {number} [minLength=2] - Minimum word length to consider
 * @param {number} [maxWords=10] - Maximum number of words to return
 * @returns {Array} Array of [word, count] pairs
 */
export function analyzeWordFrequency(text, minLength = 2, maxWords = 10) {
    const words = normalizeText(text).match(/\b\w+\b/g) || [];
    const wordFreq = {};
    
    words.forEach(word => {
        if (word.length > minLength) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });
    
    return Object.entries(wordFreq)
        .sort(([,a], [,b]) => b - a)
        .slice(0, maxWords);
} 