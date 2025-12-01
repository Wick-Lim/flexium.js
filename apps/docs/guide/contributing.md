---
title: Contributing - How to Contribute to Flexium
description: Learn how to contribute to Flexium. Guidelines for bug reports, feature requests, and pull requests.
head:
  - - meta
    - property: og:title
      content: Contributing to Flexium
  - - meta
    - property: og:description
      content: Help make Flexium better. Learn about our contribution guidelines, code standards, and development workflow.
---

# Contributing

Thank you for your interest in contributing to Flexium! This guide will help you get started.

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm 9.0 or higher
- Git

### Setting Up the Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:

```bash
git clone https://github.com/your-username/flexium.js.git
cd flexium.js
```

3. Install dependencies:

```bash
npm install
```

4. Build the packages:

```bash
npm run build
```

5. Run tests to make sure everything works:

```bash
npm test
```

## Development Workflow

### Running in Development Mode

```bash
npm run dev
```

This starts the development server with hot module replacement.

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run end-to-end tests
npm run test:e2e
```

### Building

```bash
npm run build
```

## Contribution Guidelines

### Reporting Bugs

When reporting bugs, please include:

1. A clear, descriptive title
2. Steps to reproduce the issue
3. Expected vs actual behavior
4. Your environment (OS, Node.js version, browser)
5. Any relevant code snippets or error messages

### Feature Requests

We welcome feature requests! Please:

1. Check if the feature has already been requested
2. Provide a clear use case
3. Explain why this feature would benefit others

### Pull Requests

1. Create a new branch from `main`:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following our code style
3. Add tests for new functionality
4. Ensure all tests pass
5. Commit with a descriptive message:

```bash
git commit -m "feat: add new feature description"
```

6. Push and create a pull request

### Commit Message Format

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Feel free to open an issue or reach out to the maintainers if you have any questions!
