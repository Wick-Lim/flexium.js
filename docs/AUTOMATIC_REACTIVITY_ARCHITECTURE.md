# Automatic Reactivity Architecture

## System Overview

This document explains how automatic reactive bindings work under the hood.

## High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Developer writes code                         │
│                                                                  │
│   const count = signal(0);                                      │
│   h('div', {}, [count])                                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  h() creates VNode                               │
│                                                                  │
│   { type: 'div', props: {}, children: [count] }                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              render() / mountReactive()                          │
│                                                                  │
│   - Detects signal in children array                            │
│   - Calls isSignal(child)                                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│           Signal detected - create reactive binding             │
│                                                                  │
│   1. Create text node: document.createTextNode('')              │
│   2. Create effect:                                             │
│      effect(() => {                                             │
│        textNode.textContent = String(count.value)               │
│      })                                                         │
│   3. Store dispose function for cleanup                         │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DOM is rendered                               │
│                                                                  │
│   <div>0</div>                                                  │
└─────────────────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              Signal value changes                                │
│                                                                  │
│   count.value = 5                                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│            Signal notifies subscribers                           │
│                                                                  │
│   - Effect runs automatically                                   │
│   - textNode.textContent = "5"                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DOM updates                                     │
│                                                                  │
│   <div>5</div>                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Signal System (`src/core/signal.ts`)

```
┌─────────────────────────────────────┐
│         Signal Creation             │
│                                     │
│  signal(value) ──┐                 │
│                   │                 │
│  computed(fn) ────┼────────────────┤
│                   │                 │
│                   ▼                 │
│  Add SIGNAL_MARKER symbol          │
│  (sig as any)[SYMBOL] = true       │
│                   │                 │
│                   ▼                 │
│  Return signal with marker         │
└─────────────────────────────────────┘
```

### 2. Signal Detection (`isSignal()`)

```typescript
function isSignal(value: any): boolean {
  return (
    value !== null &&
    typeof value === 'function' &&
    SIGNAL_MARKER in value
  );
}
```

**Decision Tree:**
```
value
  │
  ├─ null? ────────────────────────> false
  │
  ├─ typeof !== 'function'? ────────> false
  │
  ├─ SIGNAL_MARKER not present? ────> false
  │
  └─ All checks pass ───────────────> true (it's a signal!)
```

### 3. Reactive Mounting (`mountReactive()`)

```
Input: VNode | Signal | string | number
  │
  ├─ Is Signal? ────────────────────────┐
  │                                      │
  ├─ Is string/number? ─────────────────┤
  │                                      │
  └─ Is VNode? ─────────────────────────┤
                                         │
                                         ▼
                              ┌──────────────────────┐
                              │  Handle each type    │
                              └──────────────────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
           ┌─────────────┐      ┌─────────────┐     ┌─────────────┐
           │   Signal    │      │    Text     │     │    VNode    │
           │             │      │             │     │             │
           │ Create      │      │ Create      │     │ Create      │
           │ reactive    │      │ text node   │     │ element     │
           │ text node   │      │             │     │             │
           │             │      │             │     │ Mount       │
           │ Set up      │      │             │     │ children    │
           │ effect      │      │             │     │ recursively │
           └─────────────┘      └─────────────┘     └─────────────┘
```

### 4. Props Reactivity (`setupReactiveProps()`)

```
For each prop in props:
  │
  ├─ Is event handler (starts with 'on')? ──> Skip
  │
  ├─ Is signal (isSignal(value))? ────────┐
  │                                        │
  │                                        ▼
  │                           Create effect for prop
  │                           effect(() => {
  │                             updateNode(node, {
  │                               [key]: signal.value
  │                             })
  │                           })
  │
  ├─ Is function? ─────────────────────────┐
  │                                         │
  │                                         ▼
  │                            Try to execute as getter
  │                            (might be computed)
  │
  └─ Other ────────────────────────────────> Skip
```

## Data Flow

### Example: Counter with Computed Value

```typescript
const count = signal(0);
const doubled = computed(() => count.value * 2);
const element = h('div', {}, ['Count: ', count, ' Doubled: ', doubled]);
```

**Initial Render:**

```
1. h() called
   ├─> Create VNode
   └─> children: ['Count: ', count, ' Doubled: ', doubled]

2. mountReactive(vnode)
   ├─> Create <div> element
   │
   ├─> Process children:
   │   ├─> 'Count: ' ──> createTextNode('Count: ')
   │   │
   │   ├─> count ──┐
   │   │           │
   │   │           ├─> isSignal(count) = true
   │   │           │
   │   │           ├─> Create textNode1
   │   │           │
   │   │           ├─> effect(() => {
   │   │           │     textNode1.textContent = String(count.value)
   │   │           │   })
   │   │           │   Initial value: "0"
   │   │           │
   │   │           └─> Store dispose function
   │   │
   │   ├─> ' Doubled: ' ──> createTextNode(' Doubled: ')
   │   │
   │   └─> doubled ──┐
   │                 │
   │                 ├─> isSignal(doubled) = true
   │                 │
   │                 ├─> Create textNode2
   │                 │
   │                 ├─> effect(() => {
   │                 │     textNode2.textContent = String(doubled.value)
   │                 │   })
   │                 │   Computed evaluates: count.value * 2 = 0
   │                 │   Initial value: "0"
   │                 │
   │                 └─> Store dispose function
   │
   └─> Return <div>

3. Result: <div>Count: 0 Doubled: 0</div>
```

**Signal Update:**

```
count.value = 5

1. Signal notifies subscribers
   │
   ├─> Effect 1 (textNode1) runs
   │   └─> textNode1.textContent = "5"
   │
   └─> Computed (doubled) becomes dirty
       └─> Effect 2 (textNode2) runs
           └─> doubled re-evaluates: 5 * 2 = 10
               └─> textNode2.textContent = "10"

2. Result: <div>Count: 5 Doubled: 10</div>
```

## Cleanup Flow

```
Element removed from DOM
  │
  ▼
cleanupReactive(node) called
  │
  ├─> Get bindings from WeakMap
  │   REACTIVE_BINDINGS.get(node)
  │
  ├─> For each dispose function:
  │   └─> dispose()
  │       ├─> Run effect cleanup
  │       ├─> Unsubscribe from signals
  │       └─> Clear dependencies
  │
  ├─> Delete from WeakMap
  │   REACTIVE_BINDINGS.delete(node)
  │
  └─> Recursively cleanup children
      └─> cleanupReactive(child)
```

## Memory Management

### WeakMap Usage

```
REACTIVE_BINDINGS: WeakMap<Node, Set<() => void>>
                    │      │    │
                    │      │    └─ Dispose functions
                    │      └────── Set of cleanups
                    └──────────── DOM Node (weak key)

Benefits:
✅ Automatic garbage collection
✅ No memory leaks
✅ No manual cleanup needed
✅ Fast lookup
```

### Effect Lifecycle

```
1. Creation
   effect(() => { ... }) ──> Creates EffectNode
                             └─> Stores in dependencies

2. Execution
   EffectNode.execute()
   ├─> Clear old dependencies
   ├─> Set as activeEffect
   ├─> Run function
   │   └─> Signals accessed add this effect as subscriber
   └─> Restore previous activeEffect

3. Update
   Signal changes ──> notify() ──> Execute all subscribers
                                   └─> This effect runs again

4. Disposal
   dispose() called
   ├─> Run cleanup function (if any)
   ├─> Unsubscribe from all signals
   └─> Clear dependencies
```

## Performance Characteristics

### Signal Detection

```
isSignal(value)
  │
  ├─ null check ─────────────── O(1)
  ├─ typeof check ───────────── O(1)
  └─ Symbol check ───────────── O(1)

Total: O(1) - constant time
```

### Reactive Mounting

```
mountReactive(vnode)
  │
  ├─ For each child:
  │   ├─ isSignal() ─────────── O(1)
  │   └─ If signal:
  │       ├─ Create text node ── O(1)
  │       └─ Create effect ───── O(1)
  │
  └─ For each prop:
      ├─ isSignal() ─────────── O(1)
      └─ If signal:
          └─ Create effect ───── O(1)

Total: O(n + m) where n = children, m = props
```

### Signal Update

```
count.value = newValue
  │
  ├─ Value comparison ────────── O(1)
  │
  ├─ notify() ───────────────────┐
  │                               │
  │  For each subscriber:         │
  │    └─ execute() ───────────── O(1) per subscriber
  │                               │
  └───────────────────────────────┘

Total: O(s) where s = number of subscribers

Usually s is small (1-3 per signal)
```

## Comparison with Other Approaches

### Virtual DOM (React)

```
React:
  Signal changes
    └─> setState()
        └─> Schedule re-render
            └─> Render entire component
                └─> Diff virtual trees
                    └─> Patch minimal DOM changes

Flexium:
  Signal changes
    └─> Notify subscribers
        └─> Update specific text nodes
            (no diffing, no re-render)
```

### Template Compilation (Svelte)

```
Svelte:
  Compile time:
    └─> Analyze template
        └─> Generate update code
            └─> Build at compile time

Flexium:
  Runtime:
    └─> Detect signals
        └─> Create effects
            └─> Update automatically
```

### Fine-Grained Reactivity (Solid.js)

```
Solid.js:
  Uses similar approach!
  - Signals with subscribers
  - Fine-grained updates
  - No VDOM

Flexium:
  Same concept, different API
  - Built-in to core
  - Automatic detection
  - No explicit cleanup
```

## Edge Cases Handled

### 1. Null/Undefined Signals

```typescript
const value = signal(null);
h('div', {}, [value])
// Result: <div>null</div>
```

### 2. Object Signals

```typescript
const obj = signal({ name: 'John' });
h('div', {}, [obj])
// Result: <div>[object Object]</div>
// (toString() called automatically)
```

### 3. Nested Signals

```typescript
const a = signal(5);
const b = computed(() => a.value * 2);
const c = computed(() => b.value + 1);
h('div', {}, [c])
// Chain updates automatically: a -> b -> c -> DOM
```

### 4. Conditional Signals

```typescript
const flag = signal(true);
const value = computed(() => flag.value ? signal1.value : signal2.value);
h('div', {}, [value])
// Tracks only the active signal
```

### 5. Rapid Updates

```typescript
const count = signal(0);
h('div', {}, [count]);

// Rapid updates
count.value = 1;
count.value = 2;
count.value = 3;
// Effects are batched automatically in event loop
// DOM updates once with final value
```

## Debug Information

### Finding Reactive Bindings

```javascript
// In browser console:
const element = document.querySelector('#my-element');

// Check if element has reactive bindings
// (Would need dev tools integration)
```

### Tracking Signal Dependencies

```javascript
// Future: Dev tools could show
effect(() => {
  console.log('Dependencies:', activeEffect.dependencies);
  // Shows which signals this effect depends on
});
```

## Future Optimizations

### 1. Batch DOM Updates

```
Multiple signal changes:
  count.value = 5
  name.value = "John"
  age.value = 30

Current: 3 separate DOM updates

Future: Batch into single update
  ├─> Queue updates
  ├─> Wait for microtask
  └─> Apply all at once
```

### 2. Virtual Scrolling

```
Large lists with signals:
  items = signal([1000 items])

Future: Only render visible items
  └─> Intersec

tion observer
      └─> Lazy render
```

### 3. Memoization

```
Expensive computed values:
  const result = computed(() => heavyCalculation())

Future: Add caching strategy
  └─> Cache based on inputs
      └─> Skip recalculation
```

## Conclusion

The automatic reactivity system achieves:

- ✅ **Simplicity**: Just pass signals, it works
- ✅ **Performance**: O(1) detection, O(s) updates
- ✅ **Memory**: Automatic cleanup via WeakMap
- ✅ **Flexibility**: Works with any component structure
- ✅ **Reliability**: Tested and proven patterns

All while maintaining the core principle: **make the easy things easy, and the hard things possible**.
