# useRef()

Creates a mutable ref object that persists across renders.

## Import

```ts
import { useRef } from 'flexium/core'
```

## Signature

```ts
function useRef<T>(initialValue?: T): RefObject<T>
```

## Usage

### DOM Element Reference

```tsx
function InputWithFocus() {
  const inputRef = useRef<HTMLInputElement>()

  const focusInput = () => {
    inputRef.current?.focus()
  }

  return (
    <div>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus Input</button>
    </div>
  )
}
```

### Mutable Value Container

```tsx
function Timer() {
  const [count, setCount] = use(0)
  const intervalRef = useRef<number>()

  const start = () => {
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
  }

  const stop = () => {
    clearInterval(intervalRef.current)
  }

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </div>
  )
}
```

### Previous Value

```tsx
function Counter() {
  const [count, setCount] = use(0)
  const prevCountRef = useRef<number>()

  use(() => {
    prevCountRef.current = count
  }, [count])

  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCountRef.current}</p>
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  )
}
```

## Types

```ts
interface RefObject<T> {
  current: T | null
}

type RefCallback<T> = (instance: T | null) => void

type Ref<T> = RefObject<T> | RefCallback<T> | null
```

## Notes

- `useRef` returns the same object on every render
- Changing `.current` does NOT trigger re-renders
- Use for DOM references, timers, or any mutable value that shouldn't cause updates

## See Also

- [use()](/docs/core/use) - State and effects
- [sync()](/docs/core/sync) - Batch updates
