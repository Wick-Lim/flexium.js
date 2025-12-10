---
title: Best Practices
---

# Best Practices

Learn guides and patterns for effectively using Flexium.

## Guides

### [State Organization](/docs/guide/best-practices/state-organization)

Learn when to use local vs global state, how to name state keys, and how to manage hierarchical state.

**Key Topics:**
- Local vs Global State selection criteria
- State key naming conventions
- Hierarchical state management
- State cleanup patterns

---

### [Performance Optimization](/docs/guide/best-practices/performance)

Learn how to optimize the performance of Flexium apps.

**Key Topics:**
- Sync updates (`sync()`)
- Computed optimization
- List rendering optimization
- Global State cleanup
- Effect optimization

---

### [Common Patterns](/docs/guide/best-practices/patterns)

Learn practical patterns commonly used in real applications.

**Key Topics:**
- Form handling patterns
- Data fetching patterns
- State machine patterns
- Debouncing/Throttling
- Local storage synchronization

---

### [Anti-patterns](/docs/guide/best-practices/anti-patterns)

Learn common mistakes and anti-patterns to avoid.

**Key Topics:**
- Direct Proxy comparison
- Unnecessary Global State
- Effect infinite loops
- Missing cleanup functions
- Performance issues

---

## Quick Reference

### State Management

```tsx
// Local state
const [count, setCount] = state(0)

// Global state
const [user] = state(null, { key: 'auth:user' })

// Computed state
const [doubled] = state(() => count * 2)

// Async state
const [data, refetch, status] = state(async () => {
  return fetch('/api/data').then(r => r.json())
})
```

### Sync Updates

```tsx
import { sync } from 'flexium/core'

sync(() => {
  setA(1)
  setB(2)
  setC(3)
})  // Single re-render
```

### List Optimization

```tsx
import { for as For } from 'flexium/core'

<For each={items}>
  {(item) => <Item data={item} />}
</For>
```

---

## Next Steps

- [Migration from React](/docs/guide/migration/from-react) - Migrate React apps to Flexium
- [FAQ](/docs/guide/faq) - Frequently asked questions
- [API Documentation](/docs/) - Complete API reference