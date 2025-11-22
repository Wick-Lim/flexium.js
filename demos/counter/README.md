# Counter Variations Demo

This demo showcases different reactive patterns using Flexium's signal system.

## What's Demonstrated

### 1. Basic Counter
The simplest reactive counter showing:
- Creating a signal with `signal(0)`
- Updating values with `count.value++`
- Auto-tracking with `effect()`
- Visual feedback on updates

```javascript
const count = signal(0);

effect(() => {
  document.getElementById('display').textContent = count.value;
});

// Updates automatically trigger the effect
count.value++;
```

### 2. Computed Values
Demonstrates derived state:
- `computed()` for derived values
- Automatic dependency tracking
- Memoization of computed values
- Multiple computed values from one signal

```javascript
const count = signal(5);
const doubled = computed(() => count.value * 2);  // 10
const squared = computed(() => count.value ** 2); // 25

// Computed values update automatically when count changes
```

### 3. Async Operations
Shows handling async state:
- Loading states
- Async/await with signals
- Disabling UI during operations
- State coordination

```javascript
const count = signal(0);
const loading = signal(false);

async function asyncIncrement() {
  loading.value = true;
  await new Promise(resolve => setTimeout(resolve, 1000));
  count.value++;
  loading.value = false;
}
```

### 4. Animated Counter
Smooth value transitions:
- Interpolating between values
- requestAnimationFrame integration
- Visual feedback
- Natural feeling animations

```javascript
let displayValue = 0;

effect(() => {
  const target = count.value;
  const animate = () => {
    const diff = target - displayValue;
    if (Math.abs(diff) < 0.1) return;
    displayValue += diff * 0.15;
    requestAnimationFrame(animate);
  };
  animate();
});
```

### 5. Batched Updates
Performance optimization:
- `batch()` to group updates
- Prevents cascading effects
- Single effect run for multiple changes
- Performance counter showing optimization

```javascript
const a = signal(0);
const b = signal(0);
const c = signal(0);
const sum = computed(() => a.value + b.value + c.value);

// Without batch: effect runs 3 times
a.value++;
b.value++;
c.value++;

// With batch: effect runs only once!
batch(() => {
  a.value++;
  b.value++;
  c.value++;
});
```

### 6. Multi-Counter
Working with arrays of signals:
- Array of signals
- Computed aggregations
- Dynamic UI updates
- Reactive totals

```javascript
const counters = [signal(0), signal(0), signal(0)];
const total = computed(() =>
  counters.reduce((sum, c) => sum + c.value, 0)
);

// Total updates automatically when any counter changes
counters[0].value++;
```

## Key Concepts

### Signals
Reactive primitive values that notify subscribers on change.

```javascript
const count = signal(0);      // Create
count.value++;                 // Update
const val = count.value;      // Read
```

### Computed
Memoized derived values with automatic dependency tracking.

```javascript
const fullName = computed(() =>
  `${firstName.value} ${lastName.value}`
);
```

### Effects
Side effects that automatically re-run when dependencies change.

```javascript
effect(() => {
  console.log('Count is:', count.value);
  // Automatically re-runs when count changes
});
```

### Batch
Group multiple signal updates to run effects only once.

```javascript
batch(() => {
  signal1.value = newVal1;
  signal2.value = newVal2;
  // Effects run once after batch completes
});
```

## Running the Demo

1. Make sure Flexium is built: `npm run build`
2. Serve the demos directory with an HTTP server:
   ```bash
   cd demos
   python3 -m http.server 8000
   ```
3. Open http://localhost:8000/counter/index.html

## Performance Notes

- Signal updates: < 0.1ms
- Effect execution: Immediate, synchronous
- Batched updates: Single effect run per batch
- No Virtual DOM overhead
- Direct DOM updates only for changed values

## Code Organization

The demo is a single HTML file with inline JavaScript for simplicity:
- Styles: Clean, modern CSS with gradients
- Logic: Pure Flexium signals, no framework overhead
- Structure: Each variation is self-contained
- Comments: Explain key concepts inline

## Learning Path

1. Start with **Basic Counter** - understand signals and effects
2. Move to **Computed Values** - learn derived state
3. Try **Async Operations** - handle async state
4. Explore **Animated Counter** - integrate with requestAnimationFrame
5. Study **Batched Updates** - optimize performance
6. Master **Multi-Counter** - work with collections

## Next Steps

After understanding these patterns, check out:
- **TodoMVC Demo** - Full CRUD application
- **Dashboard Demo** - Real-time data visualization
- **Animations Demo** - Web Animations API integration
