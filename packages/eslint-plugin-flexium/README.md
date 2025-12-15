# eslint-plugin-flexium

ESLint plugin for [Flexium](https://flexium.junhyuk.im) with rules for best practices.

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
    "flexium/no-state-outside-reactive": "warn",
    "flexium/effect-cleanup": "warn",
    "flexium/no-side-effect-in-computed": "error",
    "flexium/prefer-batch": "off",
    "flexium/no-state-mutation": "warn",
    "flexium/no-effect-in-render": "error",
    "flexium/no-circular-dependency": "error",
    "flexium/component-naming": "warn"
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

### `flexium/no-state-outside-reactive`

Disallow reading state values outside of reactive contexts.

**Why?** State reads outside of `effect()` or JSX will not be tracked and won't trigger re-renders.

```javascript
// ❌ Bad - state read outside reactive context
const [count, setCount] = state(0);
if (count > 5) {
  doSomething();
}

// ✅ Good - state read inside effect
effect(() => {
  if (count > 5) {
    doSomething();
  }
});

// ✅ Good - state read inside JSX
const App = () => <div>{count}</div>;
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

Disallow side effects in computed state functions.

**Why?** Computed values should be pure functions. Side effects belong in `effect()`.

```javascript
const [count, setCount] = state(0);

// ❌ Bad - side effect in computed
const [doubled] = state(() => {
  console.log('Computing...');  // Side effect!
  return count * 2;
}, { deps: [count] });

// ✅ Good - pure computed
const [doubled] = state(() => count * 2, { deps: [count] });

// ✅ Good - side effect in effect
effect(() => {
  console.log('Count changed:', count);
});
```

### `flexium/prefer-batch`

Suggest using `batch()` when multiple state updates occur consecutively.

**Why?** Multiple state updates without batching can cause unnecessary re-renders.

```javascript
import { state, batch } from 'flexium/core';

const [count, setCount] = state(0);
const [name, setName] = state('');
const [active, setActive] = state(false);

// ⚠️ Warning - multiple updates without batching
setCount(1);
setName('test');
setActive(true);

// ✅ Good - batched updates
batch(() => {
  setCount(1);
  setName('test');
  setActive(true);
});
```

**Options:**

```json
{
  "flexium/prefer-batch": ["warn", { "threshold": 2 }]
}
```

- `threshold` (default: `2`): Number of consecutive state updates before warning.

### `flexium/no-state-mutation`

Warn about direct object/array mutations in state.

**Why?** State containing objects or arrays should be updated immutably. Direct mutations won't trigger reactivity updates.

```javascript
const [items, setItems] = state([1, 2, 3]);

// ❌ Bad - direct mutation (won't trigger updates)
items.push(4);
items[0] = 10;

// ✅ Good - immutable updates via setter
setItems(prev => [...prev, 4]);
setItems(prev => prev.map((item, i) => i === 0 ? 10 : item));

// For objects
const [user, setUser] = state({ name: 'John', age: 30 });

// ❌ Bad
user.age = 31;

// ✅ Good
setUser(prev => ({ ...prev, age: 31 }));
```

### `flexium/no-effect-in-render`

Prevent calling effect() in component render body.

**Why?** Effects should not be created during every render. In Flexium, effects are typically created once and automatically track dependencies.

```javascript
// ❌ Bad - effect created on every render
const MyComponent = () => {
  effect(() => {
    console.log('This runs on every render!');
  });

  return <div>Hello</div>;
};

// ✅ Good - effect created at module level
const [count, setCount] = state(0);

effect(() => {
  console.log('Count:', count);
});

const MyComponent = () => {
  return <div>{count}</div>;
};
```

### `flexium/no-circular-dependency`

Detect circular dependencies between computed states.

**Why?** Circular dependencies create infinite loops and will crash your application.

```javascript
// ❌ Bad - circular dependency
const [a] = state(() => b + 1);
const [b] = state(() => a + 1); // Creates infinite loop!

// ✅ Good - no circular dependencies
const [count, setCount] = state(0);
const [doubled] = state(() => count * 2, { deps: [count] });
const [quadrupled] = state(() => doubled * 2, { deps: [doubled] });
```

### `flexium/component-naming`

Enforce PascalCase naming convention for components.

**Why?** JSX conventions expect components to use PascalCase to distinguish them from HTML elements.

```javascript
// ❌ Bad - component names should be PascalCase
const myComponent = () => <div>Hello</div>;
const user_profile = () => <div>Profile</div>;

// ✅ Good - PascalCase component names
const MyComponent = () => <div>Hello</div>;
const UserProfile = () => <div>Profile</div>;

// Usage in JSX
const App = () => (
  <div>
    <MyComponent />
    <UserProfile />
  </div>
);
```

## License

MIT
