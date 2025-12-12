---
title: Performance Optimization Guide
---

# Performance Optimization Guide

Learn how to optimize the performance of Flexium apps.

## Sync Updates

### Multiple State Updates at Once

```tsx
// ❌ Bad example - multiple updates
function handleSubmit() {
  loading.set(true)      // Update 1
  name.set('John')       // Update 2
  email.set('john@example.com')  // Update 3
  loading.set(false)     // Update 4
  // Causes 4 re-renders
}

// ✅ Good example - sync updates
import { sync } from 'flexium/core'

function handleSubmit() {
  sync(() => {
    loading.set(true)
    name.set('John')
    email.set('john@example.com')
    loading.set(false)
  })
  // Single re-render
}
```

---

### sync() Usage Scenarios

```tsx
// ✅ Form submission
function handleFormSubmit() {
  sync(() => {
    submitting.set(true)
    errors.set({})
    formData.set({ ...formData.valueOf(), submitted: true })
  })
  
  // API call
  submitForm(formData.valueOf()).then(() => {
    sync(() => {
      submitting.set(false)
      success.set(true)
    })
  })
}

// ✅ Multiple fields update simultaneously
function handleBulkUpdate() {
  sync(() => {
    field1.set(value1)
    field2.set(value2)
    field3.set(value3)
    field4.set(value4)
  })
}

// ✅ State reset
function resetForm() {
  sync(() => {
    email.set('')
    password.set('')
    errors.set({})
    touched.set({})
  })
}
```

---

## Computed Optimization

### Leveraging Automatic Memoization

```tsx
// ❌ Bad example - computed every time
function ShoppingCart() {
  const items = state([])
  
  // Recalculated every time (no memoization)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  
  return <div>Total: {total}</div>
}

// ✅ Good example - automatic memoization
function ShoppingCart() {
  const items = state([])
  
  // Only recalculated when items change
  const total = state(() => 
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  
  return <div>Total: {total}</div>
}
```

---

### Complex Calculation Optimization

```tsx
// ✅ Filtering + sorting + transformation
function ProductList({ category }: { category: string }) {
  const products = state([])
  
  // Separate each step into computed (optional)
  const filtered = state(() => 
    products.filter(p => p.category === category)
  )
  
  const sorted = state(() => 
    [...filtered].sort((a, b) => b.price - a.price)
  )
  
  const formatted = state(() => 
    sorted.map(p => ({ ...p, price: `$${p.price.toFixed(2)}` }))
  )
  
  return <div>{formatted.map(p => <Product key={p.id} {...p} />)}</div>
}

// Or compute all at once (may be more efficient)
const formatted = state(() => {
  const filtered = products.filter(p => p.category === category)
  const sorted = [...filtered].sort((a, b) => b.price - a.price)
  return sorted.map(p => ({ ...p, price: `$${p.price.toFixed(2)}` }))
})
```

---

### Maintaining Stable Dependencies

```tsx
// ❌ Bad example - new object every time
const items = state([1, 2, 3])
const data = state(() => ({
  items: items,
  timestamp: Date.now()  // Different value each time → unnecessary recalculation
}))

// ✅ Good example - stable dependencies
const items = state([1, 2, 3])
const timestamp = state(() => Date.now())  // Manage as separate state
const data = state(() => ({
  items: items,
  timestamp: timestamp  // Stable dependency
}))
```

---

## List Rendering Optimization

### Using For Component

```tsx
// ❌ Bad example - regular map (slow with large lists)
function ItemList() {
  const items = state([...])  // 1000+ items
  
  return (
    <div>
      {items.map(item => (
        <Item key={item.id} data={item} />
      ))}
    </div>
  )
}

// ✅ Good example - items.map() (auto-optimized)
function ItemList() {
  const items = state([...])
  
  return (
    <div>
      {items.map((item) => <Item data={item} />)}
    </div>
  )
}
```

---

### Virtualization

```tsx
// ✅ Consider virtualization for very large lists
function VirtualizedList() {
  const items = state([...])  // 10000+ items
  
  // items.map() auto-optimizes, but
  // consider additional virtualization library if needed
  return (
    <div style={{ height: '600px', overflow: 'auto' }}>
      <For each={items}>
        {(item) => <Item data={item} />}
      </For>
    </div>
  )
}
```

---

## Global State Cleanup

### Deleting Unused State

```tsx
// ✅ Cleanup on component unmount
import { state, effect } from 'flexium/core'

function TemporaryComponent() {
  const data = state(async () => {
    return fetch('/api/temp-data').then(r => r.json())
  }, { key: 'temp:data' })
  
  effect(() => {
    // Effect runs on mount
    return () => {
    state.delete('temp:data')  // Memory cleanup
  })
  
  return <div>...</div>
}

// ✅ Conditional cleanup
function ConditionalComponent({ userId }: { userId: number | null }) {
  const user = state(async () => {
    if (!userId) return null
    return fetch(`/api/users/${userId}`).then(r => r.json())
  }, { key: userId ? ['user', userId] : undefined })
  
  effect(() => {
    if (!userId) {
      // Cleanup previous data when userId is missing
      state.delete(['user', userId])
    }
  })
  
  return userId ? <div>...</div> : null
}
```

---

### Bulk Cleanup

```tsx
// ✅ Cleanup multiple keys at once
function cleanupUserData(userId: number) {
  const keys = [
    ['user', userId],
    ['user', userId, 'posts'],
    ['user', userId, 'followers'],
    ['user', userId, 'settings']
  ]
  
  keys.forEach(key => state.delete(key))
}

// ✅ Cleanup by namespace
function cleanupNamespace(namespace: string) {
  // Cleanup all related keys (implementation dependent)
  // Example: delete all keys matching 'user:*' pattern
}
```

---

## Effect Optimization

### Preventing Unnecessary Re-execution

```tsx
// ❌ Bad example - unnecessary re-execution
const count = state(0)
const name = state('John')

effect(() => {
  console.log('Count:', count)  // Good: doesn't re-run when name changes
  // But may re-run even when count hasn't changed
})

// ✅ Good example - track only needed dependencies
effect(() => {
  const currentCount = count.valueOf()  // Explicitly read
  console.log('Count:', currentCount)
  // Doesn't read name, so won't re-run when name changes
})
```

---

### Using Cleanup Functions

```tsx
// ✅ Timer cleanup
effect(() => {
  const interval = setInterval(() => {
    console.log('tick')
  }, 1000)
  
  return () => clearInterval(interval)  // Cleanup required
})

// ✅ Event listener cleanup
effect(() => {
  const handleResize = () => {
    console.log('resized')
  }
  
  window.addEventListener('resize', handleResize)
  
  return () => window.removeEventListener('resize', handleResize)
})

// ✅ Subscription cleanup
effect(() => {
  const subscription = subscribeToUpdates((data) => {
    console.log('update:', data)
  })
  
  return () => subscription.unsubscribe()
})
```

---

## Async State Optimization

### Preventing Duplicate Requests

```tsx
// ✅ Same keys are automatically shared
function ComponentA() {
  const users = state(async () => {
    return fetch('/api/users').then(r => r.json())
  }, { key: 'users' })
  
  return <div>...</div>
}

function ComponentB() {
  // Same key, so only one request is made
  const users = state(async () => {
    return fetch('/api/users').then(r => r.json())
  }, { key: 'users' })
  
  return <div>...</div>
}
```

---

### Caching Strategy

```tsx
// ✅ Reuse with global cache
function PostList() {
  const posts = state(async () => {
    return fetch('/api/posts').then(r => r.json())
  }, { key: ['posts', 'all'] })
  
  return <div>...</div>
}

function PostDetail({ postId }: { postId: number }) {
  // Find from already cached posts
  const posts = state(null, { key: ['posts', 'all'] })
  const post = state(() => {
    return posts.valueOf()?.find(p => p.id === postId)
  })
  
  return <div>...</div>
}
```

---

## Performance Measurement

### Checking Performance in Dev Mode

```tsx
// ✅ Measure effect execution time
effect(() => {
  const start = performance.now()
  
  // Heavy computation
  const result = heavyComputation()
  
  const end = performance.now()
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Computation took ${end - start}ms`)
  }
})
```

---

## Performance Checklist

### Optimization Checklist

- [ ] Have you synced multiple state updates with `sync()`?
- [ ] Have you memoized complex calculations with `state(() => ...)`?
- [ ] Have you used `For` component for large lists?
- [ ] Have you cleaned up unused global state?
- [ ] Have you returned effect cleanup functions?
- [ ] Are unnecessary re-renders not occurring?

---

## Related Documentation

- [sync() API](/docs/core/sync) - Sync update API
- [state() API](/docs/core/state) - State API documentation
- [for() API](/docs/core/for) - List rendering API
- [Best Practices - State Organization](/docs/guide/best-practices/state-organization)