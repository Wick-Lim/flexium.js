# Flexium FAQ

Frequently asked questions about Flexium and common troubleshooting tips.

## Table of Contents

- [General Questions](#general-questions)
- [Getting Started](#getting-started)
- [Signals & Reactivity](#signals--reactivity)
- [Components & JSX](#components--jsx)
- [Performance](#performance)
- [Migration & Comparison](#migration--comparison)
- [Troubleshooting](#troubleshooting)
- [Advanced Usage](#advanced-usage)

---

## General Questions

### What is Flexium?

Flexium is a next-generation UI/UX library that uses **signal-based reactivity** instead of a Virtual DOM. It provides:
- Fine-grained reactivity (only changed elements update)
- Built-in UX primitives (Motion, Form, Gesture)
- Flex-first layout components (Row, Column, Stack, Grid)
- Cross-platform rendering (Web, Canvas, React Native)
- Zero dependencies and small bundle size (< 25KB)

### How is Flexium different from React?

| Feature | React | Flexium |
|---------|-------|---------|
| **Reactivity** | Virtual DOM diffing | Direct signal-to-DOM updates |
| **Re-renders** | Entire component tree | Only changed elements |
| **State** | useState, useReducer | Signals |
| **Derived state** | useMemo | Computed |
| **Side effects** | useEffect | Effects |
| **Bundle size** | ~45KB (min) | ~8KB core, ~25KB with primitives |
| **Dependencies** | Many | Zero |
| **UX components** | Separate libraries | Built-in |

### Is Flexium production-ready?

**Current Status (v0.1.0):** Alpha release

- **Core signals:** Fully tested and working
- **DOM renderer:** Basic functionality working
- **Primitives:** Implemented but needs integration testing

**Recommended for:**
- Learning and experimentation
- Proof-of-concept projects
- Contributing to development

**Not yet recommended for:**
- Production applications
- Mission-critical projects

See [PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md) for detailed status.

### What's the license?

MIT License - free to use in commercial and personal projects.

---

## Getting Started

### How do I install Flexium?

```bash
npm install flexium
# or
yarn add flexium
# or
pnpm add flexium
```

### Do I need a build tool?

**For development:** Yes, you'll need a bundler that supports TypeScript and JSX:
- Vite (recommended)
- webpack
- esbuild
- tsup

**For production:** The build tool creates optimized bundles.

### What's the minimal setup?

1. Install Flexium
2. Configure TypeScript:
   ```json
   {
     "compilerOptions": {
       "jsx": "react-jsx",
       "jsxImportSource": "flexium"
     }
   }
   ```
3. Create your app:
   ```typescript
   import { signal } from 'flexium'
   import { render } from 'flexium/dom'

   const count = signal(0)

   const App = () => (
     <div>
       <p>Count: {count.value}</p>
       <button onclick={() => count.value++}>+</button>
     </div>
   )

   render(<App />, document.getElementById('root')!)
   ```

### Can I use Flexium without TypeScript?

Yes, but TypeScript is **highly recommended** for:
- Type safety
- Better autocomplete
- Catching errors early

JavaScript usage:
```javascript
import { signal } from 'flexium'
import { render } from 'flexium/dom'

// Works fine, but no type checking
const count = signal(0)
```

---

## Signals & Reactivity

### What are signals?

Signals are **reactive primitives** that hold values and notify subscribers when they change.

```typescript
import { signal } from 'flexium'

const count = signal(0)    // Create
count.value = 5            // Update (triggers subscribers)
console.log(count.value)   // Read
```

Unlike React's `useState`, signals:
- Work anywhere (not just in components)
- Don't require re-renders
- Update the DOM directly

### When should I use `signal()` vs `computed()`?

**Use `signal()` when:**
- Value changes directly (user input, API response)
- You need to write to the value
- State originates here

**Use `computed()` when:**
- Value derives from other signals
- Value is read-only
- You want automatic memoization

```typescript
// Base state - use signal
const items = signal([1, 2, 3, 4, 5])

// Derived state - use computed
const evenItems = computed(() =>
  items.value.filter(n => n % 2 === 0)
)

const sum = computed(() =>
  items.value.reduce((a, b) => a + b, 0)
)
```

### How do I update objects and arrays in signals?

**For objects:** Create a new object (don't mutate)
```typescript
const user = signal({ name: 'John', age: 30 })

// Wrong: Mutating doesn't trigger updates
user.value.age = 31

// Correct: Replace with new object
user.value = { ...user.value, age: 31 }
```

**For arrays:** Create a new array
```typescript
const items = signal([1, 2, 3])

// Wrong: Mutating doesn't trigger updates
items.value.push(4)

// Correct: Replace with new array
items.value = [...items.value, 4]
```

### What are effects and when should I use them?

Effects are **side effects** that run when signals change:

```typescript
import { effect } from 'flexium'

const count = signal(0)

effect(() => {
  console.log('Count is now:', count.value)
})

count.value = 1 // Effect runs
```

**Use effects for:**
- Logging
- DOM side effects (not handled by Flexium)
- localStorage synchronization
- Analytics
- API calls

**Don't use effects for:**
- Deriving values (use `computed()` instead)
- Rendering (Flexium handles this)

### How do I clean up effects?

Return a cleanup function:

```typescript
effect(() => {
  const interval = setInterval(() => {
    console.log('Tick')
  }, 1000)

  // Cleanup runs when effect re-runs or is disposed
  return () => clearInterval(interval)
})
```

### What is `batch()` and when do I need it?

`batch()` groups multiple signal updates to prevent cascading re-renders:

```typescript
import { batch } from 'flexium'

const firstName = signal('John')
const lastName = signal('Doe')

// Without batch: 2 separate updates
firstName.value = 'Jane'
lastName.value = 'Smith'

// With batch: 1 combined update
batch(() => {
  firstName.value = 'Jane'
  lastName.value = 'Smith'
})
```

**Use when:**
- Updating multiple related signals
- Optimizing performance-critical code

---

## Components & JSX

### Do I need to import `h` for JSX?

No! Flexium uses the modern JSX transform:

```typescript
// No h import needed!
export const MyComponent = () => (
  <div>Hello</div>
)
```

Just ensure `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

### How do I pass props to components?

Just like React:

```typescript
interface ButtonProps {
  text: string
  onClick: () => void
}

const Button = (props: ButtonProps) => (
  <button onclick={props.onClick}>
    {props.text}
  </button>
)

// Usage
<Button text="Click me" onClick={() => console.log('clicked')} />
```

### How do I handle events?

Use lowercase event names:

```typescript
<button onclick={() => console.log('clicked')}>Click</button>
<input oninput={(e) => console.log(e.target.value)} />
<div onmouseenter={() => console.log('hover')} />
```

### Can I use conditional rendering?

Yes, using JavaScript expressions:

```typescript
const isLoggedIn = signal(false)

const App = () => (
  <div>
    {isLoggedIn.value ? (
      <Dashboard />
    ) : (
      <Login />
    )}
  </div>
)
```

### How do I render lists?

Use `.map()`:

```typescript
const items = signal(['Apple', 'Banana', 'Cherry'])

const List = () => (
  <ul>
    {items.value.map(item => (
      <li key={item}>{item}</li>
    ))}
  </ul>
)
```

### Do I need keys for lists?

**Not currently required** by Flexium (unlike React), but recommended for:
- Better performance
- Maintaining component state
- Future compatibility

---

## Performance

### How does Flexium's performance compare to React?

Flexium is **significantly faster** for updates because:
- No Virtual DOM reconciliation
- Direct signal-to-DOM updates
- Fine-grained reactivity (only changed elements update)

**Benchmark example:**
- React: ~16ms for 1000 updates (VDOM diff + reconciliation)
- Flexium: ~0.1ms for 1000 signal updates (direct DOM)

### How do I optimize performance?

1. **Use `computed()` for expensive calculations**
   ```typescript
   // Bad: Recalculates every render
   const result = () => expensiveFunction(data.value)

   // Good: Cached
   const result = computed(() => expensiveFunction(data.value))
   ```

2. **Batch multiple updates**
   ```typescript
   batch(() => {
     signal1.value = newValue1
     signal2.value = newValue2
   })
   ```

3. **Use `untrack()` to avoid unnecessary dependencies**
   ```typescript
   effect(() => {
     console.log(tracked.value)
     const untracked = untrack(() => notTracked.value)
   })
   ```

4. **Avoid creating signals in loops**

### What's the bundle size?

| Package | Size (minified) |
|---------|-----------------|
| Core (signals only) | ~175 bytes |
| DOM renderer | ~8.6 KB |
| All primitives | ~16 KB |
| **Total (everything)** | **~25 KB** |

Compare to React + ReactDOM: ~45KB minimum

---

## Migration & Comparison

### How do I migrate from React?

| React | Flexium |
|-------|---------|
| `useState(0)` | `signal(0)` |
| `const [count, setCount] = useState(0)` | `const count = signal(0)` |
| `setCount(1)` | `count.value = 1` |
| `useMemo(() => x * 2, [x])` | `computed(() => x.value * 2)` |
| `useEffect(() => { ... }, [x])` | `effect(() => { ... })` (auto-tracks) |
| `onClick={handler}` | `onclick={handler}` (lowercase) |
| `className` | `class` |
| `htmlFor` | `for` |

See [MIGRATION.md](./MIGRATION.md) for detailed guide.

### Can I use React libraries with Flexium?

**No** - React libraries depend on React's ecosystem.

However, Flexium includes:
- Motion (animations)
- Form (validation)
- Layout primitives (Row, Column, Grid)

For other needs, use vanilla JavaScript libraries.

### How does Flexium compare to Solid.js?

Both use signals, but differ in:

| Feature | Solid.js | Flexium |
|---------|----------|---------|
| Signals | ✅ | ✅ |
| Compiler | Yes (custom JSX) | No (standard JSX) |
| UX primitives | Separate libraries | Built-in |
| Layout primitives | No | Yes (Row, Column, etc.) |
| Cross-platform | Web only | Web, Canvas, React Native |

### How does Flexium compare to Svelte?

| Feature | Svelte | Flexium |
|---------|--------|---------|
| Reactivity | Compiler magic | Explicit signals |
| Learning curve | Low | Low |
| TypeScript | Good | Excellent (built-in) |
| Bundle size | Very small | Very small |
| UX primitives | Separate | Built-in |

---

## Troubleshooting

### Why isn't my component updating?

**Check 1:** Are you forgetting `.value`?
```typescript
// Wrong
count = 5

// Correct
count.value = 5
```

**Check 2:** Are you mutating instead of replacing?
```typescript
// Wrong
items.value.push(newItem)

// Correct
items.value = [...items.value, newItem]
```

**Check 3:** Are you reading the signal in the component?
```typescript
// Wrong: Signal not read, so no tracking
const App = () => {
  const count = signal(0)
  return <div>Static</div>
}

// Correct: Reading count.value establishes dependency
const App = () => {
  const count = signal(0)
  return <div>{count.value}</div>
}
```

### Why is my effect running infinitely?

You're probably updating a signal inside an effect that tracks that same signal:

```typescript
// Infinite loop!
const count = signal(0)
effect(() => {
  count.value = count.value + 1 // Triggers itself!
})

// Fix: Use untrack if needed
effect(() => {
  const current = untrack(() => count.value)
  console.log('Count:', current)
})
```

### TypeScript errors: "Cannot find module 'flexium'"

**Solutions:**
1. Run `npm install` to ensure Flexium is installed
2. Build the package: `npm run build`
3. Restart TypeScript server: `Cmd+Shift+P` > "TypeScript: Restart TS Server"
4. Check `tsconfig.json` includes `"moduleResolution": "bundler"`

### JSX not working: "React is not defined"

Your `tsconfig.json` isn't configured correctly.

**Solution:** Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

### CORS errors when opening HTML files

**Problem:** Opening `file://` URLs triggers CORS errors for ES modules.

**Solution:** Use an HTTP server:
```bash
# Python
python3 -m http.server 8000

# Node.js
npx http-server -p 8000

# Then open http://localhost:8000
```

### Module not found errors in examples

**Solution:** Build the library first:
```bash
npm run build
```

This generates the `dist/` folder with `.mjs` files that examples import.

---

## Advanced Usage

### Can I use Flexium with Server-Side Rendering (SSR)?

**Not yet.** SSR support is planned for future releases.

Current workaround: Generate static HTML, hydrate with Flexium on client.

### How do I test Flexium components?

Use Vitest or Jest with jsdom:

```typescript
import { describe, it, expect } from 'vitest'
import { signal } from 'flexium'
import { render } from 'flexium/dom'

describe('Counter', () => {
  it('renders count', () => {
    const count = signal(5)
    const container = document.createElement('div')

    render(<div>{count.value}</div>, container)

    expect(container.textContent).toBe('5')
  })
})
```

See [BEST_PRACTICES.md](./BEST_PRACTICES.md#testing-strategies) for more.

### Can I use Flexium with Web Components?

Yes! Signals work great with Web Components:

```typescript
class CounterElement extends HTMLElement {
  private count = signal(0)

  connectedCallback() {
    this.render()

    effect(() => {
      this.querySelector('.count')!.textContent = String(this.count.value)
    })
  }

  render() {
    this.innerHTML = `
      <div class="count">${this.count.value}</div>
      <button>Increment</button>
    `
    this.querySelector('button')!.onclick = () => this.count.value++
  }
}
```

### How do I integrate with existing JavaScript apps?

Flexium can be used incrementally:

1. Add Flexium to your project
2. Start using signals for state
3. Gradually adopt Flexium components
4. No need to rewrite everything at once

```typescript
// Existing app
const legacyButton = document.querySelector('#legacy-btn')

// Add Flexium signals
const count = signal(0)

effect(() => {
  legacyButton.textContent = `Count: ${count.value}`
})

legacyButton.onclick = () => count.value++
```

### Can I build mobile apps with Flexium?

**React Native renderer is planned** but not yet implemented.

Current options:
1. Use Flexium for web views in hybrid apps (Capacitor, Cordova)
2. Wait for React Native renderer (coming soon)

### How do I contribute?

1. Read [CONTRIBUTING.md](../CONTRIBUTING.md)
2. Pick an area (signals, layout, UX, etc.)
3. Follow the relevant agent guidelines in `.claude/agents/`
4. Submit a PR

See [GitHub Issues](https://github.com/Wick-Lim/flexium.js/issues) for open tasks.

---

## Still have questions?

- Check the [API Documentation](./API.md)
- Read [Best Practices](./BEST_PRACTICES.md)
- Search [GitHub Issues](https://github.com/Wick-Lim/flexium.js/issues)
- Open a new issue with the question label

**Happy coding with Flexium!**
