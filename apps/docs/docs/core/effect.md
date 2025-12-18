# useEffect()

Run side effects when reactive dependencies change.

<script setup>
import TimerDemo from '../../components/TimerDemo.vue'
</script>

## Live Demo

A stopwatch demonstrating `useEffect()` for timer-based updates:

<ClientOnly>
  <TimerDemo />
</ClientOnly>

## Import

```ts
import { useEffect } from 'flexium/core'
```

## Signature

```ts
function useEffect(
  fn: () => void | (() => void),
  deps: any[]
): () => void
```

## Usage

### Basic Usage

```tsx
const [count, setCount] = useState(0)

useEffect(() => {
  console.log('Count changed:', count)
}, [count])  // Explicit dependency array

setCount(1) // logs: "Count changed: 1"
setCount(2) // logs: "Count changed: 2"
```

### With Cleanup

```tsx
const [isActive, setIsActive] = useState(false)

useEffect(() => {
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
const [theme, setTheme] = useState('light')

useEffect(() => {
  document.body.classList.toggle('dark', theme === 'dark')
}, [theme])
```

### API Calls

```tsx
const [userId, setUserId] = useState(1)
const [user, setUser] = useState(null)

useEffect(() => {
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
const [isListening] = useState(true)

useEffect(() => {
  if (!isListening) return

  const handler = (e) => console.log('Key:', e.key)
  window.addEventListener('keydown', handler)

  return () => window.removeEventListener('keydown', handler)
}, [isListening])
```

### Multiple Dependencies

```tsx
const [a, setA] = useState(1)
const [b, setB] = useState(2)

useEffect(() => {
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

`useEffect()` handles all lifecycle needs - no separate hooks required:

```tsx
// Mount + Cleanup (empty deps = run once)
useEffect(() => {
  console.log('mounted')
  return () => console.log('cleanup')
}, [])

// React to changes + cleanup
useEffect(() => {
  const ws = new WebSocket(`wss://api.com/${userId}`)
  ws.onmessage = (e) => setMessages(m => [...m, e.data])
  return () => ws.close()  // cleanup before re-run or unmount
}, [userId])
```

::: info
`onMount()` and `onCleanup()` have been removed. Use `useEffect()` instead. See [Lifecycle Management](/docs/core/lifecycle) for migration guide.
:::

## Notes

- Avoid creating infinite loops by updating tracked state inside effects
- Use `useSync()` to group multiple state updates within effects
- Effects are synchronous by default

## See Also

- [useState()](/docs/core/state)
- [useSync()](/docs/core/sync)
