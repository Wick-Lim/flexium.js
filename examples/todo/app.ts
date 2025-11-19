/**
 * Flexium Todo App Example
 *
 * This example demonstrates:
 * - signal() for reactive arrays
 * - computed() for derived state
 * - Motion component for animations
 * - Form handling with Input
 * - List rendering with animations
 * - Conditional rendering
 */

import { signal, computed } from 'flexium'
import { render, Column, Row, Input, Button, Text, Motion } from 'flexium/dom'

interface Todo {
  id: number
  text: string
  done: boolean
}

function TodoApp() {
  // State
  const todos = signal<Todo[]>([])
  const input = signal('')
  const filter = signal<'all' | 'active' | 'completed'>('all')

  // Computed values
  const remaining = computed(() =>
    todos.value.filter(t => !t.done).length
  )

  const filteredTodos = computed(() => {
    switch (filter.value) {
      case 'active':
        return todos.value.filter(t => !t.done)
      case 'completed':
        return todos.value.filter(t => t.done)
      default:
        return todos.value
    }
  })

  // Actions
  const addTodo = () => {
    if (input.value.trim()) {
      todos.value = [
        ...todos.value,
        {
          id: Date.now(),
          text: input.value,
          done: false
        }
      ]
      input.value = ''
    }
  }

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    )
  }

  const deleteTodo = (id: number) => {
    todos.value = todos.value.filter(todo => todo.id !== id)
  }

  const clearCompleted = () => {
    todos.value = todos.value.filter(todo => !todo.done)
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  return (
    <Column gap={0} padding={0}>
      {/* Header */}
      <Column
        gap={20}
        padding={32}
        backgroundColor="#f5576c"
        borderRadius="16px 16px 0 0"
      >
        <Text
          fontSize={36}
          fontWeight="bold"
          color="white"
          textAlign="center"
        >
          My Tasks
        </Text>

        {/* Input */}
        <Row gap={12}>
          <Input
            value={input.value}
            onChange={(e) => input.value = e.target.value}
            onKeyPress={handleKeyPress}
            placeholder="What needs to be done?"
            padding="14px 16px"
            fontSize={16}
            border="none"
            borderRadius={8}
            flex={1}
            backgroundColor="white"
          />
          <Button
            onPress={addTodo}
            backgroundColor="white"
            color="#f5576c"
            padding="14px 24px"
            borderRadius={8}
            border="none"
            fontSize={16}
            fontWeight="bold"
            cursor="pointer"
            hover={{ backgroundColor: '#f0f0f0' }}
          >
            Add
          </Button>
        </Row>
      </Column>

      {/* Filters */}
      <Row
        gap={8}
        padding={16}
        backgroundColor="#f9fafb"
        borderBottom="1px solid #e5e7eb"
      >
        {(['all', 'active', 'completed'] as const).map(f => (
          <Button
            key={f}
            onPress={() => filter.value = f}
            backgroundColor={filter.value === f ? '#f5576c' : 'transparent'}
            color={filter.value === f ? 'white' : '#6b7280'}
            padding="8px 16px"
            borderRadius={6}
            border="none"
            fontSize={14}
            fontWeight={filter.value === f ? 'bold' : 'normal'}
            cursor="pointer"
            hover={{
              backgroundColor: filter.value === f ? '#f5576c' : '#e5e7eb'
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </Row>

      {/* Todo List */}
      <Column gap={0} padding={16} minHeight={300}>
        {filteredTodos.value.length === 0 ? (
          <Column align="center" justify="center" padding={40}>
            <Text fontSize={18} color="#9ca3af" textAlign="center">
              {filter.value === 'completed'
                ? 'No completed tasks yet'
                : filter.value === 'active'
                ? 'No active tasks'
                : 'No tasks yet. Add one above!'}
            </Text>
          </Column>
        ) : (
          filteredTodos.value.map(todo => (
            <Motion
              key={todo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <Row
                gap={12}
                padding={16}
                align="center"
                borderBottom="1px solid #f3f4f6"
                hover={{ backgroundColor: '#f9fafb' }}
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleTodo(todo.id)}
                  style={{
                    width: 20,
                    height: 20,
                    cursor: 'pointer'
                  }}
                />

                {/* Text */}
                <Text
                  flex={1}
                  fontSize={16}
                  color={todo.done ? '#9ca3af' : '#1f2937'}
                  style={{
                    textDecoration: todo.done ? 'line-through' : 'none'
                  }}
                >
                  {todo.text}
                </Text>

                {/* Delete button */}
                <Button
                  onPress={() => deleteTodo(todo.id)}
                  backgroundColor="transparent"
                  color="#ef4444"
                  padding="6px 12px"
                  borderRadius={6}
                  border="none"
                  fontSize={14}
                  cursor="pointer"
                  hover={{ backgroundColor: '#fee2e2' }}
                >
                  Delete
                </Button>
              </Row>
            </Motion>
          ))
        )}
      </Column>

      {/* Footer */}
      <Row
        justify="space-between"
        align="center"
        padding={16}
        backgroundColor="#f9fafb"
        borderRadius="0 0 16px 16px"
        borderTop="1px solid #e5e7eb"
      >
        <Text fontSize={14} color="#6b7280">
          {remaining.value} {remaining.value === 1 ? 'item' : 'items'} left
        </Text>

        {todos.value.some(t => t.done) && (
          <Button
            onPress={clearCompleted}
            backgroundColor="transparent"
            color="#6b7280"
            padding="6px 12px"
            borderRadius={6}
            border="none"
            fontSize={14}
            cursor="pointer"
            hover={{ color: '#ef4444' }}
          >
            Clear completed
          </Button>
        )}
      </Row>
    </Column>
  )
}

// Render to DOM
render(<TodoApp />, document.getElementById('app')!)
