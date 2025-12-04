# Flexium Recipes

Common patterns and solutions for building applications with Flexium.

## Table of Contents

- [Data Fetching](#data-fetching)
- [Forms & Validation](#forms--validation)
- [Lists & Tables](#lists--tables)
- [Animations](#animations)
- [Authentication](#authentication)
- [State Persistence](#state-persistence)
- [Optimistic Updates](#optimistic-updates)
- [Infinite Scroll](#infinite-scroll)
- [Debouncing & Throttling](#debouncing--throttling)
- [Modal & Dialog](#modal--dialog)

---

## Data Fetching

### Basic Data Fetching with state()

```tsx
import { state } from 'flexium'
import { render } from 'flexium/dom'

function UserProfile({ userId }) {
  // Async state with automatic loading/error handling
  const [user, { refetch, loading, error }] = state(
    async () => {
      const res = await fetch(`/api/users/${userId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    { key: `user-${userId}` }
  )

  return (
    <div>
      {loading() && <p>Loading...</p>}
      {error() && <p>Error: {error().message}</p>}
      {user() && (
        <div>
          <h1>{user().name}</h1>
          <p>{user().email}</p>
          <button onClick={refetch}>Refresh</button>
        </div>
      )}
    </div>
  )
}
```

### Dependent Data Fetching

```tsx
import { state, effect } from 'flexium'

function PostWithComments({ postId }) {
  const [post] = state(async () => {
    const res = await fetch(`/api/posts/${postId}`)
    return res.json()
  })

  // Fetch comments only after post is loaded
  const [comments] = state(
    async () => {
      if (!post()) return []
      const res = await fetch(`/api/posts/${postId}/comments`)
      return res.json()
    },
    { dependencies: [post] }
  )

  return (
    <div>
      <h1>{post()?.title}</h1>
      <p>{post()?.body}</p>
      <h2>Comments ({comments()?.length || 0})</h2>
      <For each={comments()}>
        {(comment) => <p>{comment.text}</p>}
      </For>
    </div>
  )
}
```

### Caching & Revalidation

```tsx
import { state } from 'flexium'

// Global cached state with stale-while-revalidate pattern
const [products, { refetch }] = state(
  async () => {
    const res = await fetch('/api/products')
    return res.json()
  },
  {
    key: 'products', // Global key for caching
    staleTime: 60000, // Consider fresh for 1 minute
  }
)

// Use in any component - same cached data
function ProductList() {
  return (
    <For each={products()}>
      {(product) => <ProductCard product={product} />}
    </For>
  )
}
```

---

## Forms & Validation

### Controlled Form with Validation

```tsx
import { state, computed } from 'flexium'

function ContactForm() {
  const [name, setName] = state('')
  const [email, setEmail] = state('')
  const [message, setMessage] = state('')
  const [submitted, setSubmitted] = state(false)

  // Validation rules
  const errors = computed(() => {
    const errs = {}
    if (!name()) errs.name = 'Name is required'
    if (!email()) errs.email = 'Email is required'
    else if (!email().includes('@')) errs.email = 'Invalid email'
    if (!message()) errs.message = 'Message is required'
    return errs
  })

  const isValid = computed(() => Object.keys(errors()).length === 0)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid()) return

    await fetch('/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name: name(), email: email(), message: message() })
    })
    setSubmitted(true)
  }

  return (
    <Show when={!submitted()} fallback={<p>Thank you for your message!</p>}>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            value={name()}
            onInput={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <Show when={errors().name}>
            <span class="error">{errors().name}</span>
          </Show>
        </div>

        <div>
          <input
            type="email"
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
            placeholder="Email"
          />
          <Show when={errors().email}>
            <span class="error">{errors().email}</span>
          </Show>
        </div>

        <div>
          <textarea
            value={message()}
            onInput={(e) => setMessage(e.target.value)}
            placeholder="Message"
          />
          <Show when={errors().message}>
            <span class="error">{errors().message}</span>
          </Show>
        </div>

        <button type="submit" disabled={!isValid()}>
          Send
        </button>
      </form>
    </Show>
  )
}
```

### Dynamic Form Fields

```tsx
import { state, For } from 'flexium'

function DynamicForm() {
  const [fields, setFields] = state([{ id: 1, value: '' }])

  const addField = () => {
    setFields([...fields(), { id: Date.now(), value: '' }])
  }

  const removeField = (id) => {
    setFields(fields().filter((f) => f.id !== id))
  }

  const updateField = (id, value) => {
    setFields(fields().map((f) => (f.id === id ? { ...f, value } : f)))
  }

  return (
    <div>
      <For each={fields()}>
        {(field) => (
          <div class="field-row">
            <input
              value={field.value}
              onInput={(e) => updateField(field.id, e.target.value)}
            />
            <button onClick={() => removeField(field.id)}>Remove</button>
          </div>
        )}
      </For>
      <button onClick={addField}>Add Field</button>
    </div>
  )
}
```

---

## Lists & Tables

### Sortable List

```tsx
import { state, computed } from 'flexium'

function SortableTable({ data }) {
  const [sortKey, setSortKey] = state('name')
  const [sortDir, setSortDir] = state('asc')

  const sortedData = computed(() => {
    const sorted = [...data()].sort((a, b) => {
      const aVal = a[sortKey()]
      const bVal = b[sortKey()]
      if (aVal < bVal) return sortDir() === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir() === 'asc' ? 1 : -1
      return 0
    })
    return sorted
  })

  const toggleSort = (key) => {
    if (sortKey() === key) {
      setSortDir(sortDir() === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <table>
      <thead>
        <tr>
          <th onClick={() => toggleSort('name')}>
            Name {sortKey() === 'name' && (sortDir() === 'asc' ? '↑' : '↓')}
          </th>
          <th onClick={() => toggleSort('email')}>
            Email {sortKey() === 'email' && (sortDir() === 'asc' ? '↑' : '↓')}
          </th>
        </tr>
      </thead>
      <tbody>
        <For each={sortedData()}>
          {(row) => (
            <tr>
              <td>{row.name}</td>
              <td>{row.email}</td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  )
}
```

### Filtered List with Search

```tsx
import { state, computed } from 'flexium'

function FilteredList({ items }) {
  const [search, setSearch] = state('')
  const [category, setCategory] = state('all')

  const filteredItems = computed(() => {
    return items().filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(search().toLowerCase())
      const matchesCategory = category() === 'all' || item.category === category()
      return matchesSearch && matchesCategory
    })
  })

  return (
    <div>
      <input
        value={search()}
        onInput={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />

      <select value={category()} onChange={(e) => setCategory(e.target.value)}>
        <option value="all">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
      </select>

      <p>{filteredItems().length} items</p>

      <For each={filteredItems()}>
        {(item) => <ItemCard item={item} />}
      </For>
    </div>
  )
}
```

---

## Animations

### Transition on State Change

```tsx
import { state, effect } from 'flexium'

function FadeTransition({ children, show }) {
  const [visible, setVisible] = state(show())
  const [opacity, setOpacity] = state(show() ? 1 : 0)

  effect(() => {
    if (show()) {
      setVisible(true)
      requestAnimationFrame(() => setOpacity(1))
    } else {
      setOpacity(0)
      setTimeout(() => setVisible(false), 300)
    }
  })

  return (
    <Show when={visible()}>
      <div
        style={{
          opacity: opacity(),
          transition: 'opacity 300ms ease-in-out',
        }}
      >
        {children}
      </div>
    </Show>
  )
}
```

### Animated Counter

```tsx
import { state, effect } from 'flexium'

function AnimatedCounter({ value }) {
  const [displayed, setDisplayed] = state(value())

  effect(() => {
    const target = value()
    const current = displayed()
    if (target === current) return

    const step = target > current ? 1 : -1
    const duration = 500
    const steps = Math.abs(target - current)
    const interval = duration / steps

    let i = 0
    const timer = setInterval(() => {
      i++
      setDisplayed(current + step * i)
      if (i >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  })

  return <span class="counter">{displayed()}</span>
}
```

---

## Authentication

### Auth Context Pattern

```tsx
import { state, createContext, useContext } from 'flexium'

const AuthContext = createContext(null)

function AuthProvider({ children }) {
  const [user, setUser] = state(null)
  const [loading, setLoading] = state(true)

  // Check session on mount
  onMount(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) setUser(await res.json())
    } finally {
      setLoading(false)
    }
  })

  const login = async (credentials) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    if (res.ok) setUser(await res.json())
    return res.ok
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Use in components
function Profile() {
  const { user, logout } = useContext(AuthContext)

  return (
    <Show when={user()} fallback={<LoginForm />}>
      <div>
        <p>Welcome, {user().name}</p>
        <button onClick={logout}>Logout</button>
      </div>
    </Show>
  )
}
```

---

## State Persistence

### LocalStorage Sync

```tsx
import { state, effect } from 'flexium'

function createPersistedState(key, initial) {
  // Load from localStorage
  const stored = localStorage.getItem(key)
  const [value, setValue] = state(stored ? JSON.parse(stored) : initial)

  // Sync to localStorage on change
  effect(() => {
    localStorage.setItem(key, JSON.stringify(value()))
  })

  return [value, setValue]
}

// Usage
function Settings() {
  const [theme, setTheme] = createPersistedState('theme', 'light')
  const [fontSize, setFontSize] = createPersistedState('fontSize', 16)

  return (
    <div>
      <select value={theme()} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>

      <input
        type="range"
        min="12"
        max="24"
        value={fontSize()}
        onInput={(e) => setFontSize(+e.target.value)}
      />
    </div>
  )
}
```

---

## Optimistic Updates

### Optimistic Todo Toggle

```tsx
import { state } from 'flexium'

function TodoItem({ todo, onUpdate }) {
  const [optimisticDone, setOptimisticDone] = state(todo.done)

  const toggleDone = async () => {
    const newValue = !optimisticDone()
    setOptimisticDone(newValue) // Optimistic update

    try {
      await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done: newValue }),
      })
      onUpdate()
    } catch (error) {
      setOptimisticDone(!newValue) // Rollback on error
    }
  }

  return (
    <li class={optimisticDone() ? 'done' : ''}>
      <input type="checkbox" checked={optimisticDone()} onChange={toggleDone} />
      {todo.text}
    </li>
  )
}
```

---

## Infinite Scroll

### Load More Pattern

```tsx
import { state, onMount } from 'flexium'

function InfiniteList() {
  const [items, setItems] = state([])
  const [page, setPage] = state(1)
  const [loading, setLoading] = state(false)
  const [hasMore, setHasMore] = state(true)

  const loadMore = async () => {
    if (loading() || !hasMore()) return
    setLoading(true)

    const res = await fetch(`/api/items?page=${page()}`)
    const data = await res.json()

    setItems([...items(), ...data.items])
    setHasMore(data.hasMore)
    setPage(page() + 1)
    setLoading(false)
  }

  onMount(() => {
    loadMore()

    // Intersection observer for infinite scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 1.0 }
    )

    const sentinel = document.getElementById('scroll-sentinel')
    if (sentinel) observer.observe(sentinel)

    return () => observer.disconnect()
  })

  return (
    <div>
      <For each={items()}>{(item) => <ItemCard item={item} />}</For>

      <div id="scroll-sentinel">
        <Show when={loading()}>
          <p>Loading...</p>
        </Show>
        <Show when={!hasMore()}>
          <p>No more items</p>
        </Show>
      </div>
    </div>
  )
}
```

---

## Debouncing & Throttling

### Debounced Search

```tsx
import { state, effect } from 'flexium'

function debounce(fn, delay) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), delay)
  }
}

function SearchInput() {
  const [query, setQuery] = state('')
  const [results, setResults] = state([])
  const [loading, setLoading] = state(false)

  const search = debounce(async (q) => {
    if (!q) {
      setResults([])
      return
    }
    setLoading(true)
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
    setResults(await res.json())
    setLoading(false)
  }, 300)

  effect(() => {
    search(query())
  })

  return (
    <div>
      <input
        value={query()}
        onInput={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />

      <Show when={loading()}>
        <p>Searching...</p>
      </Show>

      <For each={results()}>{(result) => <ResultItem result={result} />}</For>
    </div>
  )
}
```

---

## Modal & Dialog

### Modal Component

```tsx
import { state, Show, Portal } from 'flexium'

function Modal({ isOpen, onClose, title, children }) {
  // Close on escape key
  effect(() => {
    if (!isOpen()) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  })

  return (
    <Show when={isOpen()}>
      <Portal>
        <div class="modal-overlay" onClick={onClose}>
          <div class="modal-content" onClick={(e) => e.stopPropagation()}>
            <div class="modal-header">
              <h2>{title}</h2>
              <button class="close-btn" onClick={onClose}>
                ×
              </button>
            </div>
            <div class="modal-body">{children}</div>
          </div>
        </div>
      </Portal>
    </Show>
  )
}

// Usage
function App() {
  const [showModal, setShowModal] = state(false)

  return (
    <div>
      <button onClick={() => setShowModal(true)}>Open Modal</button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Confirm Action"
      >
        <p>Are you sure you want to proceed?</p>
        <button onClick={() => setShowModal(false)}>Cancel</button>
        <button onClick={handleConfirm}>Confirm</button>
      </Modal>
    </div>
  )
}
```

---

## See Also

- [API Reference](/docs/API.md)
- [Best Practices](/docs/BEST_PRACTICES.md)
- [Examples](/examples/)
- [FAQ](/docs/FAQ.md)
