# Flexium Best Practices

A comprehensive guide to writing clean, performant, and maintainable Flexium applications.

## Table of Contents

- [Signal Patterns](#signal-patterns)
- [Component Structure](#component-structure)
- [Performance Tips](#performance-tips)
- [Common Mistakes](#common-mistakes)
- [Testing Strategies](#testing-strategies)
- [Architecture Patterns](#architecture-patterns)
- [Advanced Techniques](#advanced-techniques)

---

## Signal Patterns

### 1. Signal Naming Conventions

Use clear, descriptive names that indicate the signal's purpose:

**Good:**
```typescript
const userCount = signal(0)
const isLoading = signal(false)
const selectedUser = signal<User | null>(null)
const formData = signal({ name: '', email: '' })
```

**Avoid:**
```typescript
const c = signal(0) // Too short
const signal1 = signal(false) // Non-descriptive
const data = signal(null) // Too generic
```

### 2. When to Use Signals vs. Computed

**Use Signals for:**
- User input state
- Data that changes over time
- Flags and toggles
- Data fetched from APIs

**Use Computed for:**
- Derived values
- Filtered or sorted data
- Formatted values
- Conditional logic based on other signals

```typescript
// Signals for base state
const todos = signal<Todo[]>([])
const filter = signal<'all' | 'active' | 'completed'>('all')

// Computed for derived state
const filteredTodos = computed(() => {
  const filterValue = filter.value
  const todoList = todos.value

  if (filterValue === 'all') return todoList
  if (filterValue === 'active') return todoList.filter(t => !t.completed)
  return todoList.filter(t => t.completed)
})

const activeCount = computed(() =>
  todos.value.filter(t => !t.completed).length
)
```

### 3. Avoid Deep Nesting

**Bad:**
```typescript
const state = signal({
  user: {
    profile: {
      settings: {
        theme: 'dark'
      }
    }
  }
})

// Changing nested values is verbose
state.value = {
  ...state.value,
  user: {
    ...state.value.user,
    profile: {
      ...state.value.user.profile,
      settings: {
        ...state.value.user.profile.settings,
        theme: 'light'
      }
    }
  }
}
```

**Good:**
```typescript
// Flatten the structure
const userProfile = signal({ name: '', email: '' })
const userSettings = signal({ theme: 'dark', notifications: true })

// Easy to update
userSettings.value = { ...userSettings.value, theme: 'light' }
```

### 4. Use Batch for Multiple Updates

When updating multiple signals at once, use `batch()` to prevent unnecessary re-renders:

```typescript
import { batch } from 'flexium/core'

const firstName = signal('John')
const lastName = signal('Doe')
const age = signal(30)

// Without batch - triggers 3 updates
firstName.value = 'Jane'
lastName.value = 'Smith'
age.value = 25

// With batch - triggers 1 update
batch(() => {
  firstName.value = 'Jane'
  lastName.value = 'Smith'
  age.value = 25
})
```

### 5. Signal Cleanup Pattern

Always clean up effects when they're no longer needed:

```typescript
export function UserProfile({ userId }: { userId: number }) {
  const user = signal<User | null>(null)
  const loading = signal(true)

  // Store dispose function
  const dispose = effect(() => {
    const controller = new AbortController()

    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        user.value = data
        loading.value = false
      })

    // Cleanup function
    return () => controller.abort()
  })

  // Clean up when component unmounts
  onUnmount(() => dispose())

  return (
    <div>
      {loading.value ? 'Loading...' : user.value?.name}
    </div>
  )
}
```

---

## Component Structure

### 1. Component Organization

Follow this consistent structure:

```typescript
import { signal, computed, effect } from 'flexium/core'
import { h } from 'flexium/dom'

// 1. Types/Interfaces
interface MyComponentProps {
  title: string
  onSubmit: (data: FormData) => void
}

// 2. Component function
export function MyComponent(props: MyComponentProps) {
  // 3. Signals (state)
  const inputValue = signal('')
  const isValid = signal(false)

  // 4. Computed values
  const isEmpty = computed(() => inputValue.value.trim() === '')

  // 5. Effects
  effect(() => {
    isValid.value = inputValue.value.length >= 3
  })

  // 6. Event handlers
  const handleSubmit = () => {
    if (isValid.value) {
      props.onSubmit({ input: inputValue.value })
      inputValue.value = '' // Reset
    }
  }

  // 7. Render
  return (
    <div>
      <h1>{props.title}</h1>
      <input
        value={inputValue.value}
        oninput={(e) => inputValue.value = e.target.value}
      />
      <button
        onclick={handleSubmit}
        disabled={!isValid.value}
      >
        Submit
      </button>
    </div>
  )
}
```

### 2. Keep Components Small

Break large components into smaller, focused components:

**Bad:**
```typescript
function TodoApp() {
  // 200+ lines of logic and rendering...
}
```

**Good:**
```typescript
function TodoApp() {
  const todos = signal<Todo[]>([])

  return (
    <div>
      <TodoHeader />
      <TodoInput onAdd={(text) => addTodo(text)} />
      <TodoList todos={todos.value} />
      <TodoFooter count={todos.value.length} />
    </div>
  )
}
```

### 3. Props vs. Signals

**Use Props for:**
- Configuration
- Callbacks
- Static data
- Parent-to-child communication

**Use Signals for:**
- Component-local state
- Shared state across components
- Reactive data

```typescript
interface ButtonProps {
  // Props: Configuration
  variant: 'primary' | 'secondary'
  disabled?: boolean
  onClick: () => void
  children: string
}

export function Button(props: ButtonProps) {
  // Signal: Local state
  const isHovered = signal(false)

  return (
    <button
      class={`btn btn-${props.variant}`}
      disabled={props.disabled}
      onclick={props.onClick}
      onmouseenter={() => isHovered.value = true}
      onmouseleave={() => isHovered.value = false}
    >
      {props.children}
    </button>
  )
}
```

### 4. Composition Over Inheritance

Prefer composition patterns:

```typescript
// Good: Composable layout components
<Column gap={16}>
  <Header />
  <Row justify="space-between">
    <Sidebar />
    <MainContent />
  </Row>
  <Footer />
</Column>

// Avoid: Creating complex inheritance hierarchies
class BaseComponent extends Component { ... }
class ExtendedComponent extends BaseComponent { ... }
```

---

## Performance Tips

### 1. Use `computed()` for Expensive Operations

Computed values are memoized and only recalculate when dependencies change:

```typescript
const items = signal<Item[]>([...])

// Bad: Recalculates on every render
const expensiveValue = () => {
  return items.value
    .filter(item => item.active)
    .map(item => heavyComputation(item))
    .sort((a, b) => a.score - b.score)
}

// Good: Cached until items changes
const expensiveValue = computed(() => {
  return items.value
    .filter(item => item.active)
    .map(item => heavyComputation(item))
    .sort((a, b) => a.score - b.score)
})
```

### 2. Avoid Creating Signals in Loops

**Bad:**
```typescript
function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <div>
      {todos.map(todo => {
        // Creates new signal on every render!
        const completed = signal(todo.completed)
        return <TodoItem completed={completed} />
      })}
    </div>
  )
}
```

**Good:**
```typescript
// Create signals at the component level
const todos = signal<Todo[]>([])

function TodoList() {
  return (
    <div>
      {todos.value.map(todo => (
        <TodoItem todo={todo} />
      ))}
    </div>
  )
}
```

### 3. Use `untrack()` for Non-Reactive Reads

When you need to read a signal value inside an effect without creating a dependency:

```typescript
const userId = signal(1)
const userName = signal('John')

effect(() => {
  console.log('User ID changed:', userId.value)

  // Read userName without tracking it
  const name = untrack(() => userName.value)
  console.log('Current name (not tracked):', name)
})

// Changing userName won't trigger the effect
userName.value = 'Jane' // Effect doesn't run
```

### 4. Debounce Expensive Operations

```typescript
const searchQuery = signal('')

// Debounced computed value
let timeoutId: number
const debouncedQuery = computed(() => {
  clearTimeout(timeoutId)
  return new Promise(resolve => {
    timeoutId = setTimeout(() => {
      resolve(searchQuery.value)
    }, 300)
  })
})

effect(() => {
  const query = debouncedQuery.value
  // Fetch results only after user stops typing for 300ms
  fetchSearchResults(query)
})
```

### 5. Virtualize Long Lists

For lists with 100+ items, use virtualization:

```typescript
import { signal, computed } from 'flexium/core'

function VirtualList({ items, itemHeight = 50, visibleCount = 20 }) {
  const scrollTop = signal(0)

  const visibleItems = computed(() => {
    const start = Math.floor(scrollTop.value / itemHeight)
    const end = start + visibleCount
    return items.slice(start, end)
  })

  return (
    <div
      style={{ height: `${visibleCount * itemHeight}px`, overflow: 'auto' }}
      onscroll={(e) => scrollTop.value = e.target.scrollTop}
    >
      <div style={{ height: `${items.length * itemHeight}px` }}>
        <div style={{ transform: `translateY(${Math.floor(scrollTop.value / itemHeight) * itemHeight}px)` }}>
          {visibleItems.value.map(item => (
            <div style={{ height: `${itemHeight}px` }}>
              {item.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## Common Mistakes

### 1. Forgetting `.value`

```typescript
const count = signal(0)

// Wrong: count is a function, not a number
console.log(count + 1) // NaN

// Correct: access the value
console.log(count.value + 1) // 1
```

### 2. Mutating Signal Values Directly

```typescript
const items = signal([1, 2, 3])

// Wrong: Mutating doesn't trigger updates
items.value.push(4) // No update!

// Correct: Replace with new array
items.value = [...items.value, 4]
```

### 3. Creating Effects Inside Loops

```typescript
// Bad: Creates multiple effects on every render
todos.value.forEach(todo => {
  effect(() => {
    console.log(todo.completed)
  })
})

// Good: One effect, observe the whole list
effect(() => {
  todos.value.forEach(todo => {
    console.log(todo.completed)
  })
})
```

### 4. Not Cleaning Up Effects

```typescript
// Bad: Effect continues running even after component is removed
effect(() => {
  const interval = setInterval(() => {
    console.log('Tick')
  }, 1000)
})

// Good: Return cleanup function
effect(() => {
  const interval = setInterval(() => {
    console.log('Tick')
  }, 1000)

  return () => clearInterval(interval)
})
```

### 5. Overusing Effects

```typescript
// Bad: Effect when computed would work
const count = signal(0)
const doubled = signal(0)

effect(() => {
  doubled.value = count.value * 2
})

// Good: Use computed instead
const doubled = computed(() => count.value * 2)
```

---

## Testing Strategies

### 1. Test Signal Behavior

```typescript
import { describe, it, expect } from 'vitest'
import { signal, computed, effect } from 'flexium/core'

describe('Counter Signal', () => {
  it('should initialize with correct value', () => {
    const count = signal(0)
    expect(count.value).toBe(0)
  })

  it('should update value', () => {
    const count = signal(0)
    count.value = 5
    expect(count.value).toBe(5)
  })

  it('should trigger effects on change', () => {
    const count = signal(0)
    let effectCount = 0

    effect(() => {
      count.value // Read to track dependency
      effectCount++
    })

    expect(effectCount).toBe(1) // Initial run

    count.value = 1
    expect(effectCount).toBe(2) // After update
  })
})
```

### 2. Test Computed Values

```typescript
describe('Computed Signals', () => {
  it('should compute derived value', () => {
    const count = signal(5)
    const doubled = computed(() => count.value * 2)

    expect(doubled.value).toBe(10)
  })

  it('should update when dependency changes', () => {
    const firstName = signal('John')
    const lastName = signal('Doe')
    const fullName = computed(() => `${firstName.value} ${lastName.value}`)

    expect(fullName.value).toBe('John Doe')

    firstName.value = 'Jane'
    expect(fullName.value).toBe('Jane Doe')
  })
})
```

### 3. Test Components

```typescript
import { render } from 'flexium/dom'

describe('Button Component', () => {
  it('should render with correct text', () => {
    const container = document.createElement('div')
    render(<Button>Click me</Button>, container)

    expect(container.textContent).toBe('Click me')
  })

  it('should call onClick when clicked', () => {
    const onClick = vi.fn()
    const container = document.createElement('div')
    render(<Button onclick={onClick}>Click</Button>, container)

    const button = container.querySelector('button')
    button?.click()

    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

### 4. Test Async Effects

```typescript
describe('Async Data Fetching', () => {
  it('should fetch and update signal', async () => {
    const data = signal(null)
    const loading = signal(true)

    effect(() => {
      fetch('/api/data')
        .then(res => res.json())
        .then(result => {
          data.value = result
          loading.value = false
        })
    })

    // Wait for async operation
    await vi.waitFor(() => {
      expect(loading.value).toBe(false)
    })

    expect(data.value).not.toBeNull()
  })
})
```

---

## Architecture Patterns

### 1. State Management

For small apps, use local signals:
```typescript
function TodoApp() {
  const todos = signal<Todo[]>([])
  // Use within component
}
```

For larger apps, create a state module:
```typescript
// state/todos.ts
export const todos = signal<Todo[]>([])
export const filter = signal<Filter>('all')

export const filteredTodos = computed(() => {
  // filtering logic
})

export function addTodo(text: string) {
  todos.value = [...todos.value, { id: uuid(), text, completed: false }]
}
```

### 2. Service Layer Pattern

```typescript
// services/userService.ts
import { signal } from 'flexium/core'

const users = signal<User[]>([])
const loading = signal(false)
const error = signal<Error | null>(null)

export const userService = {
  users,
  loading,
  error,

  async fetchUsers() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/users')
      users.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  },

  async addUser(user: User) {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(user)
    })
    const newUser = await response.json()
    users.value = [...users.value, newUser]
  }
}
```

### 3. Feature-Based Organization

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── state/
│   │   └── services/
│   ├── todos/
│   │   ├── components/
│   │   ├── state/
│   │   └── services/
│   └── profile/
├── shared/
│   ├── components/
│   └── utils/
└── app.tsx
```

---

## Advanced Techniques

### 1. Custom Signal Hooks

```typescript
export function useLocalStorage<T>(key: string, initialValue: T) {
  const stored = localStorage.getItem(key)
  const value = signal<T>(stored ? JSON.parse(stored) : initialValue)

  effect(() => {
    localStorage.setItem(key, JSON.stringify(value.value))
  })

  return value
}

// Usage
const theme = useLocalStorage('theme', 'dark')
```

### 2. Signal Synchronization

```typescript
export function syncSignals<T>(source: Signal<T>, target: Signal<T>) {
  effect(() => {
    target.value = source.value
  })
}

// Usage
const localCount = signal(0)
const globalCount = signal(0)
syncSignals(localCount, globalCount)
```

### 3. Conditional Effects

```typescript
const isEnabled = signal(false)
const count = signal(0)

effect(() => {
  if (!isEnabled.value) return

  console.log('Count:', count.value)
})

// Effect only runs when isEnabled is true
```

### 4. Signal Middleware Pattern

```typescript
export function createSignalWithMiddleware<T>(
  initialValue: T,
  middleware: (oldValue: T, newValue: T) => T
) {
  const sig = signal(initialValue)
  const originalSet = sig.set

  sig.set = (newValue: T) => {
    const processedValue = middleware(sig.peek(), newValue)
    originalSet.call(sig, processedValue)
  }

  return sig
}

// Usage: Validation middleware
const age = createSignalWithMiddleware(0, (oldVal, newVal) => {
  return newVal < 0 ? 0 : newVal > 120 ? 120 : newVal
})
```

---

## Summary

1. **Use signals for state, computed for derived values**
2. **Keep components small and focused**
3. **Batch multiple updates together**
4. **Always clean up effects**
5. **Test signal behavior thoroughly**
6. **Organize large apps by feature**
7. **Leverage composition over inheritance**
8. **Profile before optimizing**

For more patterns and examples, see:
- [Examples Directory](../examples/)
- [API Documentation](./API.md)
- [FAQ](./FAQ.md)
