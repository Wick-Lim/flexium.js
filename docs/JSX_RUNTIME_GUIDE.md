# Flexium JSX Runtime Guide

## Quick Start

### The Old Way (Classic JSX)
```tsx
import { h, render } from 'flexium/dom'  // Must import h

function App() {
  return <div>Hello World</div>
}

render(<App />, document.getElementById('app'))
```

### The New Way (Automatic JSX)
```tsx
import { render } from 'flexium/dom'  // No h import!

function App() {
  return <div>Hello World</div>
}

render(<App />, document.getElementById('app'))
```

## Setup

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

That's it! Start using JSX without importing `h`.

## What's New?

Flexium now exports two new entry points:

1. **`flexium/jsx-runtime`** - Production JSX runtime
2. **`flexium/jsx-dev-runtime`** - Development JSX runtime

When you use `jsx: "react-jsx"`, TypeScript automatically imports from these modules instead of requiring you to manually import `h`.

## How It Works

### Before Compilation
```tsx
function Button({ label }) {
  return <button>{label}</button>
}
```

### After TypeScript Compilation
```javascript
import { jsx as _jsx } from 'flexium/jsx-runtime'

function Button({ label }) {
  return _jsx('button', { children: label })
}
```

TypeScript handles the import automatically - you don't write it!

## API Reference

### jsx(type, props)

Creates a VNode for JSX elements.

```typescript
function jsx(
  type: string | Function,
  props: Record<string, any>
): VNode
```

**Parameters:**
- `type` - Element type (string for HTML, function for components)
- `props` - Element properties including `children` and `key`

**Returns:** VNode object compatible with Flexium renderers

**Example:**
```javascript
// TypeScript generates this:
jsx('div', {
  className: 'container',
  children: 'Hello'
})

// Which creates:
{
  type: 'div',
  props: { className: 'container' },
  children: ['Hello'],
  key: undefined
}
```

### jsxs(type, props)

Creates a VNode for JSX elements with static children (optimization hint).

```typescript
function jsxs(
  type: string | Function,
  props: Record<string, any>
): VNode
```

For Flexium, `jsxs` is identical to `jsx`. Different compilers use this as a hint for optimization.

### Fragment(props)

Fragment component for grouping elements without a wrapper.

```typescript
function Fragment(props: {
  children?: any[]
}): VNode
```

**Usage:**
```tsx
function List() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
    </>
  )
}
```

### jsxDEV(type, props)

Development mode variant of `jsx`. Currently identical to `jsx`, but future versions may include:
- Enhanced error messages
- Prop validation
- Performance warnings

## Examples

### Basic Counter
```tsx
import { signal } from 'flexium'
import { render } from 'flexium/dom'

function Counter() {
  const count = signal(0)

  return (
    <div>
      <h1>Count: {count.value}</h1>
      <button onclick={() => count.value++}>
        Increment
      </button>
    </div>
  )
}

render(<Counter />, document.getElementById('app'))
```

### Todo List
```tsx
import { signal } from 'flexium'
import { render } from 'flexium/dom'

function TodoList() {
  const todos = signal([
    { id: 1, text: 'Learn Flexium', done: false },
    { id: 2, text: 'Build an app', done: false }
  ])

  const addTodo = (text) => {
    todos.value = [
      ...todos.value,
      { id: Date.now(), text, done: false }
    ]
  }

  return (
    <div>
      <h1>Todos</h1>
      <ul>
        {todos.value.map(todo => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
            />
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Conditional Rendering
```tsx
function Greeting({ user }) {
  return (
    <div>
      {user ? (
        <h1>Welcome back, {user.name}!</h1>
      ) : (
        <h1>Welcome, Guest!</h1>
      )}
    </div>
  )
}
```

### Lists and Keys
```tsx
function ItemList({ items }) {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  )
}
```

### Fragments
```tsx
function TableRow() {
  return (
    <>
      <td>Cell 1</td>
      <td>Cell 2</td>
      <td>Cell 3</td>
    </>
  )
}
```

## Configuration

### TypeScript

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium",
    "moduleResolution": "bundler"
  }
}
```

**Per-file override:**
```tsx
/** @jsxImportSource flexium */

function App() {
  return <div>Hello</div>
}
```

### Babel

**babel.config.js:**
```javascript
module.exports = {
  presets: [
    ['@babel/preset-react', {
      runtime: 'automatic',
      importSource: 'flexium'
    }]
  ]
}
```

### Vite

**vite.config.js:**
```javascript
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxImportSource: 'flexium'
  }
})
```

### Webpack

**webpack.config.js:**
```javascript
module.exports = {
  module: {
    rules: [
      {
        test: /\\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              jsx: 'react-jsx',
              jsxImportSource: 'flexium'
            }
          }
        }
      }
    ]
  }
}
```

## Migration Guide

### From Classic Flexium JSX

**Before:**
```tsx
import { h, render } from 'flexium/dom'

function App() {
  return h('div', null,
    h('h1', null, 'Hello'),
    h('p', null, 'World')
  )
}
```

**After:**
```tsx
import { render } from 'flexium/dom'

function App() {
  return (
    <div>
      <h1>Hello</h1>
      <p>World</p>
    </div>
  )
}
```

**Steps:**
1. Update `tsconfig.json` to use `"jsx": "react-jsx"`
2. Remove `h` imports (or keep them if used manually)
3. Rebuild your project
4. Done!

### From React

**Before (React):**
```tsx
import React from 'react'
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

**After (Flexium):**
```tsx
import { signal } from 'flexium'
import { render } from 'flexium/dom'

function Counter() {
  const count = signal(0)

  return (
    <div>
      <h1>Count: {count.value}</h1>
      <button onclick={() => count.value++}>+</button>
    </div>
  )
}
```

**Key Differences:**
- `useState` → `signal`
- `count` → `count.value`
- `onClick` → `onclick` (lowercase)
- `className` → `class` (Flexium uses native HTML attributes)

## Troubleshooting

### "Cannot use JSX unless the '--jsx' flag is provided"

**Problem:** TypeScript isn't configured for JSX

**Solution:** Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

### "Cannot find module 'flexium/jsx-runtime'"

**Problem:** Module resolution not configured

**Solution:** Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"
  }
}
```

### h is not defined

**Problem:** Using old JSX transform setting

**Solution:** Change from `"jsx": "react"` to `"jsx": "react-jsx"` in tsconfig.json

### Types not working

**Problem:** TypeScript can't find type definitions

**Solution:**
1. Ensure Flexium is installed: `npm install flexium`
2. Check `node_modules/flexium/dist/jsx-runtime.d.ts` exists
3. Restart TypeScript server in your IDE

### Import from wrong source

**Problem:** Accidentally importing from wrong package

**Solution:** Ensure `jsxImportSource` is set to `"flexium"`, not `"react"`

## Performance

### Bundle Size

The automatic JSX runtime is **smaller** than the classic transform:

**Classic:**
```javascript
import { h } from 'flexium/dom'  // Import h everywhere
// ~500B per file importing h
```

**Automatic:**
```javascript
import { jsx } from 'flexium/jsx-runtime'  // Auto-imported once
// ~160B total
```

### Runtime Performance

- **Zero overhead** - Same VNode creation as classic `h()`
- **Better tree-shaking** - Unused helpers removed automatically
- **Optimized bundles** - Compiler can optimize based on usage

### Build Time

- **Faster compilation** - Simpler transform
- **Better caching** - Compiler can cache jsx-runtime imports

## Advanced Usage

### Manual jsx() Calls

You can still call `jsx()` manually if needed:

```tsx
import { jsx } from 'flexium/jsx-runtime'

function createButton(label) {
  return jsx('button', { children: label })
}
```

### Mixed Classic and Automatic

```tsx
import { h } from 'flexium/dom'

function App() {
  return (
    <div>
      {/* Automatic transform */}
      <h1>Title</h1>

      {/* Manual h() call */}
      {h('p', { class: 'text' }, 'Paragraph')}
    </div>
  )
}
```

### Custom JSX Factory

For special cases, you can override per-file:

```tsx
/** @jsxImportSource custom-runtime */

function App() {
  return <div>Uses custom-runtime/jsx-runtime</div>
}
```

### Component Types

```typescript
import type { VNode } from 'flexium'

// Functional component type
type FC<P = {}> = (props: P) => VNode

// Example usage
const Button: FC<{ label: string }> = ({ label }) => {
  return <button>{label}</button>
}
```

## Comparison with Other Frameworks

### React
- ✅ Same automatic JSX transform
- ✅ Same `jsxImportSource` config
- ✅ Same Fragment syntax
- ⚠️ Different reactivity (signals vs hooks)

### Preact
- ✅ Similar automatic JSX transform
- ✅ Similar size goals
- ⚠️ Different runtime API
- ⚠️ Different component model

### Solid.js
- ✅ Both use signals
- ✅ Both support automatic JSX
- ⚠️ Different JSX runtime implementation
- ⚠️ Different component model

## FAQ

**Q: Do I need to update existing code?**
A: No! The classic `h()` function still works. Update when convenient.

**Q: Can I use both transforms?**
A: Yes! Classic and automatic can coexist in the same project.

**Q: Is it faster?**
A: Same runtime performance, but smaller bundles and better tree-shaking.

**Q: Does it work with all build tools?**
A: Yes! Works with TypeScript, Babel, Vite, Webpack, Rollup, etc.

**Q: What about Fragment?**
A: Fragments work the same with `<>...</>` syntax.

**Q: Can I opt out?**
A: Yes! Keep using `"jsx": "react"` and `import { h }` if you prefer.

**Q: Is it backwards compatible?**
A: 100%! No breaking changes to existing code.

## Resources

- [Documentation](/docs/jsx-runtime.md)
- [Implementation Summary](/JSX_RUNTIME_IMPLEMENTATION.md)
- [Examples](/examples/)
- [Playground](/playground/)

## Next Steps

1. **Update your tsconfig.json** to use `"jsx": "react-jsx"`
2. **Try it out** with a simple component
3. **Gradually migrate** your codebase
4. **Enjoy cleaner imports!**

---

**Made with Flexium** - A lightweight, signals-based UI framework
