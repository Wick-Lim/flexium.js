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
    "flexium/no-signal-outside-reactive": "warn",
    "flexium/effect-cleanup": "warn",
    "flexium/no-side-effect-in-computed": "error",
    "flexium/prefer-batch": "off",
    "flexium/no-missing-dependencies": "warn",
    "flexium/effect-dependencies-complete": "warn",
    "flexium/no-signal-mutation": "warn",
    "flexium/no-effect-in-render": "error",
    "flexium/prefer-computed": "off",
    "flexium/no-circular-dependency": "error",
    "flexium/component-naming": "warn",
    "flexium/no-signal-reassignment": "error"
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

### `flexium/no-missing-dependencies`

Ensure all reactive dependencies are tracked in effect/computed.

**Why?** Missing dependencies can lead to stale closures and bugs where effects don't update when they should.

```javascript
// ❌ Bad - signal used without proper tracking
const count = signal(0);
const doubled = computed(() => {
  const c = count; // Signal referenced but not accessed
  return c.value * 2;
});

// ✅ Good - signal properly accessed
const doubled = computed(() => count.value * 2);
```

### `flexium/effect-dependencies-complete`

Ensure all reactive dependencies are tracked in effects.

**Why?** Effects should track all signals they depend on. Missing dependencies can cause effects to not re-run when they should.

```javascript
// ⚠️ Warning - ensure all signals are tracked
const count = signal(0);
const name = signal('');

effect(() => {
  if (count.value > 5) {
    console.log(name.value); // Both signals should be tracked
  }
});

// ✅ Good - all dependencies are properly tracked
effect(() => {
  console.log(`${name.value}: ${count.value}`);
});
```

### `flexium/no-signal-mutation`

Warn about direct object/array mutations in signals.

**Why?** Signals containing objects or arrays should be updated immutably. Direct mutations won't trigger reactivity updates.

```javascript
const items = signal([1, 2, 3]);

// ❌ Bad - direct mutation
items.value.push(4);
items.value[0] = 10;

// ✅ Good - immutable updates
items.value = [...items.value, 4];
items.value = items.value.map((item, i) => i === 0 ? 10 : item);

// For objects
const user = signal({ name: 'John', age: 30 });

// ❌ Bad
user.value.age = 31;

// ✅ Good
user.value = { ...user.value, age: 31 };
```

### `flexium/no-effect-in-render`

Prevent calling effect() in component render body.

**Why?** Effects should not be created during every render. They should be created at module level or inside lifecycle hooks.

```javascript
// ❌ Bad - effect created on every render
const MyComponent = () => {
  effect(() => {
    console.log('This runs on every render!');
  });

  return <div>Hello</div>;
};

// ✅ Good - effect created at module level
const logEffect = effect(() => {
  console.log('This runs once');
});

const MyComponent = () => {
  return <div>Hello</div>;
};

// ✅ Good - effect in a lifecycle hook (if framework supports)
const MyComponent = () => {
  onMount(() => {
    effect(() => {
      console.log('Properly scoped effect');
    });
  });

  return <div>Hello</div>;
};
```

### `flexium/prefer-computed`

Suggest using computed() for derived state instead of effect().

**Why?** When an effect only updates a signal based on other signals, using computed() is more efficient and clearer.

```javascript
const count = signal(0);
const doubled = signal(0);

// ⚠️ Warning - this should be a computed
effect(() => {
  doubled.value = count.value * 2;
});

// ✅ Good - use computed for derived state
const doubled = computed(() => count.value * 2);
```

### `flexium/no-circular-dependency`

Detect circular dependencies between signals.

**Why?** Circular dependencies create infinite loops and will crash your application.

```javascript
// ❌ Bad - circular dependency
const a = computed(() => b.value + 1);
const b = computed(() => a.value + 1); // Creates infinite loop!

// ✅ Good - no circular dependencies
const count = signal(0);
const doubled = computed(() => count.value * 2);
const quadrupled = computed(() => doubled.value * 2);
```

### `flexium/component-naming`

Enforce PascalCase naming convention for components.

**Why?** React and JSX conventions expect components to use PascalCase to distinguish them from HTML elements.

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

### `flexium/no-signal-reassignment`

Warn about reassigning signal variables.

**Why?** Signals should be updated via `.value` or `.set()`, not by reassigning the variable. Reassignment breaks reactivity.

```javascript
let count = signal(0);

// ❌ Bad - reassigning the signal variable
count = signal(10); // Breaks all references!

// ✅ Good - update the signal value
count.value = 10;
// or
count.set(10);

// ✅ Best - declare signals with const
const count = signal(0);
count.value = 10; // Only way to update
```

## License

MIT
