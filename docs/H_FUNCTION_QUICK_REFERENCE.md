# h() Function Quick Reference

## Import

```javascript
// ESM
import { h, render, signal, createReactiveRoot } from 'flexium/dom';

// CommonJS
const { h, render, signal, createReactiveRoot } = require('flexium/dom');
```

## Basic Syntax

```javascript
h(type, props, children)
```

## Examples

### Simple Element
```javascript
const div = h('div', null, ['Hello World']);
```

### With Props
```javascript
const button = h('button',
  { className: 'btn', disabled: false },
  ['Click me']
);
```

### With Events
```javascript
const button = h('button',
  { onclick: () => console.log('clicked') },
  ['Click me']
);
```

### Nested Elements
```javascript
const card = h('div', { className: 'card' }, [
  h('h1', {}, ['Title']),
  h('p', {}, ['Content'])
]);
```

### With Signals (Reactive)
```javascript
const count = signal(0);

function Counter() {
  return h('div', {}, [
    h('p', {}, [`Count: ${count.value}`]),
    h('button', { onclick: () => count.value++ }, ['Increment'])
  ]);
}

const root = createReactiveRoot(container);
root.render(Counter());
```

## All Props Supported

### Events
- `onclick`, `onchange`, `oninput`, `onsubmit`
- `onmouseenter`, `onmouseleave`, `onmouseover`
- `onfocus`, `onblur`, `onkeydown`, `onkeyup`

### Attributes
- `className`, `id`, `style`, `disabled`, `checked`
- `type`, `value`, `placeholder`, `href`
- Any valid HTML attribute

### Style
```javascript
h('div', {
  style: 'color: red; padding: 10px;'
}, ['Styled'])
```

## Rendering

### Static Render
```javascript
render(vnode, container);
```

### Reactive Render
```javascript
const root = createReactiveRoot(container);
root.render(Component());
// Auto-updates when signals change!
```

## Common Patterns

### List Rendering
```javascript
const items = ['Apple', 'Banana', 'Orange'];

h('ul', {},
  items.map(item => h('li', {}, [item]))
);
```

### Conditional Rendering
```javascript
const show = signal(true);

function App() {
  return h('div', {}, [
    show.value && h('p', {}, ['Visible!'])
  ]);
}
```

### Component Functions
```javascript
function Card({ title, content }) {
  return h('div', { className: 'card' }, [
    h('h2', {}, [title]),
    h('p', {}, [content])
  ]);
}

const card = Card({ title: 'Hello', content: 'World' });
```

### Form Inputs
```javascript
const text = signal('');

h('input', {
  type: 'text',
  value: text.value,
  oninput: (e) => text.value = e.target.value
}, []);
```

## Children Types

All of these work:

```javascript
// String
h('div', {}, ['text']);

// Number
h('div', {}, [42]);

// VNode
h('div', {}, [h('span', {}, ['nested'])]);

// Array
h('div', {}, [
  'text',
  h('span', {}, ['element']),
  42
]);

// Mixed
h('div', {}, [
  'Before ',
  h('strong', {}, ['bold']),
  ' after'
]);
```

## Complete Example

```javascript
import { h, render, signal, createReactiveRoot } from 'flexium/dom';

// State
const todos = signal([]);
const input = signal('');

// Component
function TodoApp() {
  return h('div', { className: 'app' }, [
    // Header
    h('h1', {}, ['Todo List']),

    // Input
    h('input', {
      type: 'text',
      value: input.value,
      oninput: (e) => input.value = e.target.value,
      onkeypress: (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          todos.value = [...todos.value, {
            id: Date.now(),
            text: input.value,
            done: false
          }];
          input.value = '';
        }
      }
    }, []),

    // List
    h('ul', {},
      todos.value.map(todo =>
        h('li', {
          onclick: () => {
            todos.value = todos.value.map(t =>
              t.id === todo.id ? { ...t, done: !t.done } : t
            );
          },
          style: todo.done ? 'text-decoration: line-through;' : ''
        }, [todo.text])
      )
    )
  ]);
}

// Render
const root = createReactiveRoot(document.body);
root.render(TodoApp());
```

## Files to Check

- `/examples/simple-h-test.html` - Minimal example
- `/examples/basic-h-function.html` - 5 demos
- `/examples/h-function-showcase.html` - 6 interactive components
- `/docs/H_FUNCTION_GUIDE.md` - Complete guide
- `/test-h-function.mjs` - Unit tests

## Run Examples

```bash
npm run build
python3 -m http.server 8000
# Open http://localhost:8000/examples/
```

## Key Takeaways

1. `h()` creates VNodes (virtual DOM nodes)
2. `render()` converts VNodes to real DOM (one-time)
3. `createReactiveRoot()` enables automatic updates with signals
4. Signals make the UI reactive - change signal, UI updates!
5. All standard HTML elements and props are supported
6. Event handlers work naturally (onclick, oninput, etc.)
7. Children can be text, numbers, elements, or arrays

## That's It!

The h() function is simple, powerful, and fully working. Start building!
