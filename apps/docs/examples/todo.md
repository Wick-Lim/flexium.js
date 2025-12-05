---
title: Todo List Example - State Management & Lists
description: Build a complete todo list app with Flexium. Learn state management, list rendering with For, and user interactions.
head:
  - - meta
    - property: og:title
      content: Todo List Example - Flexium
  - - meta
    - property: og:description
      content: Complete todo list example demonstrating state management, list rendering, and CRUD operations with Flexium.
---

# Todo List Example

A complete todo list application demonstrating state management and list operations.

## Basic Todo List

```tsx
import { state, For } from 'flexium/core'
import { Column, Row, Text, Pressable } from 'flexium/primitives'

interface Todo {
  id: number
  text: string
  completed: boolean
}

function TodoApp() {
  const [todos, setTodos] = state<Todo[]>([])
  const [inputText, setInputText] = state('')

  const addTodo = () => {
    const text = inputText().trim()
    if (!text) return

    setTodos(prev => [...prev, {
      id: Date.now(),
      text,
      completed: false
    }])
    setInputText('')
  }

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id
        ? { ...todo, completed: !todo.completed }
        : todo
    ))
  }

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
  }

  return (
    <Column gap={16} padding={20}>
      <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
        Todo List
      </Text>

      <Row gap={8}>
        <input
          type="text"
          value={inputText()}
          oninput={(e) => setInputText(e.target.value)}
          onkeydown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          style={{ flex: 1, padding: '8px' }}
        />
        <Pressable onPress={addTodo}>
          <Text style={{ padding: '8px 16px', background: '#646cff', color: 'white' }}>
            Add
          </Text>
        </Pressable>
      </Row>

      <Column gap={8}>
        <For each={todos}>
          {(todo) => (
            <Row
              gap={8}
              style={{
                padding: '8px',
                background: '#f5f5f5',
                alignItems: 'center'
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onchange={() => toggleTodo(todo.id)}
              />
              <Text style={{
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#999' : '#333'
              }}>
                {todo.text}
              </Text>
              <Pressable onPress={() => deleteTodo(todo.id)}>
                <Text style={{ color: 'red' }}>Delete</Text>
              </Pressable>
            </Row>
          )}
        </For>
      </Column>
    </Column>
  )
}
```

## With Filtering

```tsx
import { state, For } from 'flexium/core'
import { Column, Row, Text, Pressable } from 'flexium/primitives'

function TodoAppWithFilter() {
  const [todos, setTodos] = state<Todo[]>([
    { id: 1, text: 'Learn Flexium', completed: true },
    { id: 2, text: 'Build an app', completed: false },
    { id: 3, text: 'Deploy to production', completed: false }
  ])
  const [filter, setFilter] = state<'all' | 'active' | 'completed'>('all')
  const [inputText, setInputText] = state('')

  // Computed filtered list
  const [filteredTodos] = state(() => {
    const list = todos()
    switch (filter()) {
      case 'active': return list.filter(t => !t.completed)
      case 'completed': return list.filter(t => t.completed)
      default: return list
    }
  })

  // Stats
  const [remaining] = state(() => todos().filter(t => !t.completed).length)

  const addTodo = () => {
    const text = inputText().trim()
    if (!text) return
    setTodos(prev => [...prev, { id: Date.now(), text, completed: false }])
    setInputText('')
  }

  const toggleTodo = (id: number) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTodo = (id: number) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  return (
    <Column gap={16} padding={20}>
      <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>Todo List</Text>

      <Row gap={8}>
        <input
          type="text"
          value={inputText()}
          oninput={(e) => setInputText(e.target.value)}
          onkeydown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a new todo..."
          style={{ flex: 1, padding: '8px' }}
        />
        <Pressable onPress={addTodo}>
          <Text style={{ padding: '8px 16px', background: '#646cff', color: 'white' }}>
            Add
          </Text>
        </Pressable>
      </Row>

      <Row gap={8}>
        <Pressable onPress={() => setFilter('all')}>
          <Text style={{
            padding: '6px 12px',
            background: filter() === 'all' ? '#646cff' : '#e5e7eb',
            color: filter() === 'all' ? 'white' : '#333',
            borderRadius: '4px'
          }}>
            All
          </Text>
        </Pressable>
        <Pressable onPress={() => setFilter('active')}>
          <Text style={{
            padding: '6px 12px',
            background: filter() === 'active' ? '#646cff' : '#e5e7eb',
            color: filter() === 'active' ? 'white' : '#333',
            borderRadius: '4px'
          }}>
            Active
          </Text>
        </Pressable>
        <Pressable onPress={() => setFilter('completed')}>
          <Text style={{
            padding: '6px 12px',
            background: filter() === 'completed' ? '#646cff' : '#e5e7eb',
            color: filter() === 'completed' ? 'white' : '#333',
            borderRadius: '4px'
          }}>
            Completed
          </Text>
        </Pressable>
      </Row>

      <Text style={{ color: '#666' }}>{remaining} items remaining</Text>

      <Column gap={8}>
        <For each={filteredTodos}>
          {(todo) => (
            <Row gap={8} style={{ padding: '8px', background: '#f5f5f5', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={todo.completed}
                onchange={() => toggleTodo(todo.id)}
              />
              <Text style={{
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#999' : '#333'
              }}>
                {todo.text}
              </Text>
              <Pressable onPress={() => deleteTodo(todo.id)}>
                <Text style={{ color: 'red', padding: '4px 8px' }}>Delete</Text>
              </Pressable>
            </Row>
          )}
        </For>
      </Column>
    </Column>
  )
}
```

## Key Concepts

- **List State**: Using `state<Todo[]>([])` to manage an array
- **For Component**: Efficient list rendering with keyed reconciliation
- **Computed State**: Derived values that auto-update when dependencies change
- **Event Handling**: Using `onPress`, `oninput`, and `onchange` handlers
