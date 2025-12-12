---
title: State Organization Guide
---

# State Organization Guide

Learn how to effectively structure and manage state in Flexium.

## Local vs Global State

### When to Use Local State

Local state is state that is only used within a component.

```tsx
// ✅ Local state example
function Modal() {
  const isOpen = state(false)  // Only used in this component
  const selectedItem = state(null)  // Modal internal state
  
  return isOpen ? <div>...</div> : null
}

function Form() {
  const formData = state({
    email: '',
    password: ''
  })  // Form internal state
  
  return <form>...</form>
}
```

**Use local state when:**
- Only used within the component
- Not needed to be shared with other components
- Can be discarded when component unmounts

---

### When to Use Global State

Global state is state that is shared across multiple components.

```tsx
// ✅ Global state examples

// 1. User authentication (accessed app-wide)
const user = state(null, { key: 'auth:user' })

// 2. App settings (dark mode, etc.)
const theme = state('light', { key: 'app:theme' })

// 3. Server data caching
const posts = state(async () => {
  const res = await fetch('/api/posts')
  return res.json()
}, { key: ['posts', 'all'] })

// 4. Global UI state
const notifications = state([], { key: 'app:notifications' })
```

**Use global state when:**
- Need to be shared across multiple components
- Need to be accessed app-wide
- Need server state caching
- State is independent of component lifecycle

---

## State Key Naming Conventions

### Good Key Naming

```tsx
// ✅ Hierarchical keys
const user = state(null, { key: ['auth', 'user'] })
const posts = state([], { key: ['user', userId, 'posts'] })
const settings = state({}, { key: ['app', 'settings'] })

// ✅ Namespace usage
const user = state(null, { key: 'auth:user' })
const posts = state([], { key: `user:${userId}:posts` })
const settings = state({}, { key: 'app:settings' })

// ✅ Clear and specific keys
const cart = state([], { key: 'ecommerce:cart' })
const checkout = state(null, { key: 'ecommerce:checkout' })
```

**Characteristics of good keys:**
- Clear meaning
- Low collision risk
- Reflects hierarchical structure
- Grouped by namespace

---

### Bad Key Naming

```tsx
// ❌ Too generic
const data = state(null, { key: 'data' })
const user = state(null, { key: 'user' })

// ❌ Unclear meaning
const state1 = state(null, { key: 'state1' })
const temp = state(null, { key: 'temp' })

// ❌ High collision risk
const count = state(0, { key: 'count' })  // Can be used in multiple places
```

**Characteristics of bad keys:**
- Too generic or ambiguous
- High collision risk
- Doesn't reflect structure

---

## Hierarchical State Management

### Using Hierarchical Keys

```tsx
// ✅ Managing state with hierarchical structure
function UserProfile({ userId }: { userId: number }) {
  // User information
  const user = state(null, { key: ['user', userId] })
  
  // User's posts
  const posts = state([], { key: ['user', userId, 'posts'] })
  
  // User's followers
  const followers = state([], { key: ['user', userId, 'followers'] })
  
  return <div>...</div>
}

// ✅ Expressing hierarchy with array keys
const appState = state({}, { key: ['app', 'state'] })
const userState = state({}, { key: ['app', 'user', 'state'] })
const adminState = state({}, { key: ['app', 'admin', 'state'] })
```

---

### Using Dynamic Keys

```tsx
// ✅ Managing per-user state with dynamic keys
function PostDetail({ postId }: { postId: number }) {
  const post = state(async () => {
    const res = await fetch(`/api/posts/${postId}`)
    return res.json()
  }, { key: ['posts', postId] })
  
  const comments = state(async () => {
    const res = await fetch(`/api/posts/${postId}/comments`)
    return res.json()
  }, { key: ['posts', postId, 'comments'] })
  
  return <div>...</div>
}

// ✅ Creating keys with template literals
function ProductPage({ productId }: { productId: string }) {
  const product = state(null, { key: `product:${productId}` })
  const reviews = state([], { key: `product:${productId}:reviews` })
  
  return <div>...</div>
}
```

---

## State Cleanup

### Deleting Unused Global State

```tsx
// ✅ Cleanup on component unmount
import { state, effect } from 'flexium/core'

function TemporaryComponent() {
  const data = state(async () => {
    return fetch('/api/temp-data').then(r => r.json())
  }, { key: 'temp:data' })
  
  // Cleanup on component unmount
  effect(() => {
    return () => {
      state.delete('temp:data')
    }
  })
  
  return <div>...</div>
}

// ✅ Conditional cleanup
function ConditionalComponent({ show }: { show: boolean }) {
  const data = state(async () => {
    return fetch('/api/data').then(r => r.json())
  }, { key: 'conditional:data' })
  
  effect(() => {
    if (!show) {
      // Cleanup when no longer needed
      state.delete('conditional:data')
    }
  })
  
  return show ? <div>...</div> : null
}
```

---

### State Cleanup Patterns

```tsx
// ✅ Cleanup multiple keys at once
function cleanupUserData(userId: number) {
  state.delete(['user', userId])
  state.delete(['user', userId, 'posts'])
  state.delete(['user', userId, 'followers'])
}

// ✅ Cleanup by namespace
function cleanupEcommerce() {
  state.delete('ecommerce:cart')
  state.delete('ecommerce:checkout')
  state.delete('ecommerce:payment')
}

// ✅ Cleanup in effect cleanup
effect(() => {
  const tempData = state(null, { key: 'temp:data' })
  
  return () => {
    state.delete('temp:data')  // cleanup
  }
})
```

---

## Real App Structure Example

### Typical App Structure

```tsx
// app/state.ts - Global state definitions

// Authentication
export const user = state<User | null>(null, { key: 'auth:user' })
export const isAuthenticated = state(() => user.valueOf() !== null)

// App settings
export const theme = state<'light' | 'dark'>('light', { key: 'app:theme' })
export const language = state('en', { key: 'app:language' })

// Data caching
export const posts = state(async () => {
  const res = await fetch('/api/posts')
  return res.json()
}, { key: ['posts', 'all'] })

// UI state
export const notifications = state<Notification[]>([], {
  key: 'app:notifications'
})
```

```tsx
// components/UserProfile.tsx - Per-user state
function UserProfile({ userId }: { userId: number }) {
  // User information (cached)
  const user = state(async () => {
    const res = await fetch(`/api/users/${userId}`)
    return res.json()
  }, { key: ['user', userId] })
  
  // User's posts
  const posts = state(async () => {
    const res = await fetch(`/api/users/${userId}/posts`)
    return res.json()
  }, { key: ['user', userId, 'posts'] })
  
  // Local UI state
  const isEditing = state(false)
  const editForm = state({ name: '', bio: '' })
  
  return <div>...</div>
}
```

---

## State Organization Checklist

### Things to Check Before Adding State

- [ ] Is this state shared across multiple components? → Global state
- [ ] Is this state only used within the component? → Local state
- [ ] Is the key clear and has low collision risk?
- [ ] Does it reflect hierarchical structure?
- [ ] Do you have a plan for when to clean it up?

---

## Related Documentation

- [state() API](/docs/core/state) - State API documentation
- [Anti-patterns](/docs/guide/best-practices/anti-patterns) - Patterns to avoid
- [Performance Optimization](/docs/guide/best-practices/performance) - Performance guide