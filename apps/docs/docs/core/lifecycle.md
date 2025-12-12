# Lifecycle Management

Flexium uses `effect()` for all lifecycle needs. There are no separate mount or cleanup hooks.

::: info
`onMount()` and `onCleanup()` have been removed. Use `effect()` instead.
:::

## Import

```ts
import { effect } from 'flexium/core'
```

## Using effect() for Lifecycle

`effect()` handles all lifecycle needs - no separate hooks required:

### Mount + Cleanup

```tsx
import { effect } from 'flexium/core'

function MyComponent() {
  // Runs once on mount, cleanup on unmount
  effect(() => {
    console.log('Component mounted!')
    
    // Return cleanup function
    return () => console.log('Component unmounted!')
  })

  return <div>Hello</div>
}
```

### Examples

#### Initialize Third-Party Libraries

```tsx
import { effect } from 'flexium/core'

function ChartComponent() {
  let chartInstance

  effect(() => {
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
import { state, effect } from 'flexium/core'

function UserProfile(props) {
  const user = state(null)

  effect(() => {
    // Fetch runs once on mount
    fetch(`/api/users/${props.id}`)
      .then(res => res.json())
      .then(data => user.set(data))
  })

  return user.valueOf() && <div>{user.name}</div>
}
```

#### Set Up Event Listeners

```tsx
import { effect } from 'flexium/core'

function KeyboardHandler() {
  effect(() => {
    const handler = (e) => console.log('Key pressed:', e.key)
    window.addEventListener('keydown', handler)

    return () => window.removeEventListener('keydown', handler)
  })

  return <div>Press any key</div>
}
```

### Reactive Effects with Cleanup

```tsx
import { state, effect } from 'flexium/core'

function WebSocketComponent() {
  const messages = state([])
  const userId = state(1)

  effect(() => {
    // Re-creates WebSocket when userId changes
    const ws = new WebSocket(`wss://example.com/${userId.valueOf()}`)

    ws.onmessage = (e) => {
      messages.set(m => [...m, e.data])
    }

    // Cleanup before re-run or unmount
    return () => ws.close()
  })

  return <div>{messages.valueOf().map(msg => <div>{msg}</div>)}</div>
}
```

### Cancel Pending Requests

```tsx
import { state, effect } from 'flexium/core'

function SearchResults(props) {
  const results = state([])

  effect(() => {
    const controller = new AbortController()

    fetch(`/api/search?q=${props.query}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => results.set(data))

    // Cancel request if query changes or component unmounts
    return () => controller.abort()
  })

  return <div>{results.valueOf().map(item => <div>{item.title}</div>)}</div>
}
```

### Dispose Timers

```tsx
import { state, effect } from 'flexium/core'

function Countdown(props) {
  const time = state(props.seconds)

  effect(() => {
    if (time.valueOf() <= 0) return

    const timeout = setTimeout(() => {
      time.set(t => t - 1)
    }, 1000)

    return () => clearTimeout(timeout)
  })

  return <div>{time} seconds remaining</div>
}
```

## Behavior

- **Runs on mount**: Effect runs once when component mounts
- **Tracks dependencies**: Automatically tracks reactive values you read
- **Re-runs on change**: Effect re-runs when dependencies change
- **Cleanup support**: Return a function for cleanup
- **Automatic cleanup**: Cleanup runs before re-run or on unmount

## Best Practices

1. **Use effect() for all lifecycle needs** - mount, cleanup, and reactive side effects
2. **Return cleanup function** - for resources that need disposal
3. **Avoid infinite loops** - don't update tracked state inside effects without conditions

## Migration from onMount/onCleanup

If you were using `onMount()` or `onCleanup()`, migrate to `effect()`:

```tsx
// ❌ Old way (removed)
import { onMount, onCleanup } from 'flexium/core'

onMount(() => {
  const ws = new WebSocket('...')
  onCleanup(() => ws.close())
})

// ✅ New way
import { effect } from 'flexium/core'

effect(() => {
  const ws = new WebSocket('...')
  return () => ws.close()
})
```

## See Also

- [effect()](/docs/core/effect) - Complete effect() documentation
- [state()](/docs/core/state) - Reactive state management
