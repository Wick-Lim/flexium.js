import { signal, computed } from 'flexium/core'

interface CounterProps {
  initialCount?: number
}

export function Counter({ initialCount = 0 }: CounterProps) {
  const count = signal(initialCount)
  const doubled = computed(() => count.value * 2)

  const increment = () => {
    count.value++
  }

  const decrement = () => {
    count.value--
  }

  return (
    <div class="counter">
      <h2>Interactive Counter</h2>
      <div class="counter-display">
        <p>Count: <strong>{count}</strong></p>
        <p>Doubled: <strong>{doubled}</strong></p>
      </div>
      <div class="counter-buttons">
        <button onClick={decrement} class="btn btn-secondary">
          - Decrement
        </button>
        <button onClick={increment} class="btn btn-primary">
          + Increment
        </button>
      </div>
    </div>
  )
}

interface TodoItem {
  id: number
  text: string
  completed: boolean
}

export function TodoList() {
  const todos = signal<TodoItem[]>([
    { id: 1, text: 'Learn Flexium SSR', completed: false },
    { id: 2, text: 'Build awesome apps', completed: false },
    { id: 3, text: 'Deploy to production', completed: false },
  ])
  const newTodoText = signal('')

  const addTodo = () => {
    const text = newTodoText.value.trim()
    if (text) {
      todos.value = [
        ...todos.value,
        {
          id: Date.now(),
          text,
          completed: false,
        },
      ]
      newTodoText.value = ''
    }
  }

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  }

  const deleteTodo = (id: number) => {
    todos.value = todos.value.filter((todo) => todo.id !== id)
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  const activeTodos = computed(() => todos.value.filter((t) => !t.completed).length)
  const completedTodos = computed(() => todos.value.filter((t) => t.completed).length)

  return (
    <div class="todo-list">
      <h2>Todo List</h2>

      <div class="todo-stats">
        <span>Active: {activeTodos}</span>
        <span>Completed: {completedTodos}</span>
        <span>Total: {computed(() => todos.value.length)}</span>
      </div>

      <div class="todo-input">
        <input
          type="text"
          value={newTodoText.value}
          onInput={(e) => (newTodoText.value = (e.target as HTMLInputElement).value)}
          onKeyPress={handleKeyPress}
          placeholder="What needs to be done?"
          class="form-input"
        />
        <button onClick={addTodo} class="btn btn-primary">
          Add
        </button>
      </div>

      <ul class="todo-items">
        {todos.value.map((todo) => (
          <li key={todo.id} class={todo.completed ? 'completed' : ''}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span class="todo-text">{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)} class="btn-delete">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function App() {
  return (
    <div class="app">
      <header class="header">
        <h1>Flexium SSR Example</h1>
        <p>Server-Side Rendering with Client-Side Hydration</p>
      </header>

      <main class="main">
        <section class="info-section">
          <h2>How It Works</h2>
          <ul>
            <li>Server renders the initial HTML using <code>renderToString()</code></li>
            <li>HTML is sent to the browser with initial state</li>
            <li>Client JavaScript hydrates the DOM using <code>hydrate()</code></li>
            <li>Signals and event handlers become interactive</li>
            <li>No flicker or layout shift - seamless transition!</li>
          </ul>
        </section>

        <div class="examples-grid">
          <Counter initialCount={5} />
          <TodoList />
        </div>

        <section class="features-section">
          <h2>SSR Benefits</h2>
          <div class="features-grid">
            <div class="feature-card">
              <h3>Fast Initial Load</h3>
              <p>Users see content immediately without waiting for JavaScript to load and execute</p>
            </div>
            <div class="feature-card">
              <h3>SEO Friendly</h3>
              <p>Search engines can crawl and index your content effectively</p>
            </div>
            <div class="feature-card">
              <h3>Progressive Enhancement</h3>
              <p>Content is visible even if JavaScript fails to load</p>
            </div>
            <div class="feature-card">
              <h3>Fine-Grained Reactivity</h3>
              <p>After hydration, signals provide efficient updates without virtual DOM</p>
            </div>
          </div>
        </section>
      </main>

      <footer class="footer">
        <p>Built with Flexium - Fine-grained reactive framework</p>
      </footer>
    </div>
  )
}
