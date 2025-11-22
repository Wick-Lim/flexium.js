# Flexium Test Suite

Comprehensive test suite using Node.js built-in test runner.

## Quick Start

```bash
# Install dependencies (jsdom for DOM testing)
npm install

# Run all tests
npm test

# Run specific test suite
npm run test:signal      # Signal system only
npm run test:dom         # DOM renderer only
npm run test:integration # Integration tests only
```

## Test Files

### 1. signal.test.mjs
Tests the core signal reactivity system.

**Coverage:**
- Signal creation, get/set operations
- Computed signals (memoization, dependency tracking)
- Effects (lifecycle, cleanup, disposal)
- Batch updates
- Untrack (read without tracking)
- Root scopes
- Complex reactive graphs

**Critical Tests:**
- ✅ Effect doesn't run infinitely (prevents infinite loops)
- ✅ Computed memoizes correctly (performance)
- ✅ Batch prevents cascading updates (performance)

### 2. dom.test.mjs
Tests the DOM renderer implementation.

**Coverage:**
- h() JSX factory function
- Fragment component
- DOMRenderer class (element creation, updates, events)
- render() function
- Props mapping (className, style, flexbox, padding, margin)
- Component rendering

**Critical Tests:**
- ✅ h() creates valid VNodes
- ✅ Event handlers attach correctly
- ✅ Component functions render
- ❌ Props application needs fixes (see TEST_RESULTS.md)

### 3. integration.test.mjs
Tests signal system integrated with DOM rendering.

**Coverage:**
- Reactive text content
- Signal/computed values in components
- Effect-driven DOM updates
- Batch updates preventing re-renders
- Conditional rendering
- List rendering
- Form binding (two-way binding)
- Reactive styling
- Component lifecycle

**Critical Tests:**
- ✅ Effects update DOM correctly
- ✅ Batch prevents unnecessary renders
- ✅ Two-way form binding works
- ✅ Complex components (todo list) work

## Test Results

See `/Users/wick/Documents/workspaces/flexium.js/TEST_RESULTS.md` for detailed results.

**Summary:** 67/82 tests passing (82%)

## Writing Tests

Tests use Node.js built-in test runner (Node 18+):

```javascript
import { test } from 'node:test';
import assert from 'node:assert';

test('description', () => {
  // Your test code
  assert.strictEqual(actual, expected);
});
```

### Common Assertions

```javascript
assert.strictEqual(a, b)              // Exact equality (===)
assert.deepStrictEqual(obj1, obj2)    // Deep object equality
assert.ok(value)                       // Truthy check
assert.notEqual(a, b)                  // Not equal
assert.throws(() => fn())              // Function should throw
```

### DOM Testing Setup

```javascript
import { JSDOM } from 'jsdom';

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.Node = dom.window.Node;
global.HTMLElement = dom.window.HTMLElement;

// Now you can use document and DOM APIs
const container = document.createElement('div');
```

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm test
```

## Known Issues

See TEST_RESULTS.md for complete list. Key issues:

1. **DOMRenderer props**: className, style, flexbox props not applied correctly
2. **root() function**: Doesn't track/dispose effects
3. **Reactive children**: Computed/signal children don't auto-update

## Contributing Tests

When adding new features, please add corresponding tests:

1. Add tests to appropriate file (signal/dom/integration)
2. Test both happy path and edge cases
3. Test error handling
4. Run all tests before submitting PR
5. Update TEST_RESULTS.md if fixing known issues

## Performance Testing

For performance benchmarks, use:

```javascript
import { performance } from 'node:perf_hooks';

test('performance test', () => {
  const start = performance.now();

  // Your code to benchmark
  for (let i = 0; i < 10000; i++) {
    signal(i);
  }

  const duration = performance.now() - start;
  console.log(`Took ${duration}ms`);
  assert.ok(duration < 100); // Should be fast
});
```

## Debugging Tests

Run specific test with verbose output:

```bash
# Run single test file with more detail
node --test test/signal.test.mjs

# Run with Node debugger
node --inspect-brk --test test/signal.test.mjs
```

## Test Philosophy

1. **Comprehensive**: Test all public APIs
2. **Critical paths first**: Focus on features that prevent usage
3. **Edge cases**: Test null, undefined, empty arrays, etc.
4. **Real-world scenarios**: Integration tests mimic actual usage
5. **Performance**: Check for infinite loops, memory leaks
6. **Maintainable**: Clear test names, good structure

## Resources

- [Node.js Test Runner Docs](https://nodejs.org/api/test.html)
- [Node.js Assert Docs](https://nodejs.org/api/assert.html)
- [jsdom Documentation](https://github.com/jsdom/jsdom)
