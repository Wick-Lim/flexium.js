# f()

Create virtual DOM nodes programmatically without JSX.

## Import

```ts
import { f } from 'flexium/dom'
```

## Signature

```ts
function f(
  type: string | Component,
  props?: Props | null,
  ...children: Children[]
): FNode
```

## Usage

### Basic Elements

```ts
// <div>Hello</div>
f('div', null, 'Hello')

// <div class="container">Content</div>
f('div', { class: 'container' }, 'Content')

// <button onclick={handler}>Click</button>
f('button', { onclick: handleClick }, 'Click')
```

### Nested Elements

```ts
// <div><span>Text</span></div>
f('div', null,
  f('span', null, 'Text')
)

// <ul><li>A</li><li>B</li></ul>
f('ul', null,
  f('li', null, 'A'),
  f('li', null, 'B')
)
```

### With Components

```ts
function Button(props) {
  return f('button', { class: 'btn' }, props.children)
}

f(Button, null, 'Click me')
```

### Reactive Values

```ts
const count = useState(0)

f('div', null,
  f('span', null, count), // Reactive binding
  f('button', { onclick: () => count.set(c => c + 1) }, '+')
)
```

### With Styles

```ts
f('div', {
  style: {
    display: 'flex',
    gap: '10px',
    padding: '20px'
  }
}, 'Styled content')
```

### Event Handlers

```ts
f('input', {
  type: 'text',
  value: inputValue,
  oninput: (e) => setInputValue(e.target.value),
  onfocus: () => console.log('focused'),
  onblur: () => console.log('blurred')
})
```

### Complete Example

```ts
function Counter() {
  const count = useState(0)
  const doubled = useState(() => count * 2)

  return f('div', { class: 'counter' },
    f('h1', null, 'Counter'),
    f('p', null, 'Count: ', count),
    f('p', null, 'Doubled: ', doubled),
    f('div', { class: 'buttons' },
      f('button', { onclick: () => count.set(c => c - 1) }, '-'),
      f('button', { onclick: () => count.set(0) }, 'Reset'),
      f('button', { onclick: () => count.set(c => c + 1) }, '+')
    )
  )
}
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | `string \| Component` | HTML tag name or component function |
| `props` | `Props \| null` | Element properties and attributes |
| `children` | `...Children[]` | Child elements, text, or signals |

## Returns

- **FNode** - A Flexium virtual node

## When to Use

Use `f()` when:
- Building components without a JSX transpiler
- Creating dynamic element structures
- Integrating with non-JSX codebases
- Writing library code

## Notes

- JSX compiles to `f()` calls automatically
- Props use lowercase event names (`onclick`, not `onClick`)
- Children can be strings, numbers, signals, or other nodes

## Demo

<script setup>
import FDemo from '../../components/FDemo.vue'
</script>

<FDemo />

## See Also

- [render()](/docs/dom/render)
- [JSX Guide](/guide/jsx)
