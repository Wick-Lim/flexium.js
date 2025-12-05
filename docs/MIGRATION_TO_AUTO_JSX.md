# Migration Guide: Classic JSX to Automatic JSX Runtime

This guide explains how to migrate from the classic JSX transform (with manual `h` imports) to the new automatic JSX runtime.

## What Changed?

Flexium now supports the **automatic JSX runtime**, introduced in React 17. This means:

- **No need to import `h`** - The JSX transform is handled automatically
- **Cleaner code** - Less boilerplate in every file
- **Modern standard** - Aligns with React, Preact, and other modern frameworks

## Quick Comparison

### Before (Classic JSX)

```tsx
// Had to import h in every file that uses JSX
import { h } from 'flexium/dom';
import { signal } from 'flexium/core';

function Counter() {
  const count = signal(0);
  return <div>{count}</div>;
}
```

### After (Automatic JSX)

```tsx
// No h import needed!
import { signal } from 'flexium/core';
import { render } from 'flexium/dom';

function Counter() {
  const count = signal(0);
  return <div>{count}</div>;
}
```

## Migration Steps

### 1. Update tsconfig.json

Change your TypeScript configuration to use the automatic JSX runtime:

**Before:**
```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h"
  }
}
```

**After:**
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

### 2. Remove h Imports

Remove all `import { h }` statements from your JSX/TSX files:

**Before:**
```tsx
import { h } from 'flexium/dom';
import { signal, render } from 'flexium/dom';

function App() {
  return <div>Hello</div>;
}
```

**After:**
```tsx
import { signal } from 'flexium/core';
import { render } from 'flexium/dom';

function App() {
  return <div>Hello</div>;
}
```

### 3. Fragment Usage Unchanged

Fragments work the same way, but you don't need to import Fragment manually:

**Before:**
```tsx
import { h, Fragment } from 'flexium/dom';

function List() {
  return (
    <Fragment>
      <li>Item 1</li>
      <li>Item 2</li>
    </Fragment>
  );
}
```

**After:**
```tsx
// Fragment is available automatically
function List() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
    </>
  );
}
```

### 4. Build Configuration

If you're using a bundler like Vite, Webpack, or esbuild, update your config:

#### Vite

```js
// vite.config.js
export default {
  esbuild: {
    jsxImportSource: 'flexium'
  }
}
```

#### esbuild

```js
// esbuild.config.js
require('esbuild').build({
  jsxImportSource: 'flexium',
  jsx: 'automatic',
  // ... other options
})
```

#### Babel

```json
{
  "presets": [
    ["@babel/preset-react", {
      "runtime": "automatic",
      "importSource": "flexium"
    }]
  ]
}
```

## FAQ

### Do I need to update all files at once?

No! The classic and automatic JSX runtimes can coexist. You can migrate gradually:

```tsx
// Old file (still works)
import { h } from 'flexium/dom';
function OldComponent() {
  return <div>Old style</div>;
}

// New file (also works)
function NewComponent() {
  return <div>New style</div>;
}
```

### What if I'm using h() directly?

If you explicitly call `h()` in your code (not through JSX), you still need to import it:

```tsx
import { h } from 'flexium/dom';

// Direct h() calls still need the import
const vnode = h('div', { class: 'container' }, 'Hello');
```

### Does this affect performance?

No! The automatic JSX runtime generates the exact same virtual nodes. It's purely a developer experience improvement.

### Can I still use the classic JSX?

Yes! If you prefer the classic transform, keep your tsconfig.json as:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h"
  }
}
```

Both approaches are fully supported.

## Troubleshooting

### TypeScript Error: "Cannot find module 'flexium/jsx-runtime'"

**Solution:** Make sure you've rebuilt Flexium after updating:

```bash
npm run build
```

### Build Error: "jsx is not a function"

**Solution:** Verify your bundler configuration includes `jsxImportSource: 'flexium'`.

### Still seeing "h is not defined" error

**Solution:** Check your tsconfig.json has `"jsx": "react-jsx"`, not `"jsx": "react"`.

## Benefits of Automatic JSX

1. **Less boilerplate** - No more `import { h }` in every file
2. **Smaller bundles** - Slightly smaller after tree-shaking
3. **Future-proof** - Aligns with modern JSX standards
4. **Better DX** - One less thing to remember when creating new files

## Migration Checklist

- [ ] Update `tsconfig.json` to use `react-jsx` and `jsxImportSource`
- [ ] Update bundler config (if applicable)
- [ ] Rebuild the project
- [ ] Remove `h` imports from JSX files (optional, can be gradual)
- [ ] Test your application
- [ ] Update documentation/examples

## Example: Full Migration

Here's a complete before/after for a typical Flexium app:

### Before

```tsx
// app.tsx
import { h } from 'flexium/dom';
import { signal, render } from 'flexium/dom';

function TodoApp() {
  const todos = signal<string[]>([]);
  const input = signal('');

  const addTodo = () => {
    if (input.value.trim()) {
      todos.value = [...todos.value, input.value];
      input.value = '';
    }
  };

  return (
    <div>
      <h1>Todo App</h1>
      <input 
        value={input} 
        onChange={(e) => input.value = e.target.value}
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.value.map((todo, i) => (
          <li key={i}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}

render(<TodoApp />, document.getElementById('root')!);
```

### After

```tsx
// app.tsx
import { signal, render } from 'flexium/dom';

function TodoApp() {
  const todos = signal<string[]>([]);
  const input = signal('');

  const addTodo = () => {
    if (input.value.trim()) {
      todos.value = [...todos.value, input.value];
      input.value = '';
    }
  };

  return (
    <div>
      <h1>Todo App</h1>
      <input 
        value={input} 
        onChange={(e) => input.value = e.target.value}
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.value.map((todo, i) => (
          <li key={i}>{todo}</li>
        ))}
      </ul>
    </div>
  );
}

render(<TodoApp />, document.getElementById('root')!);
```

The only difference? One less import line. But across a large codebase, this adds up to cleaner, more maintainable code!

## Need Help?

If you encounter issues during migration:

1. Check the [documentation](../README.md)
2. Review the [examples](../examples/)
3. Open an issue on GitHub
4. Join our Discord community

---

**Updated:** 2025-11-22  
**Version:** Flexium 0.1.0+
