# eslint-plugin-flexium

ESLint plugin for [Flexium](https://github.com/Wick-Lim/flexium.js) with rules for best practices.

## Installation

```bash
npm install eslint-plugin-flexium --save-dev
```

## Usage

Add `flexium` to the plugins section of your `.eslintrc` configuration file:

```json
{
  "plugins": ["flexium"],
  "extends": ["plugin:flexium/recommended"]
}
```

Or configure rules individually:

```json
{
  "plugins": ["flexium"],
  "rules": {
    "flexium/no-signal-outside-reactive": "warn",
    "flexium/effect-cleanup": "warn",
    "flexium/no-side-effect-in-computed": "error",
    "flexium/prefer-batch": "off"
  }
}
```

## Configurations

| Configuration | Description |
|--------------|-------------|
| `recommended` | Balanced rules for most projects |
| `strict` | Stricter rules for production code |
| `all` | Enable all rules as errors |

## Rules

### `flexium/no-signal-outside-reactive`

Disallow reading signal values outside of reactive contexts.

**Why?** Signal reads outside of `effect()`, `computed()`, or JSX will not be tracked and won't trigger re-renders.

```javascript
// ❌ Bad - signal read outside reactive context
const count = signal(0);
if (count.value > 5) {
  doSomething();
}

// ✅ Good - signal read inside effect
effect(() => {
  if (count() > 5) {
    doSomething();
  }
});

// ✅ Good - signal read inside JSX
const App = () => <div>{count()}</div>;
```

### `flexium/effect-cleanup`

Enforce cleanup functions in effects that add event listeners or timers.

**Why?** Effects that add event listeners or timers without cleanup can cause memory leaks.

```javascript
// ❌ Bad - no cleanup for event listener
effect(() => {
  window.addEventListener('resize', handleResize);
});

// ✅ Good - returns cleanup function
effect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
});
```

### `flexium/no-side-effect-in-computed`

Disallow side effects in computed functions.

**Why?** Computed values should be pure functions. Side effects belong in `effect()`.

```javascript
// ❌ Bad - side effect in computed
const doubled = computed(() => {
  console.log('Computing...');  // Side effect!
  return count.value * 2;
});

// ✅ Good - pure computed
const doubled = computed(() => count.value * 2);

// ✅ Good - side effect in effect
effect(() => {
  console.log('Count changed:', count());
});
```

### `flexium/prefer-batch`

Suggest using `batch()` when multiple signals are updated consecutively.

**Why?** Multiple signal updates without batching can cause unnecessary re-renders.

```javascript
// ⚠️ Warning - multiple updates without batch
count.value = 1;
name.value = 'test';
active.value = true;

// ✅ Good - batched updates
batch(() => {
  count.value = 1;
  name.value = 'test';
  active.value = true;
});
```

**Options:**

```json
{
  "flexium/prefer-batch": ["warn", { "threshold": 2 }]
}
```

- `threshold` (default: `2`): Number of consecutive signal updates before warning.

## License

MIT
