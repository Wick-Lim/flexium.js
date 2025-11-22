# Quick Start for Contributors

Get up and running with Flexium development in 5 minutes.

## Prerequisites

- Node.js 18+ and npm
- Git
- VSCode (recommended) or WebStorm

## Setup (5 minutes)

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/flexium.js.git
cd flexium.js

# 2. Install dependencies
npm install

# 3. Build the library
npm run build

# 4. Run tests to verify
npm test

# 5. Open in VSCode
code .
```

## Install VSCode Extensions

When you open the project, VSCode will prompt you to install recommended extensions. Click "Install All".

Or install manually:
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension usernamehw.errorlens
```

## Make Your First Change

### 1. Create a Branch

```bash
git checkout -b feature/my-awesome-feature
```

### 2. Make Changes

Edit files in `src/` directory. The project structure:

```
src/
├── core/          # Signal system (signal, computed, effect)
├── renderers/     # DOM, Canvas, React Native renderers
└── primitives/    # UI components (Row, Column, Motion, Form)
```

### 3. Write Tests

Add tests in the same directory as your changes:

```typescript
// src/core/__tests__/my-feature.test.ts
import { describe, it, expect } from 'vitest'
import { signal } from '../signal'

describe('My Feature', () => {
  it('should work correctly', () => {
    const count = signal(0)
    count.value = 5
    expect(count.value).toBe(5)
  })
})
```

### 4. Run Tests

```bash
# Watch mode (recommended during development)
npm run test:vitest

# Or run once
npm test
```

### 5. Build and Verify

```bash
# Build
npm run build

# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

### 6. Commit Your Changes

```bash
git add .
git commit -m "feat: add my awesome feature"
```

Use conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring

### 7. Push and Create PR

```bash
git push origin feature/my-awesome-feature
```

Then go to GitHub and create a Pull Request. Fill out the PR template.

## Code Style

Flexium uses:
- **TypeScript** - Strict mode enabled
- **ESLint** - For code quality
- **Prettier** - For formatting (auto-formats on save)

The code will automatically format when you save if you have the recommended extensions.

## Project Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Watch mode - rebuilds on changes |
| `npm run build` | Production build |
| `npm test` | Run all tests |
| `npm run test:vitest` | Tests in watch mode |
| `npm run test:ui` | Tests with UI |
| `npm run lint` | Check for linting errors |
| `npm run format` | Format all files |
| `npm run typecheck` | TypeScript type checking |

## VSCode Tips

**Code Snippets** - Type and press Tab:
- `fsig` - Create a signal
- `fcomp` - Create a computed signal
- `feff` - Create an effect
- `fcomponent` - Component boilerplate

**Keyboard Shortcuts:**
- `F12` - Go to definition
- `Shift+F12` - Find all references
- `F2` - Rename symbol
- `Cmd/Ctrl+P` - Quick open file
- `Cmd/Ctrl+Shift+P` - Command palette

## Example Contribution

Here's a complete example of adding a new utility function:

```typescript
// 1. Create src/core/utils.ts
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// 2. Export from src/core/index.ts
export { debounce } from './utils'

// 3. Add test src/core/__tests__/utils.test.ts
import { describe, it, expect, vi } from 'vitest'
import { debounce } from '../utils'

describe('debounce', () => {
  it('should debounce function calls', async () => {
    const fn = vi.fn()
    const debounced = debounce(fn, 100)

    debounced()
    debounced()
    debounced()

    expect(fn).not.toHaveBeenCalled()

    await new Promise(resolve => setTimeout(resolve, 150))
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

// 4. Update docs/API.md
// Add documentation for the new function

// 5. Create example
// Add to examples/ or docs/RECIPES.md

// 6. Commit and push
// git add .
// git commit -m "feat: add debounce utility function"
// git push
```

## Getting Help

- **Documentation:** Check [docs/](../docs/) folder
- **Examples:** See [examples/](../examples/) folder
- **Issues:** Search [GitHub Issues](https://github.com/yourusername/flexium.js/issues)
- **Discussions:** Ask in [GitHub Discussions](https://github.com/yourusername/flexium.js/discussions)

## What to Work On

1. **Good First Issues:** Look for issues labeled `good first issue`
2. **Documentation:** Improve or add examples
3. **Tests:** Increase test coverage
4. **Bug Fixes:** Fix reported bugs
5. **Features:** Implement planned features

See [CONTRIBUTING.md](../CONTRIBUTING.md) for full guidelines.

## Common Issues

**Build fails:**
```bash
rm -rf node_modules dist
npm install
npm run build
```

**Tests fail:**
```bash
npm run test -- --reporter=verbose
```

**TypeScript errors:**
```bash
# In VSCode: Cmd+Shift+P > "TypeScript: Restart TS Server"
npm run typecheck
```

## Next Steps

1. Read [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed guidelines
2. Check [BEST_PRACTICES.md](../docs/BEST_PRACTICES.md) for coding patterns
3. Browse [examples/](../examples/) to understand the codebase
4. Join discussions to introduce yourself

**Thank you for contributing to Flexium!**
