# Migration Guide

Complete guide for migrating to Flexium from React, Vue, or Svelte.

## Table of Contents

- [Migrating from React](#migrating-from-react)
- [Migrating from Vue](#migrating-from-vue)
- [Migrating from Svelte](#migrating-from-svelte)
- [Common Patterns](#common-patterns)
- [FAQ](#faq)

---

## Migrating from React

### Quick Reference

| React | Flexium | Notes |
|-------|---------|-------|
| `useState` | `signal()` | Fine-grained reactivity instead of component re-renders |
| `useEffect` | `effect()` | Automatic dependency tracking |
| `useMemo` | `computed()` | Memoized derived values |
| `useCallback` | Not needed | No re-render issues, functions are stable |
| `useRef` | Not needed | Signals persist across renders |
| `useContext` | Shared signals | Export signals from modules |
| `<div>` | `<Row>` / `<Column>` | Flex-first layout primitives |
| CSS-in-JS | Inline props | Direct style props on components |

### State Management

**React:**
```typescript
function Counter() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}
```

**Flexium:**
```typescript
function Counter() {
  const count = signal(0)

  return (
    <Column>
      <Text>Count: {count.value}</Text>
      <Button onPress={() => count.value++}>+</Button>
    </Column>
  )
}
```

**Key Differences:**
- No `setCount` function - directly mutate `signal.value`
- No component re-render - only the Text updates
- Simpler, more direct code

### Derived State

**React:**
```typescript
function TodoList() {
  const [todos, setTodos] = useState([])

  // Recomputes on every render
  const remaining = useMemo(
    () => todos.filter(t => !t.done).length,
    [todos]
  )

  return <div>{remaining} remaining</div>
}
```

**Flexium:**
```typescript
function TodoList() {
  const todos = signal([])

  // Automatically updates when todos changes
  const remaining = computed(() =>
    todos.value.filter(t => !t.done).length
  )

  return <Text>{remaining.value} remaining</Text>
}
```

**Key Differences:**
- No dependency array - automatic tracking
- More efficient - only recomputes when needed
- Computed values are signals themselves

### Side Effects

**React:**
```typescript
function Profile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser)
  }, [userId])

  return <div>{user?.name}</div>
}
```

**Flexium:**
```typescript
function Profile({ userId }) {
  const user = signal(null)

  effect(() => {
    fetch(`/api/users/${userId.value}`)
      .then(res => res.json())
      .then(data => user.value = data)
  })

  return <Text>{user.value?.name}</Text>
}
```

**Key Differences:**
- No dependency array needed
- Automatically re-runs when `userId` changes
- Cleaner cleanup with return function

### Context / Global State

**React:**
```typescript
// Provider
const ThemeContext = createContext()

function App() {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Layout />
    </ThemeContext.Provider>
  )
}

// Consumer
function Button() {
  const { theme } = useContext(ThemeContext)
  return <button className={theme}>Click</button>
}
```

**Flexium:**
```typescript
// theme.ts - just export a signal
export const theme = signal('light')

// App.tsx
function App() {
  return <Layout />
}

// Button.tsx - import and use directly
import { theme } from './theme'

function Button() {
  return (
    <Button backgroundColor={theme.value === 'light' ? '#fff' : '#000'}>
      Click
    </Button>
  )
}
```

**Key Differences:**
- No Provider/Consumer boilerplate
- Signals can be imported/exported like any module
- No prop drilling or context issues

### Callbacks

**React:**
```typescript
function Parent() {
  const [count, setCount] = useState(0)

  // Need useCallback to prevent child re-renders
  const handleIncrement = useCallback(() => {
    setCount(c => c + 1)
  }, [])

  return <Child onIncrement={handleIncrement} />
}
```

**Flexium:**
```typescript
function Parent() {
  const count = signal(0)

  // No useCallback needed - no re-render issues
  const handleIncrement = () => {
    count.value++
  }

  return <Child onIncrement={handleIncrement} />
}
```

**Key Differences:**
- Functions are stable (components don't re-render)
- No need for `useCallback` or `useMemo` for functions
- Simpler mental model

### Refs

**React:**
```typescript
function Input() {
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current.focus()
  }, [])

  return <input ref={inputRef} />
}
```

**Flexium:**
```typescript
function Input() {
  const inputRef = signal(null)

  effect(() => {
    if (inputRef.value) {
      inputRef.value.focus()
    }
  })

  return <Input ref={inputRef} />
}
```

**Key Differences:**
- Signals work for refs too
- Reactive - runs when ref is set
- No special `useRef` hook needed

### Layout

**React:**
```typescript
function Card() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '20px'
    }}>
      <h1>Title</h1>
      <p>Content</p>
    </div>
  )
}
```

**Flexium:**
```typescript
function Card() {
  return (
    <Column gap={16} padding={20}>
      <Text fontSize={24} fontWeight="bold">Title</Text>
      <Text>Content</Text>
    </Column>
  )
}
```

**Key Differences:**
- Semantic layout primitives (Row, Column, Grid, Stack)
- No CSS strings - typed props
- Responsive values built-in: `gap={{ base: 8, md: 16 }}`

### Forms

**React:**
```typescript
function LoginForm() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setError('Invalid email')
      return
    }
    // submit...
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      {error && <span>{error}</span>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

**Flexium:**
```typescript
function LoginForm() {
  return (
    <Form
      onSubmit={(data) => {
        // data.email is validated automatically
        console.log(data)
      }}
      validation={{
        email: (v) => v.includes('@') || 'Invalid email'
      }}
    >
      <Input name="email" type="email" required />
      <Button type="submit">Submit</Button>
    </Form>
  )
}
```

**Key Differences:**
- Built-in validation
- No manual state management
- Automatic error display

### Animations

**React (with Framer Motion):**
```typescript
import { motion } from 'framer-motion'

function Modal() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      Content
    </motion.div>
  )
}
```

**Flexium:**
```typescript
function Modal() {
  return (
    <Motion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Column>Content</Column>
    </Motion>
  )
}
```

**Key Differences:**
- Built-in Motion component
- Same API as Framer Motion
- Smaller bundle size

---

## Migrating from Vue

### Quick Reference

| Vue | Flexium | Notes |
|-----|---------|-------|
| `ref()` | `signal()` | Same concept, different name |
| `computed()` | `computed()` | Identical API |
| `watch()` | `effect()` | Automatic dependency tracking |
| `reactive()` | `signal()` | All values are reactive |
| `v-if` | `{condition && <Component />}` | JSX conditional |
| `v-for` | `.map()` | JSX list rendering |
| `v-model` | `value + onChange` | Explicit two-way binding |
| `<template>` | `<Column>` / `<Row>` | Layout primitives |

### Reactivity

**Vue:**
```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>

<template>
  <div>
    <p>{{ count }}</p>
    <p>{{ doubled }}</p>
    <button @click="increment">+</button>
  </div>
</template>
```

**Flexium:**
```typescript
function Counter() {
  const count = signal(0)
  const doubled = computed(() => count.value * 2)

  const increment = () => {
    count.value++
  }

  return (
    <Column>
      <Text>{count.value}</Text>
      <Text>{doubled.value}</Text>
      <Button onPress={increment}>+</Button>
    </Column>
  )
}
```

**Key Differences:**
- Very similar! Vue 3 Composition API is close to Flexium
- No template syntax - JSX instead
- Same `.value` access pattern

### Watchers

**Vue:**
```typescript
import { ref, watch } from 'vue'

const count = ref(0)

watch(count, (newVal, oldVal) => {
  console.log(`Count changed from ${oldVal} to ${newVal}`)
})
```

**Flexium:**
```typescript
const count = signal(0)

effect(() => {
  console.log('Count is now:', count.value)
})
```

**Key Differences:**
- `effect()` instead of `watch()`
- No separate dependency tracking - automatic
- No access to old value (use a previous signal if needed)

### Computed Properties

**Vue:**
```vue
<script setup>
import { ref, computed } from 'vue'

const todos = ref([])
const remaining = computed(() =>
  todos.value.filter(t => !t.done).length
)
</script>
```

**Flexium:**
```typescript
const todos = signal([])
const remaining = computed(() =>
  todos.value.filter(t => !t.done).length
)
```

**Key Differences:**
- Identical API! If you know Vue 3, you know this part

### Template Directives

**Vue:**
```vue
<template>
  <div v-if="isVisible">
    <p v-for="item in items" :key="item.id">
      {{ item.name }}
    </p>
  </div>
</template>
```

**Flexium:**
```typescript
{isVisible.value && (
  <Column>
    {items.value.map(item => (
      <Text key={item.id}>
        {item.name}
      </Text>
    ))}
  </Column>
)}
```

**Key Differences:**
- JSX instead of template directives
- `&&` for `v-if`, `.map()` for `v-for`
- Need to access `.value` explicitly

### Two-Way Binding

**Vue:**
```vue
<template>
  <input v-model="text" />
</template>

<script setup>
const text = ref('')
</script>
```

**Flexium:**
```typescript
const text = signal('')

<Input
  value={text.value}
  onChange={(e) => text.value = e.target.value}
/>
```

**Key Differences:**
- No `v-model` shorthand
- Explicit `value` + `onChange`
- More verbose but clearer

---

## Migrating from Svelte

### Quick Reference

| Svelte | Flexium | Notes |
|--------|---------|-------|
| `let count = 0` | `signal(0)` | Reactive by default in Svelte, explicit in Flexium |
| `$: doubled = count * 2` | `computed()` | Svelte's reactive statements |
| `$: { effect() }` | `effect()` | Side effects |
| `{#if}` | `{condition && <Component />}` | Conditional rendering |
| `{#each}` | `.map()` | List rendering |
| `bind:value` | `value + onChange` | Two-way binding |
| Stores | Exported signals | Global state |

### Reactivity

**Svelte:**
```svelte
<script>
  let count = 0
  $: doubled = count * 2

  function increment() {
    count++
  }
</script>

<div>
  <p>{count}</p>
  <p>{doubled}</p>
  <button on:click={increment}>+</button>
</div>
```

**Flexium:**
```typescript
function Counter() {
  const count = signal(0)
  const doubled = computed(() => count.value * 2)

  function increment() {
    count.value++
  }

  return (
    <Column>
      <Text>{count.value}</Text>
      <Text>{doubled.value}</Text>
      <Button onPress={increment}>+</Button>
    </Column>
  )
}
```

**Key Differences:**
- Svelte: implicit reactivity with assignment
- Flexium: explicit signals with `.value`
- Svelte: `$:` for derived values
- Flexium: `computed()` function

### Reactive Statements

**Svelte:**
```svelte
<script>
  let count = 0

  $: {
    console.log('Count is:', count)
  }

  $: if (count > 10) {
    alert('Count is high!')
  }
</script>
```

**Flexium:**
```typescript
const count = signal(0)

effect(() => {
  console.log('Count is:', count.value)
})

effect(() => {
  if (count.value > 10) {
    alert('Count is high!')
  }
})
```

**Key Differences:**
- Svelte's `$:` is more magical
- Flexium's `effect()` is more explicit
- Both track dependencies automatically

### Stores

**Svelte:**
```typescript
// store.js
import { writable } from 'svelte/store'
export const count = writable(0)

// Component.svelte
<script>
  import { count } from './store'
</script>

<p>{$count}</p>
<button on:click={() => $count++}>+</button>
```

**Flexium:**
```typescript
// store.ts
export const count = signal(0)

// Component.tsx
import { count } from './store'

function Component() {
  return (
    <Column>
      <Text>{count.value}</Text>
      <Button onPress={() => count.value++}>+</Button>
    </Column>
  )
}
```

**Key Differences:**
- Very similar!
- Svelte: `$count` auto-subscription
- Flexium: `count.value` explicit access
- Both support module-level stores

### Conditional Rendering

**Svelte:**
```svelte
{#if condition}
  <p>True</p>
{:else}
  <p>False</p>
{/if}
```

**Flexium:**
```typescript
{condition.value ? (
  <Text>True</Text>
) : (
  <Text>False</Text>
)}
```

### List Rendering

**Svelte:**
```svelte
{#each items as item (item.id)}
  <div>{item.name}</div>
{/each}
```

**Flexium:**
```typescript
{items.value.map(item => (
  <Column key={item.id}>
    <Text>{item.name}</Text>
  </Column>
))}
```

### Animations

**Svelte:**
```svelte
<script>
  import { fade } from 'svelte/transition'
</script>

<div transition:fade>
  Content
</div>
```

**Flexium:**
```typescript
<Motion
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
>
  <Column>Content</Column>
</Motion>
```

---

## Common Patterns

### Loading States

**Before (React/Vue/Svelte):**
```typescript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

useEffect(() => {
  setLoading(true)
  fetch('/api/data')
    .then(res => res.json())
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false))
}, [])
```

**After (Flexium):**
```typescript
const data = signal(null)
const loading = signal(false)
const error = signal(null)

effect(() => {
  loading.value = true
  fetch('/api/data')
    .then(res => res.json())
    .then(result => data.value = result)
    .catch(err => error.value = err)
    .finally(() => loading.value = false)
})
```

### Form Validation

**Before:**
```typescript
// Complex form state management with errors
const [values, setValues] = useState({})
const [errors, setErrors] = useState({})
const [touched, setTouched] = useState({})
// ... lots of boilerplate
```

**After:**
```typescript
<Form
  onSubmit={(data) => console.log(data)}
  validation={{
    email: (v) => /\S+@\S+/.test(v) || 'Invalid',
    password: (v) => v.length >= 8 || 'Too short'
  }}
>
  {/* All validation handled automatically */}
</Form>
```

### Modal State

**Before:**
```typescript
const [isOpen, setIsOpen] = useState(false)

<button onClick={() => setIsOpen(true)}>Open</button>
{isOpen && <Modal onClose={() => setIsOpen(false)} />}
```

**After:**
```typescript
const isOpen = signal(false)

<Button onPress={() => isOpen.value = true}>Open</Button>
{isOpen.value && <Modal onClose={() => isOpen.value = false} />}
```

---

## FAQ

### Why signals instead of immutable state?

Signals provide:
- **Fine-grained reactivity** - only changed values update
- **No re-renders** - component functions run once
- **Better performance** - no Virtual DOM diffing
- **Simpler mental model** - just mutate `.value`

### Can I use Flexium with existing React code?

Yes! Flexium components can be wrapped and used in React:

```typescript
import { render } from 'flexium/dom'
import { useEffect, useRef } from 'react'

function FlexiumInReact() {
  const containerRef = useRef()

  useEffect(() => {
    const unmount = render(<FlexiumApp />, containerRef.current)
    return unmount
  }, [])

  return <div ref={containerRef} />
}
```

### How do I handle async state?

Use signals with effects:

```typescript
const user = signal(null)
const loading = signal(true)

effect(async () => {
  loading.value = true
  const data = await fetchUser()
  user.value = data
  loading.value = false
})
```

### What about TypeScript?

Fully supported! All APIs are typed:

```typescript
const count = signal<number>(0)
const user = signal<User | null>(null)

interface Props {
  title: string
}

function Card({ title }: Props) {
  return <Column><Text>{title}</Text></Column>
}
```

### How do I test Flexium components?

Test signals directly:

```typescript
import { signal } from 'flexium'

test('counter increments', () => {
  const count = signal(0)
  count.value++
  expect(count.value).toBe(1)
})
```

### What's the bundle size?

- Core: ~5KB gzipped
- DOM renderer: ~4KB gzipped
- Layout primitives: ~3KB gzipped
- UX components: ~3KB gzipped

Total: **< 15KB** for full featured app

### Where can I get help?

- [Documentation](/docs/API.md)
- [Examples](/examples)
- [Discord Community](https://discord.gg/flexium)
- [GitHub Issues](https://github.com/flexium/flexium/issues)

---

## Migration Checklist

- [ ] Replace `useState` with `signal()`
- [ ] Replace `useEffect` with `effect()`
- [ ] Replace `useMemo` with `computed()`
- [ ] Remove `useCallback` (not needed)
- [ ] Replace `div`/`span` with `Row`/`Column`
- [ ] Replace CSS classes with inline props
- [ ] Replace Context with exported signals
- [ ] Update form handling to use `<Form>` component
- [ ] Replace animation libraries with `<Motion>`
- [ ] Test and verify reactivity works as expected

---

Need more help? Check out our [Discord](https://discord.gg/flexium) or [open an issue](https://github.com/flexium/flexium/issues).
