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
  const [isOpen, setIsOpen] = useState(false)  // Only used in this component
  const [selectedItem, setSelectedItem] = useState(null)  // Modal internal state
  
  return isOpen ? <div>...</div> : null
}

function Form() {
  const [formData, setFormData] = useState({
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
const [user, setUser] = useState(null, { key: 'auth:user' })

// 2. App settings (dark mode, etc.)
const [theme, setTheme] = useState('light', { key: 'app:theme' })

// 3. Server data caching
const [posts, setPosts] = useState(async () => {
  const res = await fetch('/api/posts')
  return res.json()
}, { key: ['posts', 'all'] })

// 4. Global UI state
const [notifications, setNotifications] = useState([], { key: 'app:notifications' })
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
const [user, setUser] = useState(null, { key: ['auth', 'user'] })
const [posts, setPosts] = useState([], { key: ['user', userId, 'posts'] })
const [settings, setSettings] = useState({}, { key: ['app', 'settings'] })

// ✅ Namespace usage
const [user, setUser] = useState(null, { key: 'auth:user' })
const [posts, setPosts] = useState([], { key: `user:${userId}:posts` })
const [settings, setSettings] = useState({}, { key: 'app:settings' })

// ✅ Clear and specific keys
const [cart, setCart] = useState([], { key: 'ecommerce:cart' })
const [checkout, setCheckout] = useState(null, { key: 'ecommerce:checkout' })
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
const [data, setData] = useState(null, { key: 'data' })
const [user, setUser] = useState(null, { key: 'user' })

// ❌ Unclear meaning
const [state1, setState1] = useState(null, { key: 'state1' })
const [temp, setTemp] = useState(null, { key: 'temp' })

// ❌ High collision risk
const [count, setCount] = useState(0, { key: 'count' })  // Can be used in multiple places
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
  const [user, setUser] = useState(null, { key: ['user', userId] })
  
  // User's posts
  const [posts, setPosts] = useState([], { key: ['user', userId, 'posts'] })
  
  // User's followers
  const [followers, setFollowers] = useState([], { key: ['user', userId, 'followers'] })
  
  return <div>...</div>
}

// ✅ Expressing hierarchy with array keys
const [appState, setAppState] = useState({}, { key: ['app', 'state'] })
const [userState, setUserState] = useState({}, { key: ['app', 'user', 'state'] })
const [adminState, setAdminState] = useState({}, { key: ['app', 'admin', 'state'] })
```

---

### Using Dynamic Keys

```tsx
// ✅ Managing per-user state with dynamic keys
function PostDetail({ postId }: { postId: number }) {
  const [post, setPost] = useState(async () => {
    const res = await fetch(`/api/posts/${postId}`)
    return res.json()
  }, { key: ['posts', postId] })
  
  const [comments, setComments] = useState(async () => {
    const res = await fetch(`/api/posts/${postId}/comments`)
    return res.json()
  }, { key: ['posts', postId, 'comments'] })
  
  return <div>...</div>
}

// ✅ Creating keys with template literals
function ProductPage({ productId }: { productId: string }) {
  const [product, setProduct] = useState(null, { key: `product:${productId}` })
  const [reviews, setReviews] = useState([], { key: `product:${productId}:reviews` })
  
  return <div>...</div>
}
```

---

## State Cleanup

### Deleting Unused Global State

```tsx
// ✅ Cleanup on component unmount
import { useState, useEffect } from 'flexium/core'

function TemporaryComponent() {
  const [data, setData] = useState(async () => {
    return fetch('/api/temp-data').then(r => r.json())
  }, { key: 'temp:data' })

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      useState.delete('temp:data')
    }
  })

  return <div>...</div>
}

// ✅ Conditional cleanup
function ConditionalComponent({ show }: { show: boolean }) {
  const [data, setData] = useState(async () => {
    return fetch('/api/data').then(r => r.json())
  }, { key: 'conditional:data' })

  useEffect(() => {
    if (!show) {
      // Cleanup when no longer needed
      useState.delete('conditional:data')
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
  useState.delete(['user', userId])
  useState.delete(['user', userId, 'posts'])
  useState.delete(['user', userId, 'followers'])
}

// ✅ Cleanup by namespace
function cleanupEcommerce() {
  useState.delete('ecommerce:cart')
  useState.delete('ecommerce:checkout')
  useState.delete('ecommerce:payment')
}

// ✅ Cleanup in useEffect cleanup
useEffect(() => {
  const [tempData, setTempData] = useState(null, { key: 'temp:data' })

  return () => {
    useState.delete('temp:data')  // cleanup
  }
})
```

---

## Real App Structure Example

### Typical App Structure

```tsx
// app/state.ts - Global state definitions

// Authentication
export const [user, setUser] = useState<User | null>(null, { key: 'auth:user' })
export const [isAuthenticated, setIsAuthenticated] = useState(() => user !== null)

// App settings
export const [theme, setTheme] = useState<'light' | 'dark'>('light', { key: 'app:theme' })
export const [language, setLanguage] = useState('en', { key: 'app:language' })

// Data caching
export const [posts, setPosts] = useState(async () => {
  const res = await fetch('/api/posts')
  return res.json()
}, { key: ['posts', 'all'] })

// UI state
export const [notifications, setNotifications] = useState<Notification[]>([], {
  key: 'app:notifications'
})
```

```tsx
// components/UserProfile.tsx - Per-user state
function UserProfile({ userId }: { userId: number }) {
  // User information (cached)
  const [user, setUser] = useState(async () => {
    const res = await fetch(`/api/users/${userId}`)
    return res.json()
  }, { key: ['user', userId] })
  
  // User's posts
  const [posts, setPosts] = useState(async () => {
    const res = await fetch(`/api/users/${userId}/posts`)
    return res.json()
  }, { key: ['user', userId, 'posts'] })
  
  // Local UI state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', bio: '' })
  
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

- [useState() API](/docs/core/state) - State API documentation
- [Anti-patterns](/docs/guide/best-practices/anti-patterns) - Patterns to avoid
- [Performance Optimization](/docs/guide/best-practices/performance) - Performance guide