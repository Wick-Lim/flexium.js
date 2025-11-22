# Todo App Example

An intermediate example demonstrating array manipulation, computed values, and animations with Flexium.

## Difficulty Level

**Intermediate** - Build on basics with more complex state management

## What This Example Demonstrates

This todo app example teaches you advanced Flexium patterns:

### Core Concepts
- **Array signals** - Managing reactive arrays
- **Computed values** - Deriving state from other signals
- **Immutable updates** - Creating new arrays instead of mutating
- **Conditional rendering** - Showing different UI based on state
- **List rendering** - Mapping over arrays to create UI
- **Motion animations** - Adding smooth enter/exit transitions

### Key Features
1. **CRUD operations** - Create, read, update, delete todos
2. **Three filters** - All, Active, Completed
3. **Computed statistics** - Remaining items count
4. **Animations** - Smooth fade-in/slide animations with Motion
5. **Conditional UI** - Empty states for different filters
6. **Styled components** - Professional design with hover effects

## How to Run

### Method 1: Using Python HTTP Server (Recommended)

```bash
# From the project root
cd examples/todo
python3 -m http.server 8000

# Open in browser
# http://localhost:8000/index.html
```

### Method 2: Using Node.js http-server

```bash
# Install http-server globally (one time only)
npm install -g http-server

# From the todo directory
cd examples/todo
http-server -p 8000

# Open in browser
# http://localhost:8000/index.html
```

### Important Notes

- **Do NOT open with `file://` protocol** - This causes CORS errors
- **Always use an HTTP server** - Required for ES modules
- **Make sure the library is built** - Run `npm run build` from project root

## Code Walkthrough

### 1. Managing Array State

```typescript
interface Todo {
  id: number
  text: string
  done: boolean
}

const todos = signal<Todo[]>([])
const input = signal('')
const filter = signal<'all' | 'active' | 'completed'>('all')
```

**Key Points:**
- Use TypeScript interfaces for data structures
- Initialize arrays as empty `[]`
- Use union types for limited string options

### 2. Computed Values

```typescript
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
```

**Why Use Computed:**
- Only recalculates when dependencies change
- Caches the result for performance
- Automatically tracks which signals it depends on
- No manual dependency arrays needed

### 3. Immutable Array Updates

```typescript
// Adding a todo - create NEW array with spread
const addTodo = () => {
  todos.value = [
    ...todos.value,
    { id: Date.now(), text: input.value, done: false }
  ]
  input.value = ''
}

// Toggling - map creates NEW array
const toggleTodo = (id: number) => {
  todos.value = todos.value.map(todo =>
    todo.id === id ? { ...todo, done: !todo.done } : todo
  )
}

// Deleting - filter creates NEW array
const deleteTodo = (id: number) => {
  todos.value = todos.value.filter(todo => todo.id !== id)
}
```

**Important:**
- Never mutate arrays directly: `todos.value.push()` won't trigger updates
- Always create new arrays: `[...array, newItem]`
- Use array methods that return new arrays: `map()`, `filter()`

### 4. Conditional Rendering

```typescript
{filteredTodos.value.length === 0 ? (
  <Column>
    <Text>
      {filter.value === 'completed'
        ? 'No completed tasks yet'
        : filter.value === 'active'
        ? 'No active tasks'
        : 'No tasks yet. Add one above!'}
    </Text>
  </Column>
) : (
  filteredTodos.value.map(todo => (
    // Render todo items
  ))
)}
```

**Pattern:**
- Use ternary operators for if/else: `condition ? trueValue : falseValue`
- Nested ternaries for multiple conditions
- Check array length before mapping

### 5. Motion Animations

```tsx
<Motion
  key={todo.id}
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: 20 }}
  transition={{ duration: 0.2 }}
>
  <Row>
    {/* Todo content */}
  </Row>
</Motion>
```

**Animation Props:**
- **initial** - Starting state when element enters
- **animate** - Target state to animate to
- **exit** - State when element leaves
- **transition** - Animation timing (duration, delay, easing)
- **key** - Required for proper animation tracking

### 6. List Rendering with Keys

```typescript
{filteredTodos.value.map(todo => (
  <Motion key={todo.id}>
    {/* Always use unique keys! */}
  </Motion>
))}
```

**Why Keys Matter:**
- Helps Flexium track which items changed
- Enables smooth animations
- Prevents UI bugs when reordering
- Always use unique, stable values (IDs, not indexes)

## Try These Experiments

1. **Add priority levels**
   ```typescript
   interface Todo {
     id: number
     text: string
     done: boolean
     priority: 'low' | 'medium' | 'high'
   }
   ```

2. **Add a due date**
   ```typescript
   const dueDate = signal<Date | null>(null)
   ```

3. **Add categories/tags**
   ```typescript
   const categories = signal(['work', 'personal', 'shopping'])
   ```

4. **Persist to localStorage**
   ```typescript
   effect(() => {
     localStorage.setItem('todos', JSON.stringify(todos.value))
   })
   ```

5. **Add sorting**
   ```typescript
   const sorted = computed(() =>
     [...filteredTodos.value].sort((a, b) =>
       a.text.localeCompare(b.text)
     )
   )
   ```

6. **Add a search filter**
   ```typescript
   const search = signal('')
   const searched = computed(() =>
     filteredTodos.value.filter(t =>
       t.text.toLowerCase().includes(search.value.toLowerCase())
     )
   )
   ```

## File Structure

```
todo/
├── index.html    # HTML wrapper with styling
└── app.ts        # Flexium todo app implementation
```

## Patterns Learned

### 1. Array State Management
```typescript
// ✅ Good - creates new array
todos.value = [...todos.value, newTodo]

// ❌ Bad - mutates array
todos.value.push(newTodo)
```

### 2. Object Updates
```typescript
// ✅ Good - creates new object
{ ...todo, done: !todo.done }

// ❌ Bad - mutates object
todo.done = !todo.done
```

### 3. Computed vs Direct Calculation
```typescript
// ✅ Good - computed (cached, reactive)
const remaining = computed(() => todos.value.filter(t => !t.done).length)

// ❌ Bad - recalculates every time
<Text>{todos.value.filter(t => !t.done).length}</Text>
```

### 4. Filter Combinations
```typescript
// ✅ Good - single computed for all filters
const filtered = computed(() => {
  let result = todos.value
  if (statusFilter.value !== 'all') {
    result = result.filter(/* ... */)
  }
  if (categoryFilter.value !== 'all') {
    result = result.filter(/* ... */)
  }
  return result
})
```

## Next Steps

After mastering this example:

1. **Dashboard** (`/examples/dashboard`) - Learn Grid layouts and real-time data
2. **Todo App (Production)** (`/examples/todo-app`) - See a full-featured version with localStorage
3. **Showcase** (`/examples/showcase`) - Explore 9 different interactive components
4. **Build your own project** - Apply these patterns to your ideas

## Common Issues

### Todos not updating after add/delete
- Make sure you're creating new arrays, not mutating
- Use spread operator: `[...todos.value, newItem]`
- Use `map()` or `filter()` for updates/deletes

### Animations not working
- Ensure `key` prop is set on Motion component
- Use unique, stable keys (IDs, not array indexes)
- Check that initial/animate props are different

### Filter not working
- Verify `filter.value` is being set correctly
- Check `computed()` dependencies are accessed with `.value`
- Use browser DevTools to debug signal values

### Empty state not showing
- Check the condition: `filteredTodos.value.length === 0`
- Make sure `filteredTodos` is a computed value
- Verify filter logic is correct

## Performance Tips

1. **Use computed for derived state** - Don't recalculate in render
2. **Keep updates immutable** - Enables efficient change detection
3. **Use keys in lists** - Helps with efficient updates
4. **Batch multiple updates** - Wrap in `batch()` if needed

## Learning Outcomes

After completing this example, you should understand:

- How to manage reactive arrays in Flexium
- How to use `computed()` for derived state
- How to perform immutable updates (spread, map, filter)
- How to render lists with proper keys
- How to add animations with the Motion component
- How to implement filters and conditional rendering
- Array manipulation patterns in reactive systems

## Additional Resources

- [Counter Example](/examples/counter) - Review the basics
- [Dashboard Example](/examples/dashboard) - See Grid layouts
- [API Documentation](/docs/API.md) - Complete reference
- [Computed Guide](/docs/API.md#computed) - Deep dive into computed values

---

**Ready for more advanced patterns? Try the Dashboard example next!**
