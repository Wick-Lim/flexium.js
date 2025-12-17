# eslint-plugin-flexium

ESLint plugin for [Flexium](https://flexium.junhyuk.im) with rules for best practices and common pitfalls.

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
    "flexium/prefer-sync": "off",
    "flexium/no-signal-mutation": "warn",
    "flexium/no-effect-in-render": "error",
    "flexium/no-circular-dependency": "error",
    "flexium/component-naming": "warn",
    "flexium/no-signal-reassignment": "error",
    "flexium/no-state-comparison": "error"
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

Disallow reading state values outside of reactive contexts.

**Why?** State reads outside of `effect()` or JSX will not be tracked and won't trigger re-renders.

```javascript
// ❌ Bad - state read outside reactive context
const [count, setCount] = state(0)
if (count > 5) {
  doSomething()
}

// ✅ Good - state read inside effect
effect(() => {
  if (count > 5) {
    doSomething()
  }
})

// ✅ Good - state read inside JSX
const App = () => <div>{count}</div>
```

### `flexium/effect-cleanup`

Enforce cleanup functions in effects that add event listeners or timers.

**Why?** Effects that add event listeners or timers without cleanup can cause memory leaks.

```javascript
// ❌ Bad - no cleanup for event listener
effect(() => {
  window.addEventListener('resize', handleResize)
})

// ✅ Good - returns cleanup function
effect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
})
```

### `flexium/no-side-effect-in-computed`

Disallow side effects in computed state functions.

**Why?** Computed values should be pure functions. Side effects belong in `effect()`.

```javascript
const [count, setCount] = state(0)

// ❌ Bad - side effect in computed
const [doubled] = state(() => {
  console.log('Computing...')  // Side effect!
  return count * 2
}, { deps: [count] })

// ✅ Good - pure computed
const [doubled] = state(() => count * 2, { deps: [count] })

// ✅ Good - side effect in effect
effect(() => {
  console.log('Count changed:', count)
})
```

### `flexium/prefer-sync`

Suggest using `sync()` when multiple state updates occur consecutively.

**Why?** Multiple state updates are auto-batched via microtask, but `sync()` provides explicit synchronous batching when needed.

```javascript
import { state, sync } from 'flexium/core'

const [count, setCount] = state(0)
const [name, setName] = state('')
const [active, setActive] = state(false)

// ⚠️ Auto-batched (microtask), but may want explicit control
setCount(1)
setName('test')
setActive(true)

// ✅ Good - explicit synchronous batching
sync(() => {
  setCount(1)
  setName('test')
  setActive(true)
})
```

### `flexium/no-signal-mutation`

Warn about direct object/array mutations in state.

**Why?** State containing objects or arrays should be updated immutably. Direct mutations won't trigger reactivity updates.

```javascript
const [items, setItems] = state([1, 2, 3])

// ❌ Bad - direct mutation (won't trigger updates)
items.push(4)
items[0] = 10

// ✅ Good - immutable updates via setter
setItems(prev => [...prev, 4])
setItems(prev => prev.map((item, i) => i === 0 ? 10 : item))

// For objects
const [user, setUser] = state({ name: 'John', age: 30 })

// ❌ Bad
user.age = 31

// ✅ Good
setUser(prev => ({ ...prev, age: 31 }))
```

### `flexium/no-effect-in-render`

Prevent calling effect() in component render body without proper scoping.

**Why?** Effects created during every render can cause performance issues and unexpected behavior.

```javascript
// ❌ Bad - effect created on every render without deps
const MyComponent = () => {
  effect(() => {
    console.log('This runs on every render!')
  })

  return <div>Hello</div>
}

// ✅ Good - effect with empty deps (runs once)
const MyComponent = () => {
  effect(() => {
    console.log('This runs once on mount')
  }, [])

  return <div>Hello</div>
}
```

### `flexium/no-circular-dependency`

Detect circular dependencies between computed states.

**Why?** Circular dependencies create infinite loops and will crash your application.

```javascript
// ❌ Bad - circular dependency
const [a] = state(() => b + 1, { deps: [b] })
const [b] = state(() => a + 1, { deps: [a] }) // Creates infinite loop!

// ✅ Good - no circular dependencies
const [count, setCount] = state(0)
const [doubled] = state(() => count * 2, { deps: [count] })
const [quadrupled] = state(() => doubled * 2, { deps: [doubled] })
```

### `flexium/component-naming`

Enforce PascalCase naming convention for components.

**Why?** JSX conventions expect components to use PascalCase to distinguish them from HTML elements.

```javascript
// ❌ Bad - component names should be PascalCase
const myComponent = () => <div>Hello</div>
const user_profile = () => <div>Profile</div>

// ✅ Good - PascalCase component names
const MyComponent = () => <div>Hello</div>
const UserProfile = () => <div>Profile</div>
```

### `flexium/no-signal-reassignment`

Prevent reassigning state variables.

**Why?** State variables should be updated via their setter function, not reassigned.

```javascript
const [count, setCount] = state(0)

// ❌ Bad - reassigning state variable
count = 5

// ✅ Good - use setter
setCount(5)
```

### `flexium/no-state-comparison`

Warn about comparing state values with `===` or `!==`.

**Why?** State values are Proxy-wrapped and may not compare as expected with strict equality.

```javascript
const [count, setCount] = state(0)

// ⚠️ Warning - comparing proxied state
if (count === 0) { }

// ✅ Good - use Number() or compare with primitives
if (Number(count) === 0) { }
if (count == 0) { }  // loose equality works
```

### `flexium/no-missing-dependencies`

Warn when computed state or effects reference reactive values not in deps array.

```javascript
const [a, setA] = state(1)
const [b, setB] = state(2)

// ⚠️ Warning - b is used but not in deps
const [sum] = state(() => a + b, { deps: [a] })

// ✅ Good - all dependencies listed
const [sum] = state(() => a + b, { deps: [a, b] })
```

### `flexium/effect-dependencies-complete`

Enforce complete dependency arrays in effects.

```javascript
const [count, setCount] = state(0)
const [name, setName] = state('')

// ⚠️ Warning - name is used but not in deps
effect(() => {
  console.log(count, name)
}, [count])

// ✅ Good - all dependencies listed
effect(() => {
  console.log(count, name)
}, [count, name])
```

### `flexium/prefer-computed`

Suggest using computed state instead of effect for derived values.

```javascript
const [count, setCount] = state(0)
const [doubled, setDoubled] = state(0)

// ⚠️ Warning - prefer computed for derived values
effect(() => {
  setDoubled(count * 2)
}, [count])

// ✅ Good - use computed state
const [doubled] = state(() => count * 2, { deps: [count] })
```

## Rule Severity by Configuration

| Rule | recommended | strict | all |
|------|-------------|--------|-----|
| `no-signal-outside-reactive` | warn | error | error |
| `effect-cleanup` | warn | error | error |
| `no-side-effect-in-computed` | error | error | error |
| `prefer-sync` | off | warn | error |
| `no-missing-dependencies` | warn | error | error |
| `effect-dependencies-complete` | warn | error | error |
| `no-signal-mutation` | warn | error | error |
| `no-effect-in-render` | error | error | error |
| `prefer-computed` | off | warn | error |
| `no-circular-dependency` | error | error | error |
| `component-naming` | warn | error | error |
| `no-signal-reassignment` | error | error | error |
| `no-state-comparison` | error | error | error |

## License

MIT
