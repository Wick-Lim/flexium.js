<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

function ContextDemo() {
  // Local state (global state keys cause reactivity issues)
  const [user, setUser] = state(null)
  const [cart, setCart] = state([])
  const [notifications, setNotifications] = state([])

  const products = [
    { id: 1, name: 'Flexium Pro', price: 99, emoji: '⚡' },
    { id: 2, name: 'Signal Pack', price: 49, emoji: '📡' },
    { id: 3, name: 'Router Plus', price: 79, emoji: '🧭' }
  ]

  const addNotification = (msg, type = 'info') => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, msg, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 2500)
  }

  const login = (name) => {
    setUser({ name, id: Date.now() })
    addNotification(`Welcome, ${name}!`, 'success')
  }

  const logout = () => {
    const name = user?.name
    setUser(null)
    setCart([])
    addNotification(`Goodbye, ${name}!`, 'info')
  }

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
    addNotification(`Added ${product.name} to cart`, 'success')
  }

  const removeFromCart = (productId) => {
    const item = cart.find(i => i.id === productId)
    if (item) {
      setCart(prev => prev.filter(i => i.id !== productId))
      addNotification(`Removed ${item.name} from cart`, 'info')
    }
  }

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(item =>
      item.id === productId ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ))
  }

  const [total] = state(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0))
  const [itemCount] = state(() => cart.reduce((sum, item) => sum + item.qty, 0))

  return f('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '28px',
      background: '#f9fafb',
      borderRadius: '16px'
    }
  }, [
    // Header
    f('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }
    }, [
      f('div', {}, [
        f('h3', { style: { margin: '0 0 4px 0', color: '#111', fontSize: '20px' } }, ['Context API Demo']),
        f('p', { style: { margin: 0, color: '#6b7280', fontSize: '14px' } }, ['Auth + Cart + Notifications'])
      ]),
      user ? f('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }
      }, [
        f('span', { style: { color: '#374151', fontWeight: '500' } }, [`👤 ${user.name}`]),
        f('button', {
          onclick: logout,
          style: {
            padding: '8px 16px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px'
          }
        }, ['Logout'])
      ]) : f('div', { style: { display: 'flex', gap: '8px' } }, [
        f('button', {
          onclick: () => login('Alice'),
          style: {
            padding: '8px 16px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px'
          }
        }, ['Login as Alice']),
        f('button', {
          onclick: () => login('Bob'),
          style: {
            padding: '8px 16px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px'
          }
        }, ['Login as Bob'])
      ])
    ]),

    // Products
    f('div', {
      style: {
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden'
      }
    }, [
      f('div', {
        style: {
          padding: '12px 16px',
          background: '#f3f4f6',
          borderBottom: '1px solid #e5e7eb',
          fontWeight: '600',
          color: '#374151',
          fontSize: '14px'
        }
      }, ['🛍️ Products']),
      f('div', { style: { display: 'flex', flexDirection: 'column' } },
        products.map(p => f('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            borderBottom: '1px solid #f3f4f6'
          }
        }, [
          f('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } }, [
            f('span', { style: { fontSize: '24px' } }, [p.emoji]),
            f('div', {}, [
              f('div', { style: { fontWeight: '600', color: '#111' } }, [p.name]),
              f('div', { style: { color: '#6b7280', fontSize: '14px' } }, [`$${p.price}`])
            ])
          ]),
          f('button', {
            onclick: () => addToCart(p),
            disabled: !user,
            style: {
              padding: '8px 16px',
              background: user ? '#6366f1' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: user ? 'pointer' : 'not-allowed',
              fontSize: '13px'
            }
          }, ['Add to Cart'])
        ]))
      )
    ]),

    // Cart
    f('div', {
      style: {
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden'
      }
    }, [
      f('div', {
        style: {
          padding: '12px 16px',
          background: '#f3f4f6',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      }, [
        f('span', {
          style: {
            fontWeight: '600',
            color: '#374151',
            fontSize: '14px'
          }
        }, [itemCount > 0 ? `🛒 Cart (${itemCount})` : '🛒 Cart']),
        () => total > 0 ? f('span', {
          style: {
            fontWeight: '700',
            color: '#6366f1',
            fontSize: '16px'
          }
        }, [`$${total}`]) : null
      ]),
      cart.length > 0 ? f('div', {
        style: {
          display: 'flex',
          flexDirection: 'column'
        }
      }, cart.map(item => f('div', {
        key: item.id,
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid #f3f4f6'
        }
      }, [
        f('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } }, [
          f('span', {}, [item.emoji]),
          f('span', { style: { fontWeight: '500', color: '#111' } }, [item.name])
        ]),
        f('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
          f('button', {
            onclick: () => updateQty(item.id, -1),
            style: {
              width: '28px',
              height: '28px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }
          }, ['−']),
          f('span', { style: { minWidth: '24px', textAlign: 'center', fontWeight: '600' } }, [String(item.qty)]),
          f('button', {
            onclick: () => updateQty(item.id, 1),
            style: {
              width: '28px',
              height: '28px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }
          }, ['+']),
          f('span', { style: { minWidth: '60px', textAlign: 'right', color: '#6b7280' } }, [`$${item.price * item.qty}`]),
          f('button', {
            onclick: () => removeFromCart(item.id),
            style: {
              width: '28px',
              height: '28px',
              background: '#fee2e2',
              color: '#ef4444',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }
          }, ['✕'])
        ])
      ]))) : f('div', {
        style: {
          padding: '24px',
          textAlign: 'center',
          color: '#9ca3af'
        }
      }, [user ? 'Your cart is empty' : 'Login to start shopping'])
    ]),

    // Notifications
    f('div', {
      style: {
        minHeight: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }
    }, [
      notifications.map(n => f('div', {
        key: n.id,
        style: {
          padding: '10px 14px',
          background: n.type === 'success' ? '#dcfce7' : '#e0e7ff',
          borderLeft: `4px solid ${n.type === 'success' ? '#22c55e' : '#6366f1'}`,
          borderRadius: '6px',
          color: n.type === 'success' ? '#166534' : '#4338ca',
          fontSize: '14px',
          animation: 'slideIn 0.2s ease'
        }
      }, [`${n.type === 'success' ? '✓' : 'ℹ'} ${n.msg}`]))
    ])
  ])
}

onMounted(() => {
  if (container.value) {
    render(ContextDemo, container.value)
  }
})

onUnmounted(() => {
  if (container.value) {
    container.value.innerHTML = ''
  }
})
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

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
