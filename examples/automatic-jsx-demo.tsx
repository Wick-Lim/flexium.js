/**
 * Automatic JSX Demo
 *
 * This demo showcases the React 17+ automatic JSX transform.
 * Notice: NO import of h() function needed!
 *
 * The JSX will be automatically transformed using jsx() and jsxs() from flexium/jsx-runtime
 */

import { signal, computed } from '../src/core/signal';
import { Fragment } from '../src/jsx-runtime';

// ============================================================================
// Counter Component - No h() import needed!
// ============================================================================

function Counter() {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
      <h2>Counter (Automatic JSX)</h2>
      <p>Count: {count.value}</p>
      <p>Doubled: {doubled.value}</p>
      <button onClick={() => count.value++}>Increment</button>
      <button onClick={() => count.value--}>Decrement</button>
      <button onClick={() => (count.value = 0)}>Reset</button>
    </div>
  );
}

// ============================================================================
// Fragment Demo - Render multiple elements without wrapper
// ============================================================================

function FragmentDemo() {
  const items = signal(['Apple', 'Banana', 'Cherry']);

  return (
    <div style={{ padding: '20px', background: '#e3f2fd', borderRadius: '8px' }}>
      <h2>Fragment Demo</h2>
      <>
        <p>Items using Fragment:</p>
        <ul>
          {items.value.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </>
    </div>
  );
}

// ============================================================================
// Conditional Rendering Demo
// ============================================================================

function ConditionalDemo() {
  const isVisible = signal(true);
  const theme = signal<'light' | 'dark'>('light');

  return (
    <div style={{ padding: '20px', background: '#fff3bf', borderRadius: '8px' }}>
      <h2>Conditional Rendering</h2>

      <button onClick={() => (isVisible.value = !isVisible.value)}>
        Toggle Visibility
      </button>

      {isVisible.value && (
        <p>This text is conditionally rendered!</p>
      )}

      <button onClick={() => (theme.value = theme.value === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>

      <p>Current theme: {theme.value === 'light' ? 'Light Mode' : 'Dark Mode'}</p>
    </div>
  );
}

// ============================================================================
// List Rendering Demo
// ============================================================================

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

function TodoList() {
  const todos = signal<Todo[]>([
    { id: 1, text: 'Learn Flexium', completed: false },
    { id: 2, text: 'Build something cool', completed: false },
    { id: 3, text: 'Share with community', completed: false },
  ]);
  const newTodoText = signal('');

  const addTodo = () => {
    if (newTodoText.value.trim()) {
      todos.value = [
        ...todos.value,
        { id: Date.now(), text: newTodoText.value, completed: false },
      ];
      newTodoText.value = '';
    }
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  };

  const deleteTodo = (id: number) => {
    todos.value = todos.value.filter((todo) => todo.id !== id);
  };

  return (
    <div style={{ padding: '20px', background: '#d3f9d8', borderRadius: '8px' }}>
      <h2>Todo List</h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          value={newTodoText.value}
          onInput={(e: any) => (newTodoText.value = e.target.value)}
          onKeyDown={(e: any) => e.key === 'Enter' && addTodo()}
          placeholder="Enter new todo..."
          style={{ flex: 1, padding: '8px' }}
        />
        <button onClick={addTodo}>Add</button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.value.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              gap: '8px',
              padding: '8px',
              background: todo.completed ? '#f1f3f5' : 'white',
              marginBottom: '4px',
              borderRadius: '4px',
            }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              style={{
                flex: 1,
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#868e96' : '#000',
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
        {todos.value.filter((t) => !t.completed).length} items remaining
      </p>
    </div>
  );
}

// ============================================================================
// Nested Components Demo
// ============================================================================

function Button({ children, onClick, variant = 'primary' }: any) {
  const styles = {
    primary: { background: '#4dabf7', color: 'white' },
    secondary: { background: '#868e96', color: 'white' },
    danger: { background: '#ff6b6b', color: 'white' },
  };

  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        ...styles[variant as keyof typeof styles],
      }}
    >
      {children}
    </button>
  );
}

function NestedComponentsDemo() {
  const clickCount = signal(0);

  return (
    <div style={{ padding: '20px', background: '#ffe3e3', borderRadius: '8px' }}>
      <h2>Nested Components</h2>
      <p>Clicks: {clickCount.value}</p>

      <div style={{ display: 'flex', gap: '8px' }}>
        <Button onClick={() => clickCount.value++} variant="primary">
          Primary
        </Button>
        <Button onClick={() => clickCount.value++} variant="secondary">
          Secondary
        </Button>
        <Button onClick={() => (clickCount.value = 0)} variant="danger">
          Reset
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main App
// ============================================================================

function App() {
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Flexium Automatic JSX Demo</h1>
      <p>
        This demo uses React 17+ automatic JSX transform.
        <br />
        <strong>No h() import needed!</strong>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Counter />
        <FragmentDemo />
        <ConditionalDemo />
        <TodoList />
        <NestedComponentsDemo />
      </div>
    </div>
  );
}

export { App, Counter, FragmentDemo, ConditionalDemo, TodoList, NestedComponentsDemo };
