# Flexium

**Next-generation UI/UX library with signal-based reactivity, flex-first layouts, and UX primitives built-in.**

> 🚧 **Work in Progress** - Flexium is currently in active development.

## Vision

Flexium is a modern UI/UX library designed to solve the problems that React introduced:

✅ **Fine-grained reactivity** - No Virtual DOM, only changed elements update
✅ **Flex-first layouts** - Row, Column, Stack primitives with inline style props
✅ **UX built-in** - Animations, forms, gestures, accessibility out-of-the-box
✅ **Cross-platform** - Same code for Web, Canvas, React Native
✅ **Zero dependencies** - < 15KB gzipped total

## Core Philosophy

1. **Flexibility over structure** - Easy to change, minimal abstractions
2. **Local-first state** - No global state management required
3. **Signal-based reactivity** - Fine-grained updates, zero VDOM
4. **UX-first components** - Motion, Form, Gesture built-in
5. **Cross-platform ready** - Web, Canvas, React Native from one codebase

## Installation

```bash
npm install flexium
# or
yarn add flexium
# or
pnpm add flexium
```

## Try It Now

**Live Playground**: Clone this repo and run the playground:

```bash
git clone https://github.com/yourusername/flexium.js.git
cd flexium.js
npm install
npm run build
cd playground
npm run dev
```

Opens at `http://localhost:3000` with a working counter example!

**Note**: Playground is currently a simple demo. Full component integration is in progress.

## Quick Start

```javascript
import { signal, computed, effect } from 'flexium'
import { h, render } from 'flexium/dom'

// Create reactive signals
const count = signal(0)
const doubled = computed(() => count.value * 2)

// Create UI with h() function
const app = h('div', {
  style: { display: 'flex', flexDirection: 'column', gap: '16px' }
}, [
  h('div', {}, [`Count: ${count.value}`]),
  h('button', {
    onclick: () => count.value++
  }, ['Increment'])
])

// Render to DOM
render(app, document.getElementById('root'))

// React to changes with effects
effect(() => {
  console.log('Count:', count.value, 'Doubled:', doubled.value)
})
```

That's it! No Virtual DOM, no build configuration, no global state setup. Just signals and fine-grained reactivity.

**Current Status**: Core signals and DOM renderer working. Layout primitives (Row, Column) and UX components (Motion, Form) implemented but integration testing in progress.

## API Overview

### Reactivity

```typescript
// Signals - reactive primitive values
const count = signal(0)
count.value++ // Updates automatically trigger re-renders

// Computed - derived values
const doubled = computed(() => count.value * 2)

// Effects - side effects that run when dependencies change
effect(() => {
  console.log('Count changed:', count.value)
})
```

### Layout Primitives

```typescript
// Row - horizontal flex layout
<Row gap={16} align="center" justify="space-between">
  <Text>Left</Text>
  <Text>Right</Text>
</Row>

// Column - vertical flex layout
<Column gap={8} padding={24}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Column>

// Stack - overlapping layers
<Stack>
  <Image src="background.jpg" />
  <Text position="absolute" top={20} left={20}>Overlay</Text>
</Stack>

// Grid - responsive grid layout
<Grid cols={{ base: 1, md: 2, lg: 3 }} gap={16}>
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
</Grid>
```

### UX Components

```typescript
// Motion - declarative animations
<Motion
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
>
  <Text>Animated content</Text>
</Motion>

// Form - validation built-in
<Form
  onSubmit={(data) => console.log(data)}
  validation={{
    email: (v) => /\S+@\S+\.\S+/.test(v) || 'Invalid email'
  }}
>
  <Input name="email" type="email" />
  <Button type="submit">Submit</Button>
</Form>
```

### Rendering

```typescript
// Render to DOM
import { render } from 'flexium/dom'
render(<App />, document.getElementById('root'))

// Render to Canvas
import { render } from 'flexium/canvas'
render(<Game />, canvas)

// Render to React Native
import { render } from 'flexium/native'
render(<MobileApp />, rootTag)
```

## Examples

Check out the `/examples` directory for complete working examples:

- **[Counter](/examples/counter)** - Simple counter demonstrating signals and reactivity
- **[Todo App](/examples/todo)** - Full-featured todo app with Motion animations
- **[Dashboard](/examples/dashboard)** - Responsive dashboard with Grid layout and real-time updates

Each example is fully self-contained and runnable.

## Documentation

- [API Documentation](/docs/API.md) - Complete API reference
- [Migration Guide](/docs/MIGRATION.md) - Migrating from React, Vue, or Svelte

## Development Status

### ✅ Completed & Working
- [x] Core signal system (signal, computed, effect, batch, untrack)
- [x] DOM renderer with h() function
- [x] Build system (TypeScript, tsup, ESM/CJS)
- [x] Layout primitives implemented (Row, Column, Stack, Grid, Spacer)
- [x] UX components implemented (Motion, Form, Input, Button, Text)
- [x] Working playground demo

### 🚧 Current Focus
- [ ] Integration testing of layout primitives with renderer
- [ ] Full reactive integration for all components
- [ ] Comprehensive test suite
- [ ] Real-world example apps

### 📋 Planned
- [ ] Canvas renderer
- [ ] React Native renderer
- [ ] Gesture component
- [ ] DevTools extension
- [ ] npm publishing

## Known Issues

1. **Reactive Integration**: Components use manual effect() calls for updates. Working on automatic reactive bindings.
2. **Type Exports**: Package.json shows warnings about "types" condition ordering (non-breaking).
3. **Testing**: Unit tests exist for signals, need integration tests for full component system.
4. **Documentation**: Component examples in docs may not match current API exactly - refer to `/src` for source of truth.

## Development Workflow

This project uses specialized AI agents to develop different aspects of the library.

### Available Commands

```bash
# Start here - setup build system
/setup-build

# Build core reactivity
/build-signal-system

# Create layout primitives
/build-layout-system

# Implement renderers
/build-renderer

# Add UX components
/build-ux-components

# Create examples and docs
/create-examples

# Quick overview
/quick-start
```

### Agent Team

Each aspect of Flexium is designed by a specialized agent:

1. **Signal System Architect** - Core reactivity engine
2. **Layout & Style System** - Flex-first primitives
3. **UX Components Specialist** - Motion, Form, Gesture
4. **Cross-Renderer Architect** - Multi-platform support
5. **Build & Package Config** - Build system and npm publishing
6. **Documentation & Examples** - Developer experience

See `.claude/agents/README.md` for detailed agent documentation.

## Project Structure

```
flexium.js/
├── .claude/
│   ├── agents/              # Specialized agent guidelines
│   │   ├── signal-architect.md
│   │   ├── layout-style-system.md
│   │   ├── ux-components-specialist.md
│   │   ├── cross-renderer-architect.md
│   │   ├── build-package-config.md
│   │   └── documentation-examples.md
│   └── commands/            # Development slash commands
│       ├── setup-build.md
│       ├── build-signal-system.md
│       ├── build-layout-system.md
│       ├── build-renderer.md
│       ├── build-ux-components.md
│       └── create-examples.md
├── src/                     # (To be created)
│   ├── core/                # Signal system + renderer interface
│   ├── primitives/          # Row, Column, Motion, Form, etc.
│   └── renderers/           # DOM, Canvas, React Native
├── examples/                # (To be created)
│   ├── web-demo/
│   ├── canvas-game/
│   └── dashboard/
├── docs/                    # (To be created)
├── package.json             # (To be created)
├── tsconfig.json            # (To be created)
└── tsup.config.ts           # (To be created)
```

## Why Flexium?

### The Problem with React

React introduced several patterns that created complexity:
- **Virtual DOM** - Unnecessary reconciliation overhead
- **Global state** - Redux/Context coupling
- **Component re-renders** - Performance issues
- **Separate libraries for UX** - Forms, animations, gestures all separate
- **Heavy abstractions** - Hard to change when requirements shift

### The Flexium Solution

- **No Virtual DOM** - Direct signal-to-DOM updates (< 0.1ms)
- **Local-first state** - Signals can be local or shared as needed
- **Fine-grained reactivity** - Only changed values trigger updates
- **UX built-in** - Motion, Form, Gesture, A11y included
- **Concrete primitives** - Row, Column, Stack (not abstract "Container")

## Performance Targets

- Signal creation: < 1ms
- Signal updates: < 0.1ms for 1000 signals
- Animations: 60fps on mobile
- Form validation: < 1ms per field
- Total bundle: < 15KB gzipped
- Memory: < 1KB per signal

## Inspiration

Flexium combines the best ideas from:
- **Solid.js** - Signal-based reactivity
- **Svelte** - Compiler optimizations
- **Tailwind** - Inline style props
- **Framer Motion** - Declarative animations
- **Flutter** - Cross-platform architecture
- **Radix UI** - Accessibility primitives

## Contributing

This project is currently in the design and initial implementation phase. Contributions are welcome!

1. Read `.claude/agents/README.md` to understand the architecture
2. Choose an area to work on (signals, layout, UX, etc.)
3. Follow the relevant agent's guidelines
4. Submit a PR with clear description

## License

MIT

---

**Built with philosophy, designed for change, optimized for UX.** 🚀
