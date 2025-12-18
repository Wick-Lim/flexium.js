---
title: Sync API - Optimizing Multiple Updates
description: Learn how to use Flexium's useSync() API to optimize multiple signal updates and prevent cascading re-renders.
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
import { useEffect, useState } from 'flexium/core'
import { useSync } from 'flexium/core'

const firstName = useState('John')
const lastName = useState('Doe')
const age = useState(30)

useEffect(() => {
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

The `useSync()` API is available for scenarios where you want **Synchronous Updates**. When you use `useSync()`, effects run immediately after the callback completes, rather than waiting for the next microtask. This is also useful when you need to measure the DOM immediately after a set of updates.

```tsx
```tsx
import { useEffect, useState } from 'flexium/core'
import { useSync } from 'flexium/core'

// ... signals ...

// Updates run immediately after this block
useSync(() => {
  firstName.set('Jane')
  lastName.set('Smith')
})
// DOM is updated HERE, synchronously.
```

## Import

The `useSync()` function is available from multiple import paths:

```tsx
// From core API
import { useSync } from 'flexium/core'
```

## Force Sync

The `useSync()` function (without arguments) forces any pending auto-batched effects to run **synchronously**. This is useful for:

- **Testing**: Ensuring effects have run before making assertions
- **DOM Measurement**: Measuring the DOM immediately after state updates
- **Critical Synchronous Updates**: When you need updates to apply immediately

### Basic Usage

```tsx
```tsx
import { useEffect, useState } from 'flexium/core'
import { useSync } from 'flexium/core'

const count = useState(0)
let effectRan = false

useEffect(() => {
  count.valueOf()
  effectRan = true
})

count.set(1)
// Effect is queued (auto-batching)

useSync()
// Effect has now run synchronously!
console.log(effectRan) // true
```

### With Callback

`useSync()` optionally accepts a callback. Updates inside the callback are batched, and all effects run before `useSync()` returns:

```tsx
```tsx
import { useEffect, useState } from 'flexium/core'
import { useSync } from 'flexium/core'

const firstName = useState('John')
const lastName = useState('Doe')
let fullName = ''

useEffect(() => {
  fullName = `${firstName.valueOf()} ${lastName.valueOf()}`
})

useSync(() => {
  firstName.set('Jane')
  lastName.set('Smith')
})

// Effect has already run!
console.log(fullName) // "Jane Smith"
```

### Testing Example

`useSync()` is essential for testing reactive code:

```tsx
```tsx
import { describe, it, expect } from 'vitest'
import { useEffect, useState } from 'flexium/core'
import { useSync } from 'flexium/core'

describe('Counter', () => {
  it('should update when count changes', () => {
    const count = useState(0)
    let displayValue = 0

    useEffect(() => {
      displayValue = count.valueOf() * 2
    })

    expect(displayValue).toBe(0)

    count.set(5)
    useSync() // Force effects to run

    expect(displayValue).toBe(10)
  })
})
```

### DOM Measurement

Use `useSync()` when you need to measure the DOM immediately after updates:

```tsx
```tsx
import { useSync } from 'flexium/core'
import { useState } from 'flexium/core'

const items = useState(['a', 'b', 'c'])

function addItemAndMeasure() {
  useSync(() => {
    items.set([...items.valueOf(), 'd'])
  })

  // DOM is now updated, safe to measure
  const list = document.querySelector('.list')
  console.log('List height:', list.scrollHeight)
}
```

### useSync() Usage (formerly batch)

| Feature | `useSync(fn)` | `useSync()` (no args) |
|---------|-----------|---------------|
| Groups updates | Yes | No |
| Effects run | Synchronously after block | Synchronously (forced) |
| Use case | Grouping related updates | Forcing pending updates |
| Auto-batch aware | N/A | Flushes auto-batch queue |

```tsx
```tsx
// useSync(fn) - for grouping updates
useSync(() => {
  a.set(1)
  b.set(2)
})
// Effects run here, synchronously

// useSync() - for forcing queued updates
a.set(1) // Queued by auto-batch
b.set(2) // Queued by auto-batch
useSync()  // Forces all queued effects to run NOW
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
import { useEffect, useState } from 'flexium/core'
import { useSync } from 'flexium/core'

const count = useState(0)
const items = useState([])
const loading = useState(false)
const error = useState(null)

// This effect would run 4 times without syncing
useEffect(() => {
  console.log('State updated:', {
    count: count.valueOf(),
    items: items.valueOf().length,
    loading: loading.valueOf(),
    error: error.valueOf()
  })
})

// Without useSync: 4 effect executions
count.set(10)
items.set([1, 2, 3])
loading.set(false)
error.set(null)

// With useSync: 1 effect execution
useSync(() => {
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
import { useSync } from 'flexium/core'
import { useState } from 'flexium/core'

const x = useState(0)
const y = useState(0)

// Update both coordinates in one useSync block
useSync(() => {
  x.set(10)
  y.set(20)
})
```

### With Return Values

The `useSync()` function returns the value returned by the callback:

```tsx
```tsx
import { useSync } from 'flexium/core'
import { useState } from 'flexium/core'

const items = useState([])
const count = useState(0)

const result = useSync(() => {
  items.set([1, 2, 3, 4, 5])
  count.set(5)
  return 'Updates complete'
})

console.log(result) // "Updates complete"
```

### In Event Handlers

Batch multiple state changes triggered by user interactions:

```tsx
import { useState } from 'flexium/core'
import { useSync } from 'flexium/core'

function UserForm() {
  const firstName = useState('')
  const lastName = useState('')
  const email = useState('')
  const errors = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()

    // Sync all validation state updates
    useSync(() => {
      const newErrors = {}

      if (!firstName.valueOf()) newErrors.firstName = 'Required'
      if (!lastName.valueOf()) newErrors.lastName = 'Required'
      if (!email.valueOf()) newErrors.email = 'Required'

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

Sync blocks can be nested, and effects will only run after the outermost useSync completes:

```tsx
```tsx
import { useEffect, useState } from 'flexium/core'
import { useSync } from 'flexium/core'

const count = useState(0)
let runCount = 0

useEffect(() => {
  console.log('Count:', count.valueOf())
  runCount++
})

useSync(() => {
  count.set(1)

  useSync(() => {
    count.set(2)

    useSync(() => {
      count.set(3)
    })
  })

  count.set(4)
})

console.log(runCount) // 2 (initial run + 1 useSync run)
// Effect only ran once after all nested useSync blocks completed
```

### How Nested Sync Works

Flexium uses a depth counter to track nested useSync blocks:

1. Each `useSync()` call increments the depth counter
2. Signal changes are queued while depth > 0
3. When a block completes, the depth counter decrements
4. When depth reaches 0, all queued effects execute

This ensures that no matter how deeply useSync blocks are nested, effects only run once when all updates are complete.

## When to Use Sync

### Form Updates

Batch multiple form field updates:

```tsx
import { useState } from 'flexium/core'
import { useSync } from 'flexium/core'

function ProfileEditor() {
  const form = useState({
    name: '',
    email: '',
    bio: '',
    avatar: null
  })

  const loadUserData = async (userId) => {
    const user = await fetch(`/api/users/${userId}`).then(r => r.json())

    // Update all form fields at once
    useSync(() => {
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
import { useSync } from 'flexium/core'
import { useState } from 'flexium/core'

const items = useState([])
const count = useState(0)
const total = useState(0)

const addMultipleItems = (newItems) => {
  useSync(() => {
    items.set(prev => [...prev, ...newItems])
    count.set(c => c + newItems.length)
    total.set(t => t + newItems.reduce((sum, item) => sum + item.price, 0))
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
import { useState } from 'flexium/core'
import { useSync } from 'flexium/core'

function DataDashboard() {
  const users = useState([])
  const stats = useState(null)
  const loading = useState(true)
  const error = useState(null)

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

      // Update all states in one useSync block
      useSync(() => {
        users.set(usersData)
        stats.set(statsData)
        loading.set(false)
        error.set(null)
      })
    } catch (err) {
      useSync(() => {
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
import { useSync } from 'flexium/core'
import { useState } from 'flexium/core'

const x = useState(0)
const y = useState(0)
const rotation = useState(0)
const scale = useState(1)

const animate = () => {
  requestAnimationFrame(() => {
    // Batch all position/transform updates
    useSync(() => {
      x.set(Math.sin(Date.now() / 1000) * 100)
      y.set(Math.cos(Date.now() / 1000) * 100)
      rotation.set(r => (r + 1) % 360)
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
import { useSync } from 'flexium/core'
import { useState } from 'flexium/core'

const score = useState(0)
const lives = useState(3)
const level = useState(1)
const enemies = useState([])

const handlePlayerDeath = () => {
  useSync(() => {
    lives.set(l => l - 1)

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
  useSync(() => {
    score.set(s => s + 1000)
    level.set(l => l + 1)
    enemies.set(generateEnemies(level.valueOf() + 1))
  })
}
```

## When NOT to Use Sync

### Single Updates

Don't batch single signal updates - it adds unnecessary overhead:

```tsx
// Bad - unnecessary syncing
useSync(() => {
  count.set(1)
})

// Good - just update directly
count.set(1)
```

### Independent Updates

Don't batch unrelated updates that don't share effects:

```tsx
```tsx
const userCount = useState(0)
const themeColor = useState('blue')

// These are independent - no shared effects
// Syncing provides no benefit
userCount.set(10)
themeColor.set('red')
```

### Already Synced Contexts

Event handlers are automatically synced in some frameworks. Check if your context already provides syncing:

```tsx
import { useState } from 'flexium/core'
import { useSync } from 'flexium/core'

const count = useState(0)
const name = useState('')

// In Flexium event handlers, updates are NOT automatically synced
// So you should use useSync() when updating multiple signals

<button onclick={() => {
  // These run separately without useSync()
  count.set(c => c + 1)
  name.set('Updated')
}}>
  Update
</button>

// Better with explicit useSync
<button onclick={() => {
  useSync(() => {
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
useSync(() => {
  firstName.set('Jane')   → Queued
  lastName.set('Smith')   → Queued
  age.set(25)             → Queued
})                       → Effect runs once → DOM updates once
```

### Performance Metrics

```tsx
```tsx
import { useEffect, useState } from 'flexium/core'
import { useSync } from 'flexium/core'

const a = useState(0)
const b = useState(0)
const c = useState(0)
let runCount = 0

useEffect(() => {
  a.valueOf() + b.valueOf() + c.valueOf()
  runCount++
})

// Without useSync
console.time('without-sync')
a.set(1)
b.set(2)
c.set(3)
console.timeEnd('without-sync')
console.log('Runs:', runCount) // 4 (initial + 3 updates)

runCount = 0

// With useSync
console.time('with-sync')
useSync(() => {
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
import { useState } from 'flexium/core'
import { useSync } from 'flexium/core'

function ContactForm() {
  const name = useState('')
  const email = useState('')
  const message = useState('')
  const submitted = useState(false)

  const resetForm = () => {
    useSync(() => {
      name.set('')
      email.set('')
      message.set('')
      submitted.set(false)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await submitForm({ name, email, message })

    useSync(() => {
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
import { useSync } from 'flexium/core'
import { useState } from 'flexium/core'

const ball1X = useState(0)
const ball1Y = useState(0)
const ball2X = useState(100)
const ball2Y = useState(100)

const moveBalls = (deltaTime) => {
  useSync(() => {
    ball1X.set(x => x + deltaTime * 2)
    ball1Y.set(y => y + deltaTime * 1)
    ball2X.set(x => x - deltaTime * 1.5)
    ball2Y.set(y => y + deltaTime * 2.5)
  })
}
```

### 3. Shopping Cart Updates

```tsx
import { useState } from 'flexium/core'
import { useSync } from 'flexium/core'

function ShoppingCart() {
  const items = useState([])
  const total = useState(0)
  const itemCount = useState(0)

  const addItem = (item) => {
    useSync(() => {
      items.set(prev => [...prev, item])
      total.set(t => t + item.price)
      itemCount.set(c => c + 1)
    })
  }

  const removeItem = (itemId) => {
    const item = items.valueOf().find(i => i.id === itemId)

    useSync(() => {
      items.set(prev => prev.filter(i => i.id !== itemId))
      total.set(t => t - item.price)
      itemCount.set(c => c - 1)
    })
  }

  const clearCart = () => {
    useSync(() => {
      items.set([])
      total.set(0)
      itemCount.set(0)
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
import { useSync } from 'flexium/core'
import { useState } from 'flexium/core'

const temperature = useState(20)
const humidity = useState(50)
const pressure = useState(1013)
const timestamp = useState(Date.now())

// WebSocket updates multiple sensor values
websocket.on('sensor-data', (data) => {
  useSync(() => {
    temperature.set(data.temp)
    humidity.set(data.humidity)
    pressure.set(data.pressure)
    timestamp.set(Date.now())
  })
})
```

## Best Practices

### 1. Sync Related Updates

Always sync updates that are logically related:

```tsx
// Good - related updates synced together
useSync(() => {
  user.set(newUser)
  permissions.set(newUser.permissions)
  lastLogin.set(Date.now())
})

// Bad - unrelated updates synced
useSync(() => {
  user.set(newUser)
  themeColor.set('blue') // Unrelated!
})
```

### 2. Use peek() Inside Sync Blocks

When reading current values inside a useSync block, use `peek()` to avoid creating dependencies:

```tsx
import { useSync } from 'flexium/core'
import { useState } from 'flexium/core'

const count = useState(0)

// Good - uses functional update
useSync(() => {
  count.set(c => c + 1)
})

// Also okay - direct value access (auto-untracked in setter)
useSync(() => {
  const current = count.valueOf()
  count.set(current + 1)
})
```

### 3. Return Values from Sync Blocks

Use the return value for operations that need confirmation:

```tsx
import { useSync } from 'flexium/core'
import { useState } from 'flexium/core'

const inventory = useState([])
const soldItems = useState([])

const sellItem = (itemId) => {
  return useSync(() => {
    const currentInventory = inventory.valueOf()
    const item = currentInventory.find(i => i.id === itemId)

    if (!item) return false

    inventory.set(currentInventory.filter(i => i.id !== itemId))
    soldItems.set(prev => [...prev, item])

    return true
  })
}

if (sellItem(123)) {
  console.log('Item sold successfully')
}
```

### 4. Avoid Side Effects in Sync Blocks

Keep useSync blocks focused on state updates only:

```tsx
// Bad - mixing side effects with syncing
useSync(() => {
  loading.set(false)
  data.set(newData)
  console.log('Data loaded') // Side effect
  trackAnalytics('data-loaded') // Side effect
})

// Good - separate concerns
useSync(() => {
  loading.set(false)
  data.set(newData)
})

console.log('Data loaded')
trackAnalytics('data-loaded')
```

### 5. Document Complex Sync Blocks

Add comments explaining why updates are synced together:

```tsx
// Sync all cart state updates to ensure UI consistency
// and prevent intermediate states where count doesn't match items array
useSync(() => {
  cartItems.set(newItems)
  cartCount.set(newItems.length)
  cartTotal.set(calculateTotal(newItems))
})
```

## Debugging Sync Updates

### Track Sync Depth

You can track when useSync blocks are active:

```tsx
import { useEffect, useState } from 'flexium/core'
import { useSync } from 'flexium/core'

const count = useState(0)

useEffect(() => {
  console.log('Effect running, count:', count.valueOf())
})

console.log('Before useSync')
useSync(() => {
  console.log('Inside useSync')
  count.set(1)
  console.log('Still inside useSync')
  count.set(2)
  console.log('Sync ending')
})
console.log('After useSync')

// Output:
// Effect running, count: 0
// Before useSync
// Inside useSync
// Still inside useSync
// Sync ending
// After useSync
// Effect running, count: 2
```

### Performance Profiling

Measure the performance benefit of syncing:

```tsx
import { useEffect, useState } from 'flexium/core'
import { useSync } from 'flexium/core'

const signals = Array.from({ length: 100 }, () => useState(0))

useEffect(() => {
  signals.forEach(s => s.valueOf())
})

// Without useSync
console.time('no-sync')
signals.forEach((s, i) => s.set(i))
console.timeEnd('no-sync')

// With useSync
console.time('with-sync')
useSync(() => {
  signals.forEach((s, i) => s.set(i + 100))
})
console.timeEnd('with-sync')
```

## Summary

- **useSync()** groups multiple signal updates to run effects only once
- **useSync()** (without args) forces pending auto-batched effects to run synchronously
- Use useSync for **related state changes** like form updates, bulk operations, and API responses
- Use `useSync()` for **testing** and **DOM measurement** scenarios
- **Nested useSync blocks** are fully supported - effects run after the outermost useSync completes
- Don't sync **single updates** or **unrelated changes**
- Always **sync updates** in async callbacks and animation frames
- Use **peek()** inside useSync blocks to avoid unnecessary dependency tracking
- Syncing can provide **3-10x performance improvements** for multi-signal updates

Synchronization is a powerful tool for optimizing Flexium applications. When used correctly, it ensures your UI stays responsive and consistent, even with complex state updates.
