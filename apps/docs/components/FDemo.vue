<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { f, render } from 'flexium/dom'

const container = ref(null)

// f() Function Demo
function FDemo() {
  const [selectedExample, setSelectedExample] = state('basic')
  const [dynamicCount, setDynamicCount] = state(3)
  const [inputValue, setInputValue] = state('Hello')
  const [todoText, setTodoText] = state('')
  const [todos, setTodos] = state(['Learn Flexium', 'Build an app'])

  // Code examples
  const examples = {
    basic: {
      title: 'Basic Element',
      code: `f('div', { class: 'box' }, 'Hello World')`,
      render: () => f('div', {
        class: 'box',
        style: {
          padding: '16px',
          background: '#dbeafe',
          borderRadius: '8px',
          color: '#1e40af',
          fontWeight: '600'
        }
      }, 'Hello World')
    },
    nested: {
      title: 'Nested Elements',
      code: `f('div', null,
  f('h3', null, 'Title'),
  f('p', null, 'Paragraph')
)`,
      render: () => f('div', {
        style: {
          padding: '16px',
          background: '#f3f4f6',
          borderRadius: '8px'
        }
      }, [
        f('h3', {
          style: {
            margin: '0 0 8px',
            color: '#111827',
            fontSize: '18px'
          }
        }, 'Title'),
        f('p', {
          style: {
            margin: 0,
            color: '#6b7280'
          }
        }, 'Paragraph text content')
      ])
    },
    reactive: {
      title: 'Reactive Values',
      code: `const [count, setCount] = state(0)
f('div', null,
  f('span', null, count),
  f('button', {
    onclick: () => setCount(c => c + 1)
  }, '+')
)`,
      render: () => {
        const [count, setCount] = state(0)
        return f('div', {
          style: {
            padding: '16px',
            background: '#f3f4f6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }
        }, [
          f('span', {
            style: {
              fontSize: '32px',
              fontWeight: '700',
              color: '#111827',
              fontFamily: 'monospace'
            }
          }, [count]),
          f('button', {
            onclick: () => setCount(c => c + 1),
            style: {
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: '#3b82f6',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }
          }, '+')
        ])
      }
    },
    styles: {
      title: 'Inline Styles',
      code: `f('div', {
  style: {
    padding: '20px',
    background: '#f59e0b',
    borderRadius: '12px'
  }
}, 'Styled Box')`,
      render: () => f('div', {
        style: {
          padding: '20px',
          background: '#f59e0b',
          borderRadius: '12px',
          color: 'white',
          fontWeight: '600',
          textAlign: 'center'
        }
      }, 'Styled Box')
    },
    list: {
      title: 'Dynamic List',
      code: `const items = ['A', 'B', 'C']
f('ul', null,
  ...items.map(item =>
    f('li', null, item)
  )
)`,
      render: () => {
        const items = Array.from({ length: dynamicCount() }, (_, i) =>
          String.fromCharCode(65 + i)
        )
        return f('div', {
          style: {
            padding: '16px',
            background: '#f3f4f6',
            borderRadius: '8px'
          }
        }, [
          f('ul', {
            style: {
              margin: '0 0 12px',
              padding: '0 0 0 20px',
              color: '#374151'
            }
          }, items.map(item =>
            f('li', {
              style: {
                marginBottom: '4px'
              }
            }, `Item ${item}`)
          )),
          f('div', {
            style: {
              display: 'flex',
              gap: '8px'
            }
          }, [
            f('button', {
              onclick: () => setDynamicCount(c => Math.max(1, c - 1)),
              style: {
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: '#6b7280',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }
            }, '-'),
            f('button', {
              onclick: () => setDynamicCount(c => Math.min(10, c + 1)),
              style: {
                padding: '6px 12px',
                borderRadius: '6px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }
            }, '+')
          ])
        ])
      }
    },
    input: {
      title: 'Input Binding',
      code: `const [value, setValue] = state('')
f('input', {
  value: value,
  oninput: (e) => setValue(e.target.value)
})`,
      render: () => f('div', {
        style: {
          padding: '16px',
          background: '#f3f4f6',
          borderRadius: '8px'
        }
      }, [
        f('input', {
          type: 'text',
          value: inputValue,
          oninput: (e) => setInputValue(e.target.value),
          style: {
            width: '100%',
            padding: '10px',
            fontSize: '14px',
            border: '2px solid #d1d5db',
            borderRadius: '6px',
            marginBottom: '12px',
            boxSizing: 'border-box'
          }
        }),
        f('div', {
          style: {
            padding: '12px',
            background: '#dbeafe',
            borderRadius: '6px',
            color: '#1e40af',
            fontSize: '14px'
          }
        }, [
          'You typed: ',
          f('strong', {}, [inputValue])
        ])
      ])
    }
  }

  const currentExample = () => examples[selectedExample()]

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
      }, 'f() Function Demo'),
      f('p', {
        style: {
          margin: 0,
          fontSize: '14px',
          color: '#6b7280'
        }
      }, 'Create virtual DOM nodes without JSX')
    ]),

    // Example selector
    f('div', {
      style: {
        marginBottom: '20px',
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px'
      }
    }, [
      f('label', {
        style: {
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }
      }, 'Choose an example:'),
      f('div', {
        style: {
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px'
        }
      }, Object.keys(examples).map(key =>
        f('button', {
          onclick: () => setSelectedExample(key),
          style: {
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: () => selectedExample() === key ? '#4f46e5' : '#e5e7eb',
            color: () => selectedExample() === key ? 'white' : '#374151',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }
        }, examples[key].title)
      ))
    ]),

    // Code display
    f('div', {
      style: {
        marginBottom: '20px',
        padding: '16px',
        background: '#1f2937',
        borderRadius: '8px',
        overflow: 'auto'
      }
    }, [
      f('pre', {
        style: {
          margin: 0,
          color: '#e5e7eb',
          fontSize: '13px',
          fontFamily: 'monospace',
          lineHeight: '1.6'
        }
      }, [() => currentExample().code])
    ]),

    // Live output
    f('div', {
      style: {
        marginBottom: '16px'
      }
    }, [
      f('h4', {
        style: {
          margin: '0 0 12px',
          fontSize: '16px',
          color: '#374151',
          fontWeight: '600'
        }
      }, 'Live Output:'),
      f('div', {
        style: {
          padding: '20px',
          background: '#ffffff',
          border: '2px solid #e5e7eb',
          borderRadius: '8px'
        }
      }, [
        () => currentExample().render()
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
      f('div', { style: { fontWeight: '600' } }, 'Note:'),
      'The f() function creates virtual DOM nodes programmatically. It\'s what JSX compiles to under the hood.'
    ])
  ])
}

onMounted(() => {
  if (container.value) {
    render(FDemo(), container.value)
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

.demo-wrapper :deep(input:focus) {
  outline: none;
  border-color: #4f46e5;
}
</style>
