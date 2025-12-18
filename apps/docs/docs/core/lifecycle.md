# Lifecycle Management

Flexium uses `use()` for all lifecycle needs. There are no separate mount or cleanup hooks.

::: info
`onMount()` and `onCleanup()` have been removed. Use `use()` instead.
:::

## Import

```ts
import { use } from 'flexium/core'
```

## Using use() for Lifecycle

`use()` handles all lifecycle needs - no separate hooks required:

### Mount + Cleanup

```tsx
import { use } from 'flexium/core'

function MyComponent() {
  // Runs once on mount, cleanup on unmount
  use(({ onCleanup }) => {
    console.log('Component mounted!')

    // Register cleanup function
    onCleanup(() => console.log('Component unmounted!'))
  }, [])  // Empty deps = run once on mount

  return <div>Hello</div>
}
```

### Examples

#### Initialize Third-Party Libraries

```tsx
import { use } from 'flexium/core'

function ChartComponent() {
  let chartInstance

  use(({ onCleanup }) => {
    chartInstance = new Chart(document.getElementById('chart'), {
      type: 'bar',
      data: chartData
    })

    onCleanup(() => chartInstance.destroy())
  }, [])  // Run once on mount

  return <canvas id="chart" />
}
```

#### Fetch Initial Data

```tsx
import { use } from 'flexium/core'

function UserProfile(props) {
  const [user, setUser] = use(null)

  use(({ onCleanup }) => {
    // Fetch runs when props.id changes
    fetch(`/api/users/${props.id}`)
      .then(res => res.json())
      .then(data => setUser(data))
  }, [props.id])  // Re-run when id changes

  return user && <div>{user.name}</div>
}
```

#### Set Up Event Listeners

```tsx
import { use } from 'flexium/core'

function KeyboardHandler() {
  use(({ onCleanup }) => {
    const handler = (e) => console.log('Key pressed:', e.key)
    window.addEventListener('keydown', handler)

    onCleanup(() => window.removeEventListener('keydown', handler))
  }, [])  // Run once on mount

  return <div>Press any key</div>
}
```

### Reactive Effects with Cleanup

```tsx
import { use } from 'flexium/core'

function WebSocketComponent() {
  const [messages, setMessages] = use([])
  const [userId, setUserId] = use(1)

  use(({ onCleanup }) => {
    // Re-creates WebSocket when userId changes
    const ws = new WebSocket(`wss://example.com/${userId}`)

    ws.onmessage = (e) => {
      setMessages(m => [...m, e.data])
    }

    // Cleanup before re-run or unmount
    onCleanup(() => ws.close())
  }, [userId])  // Re-run when userId changes

  return <div>{messages.map(msg => <div>{msg}</div>)}</div>
}
```

### Cancel Pending Requests

```tsx
import { use } from 'flexium/core'

function SearchResults(props) {
  const [results, setResults] = use([])

  use(({ onCleanup }) => {
    const controller = new AbortController()

    fetch(`/api/search?q=${props.query}`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => setResults(data))

    // Cancel request if query changes or component unmounts
    onCleanup(() => controller.abort())
  }, [props.query])  // Re-run when query changes

  return <div>{results.map(item => <div>{item.title}</div>)}</div>
}
```

### Dispose Timers

```tsx
import { use } from 'flexium/core'

function Countdown(props) {
  const [time, setTime] = use(props.seconds)

  use(({ onCleanup }) => {
    if (time <= 0) return

    const timeout = setTimeout(() => {
      setTime(t => t - 1)
    }, 1000)

    onCleanup(() => clearTimeout(timeout))
  }, [time])  // Re-run when time changes

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

1. **Use use() for all lifecycle needs** - mount, cleanup, and reactive side effects
2. **Return cleanup function** - for resources that need disposal
3. **Avoid infinite loops** - don't update tracked state inside effects without conditions

## Migration from onMount/onCleanup

If you were using `onMount()` or `onCleanup()`, migrate to `use()`:

```tsx
// ❌ Old way (removed)
onMount(() => {
  const ws = new WebSocket('...')
  return () => ws.close()
})

// ✅ New way
import { use } from 'flexium/core'

use(({ onCleanup }) => {
  const ws = new WebSocket('...')
  onCleanup(() => ws.close())
}, [])  // Run once on mount
```

## See Also

- [use()](/docs/core/effect) - Complete use() documentation
- [use()](/docs/core/state) - Reactive state management
