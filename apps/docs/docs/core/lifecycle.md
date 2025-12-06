# Lifecycle Hooks

Manage component lifecycle with mount and cleanup hooks.

## Import

```ts
import { onMount, onCleanup } from 'flexium/core'
```

## onMount()

Run code once when a component mounts.

### Signature

```ts
function onMount(fn: () => void | (() => void)): void
```

### Usage

```tsx
import { onMount } from 'flexium/core'

function MyComponent() {
  onMount(() => {
    console.log('Component mounted!')

    // Optional: return cleanup function
    return () => console.log('Component unmounted!')
  })

  return <div>Hello</div>
}
```

### Examples

#### Initialize Third-Party Libraries

```tsx
function ChartComponent() {
  let chartInstance

  onMount(() => {
    chartInstance = new Chart(document.getElementById('chart'), {
      type: 'bar',
      data: chartData
    })

    return () => chartInstance.destroy()
  })

  return <canvas id="chart" />
}
```

#### Fetch Initial Data

```tsx
function UserProfile(props) {
  const [user, setUser] = state(null)

  onMount(async () => {
    const response = await fetch(`/api/users/${props.id}`)
    setUser(await response.json())
  })

  return <Show when={user()}>
    <div>{user().name}</div>
  </Show>
}
```

#### Set Up Event Listeners

```tsx
function KeyboardHandler() {
  onMount(() => {
    const handler = (e) => console.log('Key pressed:', e.key)
    window.addEventListener('keydown', handler)

    return () => window.removeEventListener('keydown', handler)
  })

  return <div>Press any key</div>
}
```

## onCleanup()

Register a cleanup function that runs before effect re-execution or component disposal.

### Signature

```ts
function onCleanup(fn: () => void): void
```

### Usage

```tsx
import { effect, onCleanup } from 'flexium/core'

const [count, setCount] = state(0)

effect(() => {
  const interval = setInterval(() => {
    setCount(c => c + 1)
  }, 1000)

  // Cleanup when effect re-runs or disposes
  onCleanup(() => clearInterval(interval))
})
```

### Examples

#### Clean Up Subscriptions

```tsx
function WebSocketComponent() {
  const [messages, setMessages] = state([])

  effect(() => {
    const ws = new WebSocket('wss://example.com')

    ws.onmessage = (e) => {
      setMessages(m => [...m, e.data])
    }

    onCleanup(() => ws.close())
  })

  return <For each={messages()}>
    {(msg) => <div>{msg}</div>}
  </For>
}
```

#### Cancel Pending Requests

```tsx
function SearchResults(props) {
  const [results, setResults] = state([])

  effect(() => {
    const controller = new AbortController()

    fetch(`/api/search?q=${props.query}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => setResults(data))

    onCleanup(() => controller.abort())
  })

  return <For each={results()}>
    {(item) => <div>{item.title}</div>}
  </For>
}
```

#### Dispose Timers

```tsx
function Countdown(props) {
  const [time, setTime] = state(props.seconds)

  effect(() => {
    if (time() <= 0) return

    const timeout = setTimeout(() => {
      setTime(t => t - 1)
    }, 1000)

    onCleanup(() => clearTimeout(timeout))
  })

  return <div>{time()} seconds remaining</div>
}
```

## Behavior

### onMount

- Runs **once** after the component is fully rendered
- Executes in a **microtask** (after current execution completes)
- Cleanup function runs when component unmounts
- Does **not** track reactive dependencies

### onCleanup

- Must be called **inside** an effect or component
- Runs **before** the effect re-executes
- Runs when the component is **disposed**
- Multiple cleanup functions are allowed

## Comparison

| Feature | onMount | onCleanup | effect |
|---------|---------|-----------|--------|
| Runs on mount | Once | N/A | Once |
| Tracks dependencies | No | No | Yes |
| Re-runs on change | No | N/A | Yes |
| Cleanup support | Return function | Register function | Return function |

## Best Practices

1. **Use onMount for one-time setup** - initialization that doesn't depend on reactive state
2. **Use onCleanup for resource disposal** - close connections, cancel requests
3. **Use effect for reactive side effects** - when you need to respond to state changes
4. **Return cleanup from onMount** - cleaner than separate onCleanup in mount

## Notes

- `onCleanup` outside an effect will trigger a warning
- Both hooks work in server-side rendering contexts
- Cleanup functions are called in reverse order of registration

## See Also

- [effect()](/docs/core/effect) - Reactive side effects
- [state()](/docs/core/state) - Reactive state
- [computed()](/docs/core/computed) - Derived values
