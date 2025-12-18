# Lifecycle Management

Flexium uses `useEffect()` for all lifecycle needs. There are no separate mount or cleanup hooks.

::: info
`onMount()` and `onCleanup()` have been removed. Use `useEffect()` instead.
:::

## Import

```ts
import { useEffect } from 'flexium/core'
```

## Using useEffect() for Lifecycle

`useEffect()` handles all lifecycle needs - no separate hooks required:

### Mount + Cleanup

```tsx
import { useEffect } from 'flexium/core'

function MyComponent() {
  // Runs once on mount, cleanup on unmount
  useEffect(() => {
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
import { useEffect } from 'flexium/core'

function ChartComponent() {
  let chartInstance

  useEffect(() => {
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
import { useState, useEffect } from 'flexium/core'

function UserProfile(props) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Fetch runs once on mount
    fetch(`/api/users/${props.id}`)
      .then(res => res.json())
      .then(data => setUser(data))
  })

  return user && <div>{user.name}</div>
}
```

#### Set Up Event Listeners

```tsx
import { useEffect } from 'flexium/core'

function KeyboardHandler() {
  useEffect(() => {
    const handler = (e) => console.log('Key pressed:', e.key)
    window.addEventListener('keydown', handler)

    return () => window.removeEventListener('keydown', handler)
  })

  return <div>Press any key</div>
}
```

### Reactive Effects with Cleanup

```tsx
import { useState, useEffect } from 'flexium/core'

function WebSocketComponent() {
  const [messages, setMessages] = useState([])
  const [userId, setUserId] = useState(1)

  useEffect(() => {
    // Re-creates WebSocket when userId changes
    const ws = new WebSocket(`wss://example.com/${userId}`)

    ws.onmessage = (e) => {
      setMessages(m => [...m, e.data])
    }

    // Cleanup before re-run or unmount
    return () => ws.close()
  })

  return <div>{messages.map(msg => <div>{msg}</div>)}</div>
}
```

### Cancel Pending Requests

```tsx
import { useState, useEffect } from 'flexium/core'

function SearchResults(props) {
  const [results, setResults] = useState([])

  useEffect(() => {
    const controller = new AbortController()

    fetch(`/api/search?q=${props.query}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => setResults(data))

    // Cancel request if query changes or component unmounts
    return () => controller.abort()
  })

  return <div>{results.map(item => <div>{item.title}</div>)}</div>
}
```

### Dispose Timers

```tsx
import { useState, useEffect } from 'flexium/core'

function Countdown(props) {
  const [time, setTime] = useState(props.seconds)

  useEffect(() => {
    if (time <= 0) return

    const timeout = setTimeout(() => {
      setTime(t => t - 1)
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

1. **Use useEffect() for all lifecycle needs** - mount, cleanup, and reactive side effects
2. **Return cleanup function** - for resources that need disposal
3. **Avoid infinite loops** - don't update tracked state inside effects without conditions

## Migration from onMount/onCleanup

If you were using `onMount()` or `onCleanup()`, migrate to `useEffect()`:

```tsx
// ❌ Old way (removed)
import { onMount, onCleanup } from 'flexium/core'

onMount(() => {
  const ws = new WebSocket('...')
  onCleanup(() => ws.close())
})

// ✅ New way
import { useEffect } from 'flexium/core'

useEffect(() => {
  const ws = new WebSocket('...')
  return () => ws.close()
})
```

## See Also

- [useEffect()](/docs/core/effect) - Complete useEffect() documentation
- [useState()](/docs/core/state) - Reactive state management
