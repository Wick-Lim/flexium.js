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
import { useSync } from 'flexium/core'

function handleSubmit() {
  useSync(() => {
    loading.set(true)
    name.set('John')
    email.set('john@example.com')
    loading.set(false)
  })
  // Single re-render
}
```

---

### useSync() Usage Scenarios

```tsx
// ✅ Form submission
function handleFormSubmit() {
  useSync(() => {
    submitting.set(true)
    errors.set({})
    formData.set({ ...formData.valueOf(), submitted: true })
  })

  // API call
  submitForm(formData.valueOf()).then(() => {
    useSync(() => {
      submitting.set(false)
      success.set(true)
    })
  })
}

// ✅ Multiple fields update simultaneously
function handleBulkUpdate() {
  useSync(() => {
    field1.set(value1)
    field2.set(value2)
    field3.set(value3)
    field4.set(value4)
  })
}

// ✅ State reset
function resetForm() {
  useSync(() => {
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
  const items = useState([])

  // Recalculated every time (no memoization)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return <div>Total: {total}</div>
}

// ✅ Good example - automatic memoization
function ShoppingCart() {
  const items = useState([])

  // Only recalculated when items change
  const total = useState(() =>
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
  const products = useState([])

  // Separate each step into computed (optional)
  const filtered = useState(() =>
    products.filter(p => p.category === category)
  )

  const sorted = useState(() =>
    [...filtered].sort((a, b) => b.price - a.price)
  )

  const formatted = useState(() =>
    sorted.map(p => ({ ...p, price: `$${p.price.toFixed(2)}` }))
  )

  return <div>{formatted.map(p => <Product key={p.id} {...p} />)}</div>
}

// Or compute all at once (may be more efficient)
const formatted = useState(() => {
  const filtered = products.filter(p => p.category === category)
  const sorted = [...filtered].sort((a, b) => b.price - a.price)
  return sorted.map(p => ({ ...p, price: `$${p.price.toFixed(2)}` }))
})
```

---

### Maintaining Stable Dependencies

```tsx
// ❌ Bad example - new object every time
const items = useState([1, 2, 3])
const data = useState(() => ({
  items: items,
  timestamp: Date.now()  // Different value each time → unnecessary recalculation
}))

// ✅ Good example - stable dependencies
const items = useState([1, 2, 3])
const timestamp = useState(() => Date.now())  // Manage as separate state
const data = useState(() => ({
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
  const items = useState([...])  // 1000+ items

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
  const items = useState([...])

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
  const items = useState([...])  // 10000+ items

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
import { useState, useEffect } from 'flexium/core'

function TemporaryComponent() {
  const data = useState(async () => {
    return fetch('/api/temp-data').then(r => r.json())
  }, { key: 'temp:data' })

  useEffect(() => {
    // Effect runs on mount
    return () => {
      useState.delete('temp:data')  // Memory cleanup
    }
  })

  return <div>...</div>
}

// ✅ Conditional cleanup
function ConditionalComponent({ userId }: { userId: number | null }) {
  const user = useState(async () => {
    if (!userId) return null
    return fetch(`/api/users/${userId}`).then(r => r.json())
  }, { key: userId ? ['user', userId] : undefined })

  useEffect(() => {
    if (!userId) {
      // Cleanup previous data when userId is missing
      useState.delete(['user', userId])
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

  keys.forEach(key => useState.delete(key))
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
const count = useState(0)
const name = useState('John')

useEffect(() => {
  console.log('Count:', count)  // Good: doesn't re-run when name changes
  // But may re-run even when count hasn't changed
})

// ✅ Good example - track only needed dependencies
useEffect(() => {
  const currentCount = count.valueOf()  // Explicitly read
  console.log('Count:', currentCount)
  // Doesn't read name, so won't re-run when name changes
})
```

---

### Using Cleanup Functions

```tsx
// ✅ Timer cleanup
useEffect(() => {
  const interval = setInterval(() => {
    console.log('tick')
  }, 1000)

  return () => clearInterval(interval)  // Cleanup required
})

// ✅ Event listener cleanup
useEffect(() => {
  const handleResize = () => {
    console.log('resized')
  }

  window.addEventListener('resize', handleResize)

  return () => window.removeEventListener('resize', handleResize)
})

// ✅ Subscription cleanup
useEffect(() => {
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
  const users = useState(async () => {
    return fetch('/api/users').then(r => r.json())
  }, { key: 'users' })

  return <div>...</div>
}

function ComponentB() {
  // Same key, so only one request is made
  const users = useState(async () => {
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
  const posts = useState(async () => {
    return fetch('/api/posts').then(r => r.json())
  }, { key: ['posts', 'all'] })

  return <div>...</div>
}

function PostDetail({ postId }: { postId: number }) {
  // Find from already cached posts
  const posts = useState(null, { key: ['posts', 'all'] })
  const post = useState(() => {
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
useEffect(() => {
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

- [ ] Have you synced multiple state updates with `useSync()`?
- [ ] Have you memoized complex calculations with `useState(() => ...)`?
- [ ] Have you used `For` component for large lists?
- [ ] Have you cleaned up unused global state?
- [ ] Have you returned effect cleanup functions?
- [ ] Are unnecessary re-renders not occurring?

---

## Related Documentation

- [useSync() API](/docs/core/sync) - Sync update API
- [useState() API](/docs/core/state) - State API documentation
- [for() API](/docs/core/for) - List rendering API
- [Best Practices - State Organization](/docs/guide/best-practices/state-organization)