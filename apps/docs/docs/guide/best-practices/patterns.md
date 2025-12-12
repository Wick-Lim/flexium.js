---
title: Common Patterns
---

# Common Patterns

Learn practical patterns commonly used in Flexium.

## Form Handling Patterns

### Basic Form Pattern

```tsx
import { state } from 'flexium/core'

function LoginForm() {
  const form = state({
    email: '',
    password: ''
  })
  
  const errors = state<Record<string, string>>({})
  const touched = state<Record<string, boolean>>({})
  
  const handleSubmit = (e: Event) => {
    e.preventDefault()
    
    // Validation
    const newErrors: Record<string, string> = {}
    if (!form.email) newErrors.email = 'Email is required'
    if (!form.password) newErrors.password = 'Password is required'
    
    if (Object.keys(newErrors).length > 0) {
      errors.set(newErrors)
      return
    }
    
    // Submit
    submitForm(form.valueOf())
  }
  
  return (
    <form onsubmit={handleSubmit}>
      <input
        value={form.email}
        oninput={(e) => {
          form.set({ ...form.valueOf(), email: e.currentTarget.value })
          touched.set({ ...touched.valueOf(), email: true })
        }}
      />
      {touched.email && errors.email && <span>{errors.email}</span>}
      
      <input
        type="password"
        value={form.password}
        oninput={(e) => {
          form.set({ ...form.valueOf(), password: e.currentTarget.value })
          touched.set({ ...touched.valueOf(), password: true })
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
  const form = state({
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  // Real-time validation
  const errors = state(() => {
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
        oninput={(e) => form.set({ ...form.valueOf(), email: e.currentTarget.value })}
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
  const form = state({ email: '' })
  const isChecking = state(false)
  const emailError = state<string | null>(null)
  
  const checkEmailAvailability = async (email: string) => {
    if (!email) return
    
    isChecking.set(true)
    try {
      const res = await fetch(`/api/check-email?email=${email}`)
      const { available } = await res.json()
      
      if (!available) {
        emailError.set('Email is already in use')
      } else {
        emailError.set(null)
      }
    } catch (error) {
      emailError.set('Error checking email availability')
    } finally {
      isChecking.set(false)
    }
  }
  
  return (
    <form>
      <input
        value={form.email}
        oninput={(e) => {
          const email = e.currentTarget.value
          form.set({ ...form.valueOf(), email })
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
  const posts = state(async () => {
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
  const posts = state(async () => {
    const res = await fetch(`/api/users/${userId}/posts`)
    return res.json()
  }, { key: ['user', userId, 'posts'] })
  
  // Automatically refetch when userId changes
  effect(() => {
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
  const isLiked = state(false)
  const isUpdating = state(false)
  
  const toggleLike = async () => {
    // Optimistic update
    const previousValue = isLiked.valueOf()
    isLiked.set(!previousValue)
    isUpdating.set(true)
    
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        body: JSON.stringify({ liked: !previousValue })
      })
    } catch (error) {
      // Rollback on failure
      isLiked.set(previousValue)
      alert('Failed to update like')
    } finally {
      isUpdating.set(false)
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
  const items = state([])
  const page = state(1)
  const hasMore = state(true)
  const isLoading = state(false)
  
  const loadMore = async () => {
    if (isLoading.valueOf() || !hasMore.valueOf()) return
    
    isLoading.set(true)
    try {
      const res = await fetch(`/api/items?page=${page.valueOf()}`)
      const data = await res.json()
      
      items.set([...items.valueOf(), ...data.items])
      hasMore.set(data.hasMore)
      page.set(page.valueOf() + 1)
    } catch (error) {
      console.error('Failed to load more:', error)
    } finally {
      isLoading.set(false)
    }
  }
  
  effect(() => {
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
  const loadingState = state<LoadingState>('idle')
  const data = state(null)
  const error = state<Error | null>(null)
  
  const loadData = async () => {
    loadingState.set('loading')
    error.set(null)
    
    try {
      const res = await fetch('/api/data')
      const result = await res.json()
      
      data.set(result)
      loadingState.set('success')
    } catch (err) {
      error.set(err as Error)
      loadingState.set('error')
    }
  }
  
  return (
    <div>
      {loadingState.valueOf() === 'idle' && <button onclick={loadData}>Load</button>}
      {loadingState.valueOf() === 'loading' && <div>Loading...</div>}
      {loadingState.valueOf() === 'success' && <div>{JSON.stringify(data)}</div>}
      {loadingState.valueOf() === 'error' && (
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
  const formState = state<FormState>({ type: 'idle' })
  const formData = state({ email: '', password: '' })
  
  const handleSubmit = async () => {
    // Validation phase
    formState.set({ type: 'validating' })
    
    const errors = validateForm(formData.valueOf())
    if (errors.length > 0) {
      formState.set({ type: 'error', message: errors[0] })
      return
    }
    
    // Submission phase
    formState.set({ type: 'submitting' })
    
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        body: JSON.stringify(formData.valueOf())
      })
      const data = await res.json()
      
      formState.set({ type: 'success', data })
    } catch (error) {
      formState.set({ 
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
  const query = state('')
  const results = state([])
  
  effect(() => {
    if (!query.valueOf()) {
      results.set([])
      return
    }
    
    // Debouncing: search after 300ms
    const timeoutId = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${query.valueOf()}`)
      const data = await res.json()
      results.set(data.results)
    }, 300)
    
    return () => clearTimeout(timeoutId)
  })
  
  return (
    <div>
      <input
        value={query}
        oninput={(e) => query.set(e.currentTarget.value)}
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
  const scrollY = state(0)
  const lastUpdate = state(0)
  
  effect(() => {
    const handleScroll = () => {
      const now = Date.now()
      // Update only once per 100ms
      if (now - lastUpdate.valueOf() > 100) {
        scrollY.set(window.scrollY)
        lastUpdate.set(now)
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
  const form = state(() => {
    // Get initial value from local storage
    const saved = localStorage.getItem('form-data')
    return saved ? JSON.parse(saved) : { email: '', name: '' }
  })
  
  // Save to local storage on state change
  effect(() => {
    localStorage.setItem('form-data', JSON.stringify(form.valueOf()))
  })
  
  return (
    <form>
      <input
        value={form.email}
        oninput={(e) => form.set({ ...form.valueOf(), email: e.currentTarget.value })}
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
export const theme = state<'light' | 'dark'>('light', {
  key: 'app:theme'
})

export const language = state('en', {
  key: 'app:language'
})

// components/ThemeToggle.tsx
import { theme } from '../app/state'

function ThemeToggle() {
  return (
    <button onclick={() => theme.set(theme.valueOf() === 'light' ? 'dark' : 'light')}>
      {theme.valueOf() === 'light' ? '🌙' : '☀️'}
    </button>
  )
}
```

---

## Error Handling Patterns

### Global Error Handling

```tsx
// app/error-handler.ts
export const globalError = state<Error | null>(null, {
  key: 'app:error'
})

export function handleError(error: Error) {
  globalError.set(error)
  console.error('Global error:', error)
}

// components/ErrorBoundary.tsx
import { globalError } from '../app/error-handler'

function ErrorBoundary({ children }: { children: any }) {
  if (globalError.valueOf()) {
    return (
      <div>
        <h2>An error occurred</h2>
        <p>{globalError.message}</p>
        <button onclick={() => globalError.set(null)}>Close</button>
      </div>
    )
  }
  
  return children
}
```

---

## Related Documentation

- [state() API](/docs/core/state) - State API documentation
- [effect() API](/docs/core/effect) - Side effect API
- [Best Practices - State Organization](/docs/guide/best-practices/state-organization)
- [Best Practices - Performance Optimization](/docs/guide/best-practices/performance)