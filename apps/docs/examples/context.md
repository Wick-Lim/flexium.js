---
title: Context API - State Sharing
description: Share state across components using Flexium's Context API with reactive signals.
head:
  - - meta
    - property: og:title
      content: Context API Example - Flexium
  - - meta
    - property: og:description
      content: Context API for sharing state across component trees in Flexium.
---

# Context API Example

This example demonstrates sharing state across components using the Context API.

## Features Demonstrated

- Auth context with user state
- Cart context with shopping cart management
- Notification context for toast messages
- Multiple contexts working together
- Context with signals for reactivity
- Default values and error handling

## Creating a Context

```tsx
import { createContext, useContext, signal, type Signal } from 'flexium/core'

// Define types
interface User {
  id: number
  name: string
}

interface AuthContextValue {
  user: Signal<User | null>
  login: (name: string) => void
  logout: () => void
}

// Create context with default values
const AuthContext = createContext<AuthContextValue>({
  user: signal<User | null>(null),
  login: () => {
    console.warn('AuthContext not provided!')
  },
  logout: () => {
    console.warn('AuthContext not provided!')
  }
})
```

## Provider Component

```tsx
function AuthProvider(props: { children: any }) {
  const user = signal<User | null>(null)

  const login = (name: string) => {
    user.value = { id: Date.now(), name }
  }

  const logout = () => {
    user.value = null
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {props.children}
    </AuthContext.Provider>
  )
}
```

## Consuming Context

```tsx
function UserStatus() {
  const { user, login, logout } = useContext(AuthContext)

  return (
    <div>
      {() => user.value ? (
        <div>
          <span>Welcome, {user.value.name}!</span>
          <button onclick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onclick={() => login('Alice')}>Login as Alice</button>
          <button onclick={() => login('Bob')}>Login as Bob</button>
        </div>
      )}
    </div>
  )
}
```

## Cart Context

```tsx
interface CartItem {
  id: number
  name: string
  price: number
  qty: number
}

interface CartContextValue {
  items: Signal<CartItem[]>
  addItem: (product: { id: number; name: string; price: number }) => void
  removeItem: (id: number) => void
  updateQty: (id: number, delta: number) => void
  total: Signal<number>
}

const CartContext = createContext<CartContextValue>({...})

function CartProvider(props: { children: any }) {
  const items = signal<CartItem[]>([])
  const total = signal(0)

  // Update total when items change
  effect(() => {
    total.value = items.value.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    )
  })

  const addItem = (product) => {
    const existing = items.value.find(i => i.id === product.id)
    if (existing) {
      existing.qty++
      items.value = [...items.value]
    } else {
      items.value = [...items.value, { ...product, qty: 1 }]
    }
  }

  const removeItem = (id: number) => {
    items.value = items.value.filter(i => i.id !== id)
  }

  const updateQty = (id: number, delta: number) => {
    items.value = items.value.map(item =>
      item.id === id
        ? { ...item, qty: Math.max(1, item.qty + delta) }
        : item
    )
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, total }}>
      {props.children}
    </CartContext.Provider>
  )
}
```

## Notification Context

```tsx
interface Notification {
  id: number
  msg: string
  type: 'success' | 'info' | 'error'
}

interface NotificationContextValue {
  notifications: Signal<Notification[]>
  notify: (msg: string, type?: 'success' | 'info' | 'error') => void
}

const NotificationContext = createContext<NotificationContextValue>({...})

function NotificationProvider(props: { children: any }) {
  const notifications = signal<Notification[]>([])

  const notify = (msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    const id = Date.now()
    notifications.value = [...notifications.value, { id, msg, type }]

    // Auto-dismiss after 2.5 seconds
    setTimeout(() => {
      notifications.value = notifications.value.filter(n => n.id !== id)
    }, 2500)
  }

  return (
    <NotificationContext.Provider value={{ notifications, notify }}>
      {props.children}
    </NotificationContext.Provider>
  )
}
```

## Nested Providers

```tsx
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <div class="app">
            <Header />
            <ProductList />
            <Cart />
            <NotificationToast />
          </div>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  )
}
```

## Consuming Multiple Contexts

```tsx
function ProductCard({ product }) {
  const { user } = useContext(AuthContext)
  const { addItem } = useContext(CartContext)
  const { notify } = useContext(NotificationContext)

  const handleAddToCart = () => {
    addItem(product)
    notify(`Added ${product.name} to cart`, 'success')
  }

  return (
    <div class="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button
        onclick={handleAddToCart}
        disabled={() => !user.value}
      >
        {() => user.value ? 'Add to Cart' : 'Login to Buy'}
      </button>
    </div>
  )
}
```

## Cart Display

```tsx
function CartDisplay() {
  const { items, removeItem, updateQty, total } = useContext(CartContext)

  return (
    <div class="cart">
      <h2>Shopping Cart</h2>

      {() => items.value.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          <For each={items}>
            {(item) => (
              <div class="cart-item">
                <span>{item.name}</span>
                <div class="qty-controls">
                  <button onclick={() => updateQty(item.id, -1)}>-</button>
                  <span>{item.qty}</span>
                  <button onclick={() => updateQty(item.id, 1)}>+</button>
                </div>
                <span>${item.price * item.qty}</span>
                <button onclick={() => removeItem(item.id)}>Remove</button>
              </div>
            )}
          </For>

          <div class="cart-total">
            <strong>Total: ${() => total.value}</strong>
          </div>
        </div>
      )}
    </div>
  )
}
```

## Notification Toast

```tsx
function NotificationToast() {
  const { notifications } = useContext(NotificationContext)

  return (
    <div class="toast-container">
      <For each={notifications}>
        {(notification) => (
          <div class={`toast toast-${notification.type}`}>
            {notification.type === 'success' ? '✓' : 'ℹ'} {notification.msg}
          </div>
        )}
      </For>
    </div>
  )
}
```

## Protected Content

```tsx
function ProtectedContent() {
  const { user } = useContext(AuthContext)
  const { items } = useContext(CartContext)

  return (
    <div>
      {() => user.value ? (
        <div>
          <h3>Welcome, {user.value.name}!</h3>
          <p>You have {items.value.length} items in your cart.</p>
        </div>
      ) : (
        <p>Please log in to start shopping.</p>
      )}
    </div>
  )
}
```
