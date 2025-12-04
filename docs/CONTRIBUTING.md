# Contributing to Flexium

Thank you for your interest in contributing to Flexium! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Development Setup](#development-setup)
2. [Project Structure](#project-structure)
3. [Development Workflow](#development-workflow)
4. [Testing](#testing)
5. [Building](#building)
6. [AI Agent System](#ai-agent-system)
7. [Code Style](#code-style)
8. [Pull Request Process](#pull-request-process)
9. [Reporting Issues](#reporting-issues)

## Development Setup

### Prerequisites

- Node.js 18.0.0 or higher
- npm, yarn, or pnpm
- Git
- A code editor (VS Code recommended for TypeScript support)

### Initial Setup

1. **Fork and clone the repository**:
```bash
git clone https://github.com/Wick-Lim/flexium.js.git
cd flexium.js
```

2. **Install dependencies**:
```bash
npm install
```

3. **Build the library**:
```bash
npm run build
```

4. **Run tests** (optional):
```bash
npm test
```

5. **Start the playground** (optional):
```bash
cd playground
npm install
npm run dev
```

### Development Dependencies

The project uses:
- **TypeScript** - Type-safe development
- **tsup** - Fast bundler for ESM/CJS outputs
- **Vitest** - Fast unit testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Project Structure

```
flexium.js/
├── .claude/                    # AI agent configuration
│   ├── agents/                 # Specialized agent guidelines
│   └── commands/               # Development slash commands
├── src/                        # Source code
│   ├── core/                   # Core signal system & renderer interface
│   │   ├── signal.ts           # Signal implementation
│   │   ├── renderer.ts         # Platform-agnostic renderer interface
│   │   └── index.ts            # Core exports
│   ├── renderers/              # Renderer implementations
│   │   └── dom/                # DOM renderer
│   │       ├── index.ts        # DOM renderer implementation
│   │       ├── h.ts            # JSX factory function
│   │       ├── render.ts       # Render functions
│   │       └── reactive.ts     # Reactive mounting
│   ├── primitives/             # Layout & UX components
│   │   ├── layout/             # Row, Column, Stack, Grid, Spacer
│   │   ├── motion/             # Animation component
│   │   ├── form/               # Form & Input components
│   │   └── ui/                 # Button, Text components
│   ├── index.ts                # Main entry point
│   ├── dom.ts                  # DOM renderer entry point
│   ├── canvas.ts               # Canvas renderer (future)
│   └── primitives.ts           # Primitives entry point
├── dist/                       # Build output (generated)
├── docs/                       # Documentation
├── examples/                   # Example applications
├── playground/                 # Live development playground
├── package.json                # Package configuration
├── tsconfig.json               # TypeScript configuration
├── tsup.config.ts              # Build configuration
└── README.md                   # Main documentation
```

## Development Workflow

### Making Changes

1. **Create a feature branch**:
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** in the appropriate directory:
   - Core reactivity: `src/core/signal.ts`
   - Renderers: `src/renderers/`
   - Components: `src/primitives/`

3. **Build and test**:
```bash
npm run build
npm test
```

4. **Test in playground**:
```bash
cd playground
npm run dev
# Open http://localhost:3000
```

5. **Commit your changes**:
```bash
git add .
git commit -m "feat: add your feature description"
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add Canvas renderer implementation
fix: signal not updating when batch depth is > 1
docs: update API documentation for computed()
test: add integration tests for DOM renderer
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Tests use Vitest. Place test files next to the code they test:

```typescript
// src/core/__tests__/signal.test.ts
import { describe, it, expect } from 'vitest';
import { signal, computed, effect } from '../signal';

describe('signal', () => {
  it('should create a signal with initial value', () => {
    const count = signal(0);
    expect(count.value).toBe(0);
  });

  it('should update when value changes', () => {
    const count = signal(0);
    count.value = 5;
    expect(count.value).toBe(5);
  });
});
```

### Test Coverage Goals

- Core signal system: 100%
- Renderers: 90%+
- Components: 80%+

## Building

### Development Build

```bash
# Watch mode - rebuilds on changes
npm run dev
```

### Production Build

```bash
# Full build with all outputs
npm run build
```

This generates:
- `dist/index.mjs` - ESM core signals
- `dist/index.js` - CJS core signals
- `dist/dom.mjs` - ESM DOM renderer
- `dist/dom.js` - CJS DOM renderer
- `dist/primitives.mjs` - ESM primitives
- `dist/primitives.js` - CJS primitives
- `dist/*.d.ts` - TypeScript declarations
- `dist/*.map` - Source maps

### Type Checking

```bash
# Check types without emitting files
npm run typecheck
```

### Linting and Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## AI Agent System

Flexium is developed using a specialized AI agent system. Each agent focuses on a specific domain:

### Available Agents

1. **Signal System Architect** (`/build-signal-system`)
   - Core reactivity (signal, computed, effect)
   - Performance optimization
   - Memory management

2. **Layout & Style System** (`/build-layout-system`)
   - Row, Column, Stack, Grid components
   - Responsive props
   - Flexbox primitives

3. **UX Components Specialist** (`/build-ux-components`)
   - Motion, Form, Gesture components
   - Animations and interactions
   - Accessibility

4. **Cross-Renderer Architect** (`/build-renderer`)
   - Platform-agnostic renderer interface
   - DOM, Canvas, React Native renderers
   - Reconciliation algorithms

5. **Build & Package Config** (`/setup-build`)
   - TypeScript configuration
   - Build system setup
   - npm package configuration

6. **Documentation & Examples** (`/create-examples`)
   - API documentation
   - Example applications
   - Developer guides

### Using Slash Commands

If you're using Claude Code CLI:

```bash
# Quick overview
/quick-start

# Setup build system
/setup-build

# Build specific components
/build-signal-system
/build-layout-system
/build-renderer
/build-ux-components

# Create examples
/create-examples
```

### Agent Guidelines

Each agent has specific guidelines in `.claude/agents/`. Read these before making changes in that domain.

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer `interface` over `type` for objects
- Use explicit return types for public APIs
- Avoid `any` - use `unknown` if needed

### Naming Conventions

- **Files**: kebab-case (`signal-system.ts`)
- **Functions**: camelCase (`createSignal()`)
- **Interfaces**: PascalCase (`SignalProps`)
- **Constants**: SCREAMING_SNAKE_CASE (`DEFAULT_TIMEOUT`)

### Code Organization

```typescript
// 1. Imports
import { signal } from '../core/signal';

// 2. Types/Interfaces
export interface ComponentProps {
  // ...
}

// 3. Constants
const DEFAULT_VALUE = 0;

// 4. Implementation
export function createComponent(props: ComponentProps) {
  // ...
}

// 5. Exports (if not inline)
export { createComponent };
```

### Comments

- Use JSDoc for public APIs
- Explain "why", not "what"
- Keep comments up-to-date with code changes

```typescript
/**
 * Creates a reactive signal with the given initial value
 *
 * @param initialValue - The initial value of the signal
 * @returns A signal object with value property and subscribe method
 *
 * @example
 * ```typescript
 * const count = signal(0);
 * count.value++; // Triggers updates
 * ```
 */
export function signal<T>(initialValue: T): Signal<T> {
  // Implementation...
}
```

## Pull Request Process

### Before Submitting

1. Ensure all tests pass: `npm test`
2. Build succeeds: `npm run build`
3. Code is formatted: `npm run format`
4. Types check: `npm run typecheck`
5. No lint errors: `npm run lint`

### Submitting a PR

1. **Push your branch**:
```bash
git push origin feature/your-feature-name
```

2. **Create Pull Request** on GitHub with:
   - Clear title following commit convention
   - Description of changes
   - Related issue number (if applicable)
   - Screenshots/GIFs for UI changes
   - Breaking changes clearly marked

3. **PR Template**:
```markdown
## Description
[Describe what this PR does]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] Added new tests for changes
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Build succeeds
- [ ] All tests pass
```

### Review Process

1. Maintainers will review your PR
2. Address feedback and push updates
3. Once approved, PR will be merged
4. Your contribution will be in the next release!

## Reporting Issues

### Bug Reports

Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Code snippet demonstrating the issue
- Environment (OS, Node version, browser)
- Stack trace if available

### Feature Requests

Include:
- Clear description of the feature
- Use case and motivation
- Example API (if applicable)
- Alternatives considered

### Questions

For questions:
- Check existing documentation first
- Search existing issues
- Ask in GitHub Discussions
- Be specific about what you're trying to do

## Development Tips

### Quick Start Checklist

```bash
# 1. Clone and install
git clone https://github.com/Wick-Lim/flexium.js.git
cd flexium.js
npm install

# 2. Build
npm run build

# 3. Test
npm test

# 4. Try playground
cd playground
npm install
npm run dev
```

### Common Issues

**Build fails**:
- Check Node version (must be 18+)
- Clear `node_modules` and `dist`, reinstall
- Run `npm run typecheck` for type errors

**Tests fail**:
- Run `npm run build` first
- Check if changes broke existing functionality
- Run specific test: `npm test src/core/__tests__/signal.test.ts`

**Playground doesn't load changes**:
- Rebuild library: `npm run build` from root
- Restart dev server in playground
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

### Performance Considerations

- Signal updates should be < 0.1ms
- Bundle size should stay < 30KB total
- Use `batch()` for multiple updates
- Avoid unnecessary computed recalculations
- Profile with DevTools before optimizing

## Getting Help

- Read the [documentation](/docs)
- Check [existing issues](https://github.com/Wick-Lim/flexium.js/issues)
- Ask in [GitHub Discussions](https://github.com/Wick-Lim/flexium.js/discussions)
- Review [example code](/examples)

## License

By contributing to Flexium, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Flexium! Your efforts help make this library better for everyone.
