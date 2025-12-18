---
title: Anti-patterns
---

# Anti-patterns

Common mistakes and anti-patterns to avoid when using Flexium.

## State Management

### ❌ Reading State Outside Reactive Context

**Problem**: State read outside reactive context doesn't track updates.

```tsx
// ❌ Anti-pattern
const [count] = use(0)
const displayCount = count  // Only stores initial value, doesn't track updates

function Component() {
  return <div>{displayCount}</div>  // Always 0
}

// ✅ Correct approach
function Component() {
  const [count, setCount] = use(0)
  return <div>{count}</div>  // Automatically tracks updates
}

// Or read inside useEffect
use(() => {
  console.log(count)  // Tracks updates
})
```

---

### ❌ Unnecessary Global State

**Problem**: Making state global when only used within a component causes memory waste and increased complexity.

```tsx
// ❌ Anti-pattern
function Modal() {
  // Only used in this component but made global
  const [isOpen, setIsOpen] = use(false, { key: ['modal', 'open'] })
  return isOpen ? <div>Modal</div> : null
}

// ✅ Correct approach
function Modal() {
  // Local state is sufficient
  const [isOpen, setIsOpen] = use(false)
  return isOpen ? <div>Modal</div> : null
}
```

**When should you use Global State?**
- When it needs to be shared across multiple components
- When it needs to be accessed app-wide (e.g., user authentication)
- For server data caching

---

### ❌ Global State Key Collision

**Problem**: Using meaningless or too generic keys can cause collisions.

```tsx
// ❌ Anti-pattern
const [data, setData] = use(null, { key: ['data'] })  // Too generic
const [user, setUser] = use(null, { key: ['user'] })  // Collision possible

// ✅ Correct approach
// Use hierarchical keys
const [user, setUser] = use(null, { key: ['auth', 'user'] })
const [posts, setPosts] = use([], { key: ['user', userId, 'posts'] })  // Dynamic segments

// Or clear namespace
const [user, setUser] = use(null, { key: ['app', 'auth', 'user'] })
const [posts, setPosts] = use([], { key: ['app', 'user', userId, 'posts'] })
```

---

## Effects and Side Effects

### ❌ Updating State Inside Effect (Infinite Loop)

**Problem**: Updating tracked state inside useEffect can cause infinite loops.

```tsx
// ❌ Anti-pattern - infinite loop
const [count, setCount] = use(0)
use(() => {
  setCount(count + 1)  // count changes → effect re-runs → count changes → ...
})

// ✅ Correct approach 1: conditional update
use(() => {
  if (count < 10) {
    setCount(count + 1)
  }
})

// ✅ Correct approach 2: use untrack()
import { untrack } from 'flexium/core'
use(() => {
  untrack(() => {
    setCount(count + 1)  // Not tracked
  })
})
```

---

### ❌ Missing Cleanup Function

**Problem**: Not cleaning up timers, event listeners, subscriptions causes memory leaks.

```tsx
// ❌ Anti-pattern - memory leak
const [isActive] = use(false)
use(() => {
  if (isActive) {
    const interval = setInterval(() => {
      console.log('tick')
    }, 1000)
    // No cleanup function → memory leak
  }
})

// ✅ Correct approach
use(() => {
  if (isActive) {
    const interval = setInterval(() => {
      console.log('tick')
    }, 1000)

    return () => clearInterval(interval)  // Cleanup required
  }
})
```

---

### ❌ Not Reading State Inside Effect

**Problem**: If state isn't read inside useEffect, dependencies aren't tracked.

```tsx
// ❌ Anti-pattern - dependencies not tracked
const [count, setCount] = use(0)
use(() => {
  console.log('Hello')  // Doesn't read count
})
setCount(1)  // Effect doesn't re-run

// ✅ Correct approach
use(() => {
  console.log('Count:', count)  // Must read count to track
})
setCount(1)  // Effect re-runs
```

---

## Computed State

### ❌ Creating New Object/Array Every Time

**Problem**: If computed returns a new object every time, unnecessary recalculation occurs.

```tsx
// ❌ Anti-pattern - new object every time
const [items] = use([1, 2, 3])
const [data] = use(() => ({
  items: items,
  timestamp: Date.now()  // Different value each time → unnecessary recalculation
}), [items])

// ✅ Correct approach - stable dependencies
const [items] = use([1, 2, 3])
const [timestamp] = use(() => Date.now(), [])  // Manage as separate state
const [data] = use(() => ({
  items: items,
  timestamp: timestamp  // Stable dependency
}), [items, timestamp])
```

---

### ❌ Side Effects Inside Computed

**Problem**: Computed should be pure functions. Handle side effects in useEffect.

```tsx
// ❌ Anti-pattern - side effects
const [count, setCount] = use(0)
const [doubled] = use(() => {
  console.log('Computing doubled')  // Side effect
  localStorage.setItem('count', String(count))  // Side effect
  return count * 2
}, [count])

// ✅ Correct approach
const [count, setCount] = use(0)
const [doubled] = use(() => count * 2, [count])  // Pure function

// Side effects in useEffect
use(() => {
  console.log('Count changed:', count)
  localStorage.setItem('count', String(count))
})
```

---

## Performance

### ❌ Not Batching Multiple State Updates

**Problem**: Updating multiple states consecutively causes re-renders for each.

```tsx
// ❌ Anti-pattern - multiple re-renders
setA(1)  // Re-render 1
setB(2)  // Re-render 2
setC(3)  // Re-render 3

// ✅ Correct approach - sync updates
import { sync } from 'flexium/core'
sync(() => {
  setA(1)
  setB(2)
  setC(3)
})  // Single re-render
```

---

### ❌ Unnecessary Computed Creation

**Problem**: Simple values don't need to be computed.

```tsx
// ❌ Anti-pattern - unnecessary computed
const [count, setCount] = use(0)
const [displayCount] = use(() => count, [count])  // Just returns value

// ✅ Correct approach
const [count, setCount] = use(0)
// Use count directly instead of displayCount
```

**When should you use Computed?**
- When combining multiple states
- When complex calculation is needed
- When automatic memoization is needed

---

### ❌ Not Optimizing List Rendering

**Problem**: Regular `map` can cause performance issues with large lists.

```tsx
// ❌ Anti-pattern - not optimized
{items.map(item => (
  <Item key={item.id} data={item} />
))}

// ✅ Correct approach - use items.map()
{items.map((item) => <Item data={item} />)}
```

---

## Async State

### ❌ Missing Error Handling for Async State

**Problem**: Without checking error state, you can't provide feedback to users.

```tsx
// ❌ Anti-pattern - no error handling
const [data, control] = use(async () => {
  return fetch('/api/data').then(r => r.json())
})

function Component() {
  return <div>{data}</div>  // Shows nothing on error
}

// ✅ Correct approach
const [data, control] = use(async () => {
  return fetch('/api/data').then(r => r.json())
})

function Component() {
  if (control.loading) return <Spinner />
  if (control.error) return <Error message={control.error.message} />
  return <div>{data}</div>
}
```

---

### ❌ Duplicate Requests for Async State

**Problem**: Calling multiple times with the same key causes duplicate requests.

```tsx
// ❌ Anti-pattern - duplicate requests
function ComponentA() {
  const [users, control] = use(async () => fetch('/api/users'), {
    key: ['users']
  })
  return <div>...</div>
}

function ComponentB() {
  // Same key but new request occurs
  const [users, control] = use(async () => fetch('/api/users'), {
    key: ['users']
  })
  return <div>...</div>
}

// ✅ Correct approach - same keys are automatically shared
// Both components share the same data, so only one request is made
```

---

## Type Safety

### ❌ Missing Type Specification

**Problem**: Type inference may fail with complex types.

```tsx
// ❌ Anti-pattern - type inference may fail
const [user, setUser] = use(null)
setUser({ name: 'John' })  // Type error possible

// ✅ Correct approach - explicit type specification
interface User {
  name: string
  email: string
}

const [user, setUser] = useState<User | null>(null)
setUser({ name: 'John', email: 'john@example.com' })  // Type safe
```

---

## Common Mistakes

### ❌ Event Handler Case Confusion

**Problem**: Unlike React, Flexium uses lowercase event handlers.

```tsx
// ❌ Anti-pattern - React style
<button onClick={handleClick}>Click</button>
<input onChange={handleChange} />

// ✅ Correct approach - lowercase
<button onclick={handleClick}>Click</button>
<input onchange={handleChange} />
```

---

### ❌ Not Cleaning Up Global State

**Problem**: Not cleaning up unused global state causes memory leaks.

```tsx
// ❌ Anti-pattern - no cleanup
function Component() {
  const [data, control] = use(async () => fetch('/api/data'), {
    key: ['temp', 'data']
  })
  // Remains in memory after component unmounts
}

// ✅ Correct approach - cleanup in useEffect
import { use } from 'flexium/core'

function Component() {
  const [data, control] = use(async () => fetch('/api/data'), {
    key: ['temp', 'data']
  })

  use(() => {
    // Effect runs on mount
    return () => {
      // Manual cleanup if needed
    }
  })
}
```

---

## Summary

### Things to Avoid

1. ❌ Reading state outside reactive context
2. ❌ Unnecessary Global State
3. ❌ Updating state inside effect (infinite loop)
4. ❌ Missing cleanup functions
5. ❌ Creating new object/array every time
6. ❌ Side effects inside computed
7. ❌ Not batching updates
8. ❌ Missing error handling

### Recommendations

1. ✅ Read state inside JSX or useEffect
2. ✅ Don't use global if local is sufficient
3. ✅ Sync updates with `sync()`
4. ✅ Use `deps` option for derived state
5. ✅ Always return cleanup functions
6. ✅ Specify types explicitly
7. ✅ Check error states with `control.loading` and `control.error`

---

## Related Documentation

- [FAQ](/docs/guide/faq) - Frequently asked questions
- [Best Practices - State Organization](/docs/guide/best-practices/state-organization)
- [Best Practices - Performance Optimization](/docs/guide/best-practices/performance)
- [Migration from React](/docs/guide/migration/from-react)
