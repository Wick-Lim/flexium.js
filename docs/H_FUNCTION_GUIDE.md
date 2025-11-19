# h() Function Guide

The `h()` function is Flexium's JSX factory function that creates virtual nodes (VNodes). These VNodes can then be rendered to actual DOM elements using the `render()` or `createReactiveRoot()` functions.

## Table of Contents
- [Basic Usage](#basic-usage)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Integration with Signals](#integration-with-signals)

## Basic Usage

```javascript
import { h, render } from 'flexium/dom';

// Create a simple button
const button = h('button',
  { onclick: () => alert('clicked') },
  ['Click me']
);

// Render to DOM
render(button, document.body);
```

## How It Works

The `h()` function follows a two-phase rendering model:

1. **VNode Creation** - `h()` creates a virtual node (VNode) - a lightweight JavaScript object
2. **DOM Rendering** - `render()` or `createReactiveRoot()` converts VNodes to actual DOM elements

### Why This Approach?

- **Separation of Concerns**: VNode creation is separate from DOM manipulation
- **Platform Agnostic**: VNodes can be rendered to different targets (DOM, Canvas, React Native)
- **Testable**: VNodes are plain objects that can be inspected and tested
- **Optimizable**: The renderer can diff VNodes before updating the DOM

## API Reference

### h(type, props, children)

Creates a virtual node.

**Parameters:**
- `type` (string | Function): Element type or component function
  - String: HTML element name ('div', 'button', 'span', etc.)
  - Function: Component function that returns a VNode
- `props` (object | null): Element properties and attributes
  - Event handlers (onclick, onchange, etc.)
  - DOM attributes (className, id, disabled, etc.)
  - Style properties (style, className)
  - Custom props for components
- `children` (array): Child elements
  - Strings/numbers (rendered as text nodes)
  - VNodes (nested elements)
  - Arrays of children (flattened automatically)

**Returns:** VNode object with structure:
```javascript
{
  type: string | Function,
  props: object,
  children: array,
  key?: string | number
}
```

### render(vnode, container)

Renders a VNode to a DOM container (one-time render).

**Parameters:**
- `vnode` (VNode | string | number): Virtual node to render
- `container` (HTMLElement): DOM element to render into

**Returns:** DOM Node | null

### createReactiveRoot(container)

Creates a reactive root for automatic updates when signals change.

**Parameters:**
- `container` (HTMLElement): DOM element to render into

**Returns:** Object with methods:
- `render(vnode)`: Render/update the VNode
- `unmount()`: Clean up and remove

## Examples

### 1. Basic Element

```javascript
import { h, render } from 'flexium/dom';

const div = h('div',
  { className: 'container' },
  ['Hello World']
);

render(div, document.body);
```

### 2. Element with Events

```javascript
const button = h('button',
  {
    className: 'btn-primary',
    onclick: () => console.log('Clicked!'),
    disabled: false
  },
  ['Click Me']
);

render(button, document.body);
```

### 3. Nested Elements

```javascript
const card = h('div',
  { className: 'card' },
  [
    h('h1', {}, ['Card Title']),
    h('p', {}, ['Card description text']),
    h('button', { onclick: () => {} }, ['Action'])
  ]
);

render(card, document.body);
```

### 4. Lists and Arrays

```javascript
const list = h('ul', {},
  ['Apple', 'Banana', 'Orange'].map(fruit =>
    h('li', {}, [fruit])
  )
);

render(list, document.body);
```

### 5. Styled Elements

```javascript
const styled = h('div',
  {
    style: 'padding: 20px; background: #f0f0f0; border-radius: 8px;',
    className: 'styled-box'
  },
  ['Styled content']
);

render(styled, document.body);
```

### 6. Mixed Children (Text + Elements)

```javascript
const mixed = h('div', {},
  [
    'Text before ',
    h('strong', {}, ['bold text']),
    ' text after'
  ]
);

render(mixed, document.body);
```

### 7. Component Functions

```javascript
function Card({ title, content }) {
  return h('div',
    { className: 'card' },
    [
      h('h2', {}, [title]),
      h('p', {}, [content])
    ]
  );
}

const card = Card({ title: 'Hello', content: 'World' });
render(card, document.body);
```

## Integration with Signals

The real power of `h()` comes when combined with Flexium's signal system for reactive updates.

### Basic Reactive Example

```javascript
import { h, signal, createReactiveRoot } from 'flexium/dom';

const count = signal(0);

function Counter() {
  return h('div', {}, [
    h('div', {}, [`Count: ${count.value}`]),
    h('button',
      { onclick: () => count.value++ },
      ['Increment']
    )
  ]);
}

const root = createReactiveRoot(document.body);
root.render(Counter());

// When count changes, the UI automatically updates!
```

### Reactive Props

```javascript
const color = signal('blue');

function ColorBox() {
  return h('div',
    {
      style: `background: ${color.value}; padding: 20px;`
    },
    [
      h('button',
        { onclick: () => color.value = 'red' },
        ['Make Red']
      )
    ]
  );
}

const root = createReactiveRoot(document.body);
root.render(ColorBox());
```

### Multiple Signals

```javascript
const name = signal('World');
const count = signal(0);

function App() {
  return h('div', {}, [
    h('h1', {}, [`Hello, ${name.value}!`]),
    h('p', {}, [`Count: ${count.value}`]),
    h('input', {
      type: 'text',
      value: name.value,
      oninput: (e) => name.value = e.target.value
    }, []),
    h('button',
      { onclick: () => count.value++ },
      ['Increment']
    )
  ]);
}

const root = createReactiveRoot(document.body);
root.render(App());
```

## Current Implementation Features

The h() function currently supports:

- [x] Element creation (div, button, span, etc)
- [x] Props handling (style, className, attributes)
- [x] Event handlers (onclick -> addEventListener)
- [x] Children (text, arrays, nested elements)
- [x] Component functions
- [x] Fragments
- [x] Signal integration via reactive roots
- [x] Nested arrays (automatic flattening)
- [x] Mixed content (text + elements)

## Working Examples

See the following files for working examples:

1. **examples/simple-h-test.html** - Basic h() usage
2. **examples/basic-h-function.html** - Comprehensive demos including:
   - Basic element creation
   - Event handling
   - Nested elements
   - Reactive counter with signals
   - Complex multi-signal components

3. **test-h-function.mjs** - Node.js test suite

## Usage Patterns

### Pattern 1: Direct Render (Static Content)

Use `render()` for static content that doesn't need to update:

```javascript
const content = h('div', {}, ['Static content']);
render(content, container);
```

### Pattern 2: Reactive Root (Dynamic Content)

Use `createReactiveRoot()` for dynamic content with signals:

```javascript
const root = createReactiveRoot(container);
root.render(Component());
```

### Pattern 3: Component Trees

Build component hierarchies:

```javascript
function App() {
  return h('div', {}, [
    Header(),
    MainContent(),
    Footer()
  ]);
}

function Header() {
  return h('header', {}, ['Header']);
}

function MainContent() {
  return h('main', {}, ['Content']);
}

function Footer() {
  return h('footer', {}, ['Footer']);
}
```

## Best Practices

1. **Use component functions** for reusable UI pieces
2. **Use createReactiveRoot()** when working with signals
3. **Keep VNode creation pure** - no side effects in h() calls
4. **Leverage signals** for state management instead of manual DOM updates
5. **Test VNodes** before rendering - they're just plain objects

## Summary

The h() function is:
- **Complete** - Handles all common use cases
- **Working** - Fully functional with comprehensive test coverage
- **Simple** - Easy to understand and use
- **Powerful** - Integrates seamlessly with signals for reactive UIs
- **Tested** - Works in both browser and Node.js environments

The implementation is production-ready for building reactive web applications!
