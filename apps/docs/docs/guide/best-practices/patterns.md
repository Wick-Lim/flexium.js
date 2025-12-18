---
title: Common Patterns
---

# Common Patterns

Learn practical patterns commonly used in Flexium.

## Form Handling Patterns

### Basic Form Pattern

```tsx
import { useState } from 'flexium/core'

function LoginForm() {
  const [form, setForm] = use({
    email: '',
    password: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleSubmit = (e: Event) => {
    e.preventDefault()

    // Validation
    const newErrors: Record<string, string> = {}
    if (!form.email) newErrors.email = 'Email is required'
    if (!form.password) newErrors.password = 'Password is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Submit
    submitForm(form)
  }

  return (
    <form onsubmit={handleSubmit}>
      <input
        value={form.email}
        oninput={(e) => {
          setForm({ ...form, email: e.currentTarget.value })
          setTouched({ ...touched, email: true })
        }}
      />
      {touched.email && errors.email && <span>{errors.email}</span>}

      <input
        type="password"
        value={form.password}
        oninput={(e) => {
          setForm({ ...form, password: e.currentTarget.value })
          setTouched({ ...touched, password: true })
        }}
      />
      {touched.password && errors.password && <span>{errors.password}</span>}

      <button type="submit">Login</button>
    </form>
  )
}
```

---

### Real-time Validation Pattern

```tsx
function FormWithValidation() {
  const [form, setForm] = use({
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Real-time validation
  const [errors] = use(() => {
    const errs: Record<string, string> = {}

    if (form.email && !form.email.includes('@')) {
      errs.email = 'Invalid email format'
    }

    if (form.password && form.password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    }

    if (form.confirmPassword && form.password !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }

    return errs
  })

  return (
    <form>
      <input
        value={form.email}
        oninput={(e) => setForm({ ...form, email: e.currentTarget.value })}
      />
      {errors.email && <span>{errors.email}</span>}

      {/* ... */}
    </form>
  )
}
```

---

### Async Validation Pattern

```tsx
function FormWithAsyncValidation() {
  const [form, setForm] = use({ email: '' })
  const [isChecking, setIsChecking] = use(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  const checkEmailAvailability = async (email: string) => {
    if (!email) return

    setIsChecking(true)
    try {
      const res = await fetch(`/api/check-email?email=${email}`)
      const { available } = await res.json()

      if (!available) {
        setEmailError('Email is already in use')
      } else {
        setEmailError(null)
      }
    } catch (error) {
      setEmailError('Error checking email availability')
    } finally {
      setIsChecking(false)
    }
  }

  return (
    <form>
      <input
        value={form.email}
        oninput={(e) => {
          const email = e.currentTarget.value
          setForm({ ...form, email })
          checkEmailAvailability(email)
        }}
      />
      {isChecking && <span>Checking...</span>}
      {emailError && <span>{emailError}</span>}
    </form>
  )
}
```

---

## Data Fetching Patterns

### Basic Data Fetching

```tsx
function PostList() {
  const [posts] = use(async () => {
    const res = await fetch('/api/posts')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  })

  if (String(posts.status) === 'loading') {
    return <div>Loading...</div>
  }

  if (String(posts.status) === 'error') {
    return (
      <div>
        <p>Error: {posts.error?.message}</p>
        <button onclick={posts.refetch}>Retry</button>
      </div>
    )
  }

  return (
    <div>
      <button onclick={posts.refetch}>Refresh</button>
      {posts.map(post => (
        <Post key={post.id} {...post} />
      ))}
    </div>
  )
}
```

---

### Data Fetching with Parameters

```tsx
function UserPosts({ userId }: { userId: number }) {
  const [posts] = use(async () => {
    const res = await fetch(`/api/users/${userId}/posts`)
    return res.json()
  }, { key: ['user', userId, 'posts'] })

  // Automatically refetch when userId changes
  use(() => {
    const id = userId  // Dependency tracking
    posts.refetch()
  })

  return <div>...</div>
}
```

---

### Optimistic Update Pattern

```tsx
function LikeButton({ postId }: { postId: number }) {
  const [isLiked, setIsLiked] = use(false)
  const [isUpdating, setIsUpdating] = use(false)

  const toggleLike = async () => {
    // Optimistic update
    const previousValue = isLiked
    setIsLiked(!previousValue)
    setIsUpdating(true)

    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        body: JSON.stringify({ liked: !previousValue })
      })
    } catch (error) {
      // Rollback on failure
      setIsLiked(previousValue)
      alert('Failed to update like')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <button onclick={toggleLike} disabled={isUpdating}>
      {isLiked ? '❤️' : '🤍'}
    </button>
  )
}
```

---

### Infinite Scroll Pattern

```tsx
function InfiniteScrollList() {
  const [items, setItems] = use([])
  const [page, setPage] = use(1)
  const [hasMore, setHasMore] = use(true)
  const [isLoading, setIsLoading] = use(false)

  const loadMore = async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/items?page=${page}`)
      const data = await res.json()

      setItems([...items, ...data.items])
      setHasMore(data.hasMore)
      setPage(page + 1)
    } catch (error) {
      console.error('Failed to load more:', error)
    } finally {
      setIsLoading(false)
    }
  }

  use(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  })

  return (
    <div>
      {items.map(item => <Item key={item.id} {...item} />)}
      {isLoading && <div>Loading...</div>}
      {!hasMore && <div>No more data</div>}
    </div>
  )
}
```

---

## State Machine Patterns

### Basic State Machine

```tsx
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

function DataLoader() {
  const [loadingState, setLoadingState] = useState<LoadingState>('idle')
  const [data, setData] = use(null)
  const [error, setError] = useState<Error | null>(null)

  const loadData = async () => {
    setLoadingState('loading')
    setError(null)

    try {
      const res = await fetch('/api/data')
      const result = await res.json()

      setData(result)
      setLoadingState('success')
    } catch (err) {
      setError(err as Error)
      setLoadingState('error')
    }
  }

  return (
    <div>
      {loadingState === 'idle' && <button onclick={loadData}>Load</button>}
      {loadingState === 'loading' && <div>Loading...</div>}
      {loadingState === 'success' && <div>{JSON.stringify(data)}</div>}
      {loadingState === 'error' && (
        <div>
          <p>Error: {error?.message}</p>
          <button onclick={loadData}>Retry</button>
        </div>
      )}
    </div>
  )
}
```

---

### Complex State Machine

```tsx
type FormState =
  | { type: 'idle' }
  | { type: 'validating' }
  | { type: 'submitting' }
  | { type: 'success'; data: any }
  | { type: 'error'; message: string }

function ComplexForm() {
  const [formState, setFormState] = useState<FormState>({ type: 'idle' })
  const [formData, setFormData] = use({ email: '', password: '' })

  const handleSubmit = async () => {
    // Validation phase
    setFormState({ type: 'validating' })

    const errors = validateForm(formData)
    if (errors.length > 0) {
      setFormState({ type: 'error', message: errors[0] })
      return
    }

    // Submission phase
    setFormState({ type: 'submitting' })

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      setFormState({ type: 'success', data })
    } catch (error) {
      setFormState({
        type: 'error',
        message: (error as Error).message
      })
    }
  }

  return (
    <div>
      {formState.type === 'idle' && (
        <form onsubmit={(e) => { e.preventDefault(); handleSubmit() }}>
          {/* ... */}
        </form>
      )}
      {formState.type === 'validating' && <div>Validating...</div>}
      {formState.type === 'submitting' && <div>Submitting...</div>}
      {formState.type === 'success' && <div>Success!</div>}
      {formState.type === 'error' && <div>Error: {formState.message}</div>}
    </div>
  )
}
```

---

## Debouncing/Throttling Patterns

### Debouncing Pattern

```tsx
function SearchInput() {
  const [query, setQuery] = use('')
  const [results, setResults] = use([])

  use(() => {
    if (!query) {
      setResults([])
      return
    }

    // Debouncing: search after 300ms
    const timeoutId = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${query}`)
      const data = await res.json()
      setResults(data.results)
    }, 300)

    return () => clearTimeout(timeoutId)
  })

  return (
    <div>
      <input
        value={query}
        oninput={(e) => setQuery(e.currentTarget.value)}
      />
      <ul>
        {results.map(result => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

### Throttling Pattern

```tsx
function ScrollTracker() {
  const [scrollY, setScrollY] = use(0)
  const [lastUpdate, setLastUpdate] = use(0)

  use(() => {
    const handleScroll = () => {
      const now = Date.now()
      // Update only once per 100ms
      if (now - lastUpdate > 100) {
        setScrollY(window.scrollY)
        setLastUpdate(now)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  })

  return <div>Scroll Y: {scrollY}</div>
}
```

---

## Local Storage Synchronization Pattern

### Saving State to Local Storage

```tsx
function PersistentForm() {
  const [form, setForm] = use(() => {
    // Get initial value from local storage
    const saved = localStorage.getItem('form-data')
    return saved ? JSON.parse(saved) : { email: '', name: '' }
  })

  // Save to local storage on state change
  use(() => {
    localStorage.setItem('form-data', JSON.stringify(form))
  })

  return (
    <form>
      <input
        value={form.email}
        oninput={(e) => setForm({ ...form, email: e.currentTarget.value })}
      />
      {/* ... */}
    </form>
  )
}
```

---

## Global State Patterns

### Global Settings Management

```tsx
// app/state.ts
export const [theme, setTheme] = useState<'light' | 'dark'>('light', {
  key: 'app:theme'
})

export const [language, setLanguage] = use('en', {
  key: 'app:language'
})

// components/ThemeToggle.tsx
import { theme, setTheme } from '../app/state'

function ThemeToggle() {
  return (
    <button onclick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

---

## Error Handling Patterns

### Global Error Handling

```tsx
// app/error-handler.ts
export const [globalError, setGlobalError] = useState<Error | null>(null, {
  key: 'app:error'
})

export function handleError(error: Error) {
  setGlobalError(error)
  console.error('Global error:', error)
}

// components/ErrorBoundary.tsx
import { globalError, setGlobalError } from '../app/error-handler'

function ErrorBoundary({ children }: { children: any }) {
  if (globalError) {
    return (
      <div>
        <h2>An error occurred</h2>
        <p>{globalError.message}</p>
        <button onclick={() => setGlobalError(null)}>Close</button>
      </div>
    )
  }

  return children
}
```

---

## Related Documentation

- [use() API](/docs/core/state) - State API documentation
- [use() API](/docs/core/effect) - Side effect API
- [Best Practices - State Organization](/docs/guide/best-practices/state-organization)
- [Best Practices - Performance Optimization](/docs/guide/best-practices/performance)
