<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import { state } from 'flexium/core'
import { h, render } from 'flexium/dom'

const container = ref(null)

function TodoDemo() {
  const [todos, setTodos] = state([
    { id: 1, text: 'Learn Flexium', done: true },
    { id: 2, text: 'Build something awesome', done: false },
    { id: 3, text: 'Share with the world', done: false }
  ])
  const [inputValue, setInputValue] = state('')
  const [nextId, setNextId] = state(4)

  const addTodo = () => {
    const text = inputValue().trim()
    if (!text) return
    setTodos(prev => [...prev, { id: nextId(), text, done: false }])
    setNextId(id => id + 1)
    setInputValue('')
  }

  const toggleTodo = (id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTodo = (id) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  return h('div', {
    style: {
      padding: '24px',
      background: '#f9fafb',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box'
    }
  }, [
    h('h3', { style: { margin: '0 0 16px', color: '#374151' } }, ['Todo List']),

    // Input row
    h('div', { style: { display: 'flex', gap: '8px', marginBottom: '16px' } }, [
      h('input', {
        type: 'text',
        placeholder: 'Add a new todo...',
        value: inputValue,
        oninput: (e) => setInputValue(e.target.value),
        onkeydown: (e) => e.key === 'Enter' && addTodo(),
        style: {
          flex: 1,
          padding: '10px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px'
        }
      }),
      h('button', {
        onclick: addTodo,
        style: {
          padding: '10px 16px',
          background: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: '600'
        }
      }, ['Add'])
    ]),

    // Todo list - render function for reactivity
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
      () => todos().map(todo =>
        h('div', {
          key: todo.id,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }
        }, [
          h('input', {
            type: 'checkbox',
            checked: todo.done,
            onchange: () => toggleTodo(todo.id),
            style: { width: '18px', height: '18px', cursor: 'pointer' }
          }),
          h('span', {
            style: {
              flex: 1,
              textDecoration: todo.done ? 'line-through' : 'none',
              color: todo.done ? '#9ca3af' : '#374151'
            }
          }, [todo.text]),
          h('button', {
            onclick: () => deleteTodo(todo.id),
            style: {
              padding: '4px 8px',
              background: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }
          }, ['Delete'])
        ])
      )
    )
  ])
}

onMounted(() => {
  if (container.value) {
    render(TodoDemo(), container.value)
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
</style>
