# Flexium Todo App - Production Demo

A **production-ready** Todo application built with Flexium to demonstrate its real-world capabilities and showcase fine-grained reactivity in action.

## 🚀 Quick Start

Simply open `index.html` in your browser. No build step required!

```bash
# From the project root
open examples/todo-app/index.html

# Or with a local server (recommended)
npx serve examples/todo-app
```

## ✨ Features Demonstrated

This application showcases **ALL major Flexium features** in a real-world context:

### 1. **Signal-Based State Management**

- `todos` - Main todo list state
- `newTodoTitle`, `newTodoDescription`, `newTodoCategory`, `newTodoPriority` - Form state
- `filterStatus`, `filterCategory`, `searchQuery` - Filter state
- `titleError`, `titleTouched` - Validation state

```javascript
const todos = signal(loadFromStorage());
const newTodoTitle = signal('');
const filterStatus = signal('all');
```

### 2. **Computed Values (Derived State)**

- `totalTodos` - Total count
- `completedTodos` - Completed count
- `activeTodos` - Active count
- `filteredTodos` - Filtered and searched todos
- `completionPercentage` - Progress percentage

```javascript
const completionPercentage = computed(() => {
  const total = totalTodos.value;
  if (total === 0) return 0;
  return Math.round((completedTodos.value / total) * 100);
});
```

### 3. **Effects for Side Effects**

- **Auto-save to localStorage** - Persists todos automatically
- **Form validation** - Validates title on change
- **Console logging** - Logs filter changes
- **Main render effect** - Re-renders UI when state changes

```javascript
// Auto-save to localStorage
effect(() => {
  saveToStorage(todos.value);
  console.log('💾 Saved to localStorage');
});

// Validate on change
effect(() => {
  if (titleTouched.value) {
    validateTitle();
  }
});
```

### 4. **Batch Updates**

Updates are automatically batched for performance. When multiple signals change at once, only one re-render occurs.

### 5. **Fine-Grained Reactivity**

Only the exact parts of the UI that depend on changed signals are updated. No Virtual DOM, no diffing.

### 6. **Form Management**

- Controlled inputs bound to signals
- Real-time validation
- Error display
- Submit handling
- Reset after submit

### 7. **Multiple Filters**

- **Status filter**: All, Active, Completed
- **Category filter**: All, Work, Personal, Shopping, Health
- **Search filter**: Real-time search across title and description
- **Combined filtering**: All filters work together

### 8. **Local Storage Persistence**

- Auto-saves on every change
- Loads on app start
- Survives page refreshes
- Error handling for storage quota

## 🎨 UI/UX Features

### Professional Design

- Modern gradient backgrounds
- Card-based layout
- Smooth transitions and animations
- Hover effects and visual feedback
- Color-coded categories and priorities
- Empty states with helpful messages

### Mobile Responsive

- Fluid grid layouts
- Responsive breakpoints
- Touch-friendly buttons
- Optimized for small screens
- Flexible form layouts

### Accessibility

- Semantic HTML
- Proper labels and ARIA attributes
- Keyboard navigation
- Focus states
- Clear error messages

## 📊 Real-World Patterns Demonstrated

### 1. **CRUD Operations**

- ✅ **Create** - Add new todos with validation
- ✅ **Read** - Display todos with filtering
- ✅ **Update** - Toggle completion status
- ✅ **Delete** - Remove individual todos or bulk delete

### 2. **State Management**

- Local component state (form inputs)
- Shared application state (todos)
- Derived state (computed values)
- Validation state (errors, touched)

### 3. **User Interactions**

- Form submission
- Real-time search
- Filter toggling
- Checkbox toggling
- Button clicks
- Keyboard events (Enter to submit)

### 4. **Data Persistence**

- localStorage integration
- Auto-save on changes
- Load on mount
- Error handling

### 5. **Validation**

- Required field validation
- Minimum length validation
- Real-time error display
- Touched state tracking

## 🏗️ Architecture Highlights

### State Structure

```javascript
{
  // Core state
  todos: Signal<Todo[]>

  // Form state
  newTodoTitle: Signal<string>
  newTodoDescription: Signal<string>
  newTodoCategory: Signal<Category>
  newTodoPriority: Signal<Priority>

  // Validation
  titleError: Signal<string | null>
  titleTouched: Signal<boolean>

  // Filters
  filterStatus: Signal<'all' | 'active' | 'completed'>
  filterCategory: Signal<Category | 'all'>
  searchQuery: Signal<string>

  // Computed
  totalTodos: Computed<number>
  completedTodos: Computed<number>
  activeTodos: Computed<number>
  filteredTodos: Computed<Todo[]>
  completionPercentage: Computed<number>
}
```

### Data Flow

```
User Action
    ↓
Signal Update
    ↓
Effect Triggers
    ↓
Computed Values Recalculate
    ↓
Render Effect Runs
    ↓
DOM Updates (Fine-grained)
    ↓
Side Effects Execute (localStorage, logging)
```

## 🎯 Flexium Features Checklist

- ✅ **Signals** - Reactive primitive values
- ✅ **Computed** - Derived values with automatic dependency tracking
- ✅ **Effects** - Side effects that run when dependencies change
- ✅ **Batch updates** - Automatic batching for performance
- ✅ **Fine-grained reactivity** - No VDOM, direct DOM updates
- ✅ **Form validation** - Reactive error handling
- ✅ **Local storage** - Persistent state
- ✅ **Multiple filters** - Complex filtering logic
- ✅ **Real-time search** - Instant search results
- ✅ **Statistics** - Real-time computed stats
- ✅ **CRUD operations** - Full create/read/update/delete
- ✅ **Mobile responsive** - Works on all devices
- ✅ **Professional UI** - Production-quality design

## 📈 Performance Characteristics

### Bundle Size

This demo uses an inline signal implementation (< 1KB). In production with full Flexium:

- Core signals: **175 bytes**
- DOM renderer: **8.6 KB**
- Total framework: **< 25 KB**

### Runtime Performance

- Signal updates: **< 0.1ms**
- No Virtual DOM overhead
- Fine-grained updates (only changed elements)
- Automatic batching prevents cascading updates
- Lazy computed values (only recalculate when accessed)

### Memory Efficiency

- Minimal memory footprint
- Automatic cleanup of effects
- No stale closure issues
- No dependency arrays to manage

## 🧪 Testing the App

### Try These Scenarios

1. **Add a todo**
   - Fill in title (required)
   - Add description (optional)
   - Select category and priority
   - Click "Add Task"

2. **Validate form**
   - Try submitting with empty title
   - Try title with < 3 characters
   - See error messages appear

3. **Filter todos**
   - Click "Active" to see only incomplete
   - Click "Completed" to see only done
   - Select category filters
   - Try searching

4. **Toggle completion**
   - Check/uncheck checkboxes
   - Watch statistics update in real-time
   - Notice completed todos are styled differently

5. **Delete todos**
   - Click trash icon to delete one
   - Click "Clear Completed" to remove all done
   - Click "Delete All" to start fresh

6. **Test persistence**
   - Add some todos
   - Refresh the page
   - See todos persist from localStorage

7. **Test responsiveness**
   - Resize browser window
   - Open on mobile device
   - Verify layouts adjust properly

## 💡 Code Highlights

### Reactive Form Validation

```javascript
const titleError = signal(null);
const titleTouched = signal(false);

// Validate on change
effect(() => {
  if (titleTouched.value) {
    validateTitle();
  }
});

function validateTitle() {
  const title = newTodoTitle.value.trim();
  if (!title) {
    titleError.value = 'Title is required';
    return false;
  }
  if (title.length < 3) {
    titleError.value = 'Title must be at least 3 characters';
    return false;
  }
  titleError.value = null;
  return true;
}
```

### Complex Filtering with Computed

```javascript
const filteredTodos = computed(() => {
  let result = todos.value;

  // Filter by status
  if (filterStatus.value === 'active') {
    result = result.filter(t => !t.completed);
  } else if (filterStatus.value === 'completed') {
    result = result.filter(t => t.completed);
  }

  // Filter by category
  if (filterCategory.value !== 'all') {
    result = result.filter(t => t.category === filterCategory.value);
  }

  // Filter by search
  const query = searchQuery.value.toLowerCase();
  if (query) {
    result = result.filter(t =>
      t.title.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query))
    );
  }

  return result;
});
```

### Auto-Save Effect

```javascript
effect(() => {
  saveToStorage(todos.value);
  console.log('💾 Saved to localStorage:', todos.value.length, 'todos');
});
```

### Main Render Effect

```javascript
effect(() => {
  // Access all reactive values to create dependencies
  todos.value;
  filteredTodos.value;
  newTodoTitle.value;
  // ... etc

  render(); // Only runs when dependencies change
});
```

## 🚀 Production Readiness

This app demonstrates production-ready patterns:

### ✅ What's Production-Ready

- **Error handling** - Try/catch for localStorage, validation errors
- **User feedback** - Loading states, empty states, error messages
- **Data validation** - Form validation with clear error messages
- **Accessibility** - Proper labels, ARIA attributes, keyboard support
- **Persistence** - Auto-save to localStorage
- **Performance** - Fine-grained updates, batched renders
- **Mobile support** - Responsive design, touch-friendly
- **Code organization** - Clear separation of concerns
- **User experience** - Smooth animations, visual feedback

### ⚠️ What's Missing for Production

- **Authentication** - No user accounts (out of scope)
- **Backend sync** - No API integration (localStorage only)
- **Testing** - No unit/integration tests
- **Error tracking** - No Sentry/error monitoring
- **Analytics** - No usage tracking
- **PWA features** - No service worker, offline support

## 📝 Lessons Learned

### What Works Great

1. **Signals are intuitive** - Easy to reason about state
2. **Computed values are powerful** - Automatic dependency tracking
3. **Effects handle side effects cleanly** - No useEffect dependency arrays
4. **Fine-grained reactivity is fast** - No VDOM overhead
5. **No framework boilerplate** - Just JavaScript

### Potential Improvements

1. **Component abstraction** - Would benefit from reusable components
2. **Type safety** - TypeScript would catch errors earlier
3. **DevTools** - Browser extension would help debugging
4. **Testing utilities** - Helper functions for testing reactive code

## 🎓 Learning Outcomes

After studying this example, you should understand:

- How to structure a real application with signals
- When to use signals vs computed vs effects
- How to handle forms with reactive state
- How to implement complex filtering
- How to persist state to localStorage
- How to validate user input reactively
- How to create a responsive, accessible UI
- How to optimize for performance

## 🔗 Related Examples

- **Counter** - Simple signal basics
- **Dashboard** - More complex layouts and charts
- **Shopping Cart** - E-commerce patterns

## 📄 License

MIT License - Feel free to use this as a template for your own projects!

---

**Built with ❤️ using Flexium**

Demonstrating that fine-grained reactivity can power production-ready applications.
