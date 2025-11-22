import { signal, computed, effect, batch } from '../dist/index.mjs'
import { render } from '../dist/dom.mjs'

// JSX is automatically handled by the new JSX transform - no h import needed!
// Reactive state
const count = signal(0)
const name = signal('World')
const todos = signal<string[]>(['Learn Flexium', 'Build awesome apps'])
const newTodo = signal('')

// Computed values
const doubled = computed(() => count.value * 2)
const greeting = computed(() => `Hello, ${name.value}!`)
const todoCount = computed(() => todos.value.length)

// Counter Component
function Counter() {
  return (
    <div class="card">
      <h2>🔢 Counter with Computed</h2>
      <div class="count-display">{count.value}</div>
      <div class="computed-display">Doubled: {doubled.value}</div>

      <div class="button-row">
        <button onclick={() => count.value--} class="btn-danger">-1</button>
        <button onclick={() => count.value = 0} class="btn-secondary">Reset</button>
        <button onclick={() => count.value++} class="btn-success">+1</button>
        <button onclick={() => count.value += 5} class="btn-primary">+5</button>
      </div>
    </div>
  )
}

// Greeting Component
function Greeting() {
  return (
    <div class="card">
      <h2>👋 Reactive Greeting</h2>
      <div class="greeting">{greeting.value}</div>
      <input
        type="text"
        value={name.value}
        oninput={(e: Event) => {
          name.value = (e.target as HTMLInputElement).value
        }}
        placeholder="Enter your name"
        class="input"
      />
    </div>
  )
}

// Todo List Component
function TodoList() {
  const addTodo = () => {
    if (newTodo.value.trim()) {
      batch(() => {
        todos.value = [...todos.value, newTodo.value]
        newTodo.value = ''
      })
    }
  }

  const removeTodo = (index: number) => {
    todos.value = todos.value.filter((_, i) => i !== index)
  }

  return (
    <div class="card">
      <h2>📝 Todo List ({todoCount.value} items)</h2>

      <div class="todo-input-group">
        <input
          type="text"
          value={newTodo.value}
          oninput={(e: Event) => {
            newTodo.value = (e.target as HTMLInputElement).value
          }}
          onkeypress={(e: KeyboardEvent) => {
            if (e.key === 'Enter') addTodo()
          }}
          placeholder="Add new todo..."
          class="input"
        />
        <button onclick={addTodo} class="btn-primary">Add</button>
      </div>

      <ul class="todo-list">
        {todos.value.map((todo, index) => (
          <li key={index}>
            <span>{todo}</span>
            <button
              onclick={() => removeTodo(index)}
              class="btn-remove"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Stats Component
function Stats() {
  return (
    <div class="card stats">
      <h2>📊 Live Statistics</h2>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-value">{count.value}</div>
          <div class="stat-label">Counter</div>
        </div>
        <div class="stat">
          <div class="stat-value">{doubled.value}</div>
          <div class="stat-label">Doubled</div>
        </div>
        <div class="stat">
          <div class="stat-value">{todoCount.value}</div>
          <div class="stat-label">Todos</div>
        </div>
        <div class="stat">
          <div class="stat-value">{name.value.length}</div>
          <div class="stat-label">Name Length</div>
        </div>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  return (
    <div class="app">
      <header class="header">
        <h1>🚀 Flexium.js - JSX Demo</h1>
        <p class="subtitle">Fine-grained reactivity with modern JSX syntax</p>
      </header>

      <div class="grid">
        <Counter />
        <Greeting />
        <TodoList />
        <Stats />
      </div>

      <footer class="footer">
        <span class="badge">Powered by Flexium.js</span>
      </footer>
    </div>
  )
}

// Render
const appContainer = document.getElementById('app')
if (appContainer) {
  const appVNode = <App />
  render(appVNode, appContainer)

  // Setup reactive effects for DOM updates
  effect(() => {
    console.log('📊 Stats updated:', {
      count: count.value,
      doubled: doubled.value,
      todos: todoCount.value,
      nameLength: name.value.length
    })
  })

  console.log('✅ Flexium JSX Demo loaded!')
  console.log('🎯 Try interacting with the components!')
}
