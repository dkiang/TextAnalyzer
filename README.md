# Text Analyzer

A modern, accessible, and feature-rich text analysis tool built with vanilla JavaScript. This application provides comprehensive text analysis capabilities including readability metrics, sentiment analysis, and word frequency analysis.

## Features

- **Basic Text Metrics**
  - Character count (with and without spaces)
  - Word count
  - Sentence count
  - Paragraph count
  - Average word length

- **Readability Analysis**
  - Flesch Reading Ease score
  - Flesch-Kincaid Grade Level
  - Coleman-Liau Index
  - Grade level interpretation
  - Readability interpretation

- **Sentiment Analysis**
  - Positive/negative word detection
  - Sentiment score
  - Sentiment classification (positive/negative/neutral)

- **Word Frequency Analysis**
  - Top 10 most frequent words
  - Word count visualization
  - Minimum word length filtering

- **User Interface**
  - Modern, responsive design
  - Dark/Light theme support
  - System theme integration
  - Progress bar for analysis
  - Animated results display
  - Keyboard shortcuts
  - Mobile-friendly layout

- **Accessibility**
  - ARIA labels and roles
  - Keyboard navigation
  - High contrast color schemes
  - Screen reader support
  - Focus management
  - Reduced motion support

- **Error Handling**
  - Input validation
  - Text sanitization
  - Safety checks
  - Error messages
  - Graceful error recovery

## Project Structure

```
text-analyzer/
├── src/
│   ├── js/
│   │   ├── app.js                 # Main application module
│   │   ├── utils/
│   │   │   ├── textAnalysis.js    # Text analysis utilities
│   │   │   ├── textValidation.js  # Input validation utilities
│   │   │   ├── uiState.js         # UI state management
│   │   │   └── __tests__/         # Unit tests
│   │   └── __tests__/             # Application tests
│   ├── css/
│   │   └── styles.css            # Application styles
│   └── index.html                # Main HTML file
├── package.json                  # Project configuration
└── README.md                    # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/text-analyzer.git
   cd text-analyzer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Usage

1. Enter or paste text into the input area
2. Click "Analyze Text" or press Ctrl+Enter
3. View the analysis results in the metrics sections
4. Use the theme toggle to switch between light and dark modes
5. Use the clear button or Ctrl+Shift+C to reset

### Keyboard Shortcuts

- `Ctrl+Enter`: Analyze text
- `Ctrl+Shift+C`: Clear input
- `Ctrl+Shift+T`: Toggle theme

## Development

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

## Testing

The project uses Jest for testing. Tests are organized by module and cover:

- Text analysis utilities
- Input validation
- UI state management
- Main application functionality

Run tests with:

```bash
npm test
```

For test coverage:

```bash
npm run test:coverage
```

## Accessibility

The application follows WCAG 2.1 guidelines and includes:

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Color contrast compliance
- Screen reader support
- Reduced motion support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Flesch Reading Ease](https://en.wikipedia.org/wiki/Flesch%E2%80%93Kincaid_readability_tests)
- [Coleman-Liau Index](https://en.wikipedia.org/wiki/Coleman%E2%80%93Liau_index)
- [WCAG 2.1 Guidelines](https://www.w3.org/TR/WCAG21/) 