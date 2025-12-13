<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

// Portal Demo
function PortalDemo() {
  const [showModal, setShowModal] = state(false)
  const [showTooltip, setShowTooltip] = state(false)
  const [tooltipPos, setTooltipPos] = state({ x: 0, y: 0 })
  const [showNotification, setShowNotification] = state(false)

  // Portal containers (created outside main tree)
  let modalPortal = null
  let tooltipPortal = null
  let notificationPortal = null

  // Simple Portal implementation
  const Portal = (props) => {
    const container = props.mount
    let portalContent = null

    const updatePortal = () => {
      if (!container) return

      // Clear previous content
      if (portalContent) {
        container.removeChild(portalContent)
      }

      // Render new content
      if (props.children) {
        portalContent = document.createElement('div')
        container.appendChild(portalContent)
        render(props.children, portalContent)
      }
    }

    // Initial render
    setTimeout(updatePortal, 0)

    return null
  }

  // Modal Component
  const Modal = () => {
    if (!showModal()) return null

    const content = f('div', {
      style: {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '1000'
      },
      onclick: () => setShowModal(false)
    }, [
      f('div', {
        style: {
          background: 'white',
          padding: '32px',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          maxWidth: '400px',
          width: '90%'
        },
        onclick: (e) => e.stopPropagation()
      }, [
        f('h3', {
          style: {
            margin: '0 0 16px',
            fontSize: '24px',
            color: '#111827',
            fontWeight: '700'
          }
        }, 'Portal Modal'),
        f('p', {
          style: {
            margin: '0 0 24px',
            color: '#6b7280',
            lineHeight: '1.6'
          }
        }, 'This modal is rendered using a Portal! It appears outside the normal DOM hierarchy, preventing z-index and overflow issues.'),
        f('button', {
          onclick: () => setShowModal(false),
          style: {
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            background: '#4f46e5',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            width: '100%'
          }
        }, 'Close Modal')
      ])
    ])

    if (modalPortal) {
      modalPortal.innerHTML = ''
      render(content, modalPortal)
    }

    return null
  }

  // Tooltip Component
  const Tooltip = () => {
    if (!showTooltip()) return null

    const content = f('div', {
      style: {
        position: 'fixed',
        left: `${tooltipPos().x}px`,
        top: `${tooltipPos().y + 10}px`,
        background: '#1f2937',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: '500',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
        zIndex: '1000',
        pointerEvents: 'none',
        whiteSpace: 'nowrap'
      }
    }, 'This is a portal tooltip!')

    if (tooltipPortal) {
      tooltipPortal.innerHTML = ''
      render(content, tooltipPortal)
    }

    return null
  }

  // Notification Component
  const Notification = () => {
    if (!showNotification()) return null

    const content = f('div', {
      style: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: '#10b981',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
        zIndex: '1000',
        minWidth: '250px',
        animation: 'slideIn 0.3s ease-out'
      }
    }, [
      f('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }
      }, [
        f('div', {}, [
          f('div', {
            style: {
              fontWeight: '600',
              marginBottom: '4px'
            }
          }, 'Success!'),
          f('div', {
            style: {
              fontSize: '13px',
              opacity: '0.9'
            }
          }, 'Portal notification works!')
        ]),
        f('button', {
          onclick: () => setShowNotification(false),
          style: {
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1'
          }
        }, '×')
      ])
    ])

    if (notificationPortal) {
      notificationPortal.innerHTML = ''
      render(content, notificationPortal)
    }

    return null
  }

  return f('div', {
    style: {
      padding: '24px',
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }
  }, [
    f('div', { style: { marginBottom: '20px' } }, [
      f('h3', {
        style: {
          margin: '0 0 8px',
          fontSize: '20px',
          color: '#111827',
          fontWeight: '600'
        }
      }, 'Portal Demo'),
      f('p', {
        style: {
          margin: 0,
          fontSize: '14px',
          color: '#6b7280'
        }
      }, 'Render content in different DOM locations')
    ]),

    // Portal containers setup
    f('div', {
      ref: (el) => {
        if (el && !modalPortal) {
          modalPortal = document.createElement('div')
          document.body.appendChild(modalPortal)
        }
        if (el && !tooltipPortal) {
          tooltipPortal = document.createElement('div')
          document.body.appendChild(tooltipPortal)
        }
        if (el && !notificationPortal) {
          notificationPortal = document.createElement('div')
          document.body.appendChild(notificationPortal)
        }
      }
    }),

    // Render portals
    () => Modal(),
    () => Tooltip(),
    () => Notification(),

    // Demo Controls
    f('div', {
      style: {
        display: 'grid',
        gap: '16px',
        marginBottom: '20px'
      }
    }, [
      // Modal Demo
      f('div', {
        style: {
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }
      }, [
        f('h4', {
          style: {
            margin: '0 0 8px',
            fontSize: '16px',
            color: '#111827',
            fontWeight: '600'
          }
        }, 'Modal Portal'),
        f('p', {
          style: {
            margin: '0 0 12px',
            fontSize: '14px',
            color: '#6b7280'
          }
        }, 'Render a modal outside the component hierarchy'),
        f('button', {
          onclick: () => setShowModal(true),
          style: {
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            background: '#4f46e5',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }
        }, 'Open Modal')
      ]),

      // Tooltip Demo
      f('div', {
        style: {
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }
      }, [
        f('h4', {
          style: {
            margin: '0 0 8px',
            fontSize: '16px',
            color: '#111827',
            fontWeight: '600'
          }
        }, 'Tooltip Portal'),
        f('p', {
          style: {
            margin: '0 0 12px',
            fontSize: '14px',
            color: '#6b7280'
          }
        }, 'Position tooltips freely in the viewport'),
        f('button', {
          onmouseenter: (e) => {
            setTooltipPos({ x: e.clientX, y: e.clientY })
            setShowTooltip(true)
          },
          onmousemove: (e) => {
            setTooltipPos({ x: e.clientX, y: e.clientY })
          },
          onmouseleave: () => setShowTooltip(false),
          style: {
            padding: '10px 20px',
            borderRadius: '6px',
            border: '2px solid #8b5cf6',
            background: 'white',
            color: '#8b5cf6',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }
        }, 'Hover for Tooltip')
      ]),

      // Notification Demo
      f('div', {
        style: {
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }
      }, [
        f('h4', {
          style: {
            margin: '0 0 8px',
            fontSize: '16px',
            color: '#111827',
            fontWeight: '600'
          }
        }, 'Notification Portal'),
        f('p', {
          style: {
            margin: '0 0 12px',
            fontSize: '14px',
            color: '#6b7280'
          }
        }, 'Display toast notifications at fixed positions'),
        f('button', {
          onclick: () => {
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 3000)
          },
          style: {
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            background: '#10b981',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }
        }, 'Show Notification')
      ])
    ]),

    // Info
    f('div', {
      style: {
        padding: '12px',
        background: '#eff6ff',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#1e40af'
      }
    }, [
      f('div', { style: { fontWeight: '600', marginBottom: '4px' } }, 'How Portals Work:'),
      'Portals render their children into a different DOM location (like document.body) while maintaining the component tree structure. Perfect for modals, tooltips, and notifications!'
    ])
  ])
}

onMounted(() => {
  if (container.value) {
    render(PortalDemo, container.value)
  }
})

onUnmounted(() => {
  if (container.value) {
    container.value.innerHTML = ''
    // Clean up portal containers
    const modals = document.querySelectorAll('body > div')
    modals.forEach(el => {
      if (el.innerHTML.includes('Portal Modal') ||
          el.innerHTML.includes('portal tooltip') ||
          el.innerHTML.includes('Portal notification')) {
        el.remove()
      }
    })
  }
})
</script>

<template>
  <div class="demo-wrapper">
    <div ref="container"></div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  margin: 20px 0;
}

.demo-wrapper :deep(button:hover) {
  transform: translateY(-1px);
  filter: brightness(105%);
}

.demo-wrapper :deep(button:active) {
  transform: translateY(0);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
