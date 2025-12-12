---
title: ESLint Plugin - Code Quality & Best Practices
description: Learn how to use eslint-plugin-flexium to enforce best practices and catch common mistakes in Flexium applications.
head:
  - - meta
    - property: og:title
      content: ESLint Plugin - Flexium
  - - meta
    - property: og:description
      content: ESLint plugin for Flexium with rules for reactivity best practices, effect cleanup, and performance optimization.
---

# ESLint Plugin

The official ESLint plugin for Flexium helps you write better code by enforcing best practices and catching common mistakes.

## Installation

```bash
npm install eslint-plugin-flexium --save-dev
```

## Basic Usage

Add `flexium` to the plugins section of your `.eslintrc` configuration file and extend the recommended config:

```json
{
  "plugins": ["flexium"],
  "extends": ["plugin:flexium/recommended"]
}
```

## Configurations

The plugin provides three preset configurations:

| Configuration | Description | Use Case |
|--------------|-------------|----------|
| `recommended` | Balanced rules for most projects | General development |
| `strict` | Stricter rules for production code | Production applications |
| `all` | Enable all rules as errors | Maximum code quality enforcement |

### Using Configurations

```json
{
  "extends": ["plugin:flexium/recommended"]
}
```

```json
{
  "extends": ["plugin:flexium/strict"]
}
```

```json
{
  "extends": ["plugin:flexium/all"]
}
```

## Custom Configuration

Configure rules individually to match your project's needs:

```json
{
  "plugins": ["flexium"],
  "rules": {
    "flexium/no-signal-outside-reactive": "warn",
    "flexium/effect-cleanup": "warn",
    "flexium/no-side-effect-in-computed": "error",
    "flexium/prefer-sync": "off"
  }
}
```

## Rules

### `flexium/no-state-comparison`

Prevent direct comparison of `state()` proxy values which always fail.

**Why?** State values returned by `state()` are Proxy objects. Direct comparison with `===` or boolean coercion always fails because:
- `stateValue === 5` is always `false` (Proxy !== primitive)
- `if (stateValue)` is always `true` (Proxy objects are always truthy)
- `if (!stateValue)` is always `false`

#### Bad

```tsx
const count = state(0);
const isVisible = state(false);

// ❌ Direct comparison always fails
if (count.valueOf() === 5) {
  doSomething(); // Never runs!
}

// ❌ Boolean coercion is unreliable
if (!isVisible.valueOf()) {
  hide(); // Never runs! Proxy is always truthy
}

// ❌ Direct use in ternary
const message = count.valueOf() ? 'Has value' : 'Empty'; // Always 'Has value'
```

#### Good

```tsx
const count = state(0);
const isVisible = state(false);

// ✅ Use .valueOf() syntax
if (count.valueOf() === 5) {
  doSomething();
}

// ✅ Use .valueOf() for boolean checks
if (!isVisible.valueOf()) {
  hide();
}

// ✅ Use unary plus for number comparison
if (+count === 5) {
  doSomething();
}

// ✅ Use String() for string comparison
if (String(name) === 'Alice') {
  greet();
}

// ✅ Direct property access is fine
if (user.id === 1) {
  // Works because we're comparing the property, not the proxy
}
```

---

### `flexium/no-signal-outside-reactive`

Disallow reading signal values outside of reactive contexts.

**Why?** Signal reads outside of `effect()`, `computed()`, or JSX will not be tracked and won't trigger re-renders.

#### Bad

```javascript
const count = state(0);

// ❌ Signal read outside reactive context - won't trigger updates
if (count.valueOf() > 5) {
  doSomething();
}
```

#### Good

```javascript
const count = state(0);

// ✅ Signal read inside effect
effect(() => {
  if (count.valueOf() > 5) {
    doSomething();
  }
});

// ✅ Signal read inside computed
const shouldDoSomething = state(() => count.valueOf() > 5);

// ✅ Signal read inside JSX
const App = () => (
  <div>
    {count.valueOf() > 5 && <div>Count is greater than 5</div>}
  </div>
);
```

### `flexium/effect-cleanup`

Enforce cleanup functions in effects that add event listeners or timers.

**Why?** Effects that add event listeners or timers without cleanup can cause memory leaks.

#### Bad

```javascript
// ❌ No cleanup for event listener
effect(() => {
  window.addEventListener('resize', handleResize);
});

// ❌ No cleanup for timer
effect(() => {
  const interval = setInterval(() => {
    console.log('Tick');
  }, 1000);
});
```

#### Good

```javascript
// ✅ Returns cleanup function for event listener
effect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
});

// ✅ Returns cleanup function for timer
effect(() => {
  const interval = setInterval(() => {
    console.log('Tick');
  }, 1000);
  return () => clearInterval(interval);
});

// ✅ Effect without listeners/timers doesn't need cleanup
effect(() => {
  console.log('Count changed:', count);
});
```

### `flexium/no-side-effect-in-computed`

Disallow side effects in computed functions.

**Why?** Computed values should be pure functions. Side effects belong in `effect()`.

#### Bad

```javascript
// ❌ Side effect in computed (console.log)
const doubled = state(() => {
  console.log('Computing...');
  return count.valueOf() * 2;
});

// ❌ Mutation in computed
const users = state([]);
const sortedUsers = state(() => {
  return users.valueOf().sort(); // Mutates original array!
});

// ❌ DOM manipulation in computed
const displayText = state(() => {
  document.title = String(count.valueOf()); // DOM side effect!
  return `Count: ${count.valueOf()}`;
});
```

#### Good

```javascript
// ✅ Pure computed
const doubled = state(() => count.valueOf() * 2);

// ✅ Side effect in effect
effect(() => {
  console.log('Count changed:', count);
});

// ✅ Non-mutating computed
const sortedUsers = state(() => {
  return [...users.valueOf()].sort(); // Creates new array
});

// ✅ DOM manipulation in effect
effect(() => {
  document.title = String(count.valueOf());
});
```

### `flexium/prefer-sync`

Suggest using `sync()` when multiple signals are updated consecutively.

**Why?** Multiple signal updates without syncing can cause unnecessary re-renders.

#### Bad

```javascript
// ⚠️ Warning - multiple updates without sync (3 separate re-renders)
count.set(1);
name.set('test');
active.set(true);

// ⚠️ Multiple signal updates in a function
function updateUser(id: number, data: UserData) {
  userId.set(id);
  userName.set(data.name);
  userEmail.set(data.email);
  userActive.set(data.active);
}
```

#### Good

```javascript
import { sync } from 'flexium';

// ✅ Synced updates (single re-render)
sync(() => {
  count.set(1);
  name.set('test');
  active.set(true);
});

// ✅ Synced function
function updateUser(id: number, data: UserData) {
  sync(() => {
    userId.set(id);
    userName.set(data.name);
    userEmail.set(data.email);
    userActive.set(data.active);
  });
}

// ✅ Single signal update doesn't need syncing
count.set(1);
```

#### Configuration

Configure the threshold for when to warn about consecutive updates:

```json
{
  "flexium/prefer-sync": ["warn", { "threshold": 2 }]
}
```

Options:
- `threshold` (default: `2`): Number of consecutive signal updates before warning.

## Integration with Other Configs

The Flexium ESLint plugin works alongside other ESLint configurations:

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:flexium/recommended"
  ],
  "plugins": ["@typescript-eslint", "flexium"],
  "rules": {
    // Override specific rules if needed
    "flexium/prefer-sync": "off"
  }
}
```

## TypeScript Support

The plugin fully supports TypeScript projects. Make sure to install the TypeScript ESLint parser:

```bash
npm install @typescript-eslint/parser --save-dev
```

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "plugins": ["flexium"],
  "extends": ["plugin:flexium/recommended"]
}
```

## Common Issues

### Rule Not Working

If a rule isn't being enforced:

1. Verify the plugin is listed in `plugins` array
2. Check that the rule is enabled in your config
3. Ensure your file extensions are included in ESLint's `--ext` option
4. Restart your editor/IDE

### Too Many Warnings

If you're getting too many warnings during migration:

1. Start with `recommended` config instead of `strict` or `all`
2. Disable specific rules temporarily:
   ```json
   {
     "extends": ["plugin:flexium/recommended"],
     "rules": {
       "flexium/prefer-sync": "off"
     }
   }
   ```
3. Fix violations incrementally
4. Gradually enable stricter rules

### False Positives

If you encounter false positives:

1. Use ESLint disable comments for specific cases:
   ```javascript
   // eslint-disable-next-line flexium/no-signal-outside-reactive
   const initialValue = count;
   ```

2. Report the issue on [GitHub](https://github.com/Wick-Lim/flexium.js/issues)

## Best Practices

### Use the Recommended Config

Start with the `recommended` config and customize from there:

```json
{
  "extends": ["plugin:flexium/recommended"],
  "rules": {
    // Add project-specific overrides here
  }
}
```

### Enable Auto-Fix

Many rules support auto-fix. Run ESLint with the `--fix` flag:

```bash
npx eslint . --fix
```

### Integrate with Your Editor

Install ESLint extensions for your editor:
- **VS Code**: [ESLint Extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- **WebStorm**: Built-in ESLint support
- **Vim**: [ALE](https://github.com/dense-analysis/ale) or [coc-eslint](https://github.com/neoclide/coc-eslint)

### Use Pre-Commit Hooks

Enforce ESLint checks before commits using [husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged):

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix"]
  }
}
```

## Migrating Existing Projects

When adding ESLint to an existing Flexium project:

1. **Install dependencies**:
   ```bash
   npm install eslint eslint-plugin-flexium --save-dev
   ```

2. **Create configuration**:
   ```json
   {
     "extends": ["plugin:flexium/recommended"]
   }
   ```

3. **Run ESLint**:
   ```bash
   npx eslint .
   ```

4. **Fix automatically fixable issues**:
   ```bash
   npx eslint . --fix
   ```

5. **Fix remaining issues manually**, using the rule documentation as a guide

6. **Enable stricter rules gradually** as your codebase improves
