<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { f, render } from 'flexium/dom'
import { Stack, Row, Column } from 'flexium/primitives'

const container = ref(null)

function StackDemoApp() {
  return f('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '32px',
      width: '100%',
    }
  }, [
    // Demo 1: Basic Stack - Image with Text Overlay
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Image with Text Overlay']),
      Stack({
        style: {
          width: '100%',
          height: '200px',
          borderRadius: '8px',
          overflow: 'hidden',
        }
      }, [
        // Background image
        f('div', {
          style: {
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }
        }),
        // Text overlay
        f('div', {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
          }
        }, ['Hero Title'])
      ])
    ]),

    // Demo 2: Centered Overlay
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Centered Content (align="center" justify="center")']),
      Stack({
        align: 'center',
        justify: 'center',
        style: {
          width: '100%',
          height: '200px',
          borderRadius: '8px',
        }
      }, [
        // Background layer
        f('div', {
          style: {
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          }
        }),
        // Centered card
        Column({
          gap: 8,
          align: 'center',
          style: {
            backgroundColor: 'white',
            padding: '24px 32px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          }
        }, [
          f('div', { style: { fontSize: '32px' } }, ['🎯']),
          f('h5', { style: { margin: '0', fontSize: '18px', fontWeight: '600', color: '#111827' } }, ['Centered Card']),
          f('p', { style: { margin: '0', fontSize: '14px', color: '#6b7280' } }, ['On top of background']),
        ])
      ])
    ]),

    // Demo 3: Corner Positioned Badge
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Corner Positioned Badge']),

      Row({ gap: 16 }, [
        // Top-right badge
        f('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' } }, [
          f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['align="start" justify="end"']),
          Stack({
            align: 'start',
            justify: 'end',
            style: {
              width: '100%',
              height: '160px',
              borderRadius: '8px',
            }
          }, [
            f('div', {
              style: {
                width: '100%',
                height: '100%',
                backgroundColor: '#3b82f6',
                borderRadius: '8px',
              }
            }),
            f('div', {
              style: {
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                margin: '12px',
              }
            }, ['NEW'])
          ])
        ]),

        // Bottom-right badge
        f('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', gap: '8px' } }, [
          f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['align="end" justify="end"']),
          Stack({
            align: 'end',
            justify: 'end',
            style: {
              width: '100%',
              height: '160px',
              borderRadius: '8px',
            }
          }, [
            f('div', {
              style: {
                width: '100%',
                height: '100%',
                backgroundColor: '#8b5cf6',
                borderRadius: '8px',
              }
            }),
            f('div', {
              style: {
                backgroundColor: '#10b981',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                margin: '12px',
              }
            }, ['SALE'])
          ])
        ]),
      ])
    ]),

    // Demo 4: Multiple Layers
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Multiple Stacked Layers']),
      f('p', { style: { margin: '0', fontSize: '12px', color: '#6b7280' } }, ['Each layer is semi-transparent, creating depth']),
      Stack({
        style: {
          width: '100%',
          height: '240px',
          borderRadius: '8px',
        }
      }, [
        // Layer 1 - Background
        f('div', {
          style: {
            width: '100%',
            height: '100%',
            backgroundColor: '#3b82f6',
            borderRadius: '8px',
          }
        }),
        // Layer 2 - Semi-transparent overlay
        f('div', {
          style: {
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(139, 92, 246, 0.4)',
          }
        }),
        // Layer 3 - Content
        Column({
          gap: 16,
          align: 'center',
          justify: 'center',
          style: {
            width: '100%',
            height: '100%',
            color: 'white',
          }
        }, [
          f('div', { style: { fontSize: '48px' } }, ['🌟']),
          f('h3', { style: { margin: '0', fontSize: '24px', fontWeight: 'bold' } }, ['Layered Design']),
          f('p', { style: { margin: '0', fontSize: '14px', opacity: '0.9' } }, ['Multiple overlapping elements']),
        ])
      ])
    ]),

    // Demo 5: Card with Floating Action
    f('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, [
      f('h4', { style: { margin: '0', fontSize: '16px', fontWeight: '600', color: '#374151' } }, ['Card with Floating Action Button']),
      Stack({
        style: {
          width: '100%',
          maxWidth: '400px',
        }
      }, [
        // Card base
        Column({
          gap: 12,
          style: {
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
          }
        }, [
          f('h5', { style: { margin: '0', fontSize: '18px', fontWeight: '600', color: '#111827' } }, ['Product Card']),
          f('p', { style: { margin: '0', fontSize: '14px', color: '#6b7280', lineHeight: '1.5' } }, ['This card has a floating action button positioned absolutely on top of it using the Stack component.']),
          f('div', { style: { fontSize: '20px', fontWeight: 'bold', color: '#3b82f6', marginTop: '8px' } }, ['$149.99']),
        ]),
        // Floating action button
        f('div', {
          style: {
            position: 'absolute',
            bottom: '20px',
            right: '20px',
          }
        }, [
          f('button', {
            style: {
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }
          }, ['🛒'])
        ])
      ])
    ]),
  ])
}

onMounted(() => {
  if (container.value) {
    const app = StackDemoApp()
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
  margin: 24px 0;
  padding: 24px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}

.flexium-container {
  width: 100%;
}
</style>
