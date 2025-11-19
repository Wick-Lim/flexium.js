/**
 * DOM Renderer Demo
 *
 * This example demonstrates the complete cross-renderer architecture with:
 * - Signal-based reactivity
 * - DOM rendering
 * - Platform-agnostic components
 * - Reactive updates
 */

import { signal, computed, effect } from '../src/core/signal';
import { h } from '../src/renderers/dom/h';
import { createReactiveRoot } from '../src/renderers/dom/reactive';

// ============================================================================
// Platform-Agnostic Components
// ============================================================================

/**
 * Row component - horizontal flex layout
 */
function Row(props: any) {
  return h('Row', props, ...(props.children || []));
}

/**
 * Column component - vertical flex layout
 */
function Column(props: any) {
  return h('Column', props, ...(props.children || []));
}

/**
 * Text component
 */
function Text(props: any) {
  return h('Text', props, ...(props.children || []));
}

/**
 * Button component
 */
function Button(props: any) {
  return h('Button', props, ...(props.children || []));
}

// ============================================================================
// Example 1: Simple Counter with Signals
// ============================================================================

function Counter() {
  const count = signal(0);

  return h(
    Column,
    { gap: 16, padding: 24, bg: '#f5f5f5', borderRadius: 8 },
    h(Text, { fontSize: 24, fontWeight: 'bold' }, `Count: ${count.value}`),
    h(
      Row,
      { gap: 8 },
      h(
        Button,
        {
          onPress: () => count.value--,
          padding: 8,
          bg: '#ff6b6b',
          color: 'white',
          borderRadius: 4,
        },
        '-'
      ),
      h(
        Button,
        {
          onPress: () => count.value++,
          padding: 8,
          bg: '#51cf66',
          color: 'white',
          borderRadius: 4,
        },
        '+'
      )
    )
  );
}

// ============================================================================
// Example 2: Computed Values
// ============================================================================

function TemperatureConverter() {
  const celsius = signal(0);
  const fahrenheit = computed(() => (celsius.value * 9) / 5 + 32);

  return h(
    Column,
    { gap: 16, padding: 24, bg: '#e3f2fd', borderRadius: 8 },
    h(Text, { fontSize: 20, fontWeight: 'bold' }, 'Temperature Converter'),
    h(
      Row,
      { gap: 8, alignItems: 'center' },
      h(Text, null, 'Celsius:'),
      h('Input', {
        type: 'number',
        value: celsius.value,
        onChange: (e: any) => (celsius.value = parseFloat(e.target.value) || 0),
        padding: 8,
        borderRadius: 4,
      })
    ),
    h(
      Text,
      { fontSize: 18 },
      `${celsius.value}°C = ${fahrenheit.value.toFixed(2)}°F`
    )
  );
}

// ============================================================================
// Example 3: Todo List with Fine-Grained Reactivity
// ============================================================================

function TodoList() {
  const todos = signal<{ id: number; text: string; done: boolean }[]>([]);
  const input = signal('');
  const filter = signal<'all' | 'active' | 'completed'>('all');

  const filteredTodos = computed(() => {
    const allTodos = todos.value;
    if (filter.value === 'active') {
      return allTodos.filter((t) => !t.done);
    } else if (filter.value === 'completed') {
      return allTodos.filter((t) => t.done);
    }
    return allTodos;
  });

  const addTodo = () => {
    if (input.value.trim()) {
      todos.value = [
        ...todos.value,
        { id: Date.now(), text: input.value, done: false },
      ];
      input.value = '';
    }
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
  };

  const deleteTodo = (id: number) => {
    todos.value = todos.value.filter((t) => t.id !== id);
  };

  return h(
    Column,
    { gap: 16, padding: 24, bg: '#fff', borderRadius: 8 },
    h(Text, { fontSize: 24, fontWeight: 'bold' }, 'Todo List'),

    // Input section
    h(
      Row,
      { gap: 8 },
      h('Input', {
        type: 'text',
        value: input.value,
        onChange: (e: any) => (input.value = e.target.value),
        onKeyDown: (e: any) => e.key === 'Enter' && addTodo(),
        placeholder: 'Add a todo...',
        padding: 8,
        borderRadius: 4,
        flex: 1,
      }),
      h(
        Button,
        {
          onPress: addTodo,
          padding: 8,
          bg: '#4dabf7',
          color: 'white',
          borderRadius: 4,
        },
        'Add'
      )
    ),

    // Filter buttons
    h(
      Row,
      { gap: 8 },
      h(
        Button,
        {
          onPress: () => (filter.value = 'all'),
          padding: 8,
          bg: filter.value === 'all' ? '#4dabf7' : '#e9ecef',
          color: filter.value === 'all' ? 'white' : 'black',
          borderRadius: 4,
        },
        'All'
      ),
      h(
        Button,
        {
          onPress: () => (filter.value = 'active'),
          padding: 8,
          bg: filter.value === 'active' ? '#4dabf7' : '#e9ecef',
          color: filter.value === 'active' ? 'white' : 'black',
          borderRadius: 4,
        },
        'Active'
      ),
      h(
        Button,
        {
          onPress: () => (filter.value = 'completed'),
          padding: 8,
          bg: filter.value === 'completed' ? '#4dabf7' : '#e9ecef',
          color: filter.value === 'completed' ? 'white' : 'black',
          borderRadius: 4,
        },
        'Completed'
      )
    ),

    // Todo items
    h(
      Column,
      { gap: 8 },
      ...filteredTodos.value.map((todo) =>
        h(
          Row,
          {
            gap: 8,
            padding: 12,
            bg: '#f8f9fa',
            borderRadius: 4,
            alignItems: 'center',
          },
          h('Input', {
            type: 'checkbox',
            checked: todo.done,
            onChange: () => toggleTodo(todo.id),
          }),
          h(
            Text,
            {
              flex: 1,
              textDecoration: todo.done ? 'line-through' : 'none',
              color: todo.done ? '#adb5bd' : '#000',
            },
            todo.text
          ),
          h(
            Button,
            {
              onPress: () => deleteTodo(todo.id),
              padding: 4,
              bg: '#ff6b6b',
              color: 'white',
              borderRadius: 4,
            },
            '×'
          )
        )
      )
    )
  );
}

// ============================================================================
// Example 4: Effects and Side Effects
// ============================================================================

function EffectDemo() {
  const clicks = signal(0);
  const log = signal<string[]>([]);

  // Effect runs whenever clicks changes
  effect(() => {
    const count = clicks.value;
    log.value = [...log.value, `Clicked ${count} times at ${new Date().toLocaleTimeString()}`];

    // Cleanup function
    return () => {
      console.log('Cleaning up effect');
    };
  });

  return h(
    Column,
    { gap: 16, padding: 24, bg: '#fff3bf', borderRadius: 8 },
    h(Text, { fontSize: 20, fontWeight: 'bold' }, 'Effect Demo'),
    h(
      Button,
      {
        onPress: () => clicks.value++,
        padding: 12,
        bg: '#fab005',
        color: 'white',
        borderRadius: 4,
      },
      `Click Me (${clicks.value} clicks)`
    ),
    h(
      Column,
      { gap: 4, padding: 12, bg: '#fff', borderRadius: 4 },
      h(Text, { fontWeight: 'bold' }, 'Effect Log:'),
      ...log.value.slice(-5).map((entry) => h(Text, { fontSize: 14 }, entry))
    )
  );
}

// ============================================================================
// Main App
// ============================================================================

function App() {
  return h(
    Column,
    { gap: 24, padding: 24, bg: '#f0f0f0', minHeight: '100vh' },
    h(
      Text,
      { fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
      'Flexium DOM Renderer Demo'
    ),
    h(Counter, null),
    h(TemperatureConverter, null),
    h(TodoList, null),
    h(EffectDemo, null)
  );
}

// ============================================================================
// Render to DOM
// ============================================================================

// Wait for DOM to be ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('root');
    if (container) {
      const root = createReactiveRoot(container);
      root.render(h(App, null));
    }
  });
}

// Export for use in other modules
export { App, Counter, TemperatureConverter, TodoList, EffectDemo };
