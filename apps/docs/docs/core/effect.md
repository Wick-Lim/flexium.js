# effect()

Run side effects when reactive dependencies change.

<script setup>
import TimerDemo from '../../components/TimerDemo.vue'
</script>

## Live Demo

A stopwatch demonstrating `effect()` for timer-based updates:

<ClientOnly>
  <TimerDemo />
</ClientOnly>

## Import

```ts
import { effect } from 'flexium/core'
```

## Signature

```ts
function effect(fn: () => void | (() => void)): () => void
```

## Usage

### Basic Usage

```tsx
const [count, setCount] = state(0)

effect(() => {
  console.log('Count changed:', count)
})

setCount(1) // logs: "Count changed: 1"
setCount(2) // logs: "Count changed: 2"
```

### With Cleanup

```tsx
const [isActive, setIsActive] = state(false)

effect(() => {
  if (isActive) {
    const interval = setInterval(() => {
      console.log('tick')
    }, 1000)

    // Return cleanup function
    return () => clearInterval(interval)
  }
})
```

### DOM Updates

```tsx
const [theme, setTheme] = state('light')

effect(() => {
  document.body.classList.toggle('dark', String(theme) === 'dark')
})
```

### API Calls

```tsx
const [userId, setUserId] = state(1)
const [user, setUser] = state(null)

effect(() => {
  const id = userId

  fetch(`/api/users/${id}`)
    .then(res => res.json())
    .then(data => setUser(data))

  return () => {
    // Cancel pending request if userId changes
  }
})
```

### Event Listeners

```tsx
const [isListening, setIsListening] = state(true)

effect(() => {
  if (!isListening) return

  const handler = (e) => console.log('Key:', e.key)
  window.addEventListener('keydown', handler)

  return () => window.removeEventListener('keydown', handler)
})
```

### Multiple Dependencies

```tsx
const [a, setA] = state(1)
const [b, setB] = state(2)

effect(() => {
  // Runs when either a or b changes
  console.log('Sum:', a + b)
})
```

## Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `fn` | `() => void \| (() => void)` | Effect function, optionally returning a cleanup function |

## Returns

- **dispose** `() => void` - Function to stop the effect and run cleanup

## Behavior

- Effects run **immediately** when created
- Effects **re-run** whenever accessed signals change
- **Cleanup functions** run before re-execution and on disposal
- Dependencies are **automatically tracked**

## Lifecycle Patterns

`effect()` handles all lifecycle needs - no separate hooks required:

```tsx
// Mount + Cleanup (like useEffect with empty deps)
effect(() => {
  console.log('mounted')
  return () => console.log('cleanup')
})

// React to changes + cleanup
effect(() => {
  const ws = new WebSocket(`wss://api.com/${userId}`)
  ws.onmessage = (e) => setMessages(m => [...m, e.data])
  return () => ws.close()  // cleanup before re-run or unmount
})
```

::: warning Deprecated APIs
`onMount()` and `onCleanup()` are deprecated. Use `effect()` instead. See [Lifecycle Management](/docs/core/lifecycle) for migration guide.
:::

## Notes

- Avoid creating infinite loops by updating tracked state inside effects
- Use `sync()` to group multiple state updates within effects
- Effects are synchronous by default

## See Also

- [state()](/docs/core/state)
- [sync()](/docs/core/sync)
