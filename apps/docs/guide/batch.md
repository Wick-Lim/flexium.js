---
title: Batch API - Optimizing Multiple Updates
description: Learn how to use Flexium's batch() API to optimize multiple signal updates and prevent cascading re-renders.
head:
  - - meta
    - property: og:title
      content: Batch API - Flexium Performance Optimization
  - - meta
    - property: og:description
      content: Prevent cascading updates with batching. Learn when and how to batch multiple signal updates for optimal performance.
---

# Batch API & Automatic Batching

Flexium automatically optimizes your state updates to ensure high performance. In most cases, you don't need to do anything! 

## Automatic Batching

Flexium now supports **Automatic Batching** by default. Multiple state updates occurring in the same "tick" (microtask) are coalesced into a single UI update. This works inside `setTimeout`, promises, event handlers, and native async APIs.

### Example

```tsx
import { signal, effect } from 'flexium/advanced'

const firstName = signal('John')
const lastName = signal('Doe')
const age = signal(30)

effect(() => {
  console.log(`${firstName} ${lastName}, age ${age}`)
})
// Logs: "John Doe, age 30"

// These updates are automatically batched!
setTimeout(() => {
  firstName.set('Jane')
  lastName.set('Smith')
  age.set(25)
}, 0)
// Effect runs only ONCE after the timeout callback finishes.
// Logs: "Jane Smith, age 25"
```

## Manual Batching

The `batch()` API is still available for scenarios where you want **Synchronous Batched Updates**. When you use `batch()`, effects run immediately after the batch callback completes, rather than waiting for the next microtask. This is useful when you need to measure the DOM immediately after a set of updates.

```tsx
import { signal, effect, batch } from 'flexium/advanced'

// ... signals ...

// Updates run immediately after this block
batch(() => {
  firstName.set('Jane')
  lastName.set('Smith')
})
// DOM is updated HERE, synchronously.
```

## Import

The `batch()` and `flushSync()` functions are available from multiple import paths:

```tsx
// From advanced API
import { batch, flushSync } from 'flexium/advanced'

// From core (for convenience)
import { batch, flushSync } from 'flexium/core'
```

## flushSync()

The `flushSync()` function forces any pending auto-batched effects to run **synchronously**. This is useful for:

- **Testing**: Ensuring effects have run before making assertions
- **DOM Measurement**: Measuring the DOM immediately after state updates
- **Critical Synchronous Updates**: When you need updates to apply immediately

### Basic Usage

```tsx
import { signal, effect, flushSync } from 'flexium/advanced'

const count = signal(0)
let effectRan = false

effect(() => {
  count.value
  effectRan = true
})

count.value = 1
// Effect is queued (auto-batching)

flushSync()
// Effect has now run synchronously!
console.log(effectRan) // true
```

### With Callback

`flushSync()` optionally accepts a callback. Updates inside the callback are batched, and all effects run before `flushSync()` returns:

```tsx
import { signal, effect, flushSync } from 'flexium/advanced'

const firstName = signal('John')
const lastName = signal('Doe')
let fullName = ''

effect(() => {
  fullName = `${firstName.value} ${lastName.value}`
})

flushSync(() => {
  firstName.value = 'Jane'
  lastName.value = 'Smith'
})

// Effect has already run!
console.log(fullName) // "Jane Smith"
```

### Testing Example

`flushSync()` is essential for testing reactive code:

```tsx
import { describe, it, expect } from 'vitest'
import { signal, effect, flushSync } from 'flexium/advanced'

describe('Counter', () => {
  it('should update when count changes', () => {
    const count = signal(0)
    let displayValue = 0

    effect(() => {
      displayValue = count.value * 2
    })

    expect(displayValue).toBe(0)

    count.value = 5
    flushSync() // Force effects to run

    expect(displayValue).toBe(10)
  })
})
```

### DOM Measurement

Use `flushSync()` when you need to measure the DOM immediately after updates:

```tsx
import { signal, flushSync } from 'flexium/advanced'

const items = signal(['a', 'b', 'c'])

function addItemAndMeasure() {
  flushSync(() => {
    items.value = [...items.value, 'd']
  })

  // DOM is now updated, safe to measure
  const list = document.querySelector('.list')
  console.log('List height:', list.scrollHeight)
}
```

### batch() vs flushSync()

| Feature | `batch()` | `flushSync()` |
|---------|-----------|---------------|
| Groups updates | Yes | Yes (with callback) |
| Effects run | Synchronously after batch | Synchronously (forced) |
| Use case | Grouping related updates | Forcing pending updates |
| Auto-batch aware | N/A | Flushes auto-batch queue |

```tsx
// batch() - for grouping updates
batch(() => {
  a.value = 1
  b.value = 2
})
// Effects run here, synchronously

// flushSync() - for forcing queued updates
a.value = 1 // Queued by auto-batch
b.value = 2 // Queued by auto-batch
flushSync()  // Forces all queued effects to run NOW
```

## Why Use Batch?

### Performance Benefits

Batching provides significant performance improvements by:

1. **Reducing Effect Executions** - Effects run once instead of multiple times
2. **Minimizing DOM Updates** - UI updates are consolidated into a single render
3. **Preventing Intermediate States** - Users never see partial/inconsistent updates
4. **Improving Responsiveness** - Less work means faster interactions

### Performance Impact Example

```tsx
import { signal, effect, batch } from 'flexium/advanced'

const [count, setCount] = signal(0)
const [items, setItems] = signal([])
const [loading, setLoading] = signal(false)
const [error, setError] = signal(null)

// This effect would run 4 times without batching
effect(() => {
  console.log('State updated:', {
    count: count,
    items: items.length,
    loading: loading,
    error: error
  })
})

// Without batch: 4 effect executions
setCount(10)
setItems([1, 2, 3])
setLoading(false)
setError(null)

// With batch: 1 effect execution
batch(() => {
  setCount(10)
  setItems([1, 2, 3])
  setLoading(false)
  setError(null)
})
```

## Basic Usage

### Simple Batching

```tsx
import { signal, batch } from 'flexium/advanced'

const x = signal(0)
const y = signal(0)

// Update both coordinates in one batch
batch(() => {
  x.set(10)
  y.set(20)
})
```

### With Return Values

The `batch()` function returns the value returned by the callback:

```tsx
import { signal, batch } from 'flexium/advanced'

const items = signal([])
const count = signal(0)

const result = batch(() => {
  items.set([1, 2, 3, 4, 5])
  count.set(5)
  return 'Updates complete'
})

console.log(result) // "Updates complete"
```

### In Event Handlers

Batch multiple state changes triggered by user interactions:

```tsx
import { state, batch } from 'flexium/core'

function UserForm() {
  const [firstName, setFirstName] = state('')
  const [lastName, setLastName] = state('')
  const [email, setEmail] = state('')
  const [errors, setErrors] = state({})

  const handleSubmit = (e) => {
    e.preventDefault()

    // Batch all validation state updates
    batch(() => {
      const newErrors = {}

      if (!firstName) newErrors.firstName = 'Required'
      if (!lastName) newErrors.lastName = 'Required'
      if (!email) newErrors.email = 'Required'

      setErrors(newErrors)
    })
  }

  return (
    <form onsubmit={handleSubmit}>
      <input
        type="text"
        value={firstName}
        oninput={(e) => setFirstName(e.target.value)}
        placeholder="First Name"
      />
      {errors.firstName && <span>{errors.firstName}</span>}

      <input
        type="text"
        value={lastName}
        oninput={(e) => setLastName(e.target.value)}
        placeholder="Last Name"
      />
      {errors.lastName && <span>{errors.lastName}</span>}

      <input
        type="email"
        value={email}
        oninput={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}

      <button type="submit">Submit</button>
    </form>
  )
}
```

## Nested Batches

Batches can be nested, and effects will only run after the outermost batch completes:

```tsx
import { signal, effect, batch } from 'flexium/advanced'

const count = signal(0)
let runCount = 0

effect(() => {
  console.log('Count:', count)
  runCount++
})

batch(() => {
  count.set(1)

  batch(() => {
    count.set(2)

    batch(() => {
      count.set(3)
    })
  })

  count.set(4)
})

console.log(runCount) // 2 (initial run + 1 batch run)
// Effect only ran once after all nested batches completed
```

### How Nested Batching Works

Flexium uses a depth counter to track nested batches:

1. Each `batch()` call increments the depth counter
2. Signal changes are queued while depth > 0
3. When a batch completes, the depth counter decrements
4. When depth reaches 0, all queued effects execute

This ensures that no matter how deeply batches are nested, effects only run once when all updates are complete.

## When to Use Batch

### Form Updates

Batch multiple form field updates:

```tsx
import { state, batch } from 'flexium/core'

function ProfileEditor() {
  const [form, setForm] = state({
    name: '',
    email: '',
    bio: '',
    avatar: null
  })

  const loadUserData = async (userId) => {
    const user = await fetch(`/api/users/${userId}`).then(r => r.json())

    // Update all form fields at once
    batch(() => {
      setForm({
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar
      })
    })
  }

  return (
    <div>
      <input
        value={form.name}
        oninput={(e) => setForm(f => ({ ...f, name: e.target.value }))}
      />
      <input
        value={form.email}
        oninput={(e) => setForm(f => ({ ...f, email: e.target.value }))}
      />
      <textarea
        value={form.bio}
        oninput={(e) => setForm(f => ({ ...f, bio: e.target.value }))}
      />
    </div>
  )
}
```

### Bulk Data Operations

Process arrays of updates efficiently:

```tsx
import { signal, batch } from 'flexium/advanced'

const items = signal([])
const count = signal(0)
const total = signal(0)

const addMultipleItems = (newItems) => {
  batch(() => {
    items.set([...items.peek(), ...newItems])
    count.set(count.peek() + newItems.length)
    total.set(total.peek() + newItems.reduce((sum, item) => sum + item.price, 0))
  })
}

// Add 100 items with only one effect execution
addMultipleItems(
  Array.from({ length: 100 }, (_, i) => ({
    id: i,
    name: `Item ${i}`,
    price: Math.random() * 100
  }))
)
```

### API Response Handling

Update multiple states from API responses:

```tsx
import { state, batch } from 'flexium/core'

function DataDashboard() {
  const [users, setUsers] = state([])
  const [stats, setStats] = state(null)
  const [loading, setLoading] = state(true)
  const [error, setError] = state(null)

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/stats')
      ])

      const [usersData, statsData] = await Promise.all([
        usersRes.json(),
        statsRes.json()
      ])

      // Update all states in one batch
      batch(() => {
        setUsers(usersData)
        setStats(statsData)
        setLoading(false)
        setError(null)
      })
    } catch (err) {
      batch(() => {
        setError(err.message)
        setLoading(false)
      })
    }
  }

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {stats && (
        <div>
          <h2>Stats</h2>
          <p>Total Users: {stats.totalUsers}</p>
          <p>Active: {stats.activeUsers}</p>
        </div>
      )}
    </div>
  )
}
```

### Animation Frames

Batch updates in animation loops:

```tsx
import { signal, batch } from 'flexium/advanced'

const x = signal(0)
const y = signal(0)
const rotation = signal(0)
const scale = signal(1)

const animate = () => {
  requestAnimationFrame(() => {
    // Batch all position/transform updates
    batch(() => {
      x.set(Math.sin(Date.now() / 1000) * 100)
      y.set(Math.cos(Date.now() / 1000) * 100)
      rotation.set((rotation + 1) % 360)
      scale.set(1 + Math.sin(Date.now() / 500) * 0.2)
    })

    animate()
  })
}

animate()
```

### Game State Updates

Update game state atomically:

```tsx
import { signal, batch } from 'flexium/advanced'

const score = signal(0)
const lives = signal(3)
const level = signal(1)
const enemies = signal([])

const handlePlayerDeath = () => {
  batch(() => {
    lives.set(lives - 1)

    if (+lives <= 0) {
      // Game over
      score.set(0)
      lives.set(3)
      level.set(1)
      enemies.set([])
    }
  })
}

const completeLevel = () => {
  batch(() => {
    score.set(score + 1000)
    level.set(level + 1)
    enemies.set(generateEnemies(+level))
  })
}
```

## When NOT to Use Batch

### Single Updates

Don't batch single signal updates - it adds unnecessary overhead:

```tsx
// Bad - unnecessary batching
batch(() => {
  count.set(1)
})

// Good - just update directly
count.set(1)
```

### Independent Updates

Don't batch unrelated updates that don't share effects:

```tsx
const userCount = signal(0)
const themeColor = signal('blue')

// These are independent - no shared effects
// Batching provides no benefit
userCount.set(10)
themeColor.set('red')
```

### Already Batched Contexts

Event handlers are automatically batched in some frameworks. Check if your context already provides batching:

```tsx
// In Flexium event handlers, updates are NOT automatically batched
// So you should use batch() when updating multiple signals

<button onclick={() => {
  // These run separately without batch()
  setCount(c => c + 1)
  setName('Updated')
}}>
  Update
</button>

// Better with explicit batch
<button onclick={() => {
  batch(() => {
    setCount(c => c + 1)
    setName('Updated')
  })
}}>
  Update
</button>
```

## Comparison with Individual Updates

### Visual Comparison

Here's what happens with and without batching:

**Without Batch:**
```
setFirstName('Jane')  → Effect runs → DOM updates
setLastName('Smith')  → Effect runs → DOM updates
setAge(25)            → Effect runs → DOM updates
```

**With Batch:**
```
batch(() => {
  setFirstName('Jane')   → Queued
  setLastName('Smith')   → Queued
  setAge(25)             → Queued
})                       → Effect runs once → DOM updates once
```

### Performance Metrics

```tsx
import { signal, effect, batch } from 'flexium/advanced'

const a = signal(0)
const b = signal(0)
const c = signal(0)
let runCount = 0

effect(() => {
  a + b + c
  runCount++
})

// Without batch
console.time('without-batch')
a.set(1)
b.set(2)
c.set(3)
console.timeEnd('without-batch')
console.log('Runs:', runCount) // 4 (initial + 3 updates)

runCount = 0

// With batch
console.time('with-batch')
batch(() => {
  a.set(10)
  b.set(20)
  c.set(30)
})
console.timeEnd('with-batch')
console.log('Runs:', runCount) // 1 (batched update)
```

## Common Use Cases

### 1. Resetting Form State

```tsx
import { state, batch } from 'flexium/core'

function ContactForm() {
  const [name, setName] = state('')
  const [email, setEmail] = state('')
  const [message, setMessage] = state('')
  const [submitted, setSubmitted] = state(false)

  const resetForm = () => {
    batch(() => {
      setName('')
      setEmail('')
      setMessage('')
      setSubmitted(false)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await submitForm({ name, email, message })

    batch(() => {
      resetForm()
      setSubmitted(true)
    })
  }

  return <form onsubmit={handleSubmit}>...</form>
}
```

### 2. Synchronized Animations

```tsx
import { signal, batch } from 'flexium/advanced'

const ball1X = signal(0)
const ball1Y = signal(0)
const ball2X = signal(100)
const ball2Y = signal(100)

const moveBalls = (deltaTime) => {
  batch(() => {
    ball1X.set(ball1X + deltaTime * 2)
    ball1Y.set(ball1Y + deltaTime * 1)
    ball2X.set(ball2X - deltaTime * 1.5)
    ball2Y.set(ball2Y + deltaTime * 2.5)
  })
}
```

### 3. Shopping Cart Updates

```tsx
import { state, batch } from 'flexium/core'

function ShoppingCart() {
  const [items, setItems] = state([])
  const [total, setTotal] = state(0)
  const [itemCount, setItemCount] = state(0)

  const addItem = (item) => {
    batch(() => {
      setItems([...items, item])
      setTotal(total + item.price)
      setItemCount(itemCount + 1)
    })
  }

  const removeItem = (itemId) => {
    const item = items.find(i => i.id === itemId)

    batch(() => {
      setItems(items.filter(i => i.id !== itemId))
      setTotal(total - item.price)
      setItemCount(itemCount - 1)
    })
  }

  const clearCart = () => {
    batch(() => {
      setItems([])
      setTotal(0)
      setItemCount(0)
    })
  }

  return (
    <div>
      <h2>Cart ({itemCount} items)</h2>
      <p>Total: ${total}</p>
      <button onclick={clearCart}>Clear Cart</button>
    </div>
  )
}
```

### 4. Real-time Data Synchronization

```tsx
import { signal, batch } from 'flexium/advanced'

const temperature = signal(20)
const humidity = signal(50)
const pressure = signal(1013)
const timestamp = signal(Date.now())

// WebSocket updates multiple sensor values
websocket.on('sensor-data', (data) => {
  batch(() => {
    temperature.set(data.temp)
    humidity.set(data.humidity)
    pressure.set(data.pressure)
    timestamp.set(Date.now())
  })
})
```

## Best Practices

### 1. Batch Related Updates

Always batch updates that are logically related:

```tsx
// Good - related updates batched together
batch(() => {
  setUser(newUser)
  setPermissions(newUser.permissions)
  setLastLogin(Date.now())
})

// Bad - unrelated updates batched
batch(() => {
  setUser(newUser)
  setThemeColor('blue') // Unrelated!
})
```

### 2. Use peek() Inside Batches

When reading current values inside a batch, use `peek()` to avoid creating dependencies:

```tsx
import { signal, batch } from 'flexium/advanced'

const count = signal(0)

// Good - uses peek()
batch(() => {
  const current = count.peek()
  count.set(current + 1)
})

// Also okay - direct value access
batch(() => {
  const current = +count
  count.set(current + 1)
})
```

### 3. Return Values from Batches

Use the return value for operations that need confirmation:

```tsx
import { signal, batch } from 'flexium/advanced'

const inventory = signal([])
const soldItems = signal([])

const sellItem = (itemId) => {
  return batch(() => {
    const item = inventory.find(i => i.id === itemId)

    if (!item) return false

    inventory.set(inventory.filter(i => i.id !== itemId))
    soldItems.set([...soldItems, item])

    return true
  })
}

if (sellItem(123)) {
  console.log('Item sold successfully')
}
```

### 4. Avoid Side Effects in Batches

Keep batches focused on state updates only:

```tsx
// Bad - mixing side effects with batching
batch(() => {
  setLoading(false)
  setData(newData)
  console.log('Data loaded') // Side effect
  trackAnalytics('data-loaded') // Side effect
})

// Good - separate concerns
batch(() => {
  setLoading(false)
  setData(newData)
})

console.log('Data loaded')
trackAnalytics('data-loaded')
```

### 5. Document Complex Batches

Add comments explaining why updates are batched together:

```tsx
// Batch all cart state updates to ensure UI consistency
// and prevent intermediate states where count doesn't match items array
batch(() => {
  setCartItems(newItems)
  setCartCount(newItems.length)
  setCartTotal(calculateTotal(newItems))
})
```

## Debugging Batched Updates

### Track Batch Depth

You can track when batches are active:

```tsx
import { signal, batch, effect } from 'flexium/advanced'

const count = signal(0)

effect(() => {
  console.log('Effect running, count:', count)
})

console.log('Before batch')
batch(() => {
  console.log('Inside batch')
  count.set(1)
  console.log('Still inside batch')
  count.set(2)
  console.log('Batch ending')
})
console.log('After batch')

// Output:
// Effect running, count: 0
// Before batch
// Inside batch
// Still inside batch
// Batch ending
// After batch
// Effect running, count: 2
```

### Performance Profiling

Measure the performance benefit of batching:

```tsx
import { signal, effect, batch } from 'flexium/advanced'

const signals = Array.from({ length: 100 }, () => signal(0))

effect(() => {
  signals.forEach(s => +s)
})

// Without batch
console.time('no-batch')
signals.forEach((s, i) => s.set(i))
console.timeEnd('no-batch')

// With batch
console.time('with-batch')
batch(() => {
  signals.forEach((s, i) => s.set(i + 100))
})
console.timeEnd('with-batch')
```

## Summary

- **batch()** groups multiple signal updates to run effects only once
- **flushSync()** forces pending auto-batched effects to run synchronously
- Use batching for **related state changes** like form updates, bulk operations, and API responses
- Use `flushSync()` for **testing** and **DOM measurement** scenarios
- **Nested batches** are fully supported - effects run after the outermost batch completes
- Don't batch **single updates** or **unrelated changes**
- Always **batch updates** in async callbacks and animation frames
- Use **peek()** inside batches to avoid unnecessary dependency tracking
- Batching can provide **3-10x performance improvements** for multi-signal updates

Batching and synchronization are powerful tools for optimizing Flexium applications. When used correctly, they ensure your UI stays responsive and consistent, even with complex state updates.
