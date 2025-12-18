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
  const [isOpen, setIsOpen] = use(false)  // Only used in this component
  const [selectedItem, setSelectedItem] = use(null)  // Modal internal state
  
  return isOpen ? <div>...</div> : null
}

function Form() {
  const [formData, setFormData] = use({
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
const [user, setUser] = use(null, { key: ['auth:user'] })

// 2. App settings (dark mode, etc.)
const [theme, setTheme] = use('light', { key: 'app:theme' })

// 3. Server data caching
const [posts, setPosts] = use(async () => {
  const res = await fetch('/api/posts')
  return res.json()
}, { key: ['posts', 'all'] })

// 4. Global UI state
const [notifications, setNotifications] = use([], { key: ['app:notifications'] })
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
const [user, setUser] = use(null, { key: ['auth', 'user'] })
const [posts, setPosts] = use([], { key: ['user', userId, 'posts'] })
const [settings, setSettings] = use({}, { key: ['app', 'settings'] })

// ✅ Namespace usage
const [user, setUser] = use(null, { key: ['auth:user'] })
const [posts, setPosts] = use([], { key: `user:${userId}:posts` })
const [settings, setSettings] = use({}, { key: 'app:settings' })

// ✅ Clear and specific keys
const [cart, setCart] = use([], { key: ['ecommerce:cart'] })
const [checkout, setCheckout] = use(null, { key: ['ecommerce:checkout'] })
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
const [data, setData] = use(null, { key: ['data'] })
const [user, setUser] = use(null, { key: ['user'] })

// ❌ Unclear meaning
const [state1, setState1] = use(null, { key: ['state1'] })
const [temp, setTemp] = use(null, { key: ['temp'] })

// ❌ High collision risk
const [count, setCount] = use(0, { key: 'count' })  // Can be used in multiple places
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
  const [user, setUser] = use(null, { key: ['user', userId] })
  
  // User's posts
  const [posts, setPosts] = use([], { key: ['user', userId, 'posts'] })
  
  // User's followers
  const [followers, setFollowers] = use([], { key: ['user', userId, 'followers'] })
  
  return <div>...</div>
}

// ✅ Expressing hierarchy with array keys
const [appState, setAppState] = use({}, { key: ['app', 'state'] })
const [userState, setUserState] = use({}, { key: ['app', 'user', 'state'] })
const [adminState, setAdminState] = use({}, { key: ['app', 'admin', 'state'] })
```

---

### Using Dynamic Keys

```tsx
// ✅ Managing per-user state with dynamic keys
function PostDetail({ postId }: { postId: number }) {
  const [post, setPost] = use(async () => {
    const res = await fetch(`/api/posts/${postId}`)
    return res.json()
  }, { key: ['posts', postId] })
  
  const [comments, setComments] = use(async () => {
    const res = await fetch(`/api/posts/${postId}/comments`)
    return res.json()
  }, { key: ['posts', postId, 'comments'] })
  
  return <div>...</div>
}

// ✅ Creating keys with template literals
function ProductPage({ productId }: { productId: string }) {
  const [product, setProduct] = use(null, { key: `product:${productId}` })
  const [reviews, setReviews] = use([], { key: `product:${productId}:reviews` })
  
  return <div>...</div>
}
```

---

## State Cleanup

### Deleting Unused Global State

```tsx
// ✅ Cleanup on component unmount
import { use } from 'flexium/core'

function TemporaryComponent() {
  const [data, setData] = use(async () => {
    return fetch('/api/temp-data').then(r => r.json())
  }, { key: 'temp:data' })

  return <div>...</div>
}
```

---

## Real App Structure Example

### Typical App Structure

```tsx
// app/state.ts - Global state definitions

// Authentication
export const [user, setUser] = use<User | null>(null, { key: 'auth:user' })
export const [isAuthenticated, setIsAuthenticated] = use(() => user !== null)

// App settings
export const [theme, setTheme] = use<'light' | 'dark'>('light', { key: 'app:theme' })
export const [language, setLanguage] = use('en', { key: 'app:language' })

// Data caching
export const [posts, setPosts] = use(async () => {
  const res = await fetch('/api/posts')
  return res.json()
}, { key: ['posts', 'all'] })

// UI state
export const [notifications, setNotifications] = use<Notification[]>([], {
  key: 'app:notifications'
})
```

```tsx
// components/UserProfile.tsx - Per-user state
function UserProfile({ userId }: { userId: number }) {
  // User information (cached)
  const [user, setUser] = use(async () => {
    const res = await fetch(`/api/users/${userId}`)
    return res.json()
  }, { key: ['user', userId] })
  
  // User's posts
  const [posts, setPosts] = use(async () => {
    const res = await fetch(`/api/users/${userId}/posts`)
    return res.json()
  }, { key: ['user', userId, 'posts'] })
  
  // Local UI state
  const [isEditing, setIsEditing] = use(false)
  const [editForm, setEditForm] = use({ name: '', bio: '' })
  
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

- [use() API](/docs/core/state) - State API documentation
- [Anti-patterns](/docs/guide/best-practices/anti-patterns) - Patterns to avoid
- [Performance Optimization](/docs/guide/best-practices/performance) - Performance guide