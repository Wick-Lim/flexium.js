---
title: Anti-patterns
---

# Anti-patterns

Common mistakes and anti-patterns to avoid when using Flexium.

## State Management

### ❌ Direct Proxy Comparison

**Problem**: StateValue is a Proxy object, so direct comparison always fails.

```tsx
// ❌ Anti-pattern
const [count, setCount] = state(0)
if (count === 5) {  // Always false
  console.log('Count is 5')
}

// ✅ Correct approach
import { equals } from 'flexium/core'
if (equals(count, 5)) {
  console.log('Count is 5')
}

// Or explicit conversion
if (+count === 5) {  // number
  console.log('Count is 5')
}
```

**See**: [equals() helper function](/docs/core/state#helper-functions)

---

### ❌ Direct Proxy Boolean Check

**Problem**: Proxy objects are always truthy, so direct boolean checks don't work.

```tsx
// ❌ Anti-pattern
const [user, setUser] = state<User | null>(null)
if (user) {  // Always true (Proxy is truthy)
  console.log(user.name)  // Error: user may be null
}

// ✅ Correct approach
import { isTruthy } from 'flexium/core'
if (isTruthy(user)) {
  console.log(user.name)
}

// Or explicit check
if (user.peek() !== null) {
  console.log(user.name)
}
```

---

### ❌ Reading State Outside Reactive Context

**Problem**: State read outside reactive context doesn't track updates.

```tsx
// ❌ Anti-pattern
const [count, setCount] = state(0)
const displayCount = count  // Only stores initial value, doesn't track updates

function Component() {
  return <div>{displayCount}</div>  // Always 0
}

// ✅ Correct approach
function Component() {
  const [count, setCount] = state(0)
  return <div>{count}</div>  // Automatically tracks updates
}

// Or read inside effect
effect(() => {
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
  const [isOpen, setIsOpen] = state(false, { key: 'modal:open' })
  return isOpen ? <div>Modal</div> : null
}

// ✅ Correct approach
function Modal() {
  // Local state is sufficient
  const [isOpen, setIsOpen] = state(false)
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
const [data, setData] = state(null, { key: 'data' })  // Too generic
const [user, setUser] = state(null, { key: 'user' })  // Collision possible

// ✅ Correct approach
// Use hierarchical keys
const [user] = state(null, { key: ['auth', 'user'] })
const [posts] = state([], { key: ['user', userId, 'posts'] })

// Or clear namespace
const [user] = state(null, { key: 'app:auth:user' })
const [posts] = state([], { key: `app:user:${userId}:posts` })
```

---

## Effects and Side Effects

### ❌ Updating State Inside Effect (Infinite Loop)

**Problem**: Updating tracked state inside effect can cause infinite loops.

```tsx
// ❌ Anti-pattern - infinite loop
const [count, setCount] = state(0)
effect(() => {
  setCount(count + 1)  // count changes → effect re-runs → count changes → ...
})

// ✅ Correct approach 1: conditional update
effect(() => {
  if (count < 10) {
    setCount(count + 1)
  }
})

// ✅ Correct approach 2: use untrack()
import { untrack } from 'flexium/core'
effect(() => {
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
const [isActive, setIsActive] = state(false)
effect(() => {
  if (isActive) {
    const interval = setInterval(() => {
      console.log('tick')
    }, 1000)
    // No cleanup function → memory leak
  }
})

// ✅ Correct approach
effect(() => {
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

**Problem**: If state isn't read inside effect, dependencies aren't tracked.

```tsx
// ❌ Anti-pattern - dependencies not tracked
const [count, setCount] = state(0)
effect(() => {
  console.log('Hello')  // Doesn't read count
})
setCount(1)  // Effect doesn't re-run

// ✅ Correct approach
effect(() => {
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
const [items] = state([1, 2, 3])
const [data] = state(() => ({
  items: items,
  timestamp: Date.now()  // Different value each time → unnecessary recalculation
}))

// ✅ Correct approach - stable dependencies
const [items] = state([1, 2, 3])
const [timestamp] = state(() => Date.now())  // Manage as separate state
const [data] = state(() => ({
  items: items,
  timestamp: timestamp  // Stable dependency
}))
```

---

### ❌ Side Effects Inside Computed

**Problem**: Computed should be pure functions. Handle side effects in effect.

```tsx
// ❌ Anti-pattern - side effects
const [count, setCount] = state(0)
const [doubled] = state(() => {
  console.log('Computing doubled')  // Side effect
  localStorage.setItem('count', String(count))  // Side effect
  return count * 2
})

// ✅ Correct approach
const [count, setCount] = state(0)
const [doubled] = state(() => count * 2)  // Pure function

// Side effects in effect
effect(() => {
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
const [count, setCount] = state(0)
const [displayCount] = state(() => count)  // Just returns value

// ✅ Correct approach
const [count, setCount] = state(0)
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

// ✅ Correct approach - use For component
import { for as For } from 'flexium/core'

<For each={items}>
  {(item) => <Item data={item} />}
</For>
```

---

## Async State

### ❌ Missing Error Handling for Async State

**Problem**: Without checking error state, you can't provide feedback to users.

```tsx
// ❌ Anti-pattern - no error handling
const [data] = state(async () => {
  return fetch('/api/data').then(r => r.json())
})

function Component() {
  return <div>{data}</div>  // Shows nothing on error
}

// ✅ Correct approach
const [data, refetch, status, error] = state(async () => {
  return fetch('/api/data').then(r => r.json())
})

function Component() {
  if (String(status) === 'loading') return <Spinner />
  if (String(status) === 'error') return <Error message={error.message} />
  return <div>{data}</div>
}
```

---

### ❌ Duplicate Requests for Async State

**Problem**: Calling multiple times with the same key causes duplicate requests.

```tsx
// ❌ Anti-pattern - duplicate requests
function ComponentA() {
  const [users] = state(async () => fetch('/api/users'), {
    key: 'users'
  })
  return <div>...</div>
}

function ComponentB() {
  // Same key but new request occurs
  const [users] = state(async () => fetch('/api/users'), {
    key: 'users'
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
const [user, setUser] = state(null)  // user: StateValue<null>
setUser({ name: 'John' })  // Type error possible

// ✅ Correct approach - explicit type specification
interface User {
  name: string
  email: string
}

const [user, setUser] = state<User | null>(null)
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

### ❌ Proxy Check Mistake in Conditional Rendering

**Problem**: Proxy is always truthy, so conditional rendering doesn't work.

```tsx
// ❌ Anti-pattern - always renders
const [user, setUser] = state<User | null>(null)
return user && <UserProfile user={user} />  // Renders even when user is null

// ✅ Correct approach
import { isTruthy } from 'flexium/core'
return isTruthy(user) && <UserProfile user={user} />

// Or
return user.peek() !== null && <UserProfile user={user} />
```

---

### ❌ Not Cleaning Up Global State

**Problem**: Not cleaning up unused global state causes memory leaks.

```tsx
// ❌ Anti-pattern - no cleanup
function Component() {
  const [data] = state(async () => fetch('/api/data'), {
    key: 'temp:data'
  })
  // Remains in memory after component unmounts
}

// ✅ Correct approach - cleanup in cleanup
import { state, effect, onCleanup } from 'flexium/core'

function Component() {
  const [data] = state(async () => fetch('/api/data'), {
    key: 'temp:data'
  })
  
  onCleanup(() => {
    state.delete('temp:data')  // Cleanup
  })
}
```

---

## Summary

### Things to Avoid

1. ❌ Direct Proxy comparison (`count === 5`)
2. ❌ Direct Proxy boolean check (`if (user)`)
3. ❌ Reading state outside reactive context
4. ❌ Unnecessary Global State
5. ❌ Updating state inside effect (infinite loop)
6. ❌ Missing cleanup functions
7. ❌ Creating new object/array every time
8. ❌ Side effects inside computed
9. ❌ Not batching updates
10. ❌ Missing error handling

### Recommendations

1. ✅ Use `equals()` helper
2. ✅ Use `isTruthy()` helper
3. ✅ Read state inside JSX or effect
4. ✅ Don't use global if local is sufficient
5. ✅ Sync updates with `sync()`
6. ✅ Optimize lists with `For` component
7. ✅ Always return cleanup functions
8. ✅ Specify types explicitly
9. ✅ Check error states
10. ✅ Clean up Global State

---

## Related Documentation

- [FAQ](/docs/guide/faq) - Frequently asked questions
- [Best Practices - State Organization](/docs/guide/best-practices/state-organization)
- [Best Practices - Performance Optimization](/docs/guide/best-practices/performance)
- [Migration from React](/docs/guide/migration/from-react)
