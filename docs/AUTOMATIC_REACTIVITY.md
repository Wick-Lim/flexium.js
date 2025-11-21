# Automatic Reactive Bindings

## Overview

Flexium now supports **automatic reactive bindings**, eliminating the need for manual `effect()` calls when updating the DOM. Simply pass signals directly as children or props, and the DOM will automatically update when the signal changes.

## The Problem (Before)

Previously, developers had to manually create effects to bind signals to DOM updates:

```typescript
import { signal, effect } from 'flexium';
import { h, render } from 'flexium/dom';

const count = signal(0);

const app = h('div', {}, [
  h('p', { id: 'counter' }, ['Count: 0'])
]);

render(app, document.body);

// Manual effect required!
effect(() => {
  const element = document.getElementById('counter');
  element.textContent = `Count: ${count.value}`;
});
```

This approach was:
- **Tedious**: Required boilerplate for every reactive binding
- **Error-prone**: Easy to forget cleanup or miss dependencies
- **Not composable**: Hard to reuse reactive patterns

## The Solution (Now)

With automatic reactive bindings, signals can be used directly in your UI:

```typescript
import { signal } from 'flexium';
import { h, render } from 'flexium/dom';

const count = signal(0);

const app = h('div', {}, [
  h('p', {}, ['Count: ', count]) // That's it! Automatically reactive!
]);

render(app, document.body);
```

**The DOM automatically updates when `count.value` changes!**

## Features

### 1. Signals as Children

Pass signals directly as children to any element:

```typescript
const message = signal('Hello');

h('div', {}, [
  'Static text ',
  message,           // Signal as child
  ' more static text'
]);

// Update automatically updates the DOM
message.value = 'World';
```

### 2. Computed Values as Children

Computed signals work the same way:

```typescript
const count = signal(5);
const doubled = computed(() => count.value * 2);

h('div', {}, [
  'Count: ', count,
  ' | Doubled: ', doubled
]);
```

### 3. Signals in Props

Use signals as property values:

```typescript
const isDisabled = signal(true);
const color = signal('#ff0000');

h('button', {
  disabled: isDisabled,  // Reactive prop
  style: { color }       // Reactive style
}, ['Click Me']);

// Updates button state automatically
isDisabled.value = false;
```

### 4. Multiple Signals

Combine multiple signals in one element:

```typescript
const firstName = signal('John');
const lastName = signal('Doe');
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

h('div', {}, [
  'Name: ', fullName
]);
```

### 5. Function Components Auto-track

Function components automatically re-render when signals change:

```typescript
function Counter() {
  const count = signal(0);

  return h('div', {}, [
    h('p', {}, ['Count: ', count]),
    h('button', { onClick: () => count.value++ }, ['Increment'])
  ]);
}

// Component automatically re-renders when count changes
```

## API Reference

### Automatic Detection

Signals are automatically detected using the `isSignal()` function:

```typescript
import { isSignal } from 'flexium';

const count = signal(0);
isSignal(count); // true
isSignal(5);     // false
```

### ReactiveText Component

For more explicit reactive text rendering:

```typescript
import { ReactiveText } from 'flexium/dom';

const message = signal('Hello');

h(ReactiveText, {
  style: { fontSize: '24px', color: 'blue' }
}, [message]);
```

### bind() Helper (Advanced)

For complex prop bindings:

```typescript
import { bind } from 'flexium/dom';

const state = signal({ x: 0, y: 0 });

h('div', {
  ...bind(state, (val) => ({
    style: {
      transform: `translate(${val.x}px, ${val.y}px)`
    }
  }))
});
```

## How It Works

### Signal Detection

1. Signals are marked with an internal symbol during creation
2. The `isSignal()` function checks for this marker
3. The renderer automatically detects signals in children and props

### Automatic Effect Creation

When a signal is detected:

1. **In children**: A reactive text node is created with an effect that updates on signal changes
2. **In props**: An effect is created to update the DOM property when the signal changes
3. **In components**: The entire component function runs inside an effect

### Cleanup

All effects are automatically cleaned up when:
- Elements are removed from the DOM
- Components are unmounted
- The reactive root is disposed

### Performance

- **Fine-grained updates**: Only affected DOM nodes update, not the entire tree
- **Memoization**: Computed values cache results
- **Batching**: Multiple signal changes in one tick are batched together

## Migration Guide

### Before: Manual Effects

```typescript
// Old approach
const count = signal(0);
const element = h('div', { id: 'counter' }, ['0']);
render(element, container);

effect(() => {
  document.getElementById('counter').textContent = String(count.value);
});
```

### After: Automatic Reactivity

```typescript
// New approach
const count = signal(0);
const element = h('div', {}, [count]);
render(element, container);
```

### Before: Computed with Effect

```typescript
// Old approach
const count = signal(0);
const doubled = computed(() => count.value * 2);

effect(() => {
  const element = document.getElementById('result');
  element.textContent = `${count.value} × 2 = ${doubled.value}`;
});
```

### After: Direct Usage

```typescript
// New approach
const count = signal(0);
const doubled = computed(() => count.value * 2);

h('div', {}, [count, ' × 2 = ', doubled]);
```

## Best Practices

### ✅ Do

```typescript
// Use signals directly
h('div', {}, [count])

// Combine static and reactive content
h('div', {}, ['Count: ', count])

// Use computed for derived values
const doubled = computed(() => count.value * 2);
h('div', {}, [doubled])

// Use signals in props
h('button', { disabled: isDisabled }, ['Click'])
```

### ❌ Don't

```typescript
// Don't convert to string manually
h('div', {}, [String(count.value)]) // Won't update!

// Don't use .value in render
h('div', {}, [count.value]) // Only updates on re-render

// Don't create unnecessary effects
effect(() => {
  // Not needed anymore!
  element.textContent = count.value;
});
```

## Examples

### Counter

```typescript
import { signal } from 'flexium';
import { h, render } from 'flexium/dom';

function Counter() {
  const count = signal(0);

  return h('div', {}, [
    h('h1', {}, ['Counter']),
    h('p', {}, ['Count: ', count]),
    h('button', { onClick: () => count.value++ }, ['Increment']),
    h('button', { onClick: () => count.value-- }, ['Decrement'])
  ]);
}

render(h(Counter), document.body);
```

### Form with Reactive Validation

```typescript
import { signal, computed } from 'flexium';
import { h, render } from 'flexium/dom';

function Form() {
  const email = signal('');
  const isValid = computed(() => email.value.includes('@'));
  const buttonColor = computed(() =>
    isValid.value ? '#4CAF50' : '#cccccc'
  );

  return h('div', {}, [
    h('input', {
      type: 'email',
      value: email.peek(),
      onInput: (e) => email.value = e.target.value,
      placeholder: 'Enter email'
    }),
    h('button', {
      disabled: computed(() => !isValid.value),
      style: { backgroundColor: buttonColor }
    }, ['Submit'])
  ]);
}

render(h(Form), document.body);
```

### Real-time Dashboard

```typescript
import { signal, computed } from 'flexium';
import { h, render } from 'flexium/dom';

function Dashboard() {
  const temperature = signal(72);
  const humidity = signal(45);

  const comfort = computed(() => {
    const temp = temperature.value;
    const hum = humidity.value;
    if (temp < 68 || temp > 76) return 'Uncomfortable';
    if (hum < 30 || hum > 60) return 'Dry/Humid';
    return 'Comfortable';
  });

  return h('div', {}, [
    h('h1', {}, ['Climate Dashboard']),
    h('div', {}, [
      h('p', {}, ['Temperature: ', temperature, '°F']),
      h('p', {}, ['Humidity: ', humidity, '%']),
      h('p', {}, ['Status: ', comfort])
    ])
  ]);
}

render(h(Dashboard), document.body);

// Simulate sensor updates
setInterval(() => {
  temperature.value = 70 + Math.random() * 6;
  humidity.value = 40 + Math.random() * 20;
}, 2000);
```

## Comparison with Other Frameworks

### React

```typescript
// React (requires useState and re-renders)
function Counter() {
  const [count, setCount] = useState(0);
  return <div>Count: {count}</div>; // Full component re-renders
}

// Flexium (fine-grained, no re-renders)
function Counter() {
  const count = signal(0);
  return h('div', {}, ['Count: ', count]); // Only text updates
}
```

### Vue

```typescript
// Vue (requires ref and template)
const count = ref(0);
<div>Count: {{ count }}</div>

// Flexium (similar but in JS)
const count = signal(0);
h('div', {}, ['Count: ', count])
```

### Solid.js

```typescript
// Solid.js (very similar!)
const [count, setCount] = createSignal(0);
<div>Count: {count()}</div>

// Flexium (same concept, slightly different API)
const count = signal(0);
h('div', {}, ['Count: ', count])
```

## Technical Details

### Signal Marker

Signals are marked with a symbol for efficient detection:

```typescript
const SIGNAL_MARKER = Symbol('flexium.signal');

// Added to all signals and computed values
(signal as any)[SIGNAL_MARKER] = true;

// Detection
function isSignal(value: any): boolean {
  return value !== null
    && typeof value === 'function'
    && SIGNAL_MARKER in value;
}
```

### Reactive Mounting

The `mountReactive()` function handles signal detection:

```typescript
export function mountReactive(vnode: VNode | Signal<any> | string | number) {
  // Detect signals
  if (isSignal(vnode)) {
    const textNode = document.createTextNode('');
    effect(() => {
      textNode.textContent = String(vnode.value);
    });
    return textNode;
  }

  // Handle other node types...
}
```

### Props Reactivity

Props are scanned for signals:

```typescript
function setupReactiveProps(node: HTMLElement, props: Record<string, any>) {
  for (const key in props) {
    const value = props[key];

    if (isSignal(value)) {
      effect(() => {
        updateNode(node, { [key]: value.value });
      });
    }
  }
}
```

## Troubleshooting

### Signal Not Updating

**Problem**: Signal changes but DOM doesn't update

```typescript
// ❌ Wrong: accessing .value in render
h('div', {}, [count.value])

// ✅ Right: pass signal directly
h('div', {}, [count])
```

### Memory Leaks

**Problem**: Effects not cleaning up

**Solution**: Use the reactive render functions:
```typescript
// Automatic cleanup
import { render } from 'flexium/dom';
render(app, container);

// Or use createReactiveRoot
const root = createReactiveRoot(container);
root.render(app);
// Later: root.unmount(); // Cleans up all effects
```

### Performance Issues

**Problem**: Too many re-renders

**Solution**: Use computed values:
```typescript
// ❌ Wrong: creates many effects
h('div', {}, [
  signal1.value + signal2.value + signal3.value
])

// ✅ Right: single computed
const sum = computed(() =>
  signal1.value + signal2.value + signal3.value
);
h('div', {}, [sum])
```

## Future Enhancements

Planned features for automatic reactivity:

1. **Array reactivity**: Automatically detect array changes
2. **Object reactivity**: Deep reactivity for nested objects
3. **Transition hooks**: Animate when signals change
4. **DevTools**: Visualize reactive dependencies
5. **SSR support**: Server-side rendering with hydration

## Conclusion

Automatic reactive bindings make Flexium more ergonomic and productive. The system:

- **Just works**: No boilerplate required
- **Performs well**: Fine-grained updates only
- **Cleans up**: Automatic effect disposal
- **Stays small**: Minimal overhead

Start using signals directly in your UI today!
