# Flexium Recipes

Common "How do I..." recipes for everyday Flexium development.

## Table of Contents

- [State Management](#state-management)
- [Forms & Validation](#forms--validation)
- [Data Fetching](#data-fetching)
- [Animations](#animations)
- [Lists & Tables](#lists--tables)
- [Routing](#routing)
- [Local Storage](#local-storage)
- [Debouncing & Throttling](#debouncing--throttling)
- [Modals & Dialogs](#modals--dialogs)
- [Dark Mode](#dark-mode)

---

## State Management

### How do I create global state?

Create a separate module for shared state:

```typescript
// store/counter.ts
import { signal } from 'flexium'

export const count = signal(0)

export function increment() {
  count.value++
}

export function decrement() {
  count.value--
}

export function reset() {
  count.value = 0
}
```

Use in components:
```typescript
// components/Counter.tsx
import { count, increment } from '../store/counter'

export const Counter = () => (
  <div>
    <p>Count: {count.value}</p>
    <button onclick={increment}>+</button>
  </div>
)
```

### How do I create a store pattern?

```typescript
// store/createStore.ts
import { signal, computed } from 'flexium'

export function createStore<T>(initialState: T) {
  const state = signal(initialState)

  return {
    get state() {
      return state.value
    },
    setState(update: Partial<T>) {
      state.value = { ...state.value, ...update }
    },
    reset() {
      state.value = initialState
    }
  }
}

// Usage
const userStore = createStore({
  name: '',
  email: '',
  isLoggedIn: false
})

userStore.setState({ name: 'John' })
```

---

## Forms & Validation

### How do I handle form input?

```typescript
import { signal } from 'flexium'

export function LoginForm() {
  const email = signal('')
  const password = signal('')

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    console.log('Login:', { email: email.value, password: password.value })
  }

  return (
    <form onsubmit={handleSubmit}>
      <input
        type="email"
        value={email.value}
        oninput={(e) => email.value = e.target.value}
        placeholder="Email"
      />
      <input
        type="password"
        value={password.value}
        oninput={(e) => password.value = e.target.value}
        placeholder="Password"
      />
      <button type="submit">Login</button>
    </form>
  )
}
```

### How do I add form validation?

```typescript
import { signal, computed } from 'flexium'

export function ValidatedForm() {
  const email = signal('')
  const password = signal('')

  const emailError = computed(() => {
    if (!email.value) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(email.value)) return 'Invalid email'
    return ''
  })

  const passwordError = computed(() => {
    if (!password.value) return 'Password is required'
    if (password.value.length < 8) return 'Password must be 8+ characters'
    return ''
  })

  const isValid = computed(() =>
    !emailError.value && !passwordError.value
  )

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    if (isValid.value) {
      console.log('Valid form!')
    }
  }

  return (
    <form onsubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={email.value}
          oninput={(e) => email.value = e.target.value}
        />
        {emailError.value && <span class="error">{emailError.value}</span>}
      </div>

      <div>
        <input
          type="password"
          value={password.value}
          oninput={(e) => password.value = e.target.value}
        />
        {passwordError.value && <span class="error">{passwordError.value}</span>}
      </div>

      <button type="submit" disabled={!isValid.value}>
        Submit
      </button>
    </form>
  )
}
```

### How do I create reusable form fields?

```typescript
import { signal, Signal } from 'flexium'

interface FormFieldProps {
  label: string
  value: Signal<string>
  type?: string
  error?: string
}

export function FormField(props: FormFieldProps) {
  return (
    <div class="form-field">
      <label>{props.label}</label>
      <input
        type={props.type || 'text'}
        value={props.value.value}
        oninput={(e) => props.value.value = e.target.value}
        class={props.error ? 'error' : ''}
      />
      {props.error && <span class="error-msg">{props.error}</span>}
    </div>
  )
}

// Usage
const email = signal('')
const emailError = computed(() => /* validation */)

<FormField label="Email" value={email} error={emailError.value} />
```

---

## Data Fetching

### How do I fetch data on component mount?

```typescript
import { signal, effect } from 'flexium'

export function UserList() {
  const users = signal<User[]>([])
  const loading = signal(true)
  const error = signal<Error | null>(null)

  effect(() => {
    const controller = new AbortController()

    fetch('/api/users', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        users.value = data
        loading.value = false
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          error.value = err
          loading.value = false
        }
      })

    return () => controller.abort()
  })

  return (
    <div>
      {loading.value && <p>Loading...</p>}
      {error.value && <p>Error: {error.value.message}</p>}
      {!loading.value && !error.value && (
        <ul>
          {users.value.map(user => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### How do I refetch data when params change?

```typescript
export function UserProfile({ userId }: { userId: number }) {
  const user = signal<User | null>(null)
  const loading = signal(true)

  effect(() => {
    loading.value = true
    const controller = new AbortController()

    // Effect automatically re-runs when userId changes
    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        user.value = data
        loading.value = false
      })

    return () => controller.abort()
  })

  return <div>{loading.value ? 'Loading...' : user.value?.name}</div>
}
```

### How do I create a reusable fetch hook?

```typescript
import { signal, effect, Signal } from 'flexium'

interface UseFetchReturn<T> {
  data: Signal<T | null>
  loading: Signal<boolean>
  error: Signal<Error | null>
  refetch: () => void
}

export function useFetch<T>(url: string): UseFetchReturn<T> {
  const data = signal<T | null>(null)
  const loading = signal(true)
  const error = signal<Error | null>(null)
  const trigger = signal(0)

  effect(() => {
    // Access trigger to re-run on refetch
    trigger.value

    loading.value = true
    error.value = null

    const controller = new AbortController()

    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(result => {
        data.value = result
        loading.value = false
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          error.value = err
          loading.value = false
        }
      })

    return () => controller.abort()
  })

  const refetch = () => {
    trigger.value++
  }

  return { data, loading, error, refetch }
}

// Usage
const { data, loading, error, refetch } = useFetch<User[]>('/api/users')
```

---

## Animations

### How do I animate on mount/unmount?

```typescript
import { Motion } from 'flexium/primitives'

export function FadeIn({ children }) {
  return (
    <Motion
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      duration={300}
    >
      {children}
    </Motion>
  )
}
```

### How do I create stagger animations?

```typescript
const items = ['One', 'Two', 'Three']

<div>
  {items.map((item, index) => (
    <Motion
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      delay={index * 100}
      key={item}
    >
      <div>{item}</div>
    </Motion>
  ))}
</div>
```

### How do I animate based on signal changes?

```typescript
const isExpanded = signal(false)

<Motion
  animate={{
    height: isExpanded.value ? 'auto' : 0,
    opacity: isExpanded.value ? 1 : 0
  }}
  duration={200}
>
  <div>Expandable content</div>
</Motion>
```

---

## Lists & Tables

### How do I render a dynamic list?

```typescript
const items = signal(['Apple', 'Banana', 'Cherry'])

const addItem = () => {
  items.value = [...items.value, `Item ${items.value.length + 1}`]
}

const removeItem = (index: number) => {
  items.value = items.value.filter((_, i) => i !== index)
}

<div>
  <button onclick={addItem}>Add Item</button>
  <ul>
    {items.value.map((item, index) => (
      <li key={item}>
        {item}
        <button onclick={() => removeItem(index)}>Remove</button>
      </li>
    ))}
  </ul>
</div>
```

### How do I filter and sort lists?

```typescript
const allItems = signal([
  { id: 1, name: 'Apple', category: 'Fruit' },
  { id: 2, name: 'Carrot', category: 'Vegetable' },
  { id: 3, name: 'Banana', category: 'Fruit' }
])

const searchQuery = signal('')
const selectedCategory = signal('All')

const filteredItems = computed(() => {
  let result = allItems.value

  // Filter by search
  if (searchQuery.value) {
    result = result.filter(item =>
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // Filter by category
  if (selectedCategory.value !== 'All') {
    result = result.filter(item => item.category === selectedCategory.value)
  }

  return result
})

<div>
  <input
    placeholder="Search..."
    value={searchQuery.value}
    oninput={(e) => searchQuery.value = e.target.value}
  />

  <select onchange={(e) => selectedCategory.value = e.target.value}>
    <option>All</option>
    <option>Fruit</option>
    <option>Vegetable</option>
  </select>

  <ul>
    {filteredItems.value.map(item => (
      <li key={item.id}>{item.name}</li>
    ))}
  </ul>
</div>
```

---

## Routing

### How do I implement client-side routing?

```typescript
import { signal, effect } from 'flexium'

const currentRoute = signal(window.location.pathname)

// Listen to browser navigation
effect(() => {
  const handler = () => {
    currentRoute.value = window.location.pathname
  }

  window.addEventListener('popstate', handler)
  return () => window.removeEventListener('popstate', handler)
})

function navigate(path: string) {
  window.history.pushState({}, '', path)
  currentRoute.value = path
}

function Router() {
  return (
    <div>
      {currentRoute.value === '/' && <Home />}
      {currentRoute.value === '/about' && <About />}
      {currentRoute.value === '/contact' && <Contact />}
    </div>
  )
}

// Navigation
<button onclick={() => navigate('/about')}>About</button>
```

---

## Local Storage

### How do I persist state to localStorage?

```typescript
import { signal, effect } from 'flexium'

function createPersistedSignal<T>(key: string, initialValue: T) {
  // Load from localStorage
  const stored = localStorage.getItem(key)
  const sig = signal<T>(stored ? JSON.parse(stored) : initialValue)

  // Sync to localStorage on change
  effect(() => {
    localStorage.setItem(key, JSON.stringify(sig.value))
  })

  return sig
}

// Usage
const theme = createPersistedSignal('theme', 'light')
const user = createPersistedSignal('user', null)
```

---

## Debouncing & Throttling

### How do I debounce input?

```typescript
import { signal, computed } from 'flexium'

const searchInput = signal('')
const debouncedSearch = signal('')

let debounceTimer: number

const handleInput = (value: string) => {
  searchInput.value = value

  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    debouncedSearch.value = value
  }, 300)
}

<input
  value={searchInput.value}
  oninput={(e) => handleInput(e.target.value)}
/>

// Use debouncedSearch for API calls
effect(() => {
  if (debouncedSearch.value) {
    fetch(`/api/search?q=${debouncedSearch.value}`)
  }
})
```

---

## Modals & Dialogs

### How do I create a modal?

```typescript
import { signal } from 'flexium'

const isOpen = signal(false)

function Modal({ children }) {
  if (!isOpen.value) return null

  return (
    <div class="modal-overlay" onclick={() => isOpen.value = false}>
      <div class="modal-content" onclick={(e) => e.stopPropagation()}>
        {children}
        <button onclick={() => isOpen.value = false}>Close</button>
      </div>
    </div>
  )
}

// Usage
<button onclick={() => isOpen.value = true}>Open Modal</button>
<Modal>
  <h2>Modal Content</h2>
  <p>This is a modal dialog.</p>
</Modal>
```

---

## Dark Mode

### How do I implement dark mode?

```typescript
import { signal, effect } from 'flexium'

const isDark = signal(
  localStorage.getItem('theme') === 'dark' ||
  window.matchMedia('(prefers-color-scheme: dark)').matches
)

effect(() => {
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
})

function ThemeToggle() {
  return (
    <button onclick={() => isDark.value = !isDark.value}>
      {isDark.value ? '☀️ Light' : '🌙 Dark'}
    </button>
  )
}
```

---

## More Recipes

For more examples, see:
- [Examples Directory](../examples/)
- [Best Practices](./BEST_PRACTICES.md)
- [API Documentation](./API.md)
