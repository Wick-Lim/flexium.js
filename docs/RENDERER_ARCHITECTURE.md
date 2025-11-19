# Cross-Renderer Architecture

This document explains the cross-renderer architecture of Flexium, which enables writing components once and rendering them to multiple platforms (DOM, Canvas, React Native, etc.).

## Architecture Overview

The renderer system is built on three core layers:

```
┌─────────────────────────────────────────┐
│     Platform-Agnostic Components        │
│  (Row, Column, Text, Button, etc.)      │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Renderer Interface               │
│  (createNode, updateNode, appendChild)   │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
┌───────▼───┐ ┌──▼────┐ ┌──▼──────┐
│    DOM    │ │Canvas │ │React    │
│ Renderer  │ │Render │ │Native   │
└───────────┘ └───────┘ └─────────┘
```

## Core Components

### 1. Renderer Interface (`src/core/renderer.ts`)

The `Renderer` interface defines the contract that all platform-specific renderers must implement:

```typescript
interface Renderer {
  createNode(type: string, props: Record<string, any>): RenderNode;
  updateNode(node: RenderNode, oldProps: Record<string, any>, newProps: Record<string, any>): void;
  appendChild(parent: RenderNode, child: RenderNode): void;
  insertBefore(parent: RenderNode, child: RenderNode, beforeChild: RenderNode): void;
  removeChild(parent: RenderNode, child: RenderNode): void;
  createTextNode(text: string): RenderNode;
  updateTextNode(node: RenderNode, text: string): void;
  addEventListener(node: RenderNode, event: string, handler: EventHandler): void;
  removeEventListener(node: RenderNode, event: string, handler: EventHandler): void;
}
```

### 2. DOM Renderer (`src/renderers/dom/index.ts`)

The DOM renderer implements the `Renderer` interface for browser environments:

**Key Features:**
- Maps component types to HTML elements (e.g., `Row` → `<div>` with flexbox)
- Converts platform-agnostic props to CSS styles
- Translates unified events to DOM events (e.g., `onPress` → `click`)
- Manages event listener cleanup
- Efficient DOM updates

**Type Mapping:**
```typescript
const ELEMENT_MAPPING = {
  Row: 'div',        // with display: flex, flex-direction: row
  Column: 'div',     // with display: flex, flex-direction: column
  Stack: 'div',      // with display: flex
  Text: 'span',
  Button: 'button',
  Input: 'input',
  View: 'div',
};
```

**Event Mapping:**
```typescript
const EVENT_MAPPING = {
  onPress: 'click',
  onHover: 'mouseenter',
  onChange: 'input',
  onFocus: 'focus',
  onBlur: 'blur',
};
```

### 3. JSX Factory (`src/renderers/dom/h.ts`)

The `h` function is the JSX factory that transforms JSX syntax into virtual nodes:

```typescript
// JSX
<Row gap={16}>
  <Text>Hello</Text>
</Row>

// Transforms to
h('Row', { gap: 16 }, h('Text', null, 'Hello'))

// Returns
{
  type: 'Row',
  props: { gap: 16 },
  children: [
    { type: 'Text', props: {}, children: ['Hello'] }
  ]
}
```

### 4. Render Function (`src/renderers/dom/render.ts`)

The render system provides mounting and reconciliation:

**Basic Rendering:**
```typescript
import { render } from 'flexium/dom';

render(<App />, document.getElementById('root'));
```

**Reactive Rendering:**
```typescript
import { createRoot } from 'flexium/dom';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
root.unmount(); // cleanup
```

### 5. Reactive Integration (`src/renderers/dom/reactive.ts`)

The reactive system integrates signals with the renderer for fine-grained updates:

**Features:**
- Automatic dependency tracking
- Only re-renders affected components
- No Virtual DOM diffing needed
- Direct signal-to-DOM updates

**Example:**
```typescript
import { signal } from 'flexium';
import { createReactiveRoot } from 'flexium/dom';

function Counter() {
  const count = signal(0);

  // When count changes, only the text node updates
  return (
    <Column>
      <Text>Count: {count.value}</Text>
      <Button onPress={() => count.value++}>Increment</Button>
    </Column>
  );
}

const root = createReactiveRoot(container);
root.render(<Counter />);
```

## Platform-Agnostic Props

All renderers support a common set of props:

### Layout Props
```typescript
{
  width: number | string,
  height: number | string,
  padding: number,
  margin: number,
  gap: number,
  flex: number,
}
```

### Flexbox Props
```typescript
{
  flexDirection: 'row' | 'column',
  justifyContent: 'flex-start' | 'center' | 'space-between' | ...,
  alignItems: 'flex-start' | 'center' | 'stretch' | ...,
  flexWrap: 'nowrap' | 'wrap',
}
```

### Visual Props
```typescript
{
  bg: string,              // background color
  color: string,           // text color
  borderRadius: number,
  borderWidth: number,
  borderColor: string,
  opacity: number,
}
```

### Typography Props
```typescript
{
  fontSize: number,
  fontWeight: number | string,
  fontFamily: string,
  lineHeight: number,
  textAlign: 'left' | 'center' | 'right',
}
```

### Event Props
```typescript
{
  onPress: (event) => void,    // Universal click/touch
  onHover: (event) => void,
  onChange: (event) => void,
  onFocus: (event) => void,
  onBlur: (event) => void,
}
```

## Implementation Details

### Component Lifecycle

1. **Mount Phase:**
   ```
   VNode → createElement → updateNode → appendChild
   ```

2. **Update Phase:**
   ```
   Old VNode + New VNode → updateNode (diff props)
   ```

3. **Unmount Phase:**
   ```
   removeChild → cleanup listeners → cleanup effects
   ```

### Reactive Updates

The reactive system uses signals for fine-grained reactivity:

```typescript
// 1. Signal created
const count = signal(0);

// 2. Effect tracks dependency
effect(() => {
  console.log('Count:', count.value); // Reads count.value
});

// 3. Signal updated
count.value++; // Triggers effect

// 4. Only dependent effects run (no VDOM diff)
```

### Memory Management

The DOM renderer manages memory through:

1. **WeakMaps** for storing node data (auto garbage collected)
2. **Event listener tracking** for proper cleanup
3. **Effect disposal** when components unmount

```typescript
// Automatic cleanup on unmount
const dispose = effect(() => {
  // Effect logic
  return () => {
    // Cleanup logic
  };
});
```

## Performance Characteristics

### DOM Renderer
- **Initial render:** O(n) where n = number of nodes
- **Update:** O(changed) - only changed nodes update
- **Memory:** ~200 bytes per node
- **Event handlers:** WeakMap overhead + handler size

### Signal Updates
- **Signal read:** < 0.01ms (direct property access)
- **Signal write:** < 0.1ms (notify subscribers)
- **Effect execution:** Depends on effect complexity

## Future Renderers

### Canvas Renderer (Planned)
```typescript
// Same component code
<Row gap={16}>
  <Text>Hello Canvas</Text>
</Row>

// Renders to Canvas API
import { render } from 'flexium/canvas';
render(<App />, canvas);
```

### React Native Renderer (Planned)
```typescript
// Same component code
<Row gap={16}>
  <Text>Hello Mobile</Text>
</Row>

// Renders to React Native
import { render } from 'flexium/native';
render(<App />, rootTag);
```

## Best Practices

### 1. Keep Components Platform-Agnostic

```typescript
// ✅ Good - platform-agnostic
function Button({ children, onPress }) {
  return (
    <Touchable onPress={onPress} padding={12} borderRadius={4}>
      <Text>{children}</Text>
    </Touchable>
  );
}

// ❌ Bad - DOM-specific
function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}
```

### 2. Use Unified Event Names

```typescript
// ✅ Good - onPress works everywhere
<Button onPress={() => console.log('clicked')} />

// ❌ Bad - onClick is DOM-specific
<Button onClick={() => console.log('clicked')} />
```

### 3. Prefer Signals for State

```typescript
// ✅ Good - fine-grained reactivity
const count = signal(0);

// ❌ Bad - requires VDOM diffing
const [count, setCount] = useState(0);
```

### 4. Batch Multiple Updates

```typescript
import { batch } from 'flexium';

// ✅ Good - single update
batch(() => {
  count.value++;
  name.value = 'new';
  items.value = [...items.value, newItem];
});

// ❌ Bad - three separate updates
count.value++;
name.value = 'new';
items.value = [...items.value, newItem];
```

## Testing

Each renderer can be tested independently:

```typescript
import { domRenderer } from 'flexium/dom';

describe('DOMRenderer', () => {
  it('creates nodes', () => {
    const node = domRenderer.createNode('Row', { gap: 16 });
    expect(node.style.gap).toBe('16px');
    expect(node.style.display).toBe('flex');
  });

  it('updates nodes', () => {
    const node = domRenderer.createNode('Row', {});
    domRenderer.updateNode(node, {}, { bg: 'red' });
    expect(node.style.backgroundColor).toBe('red');
  });
});
```

## Package Structure

```
flexium/
├── core/
│   ├── signal.ts         # Reactivity system
│   └── renderer.ts       # Renderer interface
└── renderers/
    ├── dom/
    │   ├── index.ts      # DOM renderer
    │   ├── h.ts          # JSX factory
    │   ├── render.ts     # Mounting/reconciliation
    │   └── reactive.ts   # Reactive integration
    ├── canvas/           # (Future)
    └── native/           # (Future)
```

## Exports

```typescript
// Core
import { signal, computed, effect } from 'flexium';

// DOM Renderer
import { render, createRoot, h } from 'flexium/dom';

// Canvas Renderer (future)
import { render } from 'flexium/canvas';

// React Native (future)
import { render } from 'flexium/native';
```

## Contributing

To add a new renderer:

1. Implement the `Renderer` interface
2. Handle all platform-agnostic props
3. Map unified events to platform events
4. Test with existing components
5. Document platform-specific behaviors

See `.claude/agents/cross-renderer-architect.md` for detailed guidelines.
