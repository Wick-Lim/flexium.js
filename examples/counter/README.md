# Counter Example

A simple, beginner-friendly example demonstrating Flexium's core reactivity features.

## Difficulty Level

**Beginner** - Perfect for your first Flexium project

## What This Example Demonstrates

This counter example teaches you the fundamentals of Flexium:

### Core Concepts
- **Signals** - Creating reactive state with `signal()`
- **Fine-grained reactivity** - Only the changed values update, not the entire component
- **Event handling** - Responding to user interactions
- **Layout primitives** - Using `Column` and `Row` for flex-based layouts
- **UI components** - Using `Button` and `Text` components with style props

### Key Features
1. **Reactive state** - The count updates automatically when the signal changes
2. **Three actions** - Increment, decrement, and reset buttons
3. **Visual feedback** - Hover effects on buttons
4. **Clean layout** - Centered design with proper spacing

## How to Run

### Method 1: Using Python HTTP Server (Recommended)

```bash
# From the project root
cd examples/counter
python3 -m http.server 8000

# Open in browser
# http://localhost:8000/index.html
```

### Method 2: Using Node.js http-server

```bash
# Install http-server globally (one time only)
npm install -g http-server

# From the counter directory
cd examples/counter
http-server -p 8000

# Open in browser
# http://localhost:8000/index.html
```

### Method 3: Using Vite Dev Server

```bash
# From the project root (if you have Vite installed)
npm run dev:web

# Navigate to the counter example in the UI
```

### Important Notes

- **Do NOT open with `file://` protocol** - This causes CORS errors with ES modules
- **Always use an HTTP server** - Even for simple examples
- **Make sure the library is built** - Run `npm run build` from the project root if needed

## Code Walkthrough

### 1. Creating Reactive State

```typescript
const count = signal(0)
```

The `signal()` function creates a reactive primitive. Any component that reads `count.value` will automatically update when it changes.

### 2. Event Handlers

```typescript
const increment = () => count.value++
const decrement = () => count.value--
const reset = () => count.value = 0
```

Event handlers are just regular functions. When they modify `count.value`, Flexium automatically updates only the parts of the UI that depend on it.

### 3. Layout with Column and Row

```tsx
<Column gap={24} padding={48} align="center">
  {/* Header */}
  <Text fontSize={32} fontWeight="bold">Flexium Counter</Text>

  {/* Counter Display */}
  <Text fontSize={64}>{count.value}</Text>

  {/* Buttons in a Row */}
  <Row gap={12}>
    <Button onPress={decrement}>- Decrement</Button>
    <Button onPress={reset}>Reset</Button>
    <Button onPress={increment}>+ Increment</Button>
  </Row>
</Column>
```

- **Column** - Stacks children vertically with flexbox
- **Row** - Arranges children horizontally
- **gap** - Spacing between children (in pixels)
- **padding** - Internal spacing
- **align** - Align items (`"center"`, `"flex-start"`, `"flex-end"`)

### 4. Styled Components

```tsx
<Button
  onPress={increment}
  backgroundColor="#10b981"
  color="white"
  padding="12px 24px"
  borderRadius={8}
  hover={{ backgroundColor: '#059669' }}
>
  + Increment
</Button>
```

Flexium components accept style props directly. The `hover` prop defines styles to apply on hover.

## What Makes This Special?

### No Virtual DOM
When you click a button, Flexium doesn't re-render the entire component. It only updates the specific `<Text>` element showing the count. This is **fine-grained reactivity**.

### No Re-renders
In React, the entire component function would run again. In Flexium, the function runs once to create the UI, then only the reactive values update.

### Direct Mutations
```typescript
// Flexium - simple and direct
count.value++

// React - verbose setState
setCount(count + 1)
```

## Try These Experiments

1. **Add a double button**
   ```typescript
   const double = () => count.value *= 2
   ```

2. **Add a computed value**
   ```typescript
   const doubled = computed(() => count.value * 2)
   // Then display it: <Text>{doubled.value}</Text>
   ```

3. **Add an effect to log changes**
   ```typescript
   effect(() => {
     console.log('Count changed to:', count.value)
   })
   ```

4. **Change the colors**
   - Try different `backgroundColor` values
   - Experiment with `hover` effects
   - Add `active` states

5. **Add validation**
   ```typescript
   const increment = () => {
     if (count.value < 100) count.value++
   }
   ```

## File Structure

```
counter/
├── index.html    # HTML wrapper with basic styling
└── app.ts        # Flexium counter implementation
```

## Next Steps

After mastering this example:

1. **Todo App** (`/examples/todo`) - Learn array manipulation and computed values
2. **Dashboard** (`/examples/dashboard`) - Explore Grid layouts and real-time updates
3. **Read the docs** - Check out `/docs/API.md` for complete API reference

## Common Issues

### Counter not updating
- Make sure you're using `.value` to access/update the signal
- Check browser console for errors
- Verify the library was built (`npm run build`)

### CORS errors
- Don't open `index.html` directly with `file://`
- Use an HTTP server (see "How to Run" above)

### Import errors
- Make sure you ran `npm run build` from project root
- Check that `dist/` folder exists with `.mjs` files

## Learning Outcomes

After completing this example, you should understand:

- How to create reactive state with `signal()`
- How signals automatically trigger UI updates
- How to use layout primitives (`Row`, `Column`)
- How to handle events in Flexium
- How to style components with inline props
- The difference between Flexium's fine-grained reactivity and React's Virtual DOM

## Questions?

- Check the [main examples README](/examples/README.md)
- Read the [API documentation](/docs/API.md)
- Look at the [JSX Guide](/docs/JSX_GUIDE.md)
- Open an issue on GitHub

---

**Happy coding with Flexium!**
