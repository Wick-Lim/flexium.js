# Automatic Reactivity Quick Reference

## At a Glance

| Feature | Old Way (Manual) | New Way (Automatic) |
|---------|------------------|---------------------|
| Text content | `effect(() => el.textContent = count.value)` | `h('div', {}, [count])` |
| Props | `effect(() => el.disabled = flag.value)` | `h('button', { disabled: flag })` |
| Computed | Multiple effects | Just pass the computed |
| Cleanup | Manual dispose | Automatic |
| LOC | 15+ lines | 3-5 lines |

## Basic Usage

### Signals as Children

```typescript
const count = signal(5);
h('div', {}, [count])
```

### Computed Values

```typescript
const count = signal(5);
const doubled = computed(() => count.value * 2);
h('div', {}, [doubled])
```

### Mixed Content

```typescript
const name = signal('John');
h('div', {}, ['Hello, ', name, '!'])
```

### Signals in Props

```typescript
const disabled = signal(true);
h('button', { disabled }, ['Click'])
```

## Common Patterns

### Counter
```typescript
const count = signal(0);
h('div', {}, [
  h('p', {}, ['Count: ', count]),
  h('button', { onClick: () => count.value++ }, ['+'])
])
```

### Form Input
```typescript
const text = signal('');
h('input', {
  value: text.peek(),
  onInput: (e) => text.value = e.target.value
})
```

### Conditional Styling
```typescript
const isActive = signal(false);
const color = computed(() => isActive.value ? 'green' : 'red');
h('div', { style: { color } }, ['Status'])
```

### List Stats
```typescript
const items = signal([1, 2, 3]);
const count = computed(() => items.value.length);
h('p', {}, ['Total: ', count])
```

## Do's and Don'ts

### ✅ Do

```typescript
// Pass signals directly
h('div', {}, [count])

// Use computed for derived values
const doubled = computed(() => count.value * 2);

// Combine static and reactive
h('div', {}, ['Score: ', score, '/100'])

// Use in props
h('button', { disabled: isLoading }, ['Submit'])
```

### ❌ Don't

```typescript
// Don't access .value in render
h('div', {}, [count.value]) // Won't update!

// Don't convert to string
h('div', {}, [String(count.value)]) // Won't update!

// Don't use manual effects
effect(() => {
  el.textContent = count.value; // Not needed!
})
```

## API Reference

### Detection

```typescript
import { isSignal } from 'flexium/core';

isSignal(count)     // true
isSignal(5)         // false
```

### Components

```typescript
import { ReactiveText } from 'flexium/dom';

h(ReactiveText, { fontSize: 24 }, [count])
```

### Advanced Binding

```typescript
import { bind } from 'flexium/dom';

h('div', {
  ...bind(state, (val) => ({
    style: { transform: `translateX(${val.x}px)` }
  }))
})
```

## Examples

- `/examples/auto-reactive-demo.ts` - Full demo
- `/examples/before-after-comparison.ts` - Migration guide
- `/docs/AUTOMATIC_REACTIVITY.md` - Complete docs

## Troubleshooting

**Signal not updating?**
- Make sure you pass the signal, not `signal.value`
- Use `render()` or `createReactiveRoot()`, not plain DOM

**Memory leak?**
- Effects are auto-cleaned when elements unmount
- Use `root.unmount()` to manually cleanup

**Performance issue?**
- Use `computed()` for expensive calculations
- Batch multiple signal updates

## Learn More

📚 Full documentation: `/docs/AUTOMATIC_REACTIVITY.md`
🔬 Test suite: `/src/renderers/dom/__tests__/auto-reactivity.test.ts`
💡 Examples: `/examples/auto-reactive-demo.ts`
