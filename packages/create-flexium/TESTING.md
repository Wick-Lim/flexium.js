# Testing Guide for create-flexium

## Overview

This guide explains how to test the create-flexium CLI tool and its templates.

## Test Suites

### 1. Unit Tests (`npm test`)

Runs comprehensive unit tests using Node.js native test runner.

```bash
npm test
```

**What it tests**:
- Template generation for all 6 templates
- File creation and structure
- package.json generation and updates
- Input validation
- Edge cases (special characters, existing directories)

**Location**: `__tests__/cli.test.js`

**Duration**: ~10-20 seconds

### 2. Quick Smoke Test (`npm run test:quick`)

Quickly tests basic functionality by creating and removing a test project.

```bash
npm run test:quick
```

**What it tests**:
- CLI can create a project
- Vite starter template works
- Files are created correctly

**Duration**: ~2-5 seconds

### 3. Manual Testing

#### Test All Templates

Test each template manually:

```bash
# Test Vite + TypeScript
npm create flexium test-vite
# Choose 1
cd test-vite && npm install && npm run dev

# Test Vanilla
npm create flexium test-vanilla
# Choose 2
cd test-vanilla && npx serve .

# Test Todo App
npm create flexium test-todo
# Choose 3
cd test-todo && npm install && npm run dev

# Test SSR
npm create flexium test-ssr
# Choose 4
cd test-ssr && npm install && npm run dev

# Test PWA
npm create flexium test-pwa
# Choose 5
cd test-pwa && npm install && npm run dev

# Test Monorepo
npm create flexium test-monorepo
# Choose 6
cd test-monorepo && pnpm install && pnpm dev
```

#### Test Input Validation

```bash
# Test uppercase (should fail)
node index.js MyApp

# Test special characters (should fail)
node index.js "my app"

# Test valid names (should succeed)
node index.js my-app
node index.js my_app
node index.js myapp123
```

#### Test Directory Conflicts

```bash
# Create a directory first
mkdir existing-project

# Try to create project with same name (should fail)
node index.js existing-project
```

## Testing Checklist

Before releasing, verify:

### All Templates

- [ ] Vite + TypeScript template creates successfully
- [ ] Vanilla template creates successfully
- [ ] Todo App template creates successfully
- [ ] SSR template creates successfully
- [ ] PWA template creates successfully
- [ ] Monorepo template creates successfully

### Functionality

- [ ] CLI shows banner correctly
- [ ] Template selection menu displays all 6 templates
- [ ] Project name validation works
- [ ] Invalid names show helpful error messages
- [ ] Existing directory detection works
- [ ] package.json gets updated with project name
- [ ] Next steps display correctly for each template

### Template-Specific

#### Vite Template
- [ ] TypeScript compilation works
- [ ] Hot reload works
- [ ] Build produces dist folder
- [ ] ESLint and Prettier work

#### Vanilla Template
- [ ] Opens in browser with serve
- [ ] No build errors (no build step)
- [ ] HTML file contains Flexium CDN

#### Todo App Template
- [ ] Application runs
- [ ] Todo functionality works
- [ ] Local storage persists

#### SSR Template
- [ ] Server starts on port 5173
- [ ] Page renders server-side
- [ ] View source shows rendered HTML
- [ ] Client hydration works
- [ ] Build creates dist/client and dist/server
- [ ] Production mode works

#### PWA Template
- [ ] Service worker registers
- [ ] Install prompt appears (in production build)
- [ ] Manifest file is valid
- [ ] Offline mode works
- [ ] TypeScript compilation works
- [ ] PWA Lighthouse score is high

#### Monorepo Template
- [ ] pnpm install works
- [ ] All three packages are recognized
- [ ] Cross-package imports work
- [ ] Hot reload works across packages
- [ ] Build all packages works (pnpm -r build)
- [ ] TypeScript path mapping works

## Common Issues

### Issue: Tests fail with EEXIST error
**Solution**: Clean up test directories
```bash
rm -rf test-output
rm -rf __tests__/test-output
```

### Issue: Monorepo template fails
**Solution**: Make sure pnpm is installed
```bash
npm install -g pnpm
```

### Issue: PWA features don't work in development
**Solution**: Build and serve over HTTPS for full PWA features
```bash
npm run build
npx serve dist -s
```

### Issue: SSR shows blank page
**Solution**: Check server logs for errors, ensure Express is installed
```bash
cd test-ssr
npm install
node server.js
```

## CI/CD Testing

For automated testing in CI/CD:

```bash
# Install dependencies
npm install

# Run unit tests
npm test

# Test each template
for template in {1..6}; do
  node index.js "test-template-$template" "$template"
  rm -rf "test-template-$template"
done
```

## Performance Benchmarks

Expected timings:

- Unit tests: 10-20 seconds
- Template creation: 1-3 seconds per template
- npm install (Vite template): 20-40 seconds
- pnpm install (Monorepo): 30-50 seconds
- Build time (Vite): 5-10 seconds
- SSR startup: 2-5 seconds

## Test Coverage Goals

Current coverage:
- Template generation: 100%
- Input validation: 100%
- File creation: 100%
- package.json updates: 100%

Future coverage goals:
- Integration tests with actual builds
- E2E tests with Playwright
- Performance regression tests
- Cross-platform tests (Windows, macOS, Linux)

## Debugging Tests

Enable verbose output:

```bash
# Run tests with full output
node --test --test-reporter=spec __tests__/cli.test.js

# Debug specific test
node --test --test-name-pattern="should create vite-starter template" __tests__/cli.test.js
```

## Contributing Tests

When adding new templates or features:

1. Add unit tests in `__tests__/cli.test.js`
2. Add manual testing steps in this document
3. Update the testing checklist
4. Document any new test scenarios

Example test structure:

```javascript
await t.test('should create new-template', () => {
  setupTestDir()
  const projectName = 'test-new'
  cleanup(projectName)

  try {
    execSync(`node ${CLI_PATH} ${projectName} 7`, {
      cwd: TEST_DIR,
      stdio: 'pipe',
    })

    const projectPath = join(TEST_DIR, projectName)
    assert.ok(existsSync(projectPath), 'Project should exist')
    // Add more assertions...
  } finally {
    cleanup(projectName)
  }
})
```

## Reporting Issues

When reporting test failures, include:
1. Test command that failed
2. Full error output
3. Node.js version (`node --version`)
4. npm/pnpm version
5. Operating system
6. Steps to reproduce
