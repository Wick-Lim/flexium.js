# Automatic JSX Runtime

Flexium supports the React 17+ automatic JSX transform, which means you **no longer need to import `h`** when writing JSX!

## Before (Classic JSX Transform)

```tsx
import { h, render } from 'flexium/dom'  // h import required

function App() {
  return <div>Hello World</div>
}
```

## After (Automatic JSX Transform)

```tsx
import { render } from 'flexium/dom'  // No h import needed!

function App() {
  return <div>Hello World</div>
}
```

## Setup

### TypeScript Configuration

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "flexium"
  }
}
```

### Babel Configuration

If using Babel, update your `.babelrc` or `babel.config.js`:

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

### Per-File Override

You can also specify the JSX import source per-file using a pragma:

```tsx
/** @jsxImportSource flexium */

function App() {
  return <div>Hello</div>
}
```

## How It Works

When you use the automatic JSX transform:

1. TypeScript/Babel automatically imports from `flexium/jsx-runtime`
2. The `jsx()` and `jsxs()` functions are used instead of `h()`
3. Everything else works exactly the same!

## API

Flexium exports the following from `flexium/jsx-runtime`:

- `jsx(type, props)` - Creates a VNode for elements with single/no children
- `jsxs(type, props)` - Creates a VNode for elements with multiple children
- `Fragment` - Fragment component for grouping elements without a wrapper
- `jsxDEV(type, props)` - Development mode variant (imported from `flexium/jsx-dev-runtime`)

## Examples

### Basic Component

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

render(<Counter />, document.getElementById('app'))
```

### Using Fragments

```tsx
function List() {
  return (
    <>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </>
  )
}
```

### Conditional Rendering

```tsx
function Greeting({ name }: { name: string }) {
  return (
    <div>
      {name ? <h1>Hello, {name}!</h1> : <h1>Hello, Guest!</h1>}
    </div>
  )
}
```

## Backwards Compatibility

The classic JSX transform with `h()` still works! If you prefer, you can continue using:

```tsx
import { h } from 'flexium/dom'

function App() {
  return h('div', null, 'Hello World')
}
```

Both approaches are fully supported and can be mixed in the same project.

## Package Exports

Flexium provides the following exports for JSX runtime:

- `flexium/jsx-runtime` - Production runtime
- `flexium/jsx-dev-runtime` - Development runtime (with potential future enhancements)

These are automatically imported by TypeScript/Babel when using the automatic JSX transform.

## Migration Guide

### Migrating from Classic Transform

1. Update `tsconfig.json` to use `"jsx": "react-jsx"` and `"jsxImportSource": "flexium"`
2. Remove `import { h }` from your files (or keep it if you use it directly)
3. That's it! Your JSX will continue to work.

### Migrating from React

If you're coming from React, the automatic JSX transform works the same way:

- Replace `react` with `flexium` in `jsxImportSource`
- Replace React-specific imports with Flexium equivalents
- JSX syntax remains identical

## Benefits

1. **Cleaner imports** - No need to import `h` in every file
2. **Better tree-shaking** - Unused JSX helpers are automatically removed
3. **Modern standard** - Aligns with React 17+ and other modern frameworks
4. **Future optimizations** - Compiler can optimize JSX separately from runtime
5. **Smaller bundles** - Only import what you actually use

## Troubleshooting

### "Cannot use JSX unless the '--jsx' flag is provided"

Make sure your `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```

### "Cannot find module 'flexium/jsx-runtime'"

Ensure you:
1. Have the latest version of Flexium installed
2. Your build tool is configured to resolve package exports
3. You've run `npm install` or `yarn install`

### TypeScript can't find jsx-runtime types

Add to your `tsconfig.json`:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler"  // or "node16"/"nodenext"
  }
}
```

## Performance

The automatic JSX runtime has the same performance as the classic `h()` function. Under the hood:

- `jsx()` and `jsxs()` both call the same normalization logic
- The compiler chooses which function to use based on static analysis
- There's no runtime overhead compared to `h()`

## Development vs Production

Currently, `flexium/jsx-runtime` and `flexium/jsx-dev-runtime` are identical. In future versions, the dev runtime may include:

- Enhanced error messages
- Component name tracking
- Prop validation warnings
- Source location information

## Learn More

- See `/playground/counter-jsx-demo.tsx` for a working example
- See `/playground/jsx-auto-demo.tsx` for automatic transform demo
- Check out the React documentation on [the new JSX transform](https://legacy.reactjs.org/blog/2020/09/22/introducing-the-new-jsx-transform.html)
