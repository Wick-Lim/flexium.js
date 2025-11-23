# Signals

Signals are the foundation of Flexium's reactivity system. They provide fine-grained reactive state without virtual DOM overhead.

## Creating Signals

```tsx
import { signal } from 'flexium'

const count = signal(0)
const name = signal('Alice')
const user = signal({ id: 1, name: 'Bob' })
```

## Reading Values

Access the current value with `.value`:

```tsx
const count = signal(0)

console.log(count.value) // 0
```

## Updating Values

Set a new value by assigning to `.value`:

```tsx
const count = signal(0)

count.value = 5
console.log(count.value) // 5

count.value++
console.log(count.value) // 6
```

## Using in JSX

Signals can be used directly in JSX. The framework automatically tracks dependencies:

```tsx
const count = signal(0)

<div>
  <p>Count: {count}</p>
  <button onclick={() => count.value++}>Increment</button>
</div>
```

When `count` changes, only the text node inside `<p>` updates—not the entire component.

## Signal Methods

### `.peek()`

Read without tracking as a dependency:

```tsx
const count = signal(0)

effect(() => {
  // This effect won't re-run when count changes
  console.log('Count peeked:', count.peek())
})

count.value++ // Effect doesn't run
```

### `.set(fn)`

Update based on current value:

```tsx
const count = signal(0)

count.set(prev => prev + 1)
console.log(count.value) // 1
```

## Object Signals

Signals work with objects, but you must replace the entire object to trigger updates:

```tsx
const user = signal({ name: 'Alice', age: 25 })

// ❌ Won't trigger updates
user.value.age = 26

// ✅ Triggers updates
user.value = { ...user.value, age: 26 }
```

For nested reactivity, use multiple signals:

```tsx
const name = signal('Alice')
const age = signal(25)

const user = computed(() => ({
  name: name.value,
  age: age.value
}))
```

## Performance Tips

### Batching Updates

When updating multiple signals, batch them to prevent multiple re-renders:

```tsx
import { batch } from 'flexium'

const firstName = signal('Alice')
const lastName = signal('Smith')

// ❌ Triggers 2 updates
firstName.value = 'Bob'
lastName.value = 'Jones'

// ✅ Triggers 1 update
batch(() => {
  firstName.value = 'Bob'
  lastName.value = 'Jones'
})
```

### Untracking

Prevent dependency tracking in specific sections:

```tsx
import { untrack } from 'flexium'

const a = signal(1)
const b = signal(2)

effect(() => {
  console.log('a:', a.value)

  // b won't be tracked as a dependency
  untrack(() => {
    console.log('b:', b.value)
  })
})

a.value = 5 // Effect runs
b.value = 10 // Effect doesn't run
```

### Async Data with `createResource`

Handle async data fetching with automatic state management:

```tsx
import { createResource } from 'flexium'

const fetchUser = async (id) => {
  const response = await fetch(\`/api/users/\${id}\`)
  return response.json()
}

const [user, { mutate, refetch }] = createResource(userId, fetchUser)

effect(() => {
  if (user.loading) {
    console.log('Loading...')
  } else if (user.error) {
    console.error('Error:', user.error)
  } else {
    console.log('User:', user())
  }
})
```

### Cleanup with `onCleanup`

Register cleanup callbacks within effects:

```tsx
import { effect, onCleanup } from 'flexium'

effect(() => {
  const handler = () => console.log('Window resized')
  window.addEventListener('resize', handler)

  onCleanup(() => {
    window.removeEventListener('resize', handler)
  })
})
```

## Comparison with Other Frameworks

### vs React useState

```tsx
// React
const [count, setCount] = useState(0)
setCount(count + 1) // Re-renders entire component

// Flexium
const count = signal(0)
count.value++ // Updates only the specific DOM node
```

### vs Vue ref

```tsx
// Vue
const count = ref(0)
count.value++ // Proxy-based reactivity

// Flexium
const count = signal(0)
count.value++ // Signal-based reactivity (lighter)
```

## Next Steps

- Learn about [Computed Values](/guide/computed)
- Understand [Effects](/guide/effects)
- Explore [Batch & Untrack](/api/batch-untrack)
