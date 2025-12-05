<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'
import { ScrollView, Text, Column, Row, Pressable } from 'flexium/primitives'

const container = ref(null)

function ScrollViewDemo() {
  const [itemCount, setItemCount] = state(20)

  const addItems = () => setItemCount(c => c + 5)
  const removeItems = () => setItemCount(c => Math.max(5, c - 5))

  return Column({ gap: 24, style: { padding: '20px' } }, [
    // Title
    f('h3', {
      style: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 0,
        marginBottom: '8px',
      }
    }, ['ScrollView Component']),

    // Vertical scroll
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
      }
    }, ['Vertical Scroll']),

    ScrollView({
      style: {
        height: '250px',
        backgroundColor: '#f9fafb',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
      }
    }, [
      Column({ gap: 8 }, [
        ...Array.from({ length: () => itemCount() }, (_, i) =>
          f('div', {
            key: i,
            style: {
              padding: '12px 16px',
              backgroundColor: i % 2 === 0 ? 'white' : '#f3f4f6',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
            }
          }, [
            Row({ justify: 'between', align: 'center' }, [
              Text({
                style: {
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                }
              }, [`Item ${i + 1}`]),
              Text({
                style: {
                  fontSize: '12px',
                  color: '#6b7280',
                }
              }, [`Index: ${i}`])
            ])
          ])
        )
      ])
    ]),

    // Controls
    Row({ gap: 8, style: { marginTop: '12px' } }, [
      Pressable({
        onPress: removeItems,
        style: {
          padding: '8px 16px',
          backgroundColor: '#ef4444',
          borderRadius: '6px',
          cursor: 'pointer',
        }
      }, [
        Text({
          style: {
            color: 'white',
            fontWeight: '600',
            fontSize: '14px',
          }
        }, ['Remove 5 Items'])
      ]),

      Pressable({
        onPress: addItems,
        style: {
          padding: '8px 16px',
          backgroundColor: '#10b981',
          borderRadius: '6px',
          cursor: 'pointer',
        }
      }, [
        Text({
          style: {
            color: 'white',
            fontWeight: '600',
            fontSize: '14px',
          }
        }, ['Add 5 Items'])
      ]),

      f('div', {
        style: {
          padding: '8px 16px',
          backgroundColor: '#f3f4f6',
          borderRadius: '6px',
        }
      }, [
        Text({
          style: {
            fontSize: '14px',
            color: '#6b7280',
          }
        }, [() => `Total: ${itemCount()} items`])
      ])
    ]),

    // Horizontal scroll
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['Horizontal Scroll']),

    ScrollView({
      horizontal: true,
      style: {
        backgroundColor: '#f9fafb',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
      }
    }, [
      Row({ gap: 12 }, [
        ...Array.from({ length: 10 }, (_, i) =>
          f('div', {
            key: i,
            style: {
              minWidth: '150px',
              height: '120px',
              backgroundColor: `hsl(${i * 36}, 70%, 60%)`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: '0',
            }
          }, [
            Text({
              style: {
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
              }
            }, [`Card ${i + 1}`])
          ])
        )
      ])
    ]),

    // Nested scrollable content
    f('h4', {
      style: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        marginTop: '16px',
        marginBottom: '8px',
      }
    }, ['ScrollView with Rich Content']),

    ScrollView({
      style: {
        height: '300px',
        backgroundColor: '#f9fafb',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
      }
    }, [
      Column({ gap: 16 }, [
        // Header
        f('div', {
          style: {
            padding: '16px',
            backgroundColor: '#4f46e5',
            borderRadius: '8px',
          }
        }, [
          Text({
            style: {
              fontSize: '18px',
              fontWeight: 'bold',
              color: 'white',
            }
          }, ['Scrollable Content Area'])
        ]),

        // Content sections
        ...Array.from({ length: 5 }, (_, i) =>
          Column({ gap: 8 }, [
            Text({
              style: {
                fontSize: '16px',
                fontWeight: '600',
                color: '#111827',
              }
            }, [`Section ${i + 1}`]),
            f('div', {
              style: {
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: '1px solid #e5e7eb',
              }
            }, [
              Text({
                style: {
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.6',
                }
              }, [`This is content for section ${i + 1}. ScrollView provides a cross-platform scrollable container that works seamlessly on web and mobile. You can scroll through this content vertically.`])
            ]),
            // Nested horizontal scroll
            i === 2 ? Column({ gap: 8 }, [
              Text({
                style: {
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                }
              }, ['Nested Horizontal Scroll:']),
              ScrollView({
                horizontal: true,
                style: {
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                }
              }, [
                Row({ gap: 8 }, [
                  ...Array.from({ length: 8 }, (_, j) =>
                    f('div', {
                      key: j,
                      style: {
                        minWidth: '80px',
                        height: '80px',
                        backgroundColor: '#e0e7ff',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: '0',
                        border: '2px solid #c7d2fe',
                      }
                    }, [
                      Text({
                        style: {
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#4f46e5',
                        }
                      }, [`${j + 1}`])
                    ])
                  )
                ])
              ])
            ]) : null
          ])
        ),

        // Footer
        f('div', {
          style: {
            padding: '16px',
            backgroundColor: '#10b981',
            borderRadius: '8px',
            textAlign: 'center',
          }
        }, [
          Text({
            style: {
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'white',
            }
          }, ['End of Content'])
        ])
      ])
    ]),

    // Info text
    f('p', {
      style: {
        marginTop: '16px',
        color: '#6b7280',
        fontSize: '14px',
        fontStyle: 'italic',
      }
    }, ['ScrollView provides a cross-platform scrollable container. Scroll vertically, horizontally, or nest scrollviews for complex layouts.'])
  ])
}

onMounted(() => {
  if (container.value) {
    const app = ScrollViewDemo()
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
  padding: 20px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-alt);
}
</style>
