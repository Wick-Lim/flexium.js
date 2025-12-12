---
title: Sync API - Optimizing Multiple Updates
description: Learn how to use Flexium's sync() API to optimize multiple signal updates and prevent cascading re-renders.
head:
  - - meta
    - property: og:title
      content: Sync API - Flexium Performance Optimization
  - - meta
    - property: og:description
      content: Prevent cascading updates with synchronization. Learn when and how to sync multiple signal updates for optimal performance.
---

# Sync API & Automatic Synchronization

Flexium automatically optimizes your state updates to ensure high performance. In most cases, you don't need to do anything! 

## Automatic Batching

Flexium now supports **Automatic Batching** by default. Multiple state updates occurring in the same "tick" (microtask) are coalesced into a single UI update. This works inside `setTimeout`, promises, event handlers, and native async APIs.

### Example

```tsx
```tsx
import { effect, state } from 'flexium/core'
import { sync } from 'flexium/advanced'

const firstName = state('John')
const lastName = state('Doe')
const age = state(30)

effect(() => {
  console.log(`${firstName.valueOf()} ${lastName.valueOf()}, age ${age.valueOf()}`)
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

## Manual Synchronization

The `sync()` API is available for scenarios where you want **Synchronous Updates**. When you use `sync()`, effects run immediately after the callback completes, rather than waiting for the next microtask. This is also useful when you need to measure the DOM immediately after a set of updates.

```tsx
```tsx
import { effect, state } from 'flexium/core'
import { sync } from 'flexium/advanced'

// ... signals ...

// Updates run immediately after this block
sync(() => {
  firstName.set('Jane')
  lastName.set('Smith')
})
// DOM is updated HERE, synchronously.
```

## Import

The `sync()` function is available from multiple import paths:

```tsx
// From advanced API
import { sync } from 'flexium/advanced'

// From core (for convenience)
import { sync } from 'flexium/advanced'
```

## Force Sync

The `sync()` function (without arguments) forces any pending auto-batched effects to run **synchronously**. This is useful for:

- **Testing**: Ensuring effects have run before making assertions
- **DOM Measurement**: Measuring the DOM immediately after state updates
- **Critical Synchronous Updates**: When you need updates to apply immediately

### Basic Usage

```tsx
```tsx
import { effect, state } from 'flexium/core'
import { sync } from 'flexium/advanced'

const count = state(0)
let effectRan = false

effect(() => {
  count.valueOf()
  effectRan = true
})

count.set(1)
// Effect is queued (auto-batching)

sync()
// Effect has now run synchronously!
console.log(effectRan) // true
```

### With Callback

`sync()` optionally accepts a callback. Updates inside the callback are batched, and all effects run before `sync()` returns:

```tsx
```tsx
import { effect, state } from 'flexium/core'
import { sync } from 'flexium/advanced'

const firstName = state('John')
const lastName = state('Doe')
let fullName = ''

effect(() => {
  fullName = `${firstName.valueOf()} ${lastName.valueOf()}`
})

sync(() => {
  firstName.set('Jane')
  lastName.set('Smith')
})

// Effect has already run!
console.log(fullName) // "Jane Smith"
```

### Testing Example

`sync()` is essential for testing reactive code:

```tsx
```tsx
import { describe, it, expect } from 'vitest'
import { effect, state } from 'flexium/core'
import { sync } from 'flexium/advanced'

describe('Counter', () => {
  it('should update when count changes', () => {
    const count = state(0)
    let displayValue = 0

    effect(() => {
      displayValue = count.valueOf() * 2
    })

    expect(displayValue).toBe(0)

    count.set(5)
    sync() // Force effects to run

    expect(displayValue).toBe(10)
  })
})
```

### DOM Measurement

Use `sync()` when you need to measure the DOM immediately after updates:

```tsx
```tsx
import { sync } from 'flexium/advanced'
import { state } from 'flexium/core'

const items = state(['a', 'b', 'c'])

function addItemAndMeasure() {
  sync(() => {
    items.set([...items.valueOf(), 'd'])
  })

  // DOM is now updated, safe to measure
  const list = document.querySelector('.list')
  console.log('List height:', list.scrollHeight)
}
```

### sync() Usage (formerly batch)

| Feature | `sync(fn)` | `sync()` (no args) |
|---------|-----------|---------------|
| Groups updates | Yes | No |
| Effects run | Synchronously after block | Synchronously (forced) |
| Use case | Grouping related updates | Forcing pending updates |
| Auto-batch aware | N/A | Flushes auto-batch queue |

```tsx
```tsx
// sync(fn) - for grouping updates
sync(() => {
  a.set(1)
  b.set(2)
})
// Effects run here, synchronously

// sync() - for forcing queued updates
a.set(1) // Queued by auto-batch
b.set(2) // Queued by auto-batch
sync()  // Forces all queued effects to run NOW
```

## Why Use Sync?

### Performance Benefits

Batching provides significant performance improvements by:

1. **Reducing Effect Executions** - Effects run once instead of multiple times
2. **Minimizing DOM Updates** - UI updates are consolidated into a single render
3. **Preventing Intermediate States** - Users never see partial/inconsistent updates
4. **Improving Responsiveness** - Less work means faster interactions

### Performance Impact Example

```tsx
```tsx
import { effect, state } from 'flexium/core'
import { sync } from 'flexium/advanced'

const count = state(0)
const items = state([])
const loading = state(false)
const error = state(null)

// This effect would run 4 times without syncing
effect(() => {
  console.log('State updated:', {
    count: count.valueOf(),
    items: items.valueOf().length,
    loading: loading.valueOf(),
    error: error.valueOf()
  })
})

// Without sync: 4 effect executions
count.set(10)
items.set([1, 2, 3])
loading.set(false)
error.set(null)

// With sync: 1 effect execution
sync(() => {
  count.set(10)
  items.set([1, 2, 3])
  loading.set(false)
  error.set(null)
})
```

## Basic Usage

### Simple Batching

```tsx
```tsx
import { sync } from 'flexium/advanced'
import { state } from 'flexium/core'

const x = state(0)
const y = state(0)

// Update both coordinates in one sync block
sync(() => {
  x.set(10)
  y.set(20)
})
```

### With Return Values

The `sync()` function returns the value returned by the callback:

```tsx
```tsx
import { sync } from 'flexium/advanced'
import { state } from 'flexium/core'

const items = state([])
const count = state(0)

const result = sync(() => {
  items.set([1, 2, 3, 4, 5])
  count.set(5)
  return 'Updates complete'
})

console.log(result) // "Updates complete"
```

### In Event Handlers

Batch multiple state changes triggered by user interactions:

```tsx
import { state } from 'flexium/core'
import { sync } from 'flexium/advanced'

function UserForm() {
  const firstName = state('')
  const lastName = state('')
  const email = state('')
  const errors = state({})

  const handleSubmit = (e) => {
    e.preventDefault()

    // Sync all validation state updates
    sync(() => {
      const newErrors = {}

      if (!firstName) newErrors.firstName = 'Required'
      if (!lastName) newErrors.lastName = 'Required'
      if (!email) newErrors.email = 'Required'

      errors.set(newErrors)
    })
  }

  return (
    <form onsubmit={handleSubmit}>
      <input
        type="text"
        value={firstName}
        oninput={(e) => firstName.set(e.target.value)}
        placeholder="First Name"
      />
      {errors.firstName && <span>{errors.firstName}</span>}

      <input
        type="text"
        value={lastName}
        oninput={(e) => lastName.set(e.target.value)}
        placeholder="Last Name"
      />
      {errors.lastName && <span>{errors.lastName}</span>}

      <input
        type="email"
        value={email}
        oninput={(e) => email.set(e.target.value)}
        placeholder="Email"
      />
      {errors.email && <span>{errors.email}</span>}

      <button type="submit">Submit</button>
    </form>
  )
}
```

## Nested Sync

Sync blocks can be nested, and effects will only run after the outermost sync completes:

```tsx
```tsx
import { effect, state } from 'flexium/core'
import { sync } from 'flexium/advanced'

const count = state(0)
let runCount = 0

effect(() => {
  console.log('Count:', count.valueOf())
  runCount++
})

sync(() => {
  count.set(1)

  sync(() => {
    count.set(2)

    sync(() => {
      count.set(3)
    })
  })

  count.set(4)
})

console.log(runCount) // 2 (initial run + 1 sync run)
// Effect only ran once after all nested sync blocks completed
```

### How Nested Sync Works

Flexium uses a depth counter to track nested sync blocks:

1. Each `sync()` call increments the depth counter
2. Signal changes are queued while depth > 0
3. When a block completes, the depth counter decrements
4. When depth reaches 0, all queued effects execute

This ensures that no matter how deeply sync blocks are nested, effects only run once when all updates are complete.

## When to Use Sync

### Form Updates

Batch multiple form field updates:

```tsx
import { state } from 'flexium/core'
import { sync } from 'flexium/advanced'

function ProfileEditor() {
  const form = state({
    name: '',
    email: '',
    bio: '',
    avatar: null
  })

  const loadUserData = async (userId) => {
    const user = await fetch(`/api/users/${userId}`).then(r => r.json())

    // Update all form fields at once
    sync(() => {
      form.set({
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
        oninput={(e) => form.set(f => ({ ...f, name: e.target.value }))}
      />
      <input
        value={form.email}
        oninput={(e) => form.set(f => ({ ...f, email: e.target.value }))}
      />
      <textarea
        value={form.bio}
        oninput={(e) => form.set(f => ({ ...f, bio: e.target.value }))}
      />
    </div>
  )
}
```

### Bulk Data Operations

Process arrays of updates efficiently:

```tsx
```tsx
import { sync } from 'flexium/advanced'
import { state } from 'flexium/core'

const items = state([])
const count = state(0)
const total = state(0)

const addMultipleItems = (newItems) => {
  sync(() => {
    items.set([...items.valueOf(), ...newItems])
    count.set(count.valueOf() + newItems.length)
    total.set(total.valueOf() + newItems.reduce((sum, item) => sum + item.price, 0))
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
import { state } from 'flexium/core'
import { sync } from 'flexium/advanced'

function DataDashboard() {
  const users = state([])
  const stats = state(null)
  const loading = state(true)
  const error = state(null)

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

      // Update all states in one sync block
      sync(() => {
        users.set(usersData)
        stats.set(statsData)
        loading.set(false)
        error.set(null)
      })
    } catch (err) {
      sync(() => {
        error.set(err.message)
        loading.set(false)
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
```tsx
import { sync } from 'flexium/advanced'
import { state } from 'flexium/core'

const x = state(0)
const y = state(0)
const rotation = state(0)
const scale = state(1)

const animate = () => {
  requestAnimationFrame(() => {
    // Batch all position/transform updates
    sync(() => {
      x.set(Math.sin(Date.now() / 1000) * 100)
      y.set(Math.cos(Date.now() / 1000) * 100)
      rotation.set((rotation.valueOf() + 1) % 360)
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
```tsx
import { sync } from 'flexium/advanced'
import { state } from 'flexium/core'

const score = state(0)
const lives = state(3)
const level = state(1)
const enemies = state([])

const handlePlayerDeath = () => {
  sync(() => {
    lives.set(lives.valueOf() - 1)

    if (lives.valueOf() <= 0) {
      // Game over
      score.set(0)
      lives.set(3)
      level.set(1)
      enemies.set([])
    }
  })
}

const completeLevel = () => {
  sync(() => {
    score.set(score.valueOf() + 1000)
    level.set(level.valueOf() + 1)
    enemies.set(generateEnemies(level.valueOf()))
  })
}
```

## When NOT to Use Sync

### Single Updates

Don't batch single signal updates - it adds unnecessary overhead:

```tsx
// Bad - unnecessary syncing
sync(() => {
  count.set(1)
})

// Good - just update directly
count.set(1)
```

### Independent Updates

Don't batch unrelated updates that don't share effects:

```tsx
```tsx
const userCount = state(0)
const themeColor = state('blue')

// These are independent - no shared effects
// Syncing provides no benefit
userCount.set(10)
themeColor.set('red')
```

### Already Synced Contexts

Event handlers are automatically synced in some frameworks. Check if your context already provides syncing:

```tsx
// In Flexium event handlers, updates are NOT automatically synced
// So you should use sync() when updating multiple signals

<button onclick={() => {
  // These run separately without sync()
  count.set(c => c + 1)
  name.set('Updated')
}}>
  Update
</button>

// Better with explicit sync
<button onclick={() => {
  sync(() => {
    count.set(c => c + 1)
    name.set('Updated')
  })
}}>
  Update
</button>
```

## Comparison with Individual Updates

### Visual Comparison

Here's what happens with and without syncing:

**Without Sync:**
```
setFirstName('Jane')  → Effect runs → DOM updates
setLastName('Smith')  → Effect runs → DOM updates
setAge(25)            → Effect runs → DOM updates
```

**With Sync:**
```
sync(() => {
  firstName.set('Jane')   → Queued
  lastName.set('Smith')   → Queued
  age.set(25)             → Queued
})                       → Effect runs once → DOM updates once
```

### Performance Metrics

```tsx
```tsx
import { effect, state } from 'flexium/core'
import { sync } from 'flexium/advanced'

const a = state(0)
const b = state(0)
const c = state(0)
let runCount = 0

effect(() => {
  a.valueOf() + b.valueOf() + c.valueOf()
  runCount++
})

// Without sync
console.time('without-sync')
a.set(1)
b.set(2)
c.set(3)
console.timeEnd('without-sync')
console.log('Runs:', runCount) // 4 (initial + 3 updates)

runCount = 0

// With sync
console.time('with-sync')
sync(() => {
  a.set(10)
  b.set(20)
  c.set(30)
})
console.timeEnd('with-sync')
console.log('Runs:', runCount) // 1 (synced update)
```

## Common Use Cases

### 1. Resetting Form State

```tsx
import { state } from 'flexium/core'
import { sync } from 'flexium/advanced'

function ContactForm() {
  const name = state('')
  const email = state('')
  const message = state('')
  const submitted = state(false)

  const resetForm = () => {
    sync(() => {
      name.set('')
      email.set('')
      message.set('')
      submitted.set(false)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await submitForm({ name, email, message })

    sync(() => {
      resetForm()
      submitted.set(true)
    })
  }

  return <form onsubmit={handleSubmit}>...</form>
}
```

### 2. Synchronized Animations

```tsx
```tsx
import { sync } from 'flexium/advanced'
import { state } from 'flexium/core'

const ball1X = state(0)
const ball1Y = state(0)
const ball2X = state(100)
const ball2Y = state(100)

const moveBalls = (deltaTime) => {
  sync(() => {
    ball1X.set(ball1X.valueOf() + deltaTime * 2)
    ball1Y.set(ball1Y.valueOf() + deltaTime * 1)
    ball2X.set(ball2X.valueOf() - deltaTime * 1.5)
    ball2Y.set(ball2Y.valueOf() + deltaTime * 2.5)
  })
}
```

### 3. Shopping Cart Updates

```tsx
import { state } from 'flexium/core'
import { sync } from 'flexium/advanced'

function ShoppingCart() {
  const items = state([])
  const total = state(0)
  const itemCount = state(0)

  const addItem = (item) => {
    sync(() => {
      setItems([...items, item])
      setTotal(total + item.price)
      setItemCount(itemCount + 1)
    })
  }

  const removeItem = (itemId) => {
    const item = items.find(i => i.id === itemId)

    sync(() => {
      setItems(items.filter(i => i.id !== itemId))
      setTotal(total - item.price)
      setItemCount(itemCount - 1)
    })
  }

  const clearCart = () => {
    sync(() => {
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
import { sync } from 'flexium/advanced'
import { state } from 'flexium/core'

const [temperature, setTemperature] = state(20)
const [humidity, setHumidity] = state(50)
const [pressure, setPressure] = state(1013)
const [timestamp, setTimestamp] = state(Date.now())

// WebSocket updates multiple sensor values
websocket.on('sensor-data', (data) => {
  sync(() => {
    setTemperature(data.temp)
    setHumidity(data.humidity)
    setPressure(data.pressure)
    setTimestamp(Date.now())
  })
})
```

## Best Practices

### 1. Sync Related Updates

Always sync updates that are logically related:

```tsx
// Good - related updates synced together
sync(() => {
  setUser(newUser)
  setPermissions(newUser.permissions)
  setLastLogin(Date.now())
})

// Bad - unrelated updates synced
sync(() => {
  setUser(newUser)
  setThemeColor('blue') // Unrelated!
})
```

### 2. Use peek() Inside Sync Blocks

When reading current values inside a sync block, use `peek()` to avoid creating dependencies:

```tsx
import { sync } from 'flexium/advanced'
import { state } from 'flexium/core'

const [count, setCount] = state(0)

// Good - uses functional update
sync(() => {
  setCount(c => c + 1)
})

// Also okay - direct value access (auto-untracked in setter)
sync(() => {
  const current = count()
  setCount(current + 1)
})
```

### 3. Return Values from Sync Blocks

Use the return value for operations that need confirmation:

```tsx
import { sync } from 'flexium/advanced'
import { state } from 'flexium/core'

const [inventory, setInventory] = state([])
const [soldItems, setSoldItems] = state([])

const sellItem = (itemId) => {
  return sync(() => {
    const currentInventory = inventory()
    const item = currentInventory.find(i => i.id === itemId)

    if (!item) return false

    setInventory(currentInventory.filter(i => i.id !== itemId))
    setSoldItems([...soldItems(), item])

    return true
  })
}

if (sellItem(123)) {
  console.log('Item sold successfully')
}
```

### 4. Avoid Side Effects in Sync Blocks

Keep sync blocks focused on state updates only:

```tsx
// Bad - mixing side effects with syncing
sync(() => {
  setLoading(false)
  setData(newData)
  console.log('Data loaded') // Side effect
  trackAnalytics('data-loaded') // Side effect
})

// Good - separate concerns
sync(() => {
  setLoading(false)
  setData(newData)
})

console.log('Data loaded')
trackAnalytics('data-loaded')
```

### 5. Document Complex Sync Blocks

Add comments explaining why updates are synced together:

```tsx
// Sync all cart state updates to ensure UI consistency
// and prevent intermediate states where count doesn't match items array
sync(() => {
  setCartItems(newItems)
  setCartCount(newItems.length)
  setCartTotal(calculateTotal(newItems))
})
```

## Debugging Sync Updates

### Track Sync Depth

You can track when sync blocks are active:

```tsx
import { effect, state } from 'flexium/core'
import { sync } from 'flexium/advanced'

const [count, setCount] = state(0)

effect(() => {
  console.log('Effect running, count:', count())
})

console.log('Before sync')
sync(() => {
  console.log('Inside sync')
  setCount(1)
  console.log('Still inside sync')
  setCount(2)
  console.log('Sync ending')
})
console.log('After sync')

// Output:
// Effect running, count: 0
// Before sync
// Inside sync
// Still inside sync
// Sync ending
// After sync
// Effect running, count: 2
```

### Performance Profiling

Measure the performance benefit of syncing:

```tsx
import { effect, state } from 'flexium/core'
import { sync } from 'flexium/advanced'

const signals = Array.from({ length: 100 }, () => state(0))

effect(() => {
  signals.forEach(([s]) => s())
})

// Without sync
console.time('no-sync')
signals.forEach(([_, set], i) => set(i))
console.timeEnd('no-sync')

// With sync
console.time('with-sync')
sync(() => {
  signals.forEach(([_, set], i) => set(i + 100))
})
console.timeEnd('with-sync')
```

## Summary

- **sync()** groups multiple signal updates to run effects only once
- **sync()** (without args) forces pending auto-batched effects to run synchronously
- Use sync for **related state changes** like form updates, bulk operations, and API responses
- Use `sync()` for **testing** and **DOM measurement** scenarios
- **Nested sync blocks** are fully supported - effects run after the outermost sync completes
- Don't sync **single updates** or **unrelated changes**
- Always **sync updates** in async callbacks and animation frames
- Use **peek()** inside sync blocks to avoid unnecessary dependency tracking
- Syncing can provide **3-10x performance improvements** for multi-signal updates

Synchronization is a powerful tool for optimizing Flexium applications. When used correctly, it ensures your UI stays responsive and consistent, even with complex state updates.
