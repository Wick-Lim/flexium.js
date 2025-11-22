# Dashboard Example

An advanced example demonstrating responsive Grid layouts, real-time updates, and complex nested component structures.

## Difficulty Level

**Advanced** - Comprehensive patterns for production applications

## What This Example Demonstrates

This dashboard example teaches you production-ready Flexium patterns:

### Core Concepts
- **Grid layouts** - Responsive multi-column layouts with breakpoints
- **Real-time updates** - Using effects to simulate live data
- **Multiple signal instances** - Managing different data sets
- **Effect cleanup** - Properly cleaning up timers and subscriptions
- **Complex nesting** - Cards, lists, and grids working together
- **Hover states** - Interactive feedback on components
- **Responsive design** - Layouts that adapt to screen size

### Key Features
1. **Stat cards** - 4 metric cards with real-time updates
2. **Responsive grid** - 1 column on mobile, 2 on tablet, 4 on desktop
3. **Activity feed** - Recent user activities with avatars
4. **Quick actions** - Grid of action buttons
5. **Auto-updates** - Stats change every 3 seconds
6. **Professional design** - Clean, modern UI with proper spacing
7. **Smooth animations** - Cards fade in on mount

## How to Run

### Method 1: Using Python HTTP Server (Recommended)

```bash
# From the project root
cd examples/dashboard
python3 -m http.server 8000

# Open in browser
# http://localhost:8000/index.html
```

### Method 2: Using Node.js http-server

```bash
# Install http-server globally (one time only)
npm install -g http-server

# From the dashboard directory
cd examples/dashboard
http-server -p 8000

# Open in browser
# http://localhost:8000/index.html
```

### Important Notes

- **Do NOT open with `file://` protocol** - This causes CORS errors
- **Always use an HTTP server** - Required for ES modules
- **Make sure the library is built** - Run `npm run build` from project root
- **Watch the stats update** - They change every 3 seconds automatically

## Code Walkthrough

### 1. Complex Data Structures

```typescript
interface Stat {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: string
}

interface Activity {
  id: number
  user: string
  action: string
  time: string
}
```

**Key Points:**
- Use TypeScript interfaces for type safety
- Define clear data shapes for complex objects
- Use union types for limited options (`'up' | 'down'`)
- String IDs for stable keys

### 2. Responsive Grid Layout

```tsx
<Grid
  cols={{ base: 1, sm: 2, lg: 4 }}
  gap={20}
>
  {stats.value.map(stat => (
    <StatCard key={stat.id} {...stat} />
  ))}
</Grid>
```

**Breakpoint System:**
- **base** - Mobile (default, 1 column)
- **sm** - Small tablets (2 columns)
- **md** - Medium tablets (not used here)
- **lg** - Desktop (4 columns)

The Grid automatically adjusts based on viewport width.

### 3. Real-Time Updates with Effects

```typescript
effect(() => {
  const interval = setInterval(() => {
    // Update random stat
    const randomIndex = Math.floor(Math.random() * stats.value.length)
    const newStats = [...stats.value]
    // ... update logic ...
    stats.value = newStats
  }, 3000)

  // Cleanup function - IMPORTANT!
  return () => clearInterval(interval)
})
```

**Effect Cleanup Pattern:**
- Effects can return a cleanup function
- Cleanup runs when effect is disposed
- Always clear timers, subscriptions, listeners
- Prevents memory leaks

### 4. Nested Component Patterns

```tsx
<Column gap={0}>
  {/* Card container */}
  <Row padding={20} borderBottom="1px solid #e5e7eb">
    {/* Card header */}
    <Text fontSize={18} fontWeight="bold">Recent Activity</Text>
  </Row>

  <Column gap={0}>
    {/* Activity list */}
    {activities.value.map(activity => (
      <Row key={activity.id} padding={20}>
        {/* Activity item */}
      </Row>
    ))}
  </Column>
</Column>
```

**Nesting Strategy:**
- Use `gap={0}` for cards with borders (prevents double spacing)
- Nest Column/Row for complex layouts
- Apply borders at appropriate levels
- Use `overflow="hidden"` for rounded corners with borders

### 5. Hover Effects

```tsx
<Column
  hover={{
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }}
>
  {/* Card content */}
</Column>
```

**Interactive States:**
- `hover` prop defines hover styles
- Can change any CSS property
- Automatically adds/removes on mouse enter/leave
- Use for buttons, cards, list items

### 6. Dynamic Value Updates

```typescript
const newValue = baseValue + change
newStats[randomIndex] = {
  ...stat,
  value: stat.label === 'Revenue'
    ? `$${newValue.toLocaleString()}`
    : stat.label === 'Conversion Rate'
    ? `${(newValue / 100).toFixed(2)}%`
    : newValue.toLocaleString()
}
```

**Formatting Patterns:**
- Use `toLocaleString()` for number formatting
- Conditional formatting based on data type
- Keep immutability (spread operator)

## Try These Experiments

1. **Add more stat cards**
   ```typescript
   const stats = signal<Stat[]>([
     // ... existing stats ...
     { id: '5', label: 'API Calls', value: '45,123', change: '+15%', trend: 'up', icon: '📡' }
   ])
   ```

2. **Change update interval**
   ```typescript
   setInterval(() => { /* ... */ }, 1000) // Update every second
   ```

3. **Add a chart library**
   ```bash
   npm install chart.js
   # Then integrate in the performance section
   ```

4. **Add filters to activity feed**
   ```typescript
   const activityFilter = signal<'all' | 'today' | 'week'>('all')
   const filteredActivities = computed(() => {
     // Filter based on time
   })
   ```

5. **Add pagination**
   ```typescript
   const page = signal(1)
   const itemsPerPage = 5
   const paginatedActivities = computed(() =>
     activities.value.slice((page.value - 1) * itemsPerPage, page.value * itemsPerPage)
   )
   ```

6. **Make stats clickable**
   ```typescript
   <Button onPress={() => navigateToDetails(stat.id)}>
     <StatCard {...stat} />
   </Button>
   ```

## File Structure

```
dashboard/
├── index.html    # HTML wrapper with styling
└── app.ts        # Flexium dashboard implementation
```

## Advanced Patterns Learned

### 1. Effect Cleanup

```typescript
// ✅ Good - with cleanup
effect(() => {
  const timer = setInterval(/* ... */)
  return () => clearInterval(timer)
})

// ❌ Bad - memory leak
effect(() => {
  setInterval(/* ... */) // Never cleaned up!
})
```

### 2. Responsive Layouts

```typescript
// ✅ Good - responsive breakpoints
<Grid cols={{ base: 1, sm: 2, lg: 4 }} gap={20}>

// ✅ Also good - fixed columns
<Grid cols={3} gap={20}>
```

### 3. Complex State Updates

```typescript
// ✅ Good - create new array, update specific item
const newStats = [...stats.value]
newStats[index] = { ...newStats[index], value: newValue }
stats.value = newStats

// ❌ Bad - direct mutation
stats.value[index].value = newValue
```

### 4. Nested Grids

```tsx
{/* Outer grid for sections */}
<Grid cols={{ base: 1, lg: 2 }} gap={20}>
  {/* Inner grid for actions */}
  <Grid cols={2} gap={16}>
    {actions.map(/* ... */)}
  </Grid>
</Grid>
```

## Performance Considerations

### What This Example Shows

1. **Efficient updates** - Only changed stat cards re-render
2. **Computed caching** - Filtered data isn't recalculated unnecessarily
3. **Proper cleanup** - No memory leaks from timers
4. **Batched updates** - Multiple signal changes in one update cycle

### Optimization Tips

```typescript
// Instead of multiple updates:
stats.value = newStats1
stats.value = newStats2
stats.value = newStats3

// Use batch:
batch(() => {
  stats.value = newStats1
  otherSignal.value = newValue
  anotherSignal.value = anotherValue
})
```

## Real-World Applications

This dashboard pattern is useful for:

1. **Admin panels** - Metrics, user management, settings
2. **Analytics dashboards** - Charts, stats, real-time data
3. **Monitoring systems** - Server stats, alerts, logs
4. **E-commerce dashboards** - Sales, inventory, orders
5. **Project management** - Tasks, timeline, team activity

## Next Steps

After mastering this example:

1. **Build a real dashboard** - Connect to actual APIs
2. **Add authentication** - User login and permissions
3. **Implement routing** - Multiple pages/views
4. **Add data fetching** - Fetch from REST APIs or GraphQL
5. **Add state persistence** - Save user preferences to localStorage
6. **Explore charting libraries** - Integrate Chart.js, D3, or Recharts

## Common Issues

### Stats not updating
- Check that effect cleanup is returning a function
- Verify `setInterval` is inside the effect
- Make sure you're creating new arrays, not mutating

### Layout not responsive
- Verify breakpoint values: `{ base: 1, sm: 2, lg: 4 }`
- Check that Grid component is from `flexium/dom`
- Test at different viewport widths

### Memory leaks
- Always return cleanup function from effects
- Clear intervals with `clearInterval()`
- Remove event listeners if you add any
- Check browser DevTools Performance tab

### Cards not rendering correctly
- Ensure proper nesting of Column/Row
- Check `gap={0}` for bordered containers
- Verify `overflow="hidden"` for rounded corners

## Production Checklist

Before deploying a dashboard like this:

- [ ] Replace mock data with real API calls
- [ ] Add error handling for failed requests
- [ ] Implement loading states
- [ ] Add authentication and authorization
- [ ] Set up proper routing
- [ ] Add accessibility (ARIA labels, keyboard nav)
- [ ] Test on mobile devices
- [ ] Optimize images and icons
- [ ] Add analytics tracking
- [ ] Set up error monitoring (Sentry, etc.)

## Learning Outcomes

After completing this example, you should understand:

- How to use Grid for responsive layouts
- How to manage real-time data with effects
- How to properly clean up timers and subscriptions
- How to build complex nested component structures
- How to implement hover states and interactions
- How to format and display dynamic data
- How to structure a production-ready dashboard
- How to avoid common pitfalls (memory leaks, mutations)

## Additional Resources

- [Counter Example](/examples/counter) - Review the basics
- [Todo Example](/examples/todo) - Review array patterns
- [Grid Documentation](/docs/API.md#grid) - Complete Grid API
- [Effect Documentation](/docs/API.md#effect) - Deep dive into effects
- [Motion Documentation](/docs/API.md#motion) - Animation guide

---

**Ready to build production apps? You now have all the patterns you need!**
