# Flexium Todo App Template

A complete, production-ready todo application demonstrating all Flexium features. Use this as a reference implementation or starting point for your own application.

## Features Demonstrated

### Reactivity System
- **Signals** - Reactive primitive values
- **Computed Values** - Derived state that updates automatically
- **Effects** - Side effects with automatic dependency tracking
- **Batch Updates** - Optimized updates when changing multiple values

### State Management
- **Local State** - Component-level reactive state
- **Global State** - Shared state across the application
- **Derived State** - Computed values from base state
- **State Persistence** - Auto-save to localStorage

### Form Management
- **Form Validation** - Reactive validation with error messages
- **Field State** - Track touched, dirty, error states
- **Multi-field Forms** - Handle complex forms with multiple inputs
- **Form Reset** - Clear form after submission

### Data Filtering
- **Multiple Filters** - Status, category, and text search
- **Computed Filtering** - Efficient filtered lists
- **Active Filter State** - Track which filters are applied
- **Empty States** - Handle no results gracefully

### UI/UX
- **Responsive Design** - Mobile-first, works on all devices
- **Professional Styling** - Production-ready CSS
- **Animations** - Smooth transitions and entry animations
- **Empty States** - Helpful messages when no data
- **Loading States** - Handle async operations
- **Confirmation Dialogs** - Prevent accidental deletions

### Best Practices
- **Type Safety** - Structured data with validation
- **Error Handling** - Graceful degradation
- **Accessibility** - Semantic HTML and ARIA labels
- **Performance** - Optimized rendering and updates
- **Code Comments** - Well-documented code
- **Security** - XSS protection with HTML escaping

## Quick Start

### 1. Serve the Application

```bash
cd templates/todo-app-template
python3 -m http.server 8000
```

Open `http://localhost:8000` in your browser.

### 2. Explore the Features

- Add todos with title, description, category, and priority
- Toggle todos as complete/incomplete
- Filter by status (all, active, completed)
- Filter by category (work, personal, shopping, health)
- Search todos by title or description
- View statistics (total, active, completed, progress)
- Clear completed todos
- Delete individual or all todos
- Data persists to localStorage

### 3. Study the Code

The entire application is in a single file (`index.html`) with comprehensive comments explaining each section.

## Project Structure

```
todo-app-template/
├── index.html           # Complete application
└── README.md           # This file
```

## Code Sections

### 1. CSS Styles (Lines 7-617)
- CSS custom properties for theming
- Responsive layout system
- Component styles
- Mobile breakpoints
- Animations

### 2. State System (Lines 621-690)
- `state()` - Unified reactive state management
- `state(() => ...)` - Computed/Derived values
- `state(async () => ...)` - Async resources
- `effect()` - Side effects with automatic dependency tracking
- `sync()` - Optimized updates when changing multiple values

### 3. State Management (Lines 713-805)
- Todo list state
- Form state (title, description, category, priority)
- Validation state
- Filter state
- Computed statistics

### 4. Actions (Lines 810-881)
- `addTodo()` - Create new todo
- `toggleTodo()` - Mark complete/incomplete
- `deleteTodo()` - Remove todo
- `clearCompleted()` - Remove all completed
- `deleteAll()` - Clear everything
- `validateTitle()` - Form validation

### 5. Effects (Lines 886-900)
- Auto-save to localStorage
- Validate on input change
- Re-render on state changes

### 6. Rendering (Lines 905-1169)
- Template generation
- Event listener attachment
- DOM updates
- HTML escaping for security

## Key Patterns

### State Pattern (Local)
```javascript
// Create state
const [count, setCount] = state(0)

// Read value (direct usage)
console.log(count)

// Update value
setCount(c => c + 1)
```

### Computed Pattern
```javascript
// Create computed state
// Pass a function with deps option
const [doubled] = state(() => count * 2, { deps: [count] })

// Always up-to-date
console.log(doubled) // count * 2
```

### Effect Pattern
```javascript
// Run side effect
effect(() => {
  console.log('Count changed:', count)
})
```

### Sync/Batch Pattern
```javascript
// Update multiple states efficiently
sync(() => {
  setCount(10)
  setFlag(true)
})
// Effects run once after updates
```

### Form Validation Pattern
```javascript
const [input, setInput] = state('')
const [error] = state(() => {
  if (!input) return 'Required'
  if (input.length < 3) return 'Too short'
  return null
}, { deps: [input] })
```

### Filter Pattern
```javascript
const [items] = state([...])
const [filter, setFilter] = state('all')
const [filtered] = state(() => {
  if (filter === 'all') return items
  return items.filter(item => item.status === filter)
}, { deps: [items, filter] })
```

### Persistence Pattern
```javascript
// Auto-save effect
effect(() => {
  localStorage.setItem('key', JSON.stringify(todos))
})

// Load on init
const [todos] = state(loadFromStorage())
```

## Customization Guide

### Change Theme Colors

Update CSS custom properties:

```css
:root {
  --color-primary: #your-color;
  --color-success: #your-color;
  /* etc */
}
```

### Add New Categories

Update the category select and styles:

```html
<option value="fitness">Fitness</option>
```

```css
.category-fitness {
  background: #your-bg;
  color: #your-color;
}
```

### Add Due Dates

1. Add to todo object:
```javascript
const newTodo = {
  // ...existing fields
  dueDate: signal(new Date())
}
```

2. Add to form:
```html
<input type="date" id="due-date" />
```

3. Update rendering to display date

### Add Tags

1. Add tags to state:
```javascript
const newTodoTags = signal([])
```

2. Create tag input component
3. Update rendering to show tags
4. Add tag filtering

### Add Editing

1. Add edit mode state:
```javascript
const editingId = signal(null)
```

2. Add edit button to todo item
3. Create edit form
4. Add save/cancel handlers

### Add Sorting

1. Add sort state:
```javascript
const sortBy = signal('createdAt')
const sortOrder = signal('desc')
```

2. Create computed sorted list:
```javascript
const sortedTodos = computed(() => {
  return [...filteredTodos.value].sort((a, b) => {
    // Sort logic
  })
})
```

3. Add sort controls to UI

## Production Enhancements

### To make this production-ready:

1. **Use Vite Starter**
   - Move to TypeScript
   - Split into components
   - Add proper build process
   - Enable tree-shaking

2. **Add Tests**
   - Unit tests for signals
   - Integration tests for actions
   - E2E tests for user flows

3. **Improve Performance**
   - Virtual scrolling for long lists
   - Debounce search input
   - Lazy load todos
   - Optimize re-renders

4. **Add Backend**
   - API integration
   - Real-time sync
   - User authentication
   - Cloud storage

5. **Enhance UX**
   - Drag-and-drop reordering
   - Keyboard shortcuts
   - Undo/redo
   - Offline support
   - Progressive Web App

6. **Improve Accessibility**
   - Proper ARIA labels
   - Keyboard navigation
   - Screen reader support
   - Focus management

7. **Add Analytics**
   - Track user actions
   - Monitor performance
   - Error tracking
   - Usage metrics

## Learning Path

### Beginner
1. Read through the code comments
2. Understand signal basics
3. Modify existing features
4. Add simple new features

### Intermediate
1. Add new state and computed values
2. Implement new filters
3. Customize the UI
4. Add form fields

### Advanced
1. Refactor into components
2. Add complex features (editing, tags)
3. Optimize performance
4. Migrate to TypeScript/Vite

## Troubleshooting

### Todos Not Persisting

**Problem:** Todos lost on refresh
**Solution:** Check localStorage in DevTools, ensure no errors in console

### Filters Not Working

**Problem:** Filtering doesn't update UI
**Solution:** Check that filteredTodos is accessed in render effect

### Validation Not Showing

**Problem:** Error messages don't appear
**Solution:** Ensure titleTouched is set to true on blur

### Performance Issues

**Problem:** App feels slow with many todos
**Solution:** Implement virtual scrolling or pagination

## Browser Support

Works in all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires support for:
- ES6 modules
- Template literals
- Arrow functions
- Destructuring
- localStorage

## Learn More

- [Flexium Documentation](/docs/API.md)
- [Vite Starter](../vite-starter/) - For production apps
- [Vanilla Starter](../vanilla-starter/) - For simpler examples

## Next Steps

1. Study the code and run the app
2. Modify features and see what breaks
3. Add your own features
4. Migrate to Vite starter for production
5. Build your own app using these patterns

## License

MIT - Use this template freely in your projects!
