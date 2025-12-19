# Useable

Base class for creating custom reactive data sources that integrate with `use()`.

## Import

```ts
import { Useable, isUseable } from 'flexium/core'
```

## Overview

`Useable` is an abstract class that allows you to create custom data sources (like Context, external state managers, or real-time streams) that work seamlessly with Flexium's `use()` hook.

## Creating a Custom Source

Extend `Useable` and implement two methods:

```tsx
import { Useable } from 'flexium/core'

class Timer extends Useable<number> {
  private interval: number

  constructor(interval = 1000) {
    super()
    this.interval = interval
  }

  getInitial(): number {
    return 0
  }

  subscribe(_params: undefined, callback: (value: number) => void): () => void {
    let count = 0
    const id = setInterval(() => {
      count++
      callback(count)
    }, this.interval)

    return () => clearInterval(id)
  }
}
```

## Using with use()

Once created, use it like any other reactive source:

```tsx
const timer = new Timer(1000)

function Clock() {
  const [seconds] = use(timer)

  return <div>Elapsed: {seconds}s</div>
}
```

## With Parameters

Use the second type parameter for parameterized sources:

```tsx
class UserEvents extends Useable<Event[], string> {
  getInitial(userId?: string): Event[] {
    return []
  }

  subscribe(userId: string | undefined, callback: (events: Event[]) => void) {
    if (!userId) return () => {}

    const eventSource = new EventSource(`/api/users/${userId}/events`)
    eventSource.onmessage = (e) => callback(JSON.parse(e.data))

    return () => eventSource.close()
  }
}

const userEvents = new UserEvents()

function UserActivity({ userId }: { userId: string }) {
  const [events] = use(userEvents, userId)

  return (
    <ul>
      {events.map(e => <li key={e.id}>{e.name}</li>)}
    </ul>
  )
}
```

## Built-in Useable Types

Flexium's `Context` extends `Useable`:

```tsx
import { Context } from 'flexium/core'

const ThemeCtx = new Context<'light' | 'dark'>('light')

function ThemedComponent() {
  const [theme] = use(ThemeCtx)
  return <div class={theme}>...</div>
}
```

## Type Guard

Use `isUseable()` to check if a value is a Useable instance:

```ts
import { isUseable } from 'flexium/core'

if (isUseable(someValue)) {
  // someValue is Useable<any, any>
}
```

## API Reference

### Useable<T, P>

```ts
abstract class Useable<T, P = void> {
  readonly _useableTag: true

  // Get initial value synchronously
  abstract getInitial(params?: P): T

  // Subscribe to changes, return cleanup function
  abstract subscribe(
    params: P | undefined,
    callback: (value: T) => void
  ): () => void
}
```

### Type Parameters

| Parameter | Description |
|-----------|-------------|
| `T` | The value type this source provides |
| `P` | Optional parameter type for `subscribe()` |

## See Also

- [use()](/docs/core/use) - Unified reactive API
- [Context](/docs/core/context) - Built-in Useable for dependency injection
