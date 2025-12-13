<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

// Fake API that returns random users after delay
function fakeUserApi() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const users = [
        { id: 1, name: 'Alice', role: 'Developer' },
        { id: 2, name: 'Bob', role: 'Designer' },
        { id: 3, name: 'Charlie', role: 'Manager' },
        { id: 4, name: 'Diana', role: 'Developer' },
      ]
      // Return random subset
      const shuffled = users.sort(() => Math.random() - 0.5)
      resolve(shuffled.slice(0, 2 + Math.floor(Math.random() * 3)))
    }, 1000)
  })
}

function AsyncDemo() {
  const users = state(async () => fakeUserApi())
  const refetch = users.refetch
  const status = users.status
  const error = users.error


  const containerNode = f('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '32px',
      background: '#f9fafb',
      borderRadius: '12px',
      boxSizing: 'border-box'
    }
  }, [
    // Title
    f('div', {}, [
      f('h3', {
        style: {
          margin: '0 0 4px 0',
          color: '#111',
          fontSize: '20px',
          fontWeight: '600'
        }
      }, ['Async State Demo']),
      f('p', {
        style: {
          margin: '0',
          color: '#6b7280',
          fontSize: '14px'
        }
      }, ['Fetching data with loading and error states'])
    ]),

    // Status bar
    f('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }
    }, [
      f('div', {
        style: () => ({
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: status === 'loading' ? '#f59e0b' : '#10b981',
          transition: 'background 0.2s'
        })
      }),
      f('span', {
        style: {
          fontSize: '14px',
          color: '#374151'
        }
      }, [() => status === 'loading' ? 'Loading...' : 'Ready']),
      f('button', {
        onclick: refetch,
        style: {
          marginLeft: 'auto',
          padding: '8px 16px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer'
        }
      }, ['Refetch'])
    ]),

    // User list
    f('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }
    }, [
      () => {
        if (status === 'loading') {
          return f('div', {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }
          }, [
            f('div', { style: { height: '60px', background: '#e5e7eb', borderRadius: '8px', animation: 'pulse 1.5s infinite' } }),
            f('div', { style: { height: '60px', background: '#e5e7eb', borderRadius: '8px', animation: 'pulse 1.5s infinite', animationDelay: '0.2s' } }),
          ])
        }

        const currentError = error
        if (currentError) {
          return f('div', {
            style: {
              padding: '16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626'
            }
          }, ['Error: ' + currentError.message])
        }

        // users는 바로 배열처럼 사용 가능 (proxy가 속성 접근을 포워딩)
        if (!users.length) {
          return f('div', {
            style: {
              padding: '16px',
              textAlign: 'center',
              color: '#6b7280'
            }
          }, ['No users found'])
        }

        return f('div', {
          style: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }
        }, users.map(user =>
          f('div', {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }
          }, [
            f('div', {
              style: {
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
                fontSize: '16px'
              }
            }, [user.name[0]]),
            f('div', {}, [
              f('div', {
                style: { fontWeight: '600', color: '#111' }
              }, [user.name]),
              f('div', {
                style: { fontSize: '13px', color: '#6b7280' }
              }, [user.role])
            ])
          ])
        ))
      }
    ]),

    // Code hint
    f('div', {
      style: {
        padding: '12px 16px',
        background: '#1f2937',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#e5e7eb',
        overflowX: 'auto'
      }
    }, ['const [users, refetch, status, error] = state(async () => fetch(...))'])
  ])

  return containerNode
}

onMounted(() => {
  if (container.value) {
    const app = AsyncDemo()
    render(app, container.value)
  }
})

onUnmounted(() => {
  if (container.value) {
    container.value.innerHTML = ''
  }
})
</script>

<template>
  <div class="demo-wrapper">
    <div ref="container" class="flexium-container"></div>
  </div>
</template>

<style scoped>
.demo-wrapper {
  margin: 40px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.flexium-container :deep(button:hover) {
  filter: brightness(110%);
}
</style>
