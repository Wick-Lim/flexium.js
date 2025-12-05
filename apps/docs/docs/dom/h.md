# h()

Create virtual DOM nodes programmatically without JSX.

## Import

```ts
import { h } from 'flexium/dom'
```

## Signature

```ts
function h(
  type: string | Component,
  props?: Props | null,
  ...children: Children[]
): FNode
```

## Usage

### Basic Elements

```ts
// <div>Hello</div>
h('div', null, 'Hello')

// <div class="container">Content</div>
h('div', { class: 'container' }, 'Content')

// <button onclick={handler}>Click</button>
h('button', { onclick: handleClick }, 'Click')
```

### Nested Elements

```ts
// <div><span>Text</span></div>
h('div', null,
  h('span', null, 'Text')
)

// <ul><li>A</li><li>B</li></ul>
h('ul', null,
  h('li', null, 'A'),
  h('li', null, 'B')
)
```

### With Components

```ts
function Button(props) {
  return h('button', { class: 'btn' }, props.children)
}

h(Button, null, 'Click me')
```

### Reactive Values

```ts
const [count, setCount] = state(0)

h('div', null,
  h('span', null, count), // Reactive binding
  h('button', { onclick: () => setCount(c => c + 1) }, '+')
)
```

### With Styles

```ts
h('div', {
  style: {
    display: 'flex',
    gap: '10px',
    padding: '20px'
  }
}, 'Styled content')
```

### Event Handlers

```ts
h('input', {
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
  const [count, setCount] = state(0)
  const doubled = computed(() => count() * 2)

  return h('div', { class: 'counter' },
    h('h1', null, 'Counter'),
    h('p', null, 'Count: ', count),
    h('p', null, 'Doubled: ', doubled),
    h('div', { class: 'buttons' },
      h('button', { onclick: () => setCount(c => c - 1) }, '-'),
      h('button', { onclick: () => setCount(0) }, 'Reset'),
      h('button', { onclick: () => setCount(c => c + 1) }, '+')
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

Use `h()` when:
- Building components without a JSX transpiler
- Creating dynamic element structures
- Integrating with non-JSX codebases
- Writing library code

## Notes

- JSX compiles to `h()` calls automatically
- Props use lowercase event names (`onclick`, not `onClick`)
- Children can be strings, numbers, signals, or other nodes

## See Also

- [render()](/docs/dom/render)
- [JSX Guide](/guide/jsx)
