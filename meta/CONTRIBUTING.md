# Contributing to Flexium

## Before You Start

Read these documents first:
1. [PHILOSOPHY.md](./PHILOSOPHY.md) - Why Flexium exists
2. [ARCHITECTURE.md](./ARCHITECTURE.md) - How Flexium works

## Development Setup

```bash
# Clone
git clone https://github.com/Wick-Lim/flexium.js.git
cd flexium.js

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test

# Development mode (watch)
npm run dev
```

## Project Structure

```
flexium.js/
├── packages/
│   └── flexium/              # Main library
│       ├── src/
│       │   ├── index.ts      # VERSION export
│       │   ├── jsx-runtime.ts
│       │   ├── jsx-dev-runtime.ts
│       │   │
│       │   ├── core/         # Reactive system
│       │   │   ├── reactive.ts   # Proxy reactivity
│       │   │   ├── state.ts      # state() API
│       │   │   ├── lifecycle.ts  # effect(), sync()
│       │   │   ├── hook.ts       # hook()
│       │   │   ├── context.ts    # Context API
│       │   │   └── devtools.ts   # DevTools integration
│       │   │
│       │   ├── ref/          # Ref system
│       │   │   ├── ref.ts        # ref()
│       │   │   └── forwardRef.ts # forwardRef()
│       │   │
│       │   ├── dom/          # DOM renderer
│       │   │   ├── render.ts     # render(), reconcile()
│       │   │   ├── hydrate.ts    # hydrate()
│       │   │   ├── f.ts          # f() factory
│       │   │   └── components/   # Portal, Suspense, ErrorBoundary, lazy
│       │   │
│       │   ├── router/       # Client-side routing
│       │   │   ├── router.ts     # location(), router()
│       │   │   ├── utils.ts      # Route matching
│       │   │   └── dom/          # Routes, Route, Link, Outlet
│       │   │
│       │   ├── server/       # SSR
│       │   │   ├── renderToString.ts
│       │   │   ├── serverState.ts
│       │   │   └── escape.ts
│       │   │
│       │   ├── canvas/       # Canvas renderer
│       │   │   ├── Canvas.tsx
│       │   │   └── dom/          # DrawRect, DrawCircle, etc.
│       │   │
│       │   └── interactive/  # Game loop & input
│       │       ├── loop.ts
│       │       ├── keyboard.ts
│       │       └── mouse.ts
│       │
│       └── src/__tests__/    # Test files
│
├── meta/                     # Internal documentation (you are here)
│   ├── PHILOSOPHY.md
│   ├── ARCHITECTURE.md
│   └── CONTRIBUTING.md
│
└── package.json              # Monorepo root
```

## Making Changes

### 1. Create a Branch

```bash
git checkout -b feature/your-feature
# or
git checkout -b fix/issue-description
```

### 2. Write Code

Follow existing patterns. Key principles:

- **Keep it simple** - No over-engineering
- **One API** - Prefer extending `state()` over new APIs
- **No magic** - Explicit behavior, easy to trace
- **Performance** - Consider reactive tracking cost

### 3. Write Tests

Every feature needs tests. Tests are located in `src/__tests__/`.

```typescript
import { describe, it, expect } from 'vitest'
import { state } from '../core/state'

describe('state', () => {
  it('should hold a primitive value', () => {
    const [count, setCount] = state(0)
    expect(count).toBe(0)

    setCount(5)
    expect(count).toBe(5)
  })

  it('should support updater function', () => {
    const [count, setCount] = state(10)
    setCount(prev => prev + 1)
    expect(count).toBe(11)
  })
})
```

Test files by module:
- `core.test.ts` - Core reactive system
- `dom.test.ts` - DOM renderer
- `router.test.ts` - Router
- `server.test.ts` - SSR
- `integration.test.ts` - Cross-module tests

### 4. Run Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- core.test.ts

# Watch mode
npm run test:vitest

# With UI
npm run test:ui

# Coverage report
npm run test:coverage
```

### 5. Build and Type Check

```bash
# Build
npm run build

# Type check only
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

### 6. Commit

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

### 7. Push & PR

```bash
git push origin feature/your-feature
```

Open a Pull Request on GitHub.

## Code Standards

### TypeScript

- Strict mode enabled
- No `any` types (use `unknown` if needed)
- Explicit return types for public APIs
- Export types from `types.ts` files

### Style

- 2 spaces indentation
- Single quotes
- No semicolons (configured in Prettier)
- Prettier handles formatting

### Naming

| Type | Convention | Example |
|------|------------|---------|
| Variables/Functions | camelCase | `renderNode`, `activeEffect` |
| Types/Interfaces | PascalCase | `FNode`, `ComponentInstance` |
| Constants | SCREAMING_CASE | `REACTIVE_SIGNAL` |
| Private/Internal | `_` prefix or module-scoped | `_contextId` |

### File Organization

```typescript
// 1. Imports
import { something } from './other'

// 2. Types (if small, otherwise separate types.ts)
interface MyType { }

// 3. Constants
const SOME_CONSTANT = 'value'

// 4. Module-level state (if needed)
let moduleState = null

// 5. Internal/helper functions
function helperFunction() { }

// 6. Public API functions
export function publicFunction() { }
```

### Comments

- Comment "why", not "what"
- No commented-out code
- JSDoc for public APIs only

```typescript
// Good: explains why
// Use WeakMap to avoid memory leaks when targets are garbage collected
const targetMap = new WeakMap()

// Bad: explains what (obvious from code)
// Create a new WeakMap
const targetMap = new WeakMap()
```

## Module Guidelines

### Core (`core/`)

The most critical module. Changes here affect everything.

- `reactive.ts` - Keep Proxy handlers minimal
- `state.ts` - Maintain the three-pattern API (Signal/Resource/Computed)
- `lifecycle.ts` - Ensure cleanup is always called
- `hook.ts` - Never break hook order semantics

### DOM (`dom/`)

- `render.ts` - Reconciliation must be efficient
- Keep component instance tracking correct
- Test with complex nested structures

### Router (`router/`)

- Security first (validate paths)
- Keep route matching simple
- Support nested routes via `Outlet`

### Server (`server/`)

- Always escape HTML output
- Match client rendering output exactly (for hydration)
- Handle async components properly

### Canvas (`canvas/`)

- Keep draw queue simple
- Support reactive props (getter functions)
- Clear canvas before each render

### Interactive (`interactive/`)

- Fixed timestep for physics
- Variable timestep for rendering
- Clean up event listeners on dispose

## What We Accept

### Yes

- Bug fixes with tests
- Performance improvements with benchmarks
- Documentation improvements
- New Draw components for Canvas
- Router improvements (guards, transitions)

### Maybe (Discuss First)

- New APIs (we prefer extending `state()`)
- New renderers (Native, WebGL, etc.)
- Breaking changes

### No

- Features that violate our philosophy
- Code without tests
- Overly complex solutions
- External dependencies (keep bundle small)

## Pull Request Guidelines

### Title

Clear and descriptive:
- `feat: add beforeEnter guard to Router`
- `fix: resolve memory leak in effect cleanup`
- `docs: clarify state() resource pattern`

### Description

- What does this PR do?
- Why is this change needed?
- How to test?
- Any breaking changes?

### Checklist

Before submitting:
- [ ] Tests pass (`npm test`)
- [ ] Code is formatted (`npm run format`)
- [ ] Types check (`npm run typecheck`)
- [ ] No lint errors (`npm run lint`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow convention

## Testing Best Practices

### Unit Tests

Test individual functions in isolation:

```typescript
describe('reactive', () => {
  it('should track property access', () => {
    const obj = reactive({ count: 0 })
    let tracked = false

    // Set up effect that tracks
    unsafeEffect(() => {
      obj.count  // Access triggers tracking
      tracked = true
    })

    expect(tracked).toBe(true)
  })
})
```

### Integration Tests

Test modules working together:

```typescript
describe('state + render', () => {
  it('should update DOM when state changes', () => {
    const container = document.createElement('div')

    function App() {
      const [count, setCount] = state(0)
      return <div>{count}</div>
    }

    render(App, container)
    expect(container.textContent).toBe('0')

    // Trigger state change and verify DOM update
  })
})
```

### Use jsdom

Tests run in jsdom environment (configured in vitest):

```typescript
// DOM APIs available
document.createElement('div')
window.addEventListener('click', handler)
```

## Getting Help

- **Bug?** Open an issue with reproduction steps
- **Feature idea?** Open a discussion first
- **Question?** Check existing issues/discussions

## Code of Conduct

Be respectful. Be constructive. Focus on the code, not the person.

## License

By contributing, you agree that your contributions will be licensed under MIT.
