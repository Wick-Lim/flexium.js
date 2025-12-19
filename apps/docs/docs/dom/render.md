# render()

Mount a Flexium component to the DOM.

## Import

```ts
import { render } from 'flexium/dom'
```

## Signature

```ts
function render(element: JSX.Element, container: HTMLElement): () => void
```

## Usage

### Basic Usage

```tsx
import { render } from 'flexium/dom'

function App() {
  return <div>Hello, Flexium!</div>
}

render(<App />, document.getElementById('root')!)
```

### With Cleanup

```tsx
const dispose = render(<App />, document.getElementById('root')!)

// Later, to unmount
dispose()
```

### Multiple Roots

```tsx
render(<Header />, document.getElementById('header')!)
render(<Sidebar />, document.getElementById('sidebar')!)
render(<Main />, document.getElementById('main')!)
```

### Dynamic Mounting

```tsx
function mountWidget(containerId: string) {
  const container = document.getElementById(containerId)
  if (container) {
    return render(<Widget />, container)
  }
}

const disposeWidget = mountWidget('widget-container')

// Cleanup when needed
disposeWidget?.()
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `element` | `JSX.Element` | The component or element to render |
| `container` | `HTMLElement` | The DOM element to render into |

## Returns

- **dispose** `() => void` - Function to unmount and cleanup the rendered content

## Behavior

- **Replaces** container content (clears existing content)
- Creates **reactive subscriptions** for signals
- **Cleans up** subscriptions and effects on dispose
- Returns **dispose function** for unmounting

## Notes

- Call dispose to prevent memory leaks when unmounting
- Container must exist in the DOM before calling render
- Each render call is independent

## Demo

<script setup>
import RenderDemo from '../../components/RenderDemo.vue'
</script>

<RenderDemo />

## See Also

- [f()](/docs/dom/f)
