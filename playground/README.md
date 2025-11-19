# Flexium Playground

A simple interactive demo of Flexium's signal-based reactivity system.

## Quick Start

**Important**: Build the library first!

```bash
# From project root, build the library
cd /path/to/flexium.js
npm install
npm run build

# Then start the playground
cd playground
npm install
npm run dev
```

The playground will open at `http://localhost:3000`

## What's Included

- Signal creation and updates
- Computed values (auto-derived state)
- Effects (console logging)
- Basic DOM rendering with h()
- Event handlers (button clicks)

## What's NOT Included

This is a **minimal demo**. It does NOT demonstrate:
- Layout primitives (Row, Column, Stack, Grid) - implemented but not in demo
- UX components (Motion, Form, Input, Button, Text) - implemented but not in demo
- Automatic reactive bindings - uses manual effects
- Full component composition

## How It Works

The playground imports from the built Flexium library:

```javascript
import { signal, computed, effect } from '../dist/index.mjs'
import { h, render } from '../dist/dom.mjs'
```

**Note**: Changes to library source require rebuilding (`npm run build` from root).

### Example: Counter with Signals

```javascript
// Create reactive signal
const count = signal(0)

// Create computed value
const doubled = computed(() => count.value * 2)

// React to changes
effect(() => {
  console.log('Count:', count.value)
})

// Update (automatically triggers effects)
count.value++
```

## Making Changes

1. Edit `main.js` to try different Flexium features
2. Changes to `main.js` will hot-reload automatically
3. **Changes to library source** require `npm run build` from root + restart dev server
4. Open browser console to see signal updates

## Troubleshooting

### "Cannot find module 'flexium'"
Build the library first: `cd .. && npm run build`

### Port 3000 already in use
Change port in `vite.config.js` or kill the process using port 3000

### Changes to library not reflected
Rebuild: `cd .. && npm run build`, then restart dev server

### Console errors
1. Check that `dist/` folder exists in project root
2. Verify imports in `main.js` point to correct paths
3. Check browser console for specific errors

## Tips

- Open DevTools console to see reactive updates in real-time
- Try clicking buttons rapidly - notice the performance
- Watch how only specific DOM nodes update, not the entire UI
- Check Network tab - no frameworks loaded, just Flexium!

## Performance Notes

Open DevTools console to see:
- Signal updates in < 0.1ms
- Only changed DOM nodes update
- No Virtual DOM overhead

## Next Steps

For more advanced examples:
- `/examples/counter` - Counter with better structure
- `/examples/todo` - Todo app with animations
- `/examples/dashboard` - Responsive dashboard
- `/docs/API.md` - Full API documentation

## Contributing

See [/CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.
