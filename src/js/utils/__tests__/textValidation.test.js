/**
 * Unit tests for text validation utilities
 * @module utils/textValidation.test
 */

import {
    validateText,
    sanitizeText,
    checkTextSafety,
    normalizeText,
    truncateText
} from '../textValidation.js';

describe('Text Validation Utilities', () => {
    describe('validateText', () => {
        test('validates text within length limits', () => {
            const text = 'This is a valid text.';
            const result = validateText(text);
            
            expect(result.isValid).toBe(true);
            expect(result.message).toBe('');
        });
        
        test('rejects text that is too short', () => {
            const text = 'Too short';
            const result = validateText(text);
            
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('too short');
        });
        
        test('rejects text that is too long', () => {
            const text = 'a'.repeat(100001);
            const result = validateText(text);
            
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('too long');
        });
        
        test('handles empty text', () => {
            const result = validateText('');
            
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('too short');
        });
    });
    
    describe('sanitizeText', () => {
        test('removes HTML tags', () => {
            const text = '<p>Hello <b>world</b>!</p>';
            const result = sanitizeText(text);
            
            expect(result).toBe('Hello world!');
        });
        
        test('removes URLs', () => {
            const text = 'Visit https://example.com for more info';
            const result = sanitizeText(text);
            
            expect(result).not.toContain('https://example.com');
        });
        
        test('normalizes whitespace', () => {
            const text = '  Multiple    spaces   and\n\nlines  ';
            const result = sanitizeText(text);
            
            expect(result).toBe('Multiple spaces and lines');
        });
        
        test('handles empty text', () => {
            const result = sanitizeText('');
            expect(result).toBe('');
        });
        
        test('preserves legitimate punctuation', () => {
            const text = 'Hello, world! How are you?';
            const result = sanitizeText(text);
            
            expect(result).toBe('Hello, world! How are you?');
        });
    });
    
    describe('checkTextSafety', () => {
        test('approves safe text', () => {
            const text = 'This is a safe and appropriate text.';
            const result = checkTextSafety(text);
            
            expect(result.isSafe).toBe(true);
            expect(result.message).toBe('');
        });
        
        test('detects potentially harmful content', () => {
            const text = 'This text contains <script>alert("xss")</script>';
            const result = checkTextSafety(text);
            
            expect(result.isSafe).toBe(false);
            expect(result.message).toContain('potentially harmful');
        });
        
        test('handles empty text', () => {
            const result = checkTextSafety('');
            
            expect(result.isSafe).toBe(true);
            expect(result.message).toBe('');
        });
        
        test('detects suspicious patterns', () => {
            const text = 'javascript:alert("xss")';
            const result = checkTextSafety(text);
            
            expect(result.isSafe).toBe(false);
            expect(result.message).toContain('potentially harmful');
        });
    });
    
    describe('normalizeText', () => {
        test('converts text to lowercase', () => {
            const text = 'Hello WORLD!';
            const result = normalizeText(text);
            
            expect(result).toBe('hello world!');
        });
        
        test('trims whitespace', () => {
            const text = '  Hello world!  ';
            const result = normalizeText(text);
            
            expect(result).toBe('hello world!');
        });
        
        test('handles empty text', () => {
            const result = normalizeText('');
            expect(result).toBe('');
        });
        
        test('preserves punctuation', () => {
            const text = 'Hello, world! How are you?';
            const result = normalizeText(text);
            
            expect(result).toBe('hello, world! how are you?');
        });
    });
    
    describe('truncateText', () => {
        test('truncates text to specified length', () => {
            const text = 'This is a long text that needs to be truncated.';
            const result = truncateText(text, 20);
            
            expect(result.length).toBe(20);
            expect(result).toBe('This is a long te...');
        });
        
        test('handles text shorter than max length', () => {
            const text = 'Short text';
            const result = truncateText(text, 20);
            
            expect(result).toBe(text);
        });
        
        test('handles empty text', () => {
            const result = truncateText('', 20);
            expect(result).toBe('');
        });
        
        test('handles zero max length', () => {
            const text = 'Any text';
            const result = truncateText(text, 0);
            
            expect(result).toBe('...');
        });
        
        test('handles negative max length', () => {
            const text = 'Any text';
            const result = truncateText(text, -10);
            
            expect(result).toBe('...');
        });
    });
}); 