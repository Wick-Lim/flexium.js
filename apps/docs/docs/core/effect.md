# use()

Run side effects when reactive dependencies change.

<script setup>
import TimerDemo from '../../components/TimerDemo.vue'
</script>

## Live Demo

A stopwatch demonstrating `use()` for timer-based updates:

<ClientOnly>
  <TimerDemo />
</ClientOnly>

## Import

```ts
import { useEffect } from 'flexium/core'
```

## Signature

```ts
function use(
  fn: () => void | (() => void),
  deps: any[]
): () => void
```

## Usage

### Basic Usage

```tsx
const [count, setCount] = use(0)

use(() => {
  console.log('Count changed:', count)
}, [count])  // Explicit dependency array

setCount(1) // logs: "Count changed: 1"
setCount(2) // logs: "Count changed: 2"
```

### With Cleanup

```tsx
const [isActive, setIsActive] = use(false)

use(() => {
  if (isActive) {
    const interval = setInterval(() => {
      console.log('tick')
    }, 1000)

    // Return cleanup function
    return () => clearInterval(interval)
  }
}, [isActive])
```

### DOM Updates

```tsx
const [theme, setTheme] = use('light')

use(() => {
  document.body.classList.toggle('dark', theme === 'dark')
}, [theme])
```

### API Calls

```tsx
const [userId, setUserId] = use(1)
const [user, setUser] = use(null)

use(() => {
  fetch(`/api/users/${userId}`)
    .then(res => res.json())
    .then(data => setUser(data))

  return () => {
    // Cancel pending request if userId changes
  }
}, [userId])
```

### Event Listeners

```tsx
const [isListening] = use(true)

use(() => {
  if (!isListening) return

  const handler = (e) => console.log('Key:', e.key)
  window.addEventListener('keydown', handler)

  return () => window.removeEventListener('keydown', handler)
}, [isListening])
```

### Multiple Dependencies

```tsx
const [a, setA] = use(1)
const [b, setB] = use(2)

use(() => {
  // Runs when either a or b changes
  console.log('Sum:', a + b)
}, [a, b])
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `() => void \| (() => void)` | Effect function, optionally returning a cleanup function |
| `deps` | `any[]` | Dependency array - effect re-runs when these values change |

## Returns

- **dispose** `() => void` - Function to stop the effect and run cleanup

## Behavior

- Effects run **immediately** when created
- Effects **re-run** when any value in `deps` array changes
- **Cleanup functions** run before re-execution and on disposal
- Use **empty array `[]`** to run only once on mount

## Lifecycle Patterns

`use()` handles all lifecycle needs - no separate hooks required:

```tsx
// Mount + Cleanup (empty deps = run once)
use(() => {
  console.log('mounted')
  return () => console.log('cleanup')
}, [])

// React to changes + cleanup
use(() => {
  const ws = new WebSocket(`wss://api.com/${userId}`)
  ws.onmessage = (e) => setMessages(m => [...m, e.data])
  return () => ws.close()  // cleanup before re-run or unmount
}, [userId])
```

::: info
`onMount()` and `onCleanup()` have been removed. Use `use()` instead. See [Lifecycle Management](/docs/core/lifecycle) for migration guide.
:::

## Notes

- Avoid creating infinite loops by updating tracked state inside effects
- Use `sync()` to group multiple state updates within effects
- Effects are synchronous by default

## See Also

- [use()](/docs/core/state)
- [sync()](/docs/core/sync)
