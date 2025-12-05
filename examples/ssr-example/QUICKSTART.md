# Quick Start Guide

Get the SSR example running in under 2 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Installation & Running

### Option 1: From the monorepo root

```bash
# Install all dependencies (if not already done)
npm install

# Navigate to the example
cd examples/ssr-example

# Run the development server
npm run dev
```

### Option 2: From the example directory

```bash
# Navigate to the example
cd examples/ssr-example

# Install dependencies (links to local flexium package)
npm install

# Run the development server
npm run dev
```

## Open in Browser

Open http://localhost:3000 in your browser.

You should see:
- A counter component that you can increment/decrement
- A todo list where you can add, complete, and delete tasks
- All components are server-rendered and then hydrated on the client

## What's Happening?

1. **Server Renders HTML**: The Express server renders your components to HTML using `renderToString()`
2. **Browser Receives HTML**: You see the content immediately - no loading spinner!
3. **JavaScript Loads**: The client bundle downloads in the background
4. **Hydration**: The app becomes interactive via `hydrate()` - event handlers attach, signals activate
5. **Interactive**: Click buttons, add todos - everything works!

## Try It Out

### Test Server-Side Rendering

1. Disable JavaScript in your browser
2. Refresh the page
3. Notice that the content still appears (though it's not interactive)
4. Re-enable JavaScript and refresh
5. Now the buttons work!

This demonstrates progressive enhancement - the content is available even without JavaScript.

### View the Source

Right-click and "View Page Source" to see the server-rendered HTML. You'll notice:
- Complete HTML structure
- Initial counter value (5)
- Todo items in the markup
- No loading states or spinners

### Check the Network Tab

Open Developer Tools → Network tab and refresh:
1. Initial HTML loads with content (fast!)
2. JavaScript bundles load afterwards
3. Page becomes interactive after hydration

## Next Steps

- Read the full [README.md](./README.md) for in-depth explanations
- Explore the code in `src/App.tsx` to see how components work
- Check `server.ts` to understand the SSR setup
- Modify components and see HMR in action

## Production Build

```bash
# Build for production
npm run build

# Preview the production build
npm run preview
```

The production build:
- Optimizes and minifies JavaScript
- Generates separate client and server bundles
- Runs significantly faster than development mode

## Common Issues

### Port already in use

If port 3000 is already taken:

```bash
PORT=3001 npm run dev
```

### Module not found

Make sure you're in the monorepo and have run:

```bash
npm install
```

from the root directory.

### TypeScript errors

Run the TypeScript compiler to check for errors:

```bash
npx tsc --noEmit
```

## Learn More

- [Full README](./README.md) - Detailed documentation
- [Flexium Docs](../../docs) - Framework documentation
- [SSR Implementation](../../packages/flexium/src/server/index.ts) - Source code
