# Contributing to Flexium

## Before You Start

Read these documents first:
1. [PHILOSOPHY.md](./PHILOSOPHY.md) - Why Flexium exists
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - How Flexium works

## Development Setup

```bash
# Clone
git clone https://github.com/your-username/flexium.js.git
cd flexium.js

# Install
npm install

# Build
npm run build

# Test
npm test

# Dev mode (watch)
npm run dev
```

## Project Structure

```
flexium.js/
├── packages/flexium/     # Main library
│   ├── src/
│   │   ├── core/         # Signals, state, effects
│   │   ├── dom/          # DOM renderer
│   │   └── primitives/   # UI components
│   └── __tests__/
├── apps/docs/            # VitePress documentation site
└── meta/                 # Internal docs (you're here)
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature
# or
git checkout -b fix/issue-description
```

### 2. Write Code

Follow existing patterns. Keep it simple.

### 3. Write Tests

Every feature needs tests. Location: `__tests__/` directory next to source.

```typescript
import { describe, it, expect } from 'vitest'
import { state } from '../state'

describe('state', () => {
  it('should hold a value', () => {
    const [count] = state(42)
    expect(+count).toBe(42)
  })
})
```

### 4. Test Your Changes

```bash
npm test
```

### 5. Commit

```bash
git commit -m "feat: add X feature"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring
- `chore:` - Maintenance

### 6. Push & PR

```bash
git push origin feature/your-feature
```

Open a Pull Request on GitHub.

## Code Standards

### TypeScript

- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for public APIs

### Style

- 2 spaces indentation
- Single quotes
- No semicolons
- Prettier handles formatting

### Naming

- `camelCase` for variables and functions
- `PascalCase` for types and components
- `SCREAMING_CASE` for constants

### Comments

- Comment "why", not "what"
- No commented-out code
- JSDoc for public APIs only

## What We Accept

### Yes

- Bug fixes with tests
- Performance improvements with benchmarks
- Documentation improvements
- New primitives that follow existing patterns

### Maybe

- New features (discuss first in an issue)
- API changes (need strong justification)

### No

- Breaking changes without discussion
- Features that violate our philosophy
- Code without tests
- Overly complex solutions

## Pull Request Guidelines

### Title

Clear and descriptive:
- `feat: add Form primitive`
- `fix: resolve memory leak in effect cleanup`
- `docs: clarify state() usage`

### Description

- What does this PR do?
- Why is this change needed?
- How to test?

### Checklist

Before submitting:
- [ ] Tests pass (`npm test`)
- [ ] Code is formatted (`npm run format`)
- [ ] Types check (`npm run typecheck`)
- [ ] Documentation updated if needed

## Getting Help

- **Bug?** Open an issue
- **Feature idea?** Open a discussion
- **Question?** Check existing issues/discussions first

## Code of Conduct

Be respectful. Be constructive. Focus on the code, not the person.

## License

By contributing, you agree that your contributions will be licensed under MIT.
