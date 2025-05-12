/**
 * Unit tests for text analysis utilities
 * @module utils/textAnalysis.test
 */

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
} from '../textAnalysis.js';

describe('Text Analysis Utilities', () => {
    describe('calculateBasicMetrics', () => {
        test('calculates correct metrics for simple text', () => {
            const text = 'Hello world. This is a test.';
            const metrics = calculateBasicMetrics(text);
            
            expect(metrics.charCount).toBe(25);
            expect(metrics.charNoSpacesCount).toBe(20);
            expect(metrics.wordCount).toBe(6);
            expect(metrics.sentenceCount).toBe(2);
            expect(metrics.paragraphCount).toBe(1);
            expect(metrics.avgWordLength).toBe('3.33');
        });
        
        test('handles empty text', () => {
            const metrics = calculateBasicMetrics('');
            
            expect(metrics.charCount).toBe(0);
            expect(metrics.charNoSpacesCount).toBe(0);
            expect(metrics.wordCount).toBe(0);
            expect(metrics.sentenceCount).toBe(0);
            expect(metrics.paragraphCount).toBe(0);
            expect(metrics.avgWordLength).toBe(0);
        });
        
        test('handles text with multiple paragraphs', () => {
            const text = 'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.';
            const metrics = calculateBasicMetrics(text);
            
            expect(metrics.paragraphCount).toBe(3);
        });
    });
    
    describe('countSyllables', () => {
        test('counts syllables correctly', () => {
            expect(countSyllables('hello')).toBe(2);
            expect(countSyllables('world')).toBe(1);
            expect(countSyllables('beautiful')).toBe(3);
            expect(countSyllables('extraordinary')).toBe(6);
        });
        
        test('handles empty text', () => {
            expect(countSyllables('')).toBe(0);
        });
        
        test('handles text with punctuation', () => {
            expect(countSyllables('hello, world!')).toBe(3);
        });
    });
    
    describe('calculateFleschReadingEase', () => {
        test('calculates score for simple text', () => {
            const score = calculateFleschReadingEase(10, 2, 15);
            expect(score).toBeGreaterThan(0);
        });
        
        test('returns 0 for empty text', () => {
            const score = calculateFleschReadingEase(0, 0, 0);
            expect(score).toBe(0);
        });
    });
    
    describe('calculateFleschKincaidGrade', () => {
        test('calculates grade level for simple text', () => {
            const grade = calculateFleschKincaidGrade(10, 2, 15);
            expect(grade).toBeGreaterThan(0);
        });
        
        test('returns 0 for empty text', () => {
            const grade = calculateFleschKincaidGrade(0, 0, 0);
            expect(grade).toBe(0);
        });
    });
    
    describe('calculateColemanLiauIndex', () => {
        test('calculates index for simple text', () => {
            const index = calculateColemanLiauIndex(100, 20, 5);
            expect(index).toBeGreaterThan(0);
        });
        
        test('returns 0 for empty text', () => {
            const index = calculateColemanLiauIndex(0, 0, 0);
            expect(index).toBe(0);
        });
    });
    
    describe('determineGradeLevel', () => {
        test('returns correct grade level', () => {
            expect(determineGradeLevel(1, 1)).toBe('1st grade');
            expect(determineGradeLevel(2, 2)).toBe('2nd grade');
            expect(determineGradeLevel(3, 3)).toBe('3rd grade');
            expect(determineGradeLevel(4, 4)).toBe('4th grade');
            expect(determineGradeLevel(0, 0)).toBe('Kindergarten');
            expect(determineGradeLevel(13, 13)).toBe('College level');
        });
    });
    
    describe('getReadabilityInterpretation', () => {
        test('returns correct interpretation for different scores', () => {
            expect(getReadabilityInterpretation(95)).toContain('Very easy to read');
            expect(getReadabilityInterpretation(85)).toContain('Easy to read');
            expect(getReadabilityInterpretation(75)).toContain('Fairly easy to read');
            expect(getReadabilityInterpretation(65)).toContain('Plain English');
            expect(getReadabilityInterpretation(55)).toContain('Fairly difficult to read');
            expect(getReadabilityInterpretation(35)).toContain('Difficult to read');
            expect(getReadabilityInterpretation(25)).toContain('Very difficult to read');
        });
    });
    
    describe('analyzeSentiment', () => {
        test('analyzes positive text correctly', () => {
            const result = analyzeSentiment('This is a great and wonderful product!');
            expect(result.sentiment).toBe('positive');
            expect(result.positiveCount).toBeGreaterThan(result.negativeCount);
        });
        
        test('analyzes negative text correctly', () => {
            const result = analyzeSentiment('This is a terrible and awful product!');
            expect(result.sentiment).toBe('negative');
            expect(result.negativeCount).toBeGreaterThan(result.positiveCount);
        });
        
        test('analyzes neutral text correctly', () => {
            const result = analyzeSentiment('This is a product.');
            expect(result.sentiment).toBe('neutral');
            expect(result.positiveCount).toBe(result.negativeCount);
        });
        
        test('handles empty text', () => {
            const result = analyzeSentiment('');
            expect(result.sentiment).toBe('neutral');
            expect(result.positiveCount).toBe(0);
            expect(result.negativeCount).toBe(0);
            expect(result.score).toBe(0);
        });
    });
    
    describe('analyzeWordFrequency', () => {
        test('analyzes word frequency correctly', () => {
            const text = 'the the the quick brown fox jumps over the lazy dog';
            const result = analyzeWordFrequency(text, 2, 5);
            
            expect(result).toHaveLength(5);
            expect(result[0][0]).toBe('the');
            expect(result[0][1]).toBe(5);
        });
        
        test('respects minimum word length', () => {
            const text = 'a an the quick brown fox';
            const result = analyzeWordFrequency(text, 3, 10);
            
            expect(result.every(([word]) => word.length > 2)).toBe(true);
        });
        
        test('respects maximum words limit', () => {
            const text = 'word1 word2 word3 word4 word5 word6';
            const result = analyzeWordFrequency(text, 2, 3);
            
            expect(result).toHaveLength(3);
        });
        
        test('handles empty text', () => {
            const result = analyzeWordFrequency('');
            expect(result).toHaveLength(0);
        });
    });
}); 