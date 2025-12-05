<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

// State
let user = null
let cart = []
let notifications = []

const products = [
  { id: 1, name: 'Flexium Pro', price: 99, emoji: '⚡' },
  { id: 2, name: 'Signal Pack', price: 49, emoji: '📡' },
  { id: 3, name: 'Router Plus', price: 79, emoji: '🧭' }
]

const addNotification = (msg, type = 'info') => {
  const id = Date.now()
  notifications.push({ id, msg, type })
  render()
  setTimeout(() => {
    notifications = notifications.filter(n => n.id !== id)
    render()
  }, 2500)
}

const login = (name) => {
  user = { name, id: Date.now() }
  addNotification(`Welcome, ${name}!`, 'success')
}

const logout = () => {
  const name = user?.name
  user = null
  cart = []
  addNotification(`Goodbye, ${name}!`, 'info')
}

const addToCart = (product) => {
  const existing = cart.find(item => item.id === product.id)
  if (existing) {
    existing.qty++
  } else {
    cart.push({ ...product, qty: 1 })
  }
  addNotification(`Added ${product.name} to cart`, 'success')
}

const removeFromCart = (productId) => {
  const item = cart.find(i => i.id === productId)
  if (item) {
    cart = cart.filter(i => i.id !== productId)
    addNotification(`Removed ${item.name} from cart`, 'info')
  }
}

const updateQty = (productId, delta) => {
  const item = cart.find(i => i.id === productId)
  if (item) {
    item.qty = Math.max(1, item.qty + delta)
    render()
  }
}

const getTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0)
const getItemCount = () => cart.reduce((sum, item) => sum + item.qty, 0)

const render = () => {
  if (!container.value) return

  const total = getTotal()
  const itemCount = getItemCount()

  container.value.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px; padding: 28px; background: #f9fafb; border-radius: 16px;">

      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px;">Context API Demo</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Auth + Cart + Notifications</p>
        </div>
        ${user ? `
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="color: #374151; font-weight: 500;">👤 ${user.name}</span>
            <button class="logout-btn" style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">
              Logout
            </button>
          </div>
        ` : `
          <div style="display: flex; gap: 8px;">
            <button class="login-btn" data-name="Alice" style="padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">
              Login as Alice
            </button>
            <button class="login-btn" data-name="Bob" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">
              Login as Bob
            </button>
          </div>
        `}
      </div>

      <!-- Products -->
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="padding: 12px 16px; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151; font-size: 14px;">
          🛍️ Products
        </div>
        <div style="display: flex; flex-direction: column;">
          ${products.map(p => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #f3f4f6;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">${p.emoji}</span>
                <div>
                  <div style="font-weight: 600; color: #111;">${p.name}</div>
                  <div style="color: #6b7280; font-size: 14px;">$${p.price}</div>
                </div>
              </div>
              <button class="add-btn" data-id="${p.id}" ${!user ? 'disabled' : ''} style="
                padding: 8px 16px; background: ${user ? '#6366f1' : '#d1d5db'}; color: white;
                border: none; border-radius: 6px; cursor: ${user ? 'pointer' : 'not-allowed'}; font-size: 13px;
              ">
                Add to Cart
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Cart -->
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="padding: 12px 16px; background: #f3f4f6; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 600; color: #374151; font-size: 14px;">🛒 Cart ${itemCount > 0 ? `(${itemCount})` : ''}</span>
          ${total > 0 ? `<span style="font-weight: 700; color: #6366f1; font-size: 16px;">$${total}</span>` : ''}
        </div>
        ${cart.length > 0 ? `
          <div style="display: flex; flex-direction: column;">
            ${cart.map(item => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #f3f4f6;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span>${item.emoji}</span>
                  <span style="font-weight: 500; color: #111;">${item.name}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <button class="qty-btn" data-id="${item.id}" data-delta="-1" style="width: 28px; height: 28px; background: #f3f4f6; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">−</button>
                  <span style="min-width: 24px; text-align: center; font-weight: 600;">${item.qty}</span>
                  <button class="qty-btn" data-id="${item.id}" data-delta="1" style="width: 28px; height: 28px; background: #f3f4f6; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">+</button>
                  <span style="min-width: 60px; text-align: right; color: #6b7280;">$${item.price * item.qty}</span>
                  <button class="remove-btn" data-id="${item.id}" style="width: 28px; height: 28px; background: #fee2e2; color: #ef4444; border: none; border-radius: 4px; cursor: pointer;">✕</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="padding: 24px; text-align: center; color: #9ca3af;">
            ${user ? 'Your cart is empty' : 'Login to start shopping'}
          </div>
        `}
      </div>

      <!-- Notifications -->
      <div style="min-height: 40px; display: flex; flex-direction: column; gap: 8px;">
        ${notifications.map(n => `
          <div style="
            padding: 10px 14px;
            background: ${n.type === 'success' ? '#dcfce7' : '#e0e7ff'};
            border-left: 4px solid ${n.type === 'success' ? '#22c55e' : '#6366f1'};
            border-radius: 6px; color: ${n.type === 'success' ? '#166534' : '#4338ca'}; font-size: 14px;
            animation: slideIn 0.2s ease;
          ">
            ${n.type === 'success' ? '✓' : 'ℹ'} ${n.msg}
          </div>
        `).join('')}
      </div>

    </div>
    <style>
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(-10px); }
        to { opacity: 1; transform: translateX(0); }
      }
    </style>
  `

  // Event listeners
  container.value.querySelectorAll('.login-btn').forEach(btn => {
    btn.addEventListener('click', () => login(btn.dataset.name))
  })
  container.value.querySelector('.logout-btn')?.addEventListener('click', logout)

  container.value.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = products.find(p => p.id === parseInt(btn.dataset.id))
      if (product) addToCart(product)
    })
  })

  container.value.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      updateQty(parseInt(btn.dataset.id), parseInt(btn.dataset.delta))
    })
  })

  container.value.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(parseInt(btn.dataset.id)))
  })
}

onMounted(render)
</script>

<template>
  <div class="showcase-wrapper">
    <div ref="container" class="flexium-container"></div>
  </div>
</template>

<style scoped>
.showcase-wrapper {
  margin: 40px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}
.flexium-container :deep(button:hover:not(:disabled)) {
  filter: brightness(110%);
}
.flexium-container :deep(button:disabled) {
  cursor: not-allowed;
}
</style>
