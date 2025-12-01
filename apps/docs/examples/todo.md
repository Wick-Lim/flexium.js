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
import { state, For } from 'flexium'
import { Column, Row, Text, Pressable } from 'flexium'

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
function TodoAppWithFilter() {
  const [todos, setTodos] = state<Todo[]>([])
  const [filter, setFilter] = state<'all' | 'active' | 'completed'>('all')

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
  const [remaining] = state(() =>
    todos().filter(t => !t.completed).length
  )

  return (
    <Column gap={16}>
      {/* ... input section ... */}

      <Row gap={8}>
        <Pressable onPress={() => setFilter('all')}>
          <Text style={{ fontWeight: filter() === 'all' ? 'bold' : 'normal' }}>
            All
          </Text>
        </Pressable>
        <Pressable onPress={() => setFilter('active')}>
          <Text style={{ fontWeight: filter() === 'active' ? 'bold' : 'normal' }}>
            Active
          </Text>
        </Pressable>
        <Pressable onPress={() => setFilter('completed')}>
          <Text style={{ fontWeight: filter() === 'completed' ? 'bold' : 'normal' }}>
            Completed
          </Text>
        </Pressable>
      </Row>

      <Text>{remaining} items remaining</Text>

      <For each={filteredTodos}>
        {(todo) => (
          /* ... todo item ... */
        )}
      </For>
    </Column>
  )
}
```

## Key Concepts

- **List State**: Using `state<Todo[]>([])` to manage an array
- **For Component**: Efficient list rendering with keyed reconciliation
- **Computed State**: Derived values that auto-update when dependencies change
- **Event Handling**: Using `onPress`, `oninput`, and `onchange` handlers
