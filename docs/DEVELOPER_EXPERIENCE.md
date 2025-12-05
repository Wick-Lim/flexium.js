# Developer Experience Guide

Welcome to Flexium! This guide will help you get the best possible development experience.

## Quick Start Checklist

- [ ] Install Node.js 18+ and npm
- [ ] Clone the repository
- [ ] Run `npm install`
- [ ] Install recommended VSCode extensions
- [ ] Configure your IDE (see [IDE_SETUP.md](./IDE_SETUP.md))
- [ ] Build the project: `npm run build`
- [ ] Run tests: `npm test`
- [ ] Start developing!

## Development Workflow

### 1. Initial Setup

```bash
# Clone repository
git clone https://github.com/Wick-Lim/flexium.js.git
cd flexium.js

# Install dependencies
npm install

# Build the library
npm run build

# Run tests to verify everything works
npm test
```

### 2. IDE Configuration

**Visual Studio Code (Recommended):**

1. Open the project in VSCode
2. Install recommended extensions when prompted
3. Extensions are configured in `.vscode/extensions.json`
4. Settings are pre-configured in `.vscode/settings.json`

**WebStorm/IntelliJ:**

See [IDE_SETUP.md](./IDE_SETUP.md#webstorm--intellij-idea) for setup instructions.

### 3. Development Commands

```bash
# Watch mode - rebuilds on file changes
npm run dev

# Build for production
npm run build

# Run all tests
npm test

# Run tests in watch mode
npm run test:vitest

# Run tests with UI
npm run test:ui

# Type checking
npm run typecheck

# Linting
npm run lint

# Format code
npm run format
```

### 4. File Structure

```
flexium.js/
├── .github/              # GitHub templates and workflows
│   ├── ISSUE_TEMPLATE.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── FUNDING.yml
├── .vscode/              # VSCode configuration
│   ├── settings.json     # Project settings
│   ├── extensions.json   # Recommended extensions
│   ├── launch.json       # Debug configurations
│   ├── tasks.json        # Build tasks
│   └── flexium.code-snippets  # Code snippets
├── docs/                 # Documentation
│   ├── IDE_SETUP.md      # IDE setup guide
│   ├── BEST_PRACTICES.md # Best practices
│   ├── FAQ.md            # FAQ
│   ├── RECIPES.md        # Common recipes
│   └── API.md            # API reference
├── src/                  # Source code
│   ├── core/             # Signal system
│   ├── renderers/        # DOM, Canvas, etc.
│   └── primitives/       # UI components
├── examples/             # Example applications
└── tests/                # Test files
```

## Code Quality Tools

### TypeScript

Flexium uses strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Tips:**
- Always define types for function parameters
- Use type inference where possible
- Avoid `any` type
- Use interfaces for object shapes

### ESLint

ESLint is configured to catch common issues:

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Prettier

Code is auto-formatted on save (if using VSCode with recommended settings):

```bash
# Manually format all files
npm run format
```

**Configuration:**
- Single quotes
- No semicolons
- 2 spaces indentation
- 80 character line length

## Testing

### Writing Tests

Flexium uses Vitest for testing:

```typescript
import { describe, it, expect } from 'vitest'
import { signal, computed, effect } from 'flexium/core'

describe('Signal System', () => {
  it('should create a signal', () => {
    const count = signal(0)
    expect(count.value).toBe(0)
  })

  it('should update signal value', () => {
    const count = signal(0)
    count.value = 5
    expect(count.value).toBe(5)
  })

  it('should trigger effects', () => {
    const count = signal(0)
    let effectRuns = 0

    effect(() => {
      count.value
      effectRuns++
    })

    expect(effectRuns).toBe(1)
    count.value = 1
    expect(effectRuns).toBe(2)
  })
})
```

### Running Tests

```bash
# Run all tests once
npm test

# Watch mode
npm run test:vitest

# With UI
npm run test:ui

# Coverage report
npm run test:coverage
```

## Debugging

### VSCode Debugging

**Browser Debugging:**
1. Start HTTP server: `python3 -m http.server 8000`
2. Press `F5` and select "Launch Chrome - Examples"
3. Set breakpoints in your code
4. Browser opens and stops at breakpoints

**Test Debugging:**
1. Set breakpoints in test files
2. Press `F5` and select "Debug Tests"
3. Debugger stops at breakpoints

### Console Debugging

Add `debugger;` statement to pause execution:

```typescript
const count = signal(0)

effect(() => {
  debugger; // Execution pauses here
  console.log('Count:', count.value)
})
```

## Code Snippets

Type these prefixes and press `Tab` in VSCode:

**Signals:**
- `fsig` - Create a signal
- `fcomp` - Create a computed signal
- `feff` - Create an effect
- `fbatch` - Batch updates

**Components:**
- `fcomponent` - Full component boilerplate
- `frow` - Row layout
- `fcol` - Column layout
- `fmotion` - Motion component
- `fform` - Form with validation

**Patterns:**
- `fcounter` - Counter example
- `ftodo` - Todo list pattern
- `ftest` - Test template

See [.vscode/flexium.code-snippets](../.vscode/flexium.code-snippets) for all snippets.

## Git Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring
- `test/description` - Test improvements

### Commit Messages

Follow conventional commits:

```
feat: add dark mode support
fix: resolve signal cleanup issue
docs: update API documentation
test: add integration tests for Motion
refactor: simplify effect tracking
chore: update dependencies
```

### Pull Requests

1. Create a branch from `main`
2. Make your changes
3. Write/update tests
4. Ensure all tests pass: `npm test`
5. Format code: `npm run format`
6. Commit with clear message
7. Push and create PR
8. Fill out PR template
9. Request review

See [.github/PULL_REQUEST_TEMPLATE.md](../.github/PULL_REQUEST_TEMPLATE.md)

## Performance Profiling

### Bundle Size Analysis

Check bundle size impact:

```bash
# Build and check output
npm run build

# Check dist/ folder sizes
ls -lh dist/
```

**Targets:**
- Core signals: < 1KB
- DOM renderer: < 10KB
- All primitives: < 25KB total

### Runtime Performance

Use browser DevTools:

1. Open Performance tab
2. Click Record
3. Interact with your app
4. Stop recording
5. Analyze flame graph

**Targets:**
- Signal updates: < 0.1ms
- Component renders: < 16ms (60fps)
- Effect execution: < 1ms

## Common Tasks

### Adding a New Component

1. Create file in `src/primitives/`
2. Define TypeScript interface
3. Implement component
4. Export from `src/primitives/index.ts`
5. Add tests
6. Update documentation
7. Create example

### Adding a New Feature

1. Design the API
2. Write tests first (TDD)
3. Implement the feature
4. Update TypeScript types
5. Add documentation
6. Create example usage
7. Update CHANGELOG.md

### Fixing a Bug

1. Write a failing test that reproduces the bug
2. Fix the bug
3. Ensure test passes
4. Add regression test
5. Update documentation if needed

## Resources

### Documentation

- [API Documentation](./API.md) - Complete API reference
- [Best Practices](./BEST_PRACTICES.md) - Coding patterns
- [FAQ](./FAQ.md) - Common questions
- [Recipes](./RECIPES.md) - How-to guides
- [IDE Setup](./IDE_SETUP.md) - Editor configuration

### Examples

- [Counter](../examples/counter/) - Simple counter
- [Todo App](../examples/todo/) - Todo list with animations
- [Dashboard](../examples/dashboard/) - Responsive dashboard

### Community

- [GitHub Discussions](https://github.com/Wick-Lim/flexium.js/discussions)
- [Issue Tracker](https://github.com/Wick-Lim/flexium.js/issues)
- [Contributing Guide](../CONTRIBUTING.md)

## Troubleshooting

### Build Errors

**"Cannot find module"**
```bash
# Clean and reinstall
rm -rf node_modules dist
npm install
npm run build
```

**TypeScript errors**
```bash
# Restart TS server in VSCode
# Cmd+Shift+P > "TypeScript: Restart TS Server"

# Or rebuild
npm run build
```

### Test Failures

**"ECONNREFUSED" or network errors**
- Check if you're offline
- Verify API endpoints in tests

**"Timeout" errors**
- Increase timeout in test file
- Check for infinite loops
- Verify async cleanup

### Runtime Issues

**"signal is not a function"**
- Import from correct package: `import { signal } from 'flexium/core'`
- Ensure library is built: `npm run build`

**Components not updating**
- Are you reading `.value` in the component?
- Are you mutating instead of replacing?
- Check [FAQ.md](./FAQ.md#why-isnt-my-component-updating)

## Tips for Productivity

1. **Use code snippets** - Type `f` + `Tab` to see all Flexium snippets
2. **Enable auto-save** - Files save automatically on focus change
3. **Learn keyboard shortcuts** - See [IDE_SETUP.md](./IDE_SETUP.md)
4. **Use multi-cursor editing** - `Cmd+D` to select next occurrence
5. **Enable auto-imports** - TypeScript will import for you
6. **Use the debugger** - `F5` is faster than `console.log`
7. **Read error messages** - TypeScript errors are usually helpful
8. **Check examples** - See how things are done in practice

## Getting Help

1. **Check documentation** - Most questions are answered here
2. **Search issues** - Someone may have had the same problem
3. **Ask in discussions** - Community Q&A
4. **Open an issue** - For bugs or feature requests
5. **Read the code** - Source code is well-documented

## Contributing

We welcome contributions! See [CONTRIBUTING.md](../CONTRIBUTING.md) for:
- Code of conduct
- Development setup
- Coding standards
- PR process
- Agent-based development workflow

## License

MIT - See [LICENSE](../LICENSE) for details.

---

**Happy coding with Flexium!** If you have suggestions to improve the developer experience, please open an issue or PR.
