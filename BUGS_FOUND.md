# Bugs Found During Testing

## Critical Bugs (Block Basic Usage)

### 1. DOMRenderer doesn't apply className prop
**File**: `/Users/wick/Documents/workspaces/flexium.js/src/renderers/dom/renderer.ts`

**Problem**: When creating a node with className, it's not applied to the element.

```javascript
// Current behavior:
const node = renderer.createNode('div', { className: 'test-class' });
console.log(node.className); // "" (empty)

// Expected behavior:
console.log(node.className); // "test-class"
```

**Impact**: Cannot style elements with classes

**Test**: `test/dom.test.mjs` - "DOMRenderer creates element with className"

---

### 2. DOMRenderer doesn't apply style prop
**File**: `/Users/wick/Documents/workspaces/flexium.js/src/renderers/dom/renderer.ts`

**Problem**: When creating a node with inline styles, they're not applied.

```javascript
// Current behavior:
const node = renderer.createNode('div', { style: { color: 'red' } });
console.log(node.style.color); // "" (empty)

// Expected behavior:
console.log(node.style.color); // "red"
```

**Impact**: Cannot use inline styles

**Test**: `test/dom.test.mjs` - "DOMRenderer creates element with style"

---

### 3. Flexbox props not converted to CSS
**File**: `/Users/wick/Documents/workspaces/flexium.js/src/renderers/dom/renderer.ts`

**Problem**: Flexbox layout props (flexDirection, justifyContent, etc.) are not converted to CSS.

```javascript
// Current behavior:
const node = renderer.createNode('div', {
  flexDirection: 'row',
  justifyContent: 'center'
});
console.log(node.style.display); // "" (should be "flex")
console.log(node.style.flexDirection); // "" (should be "row")

// Expected behavior:
// Should automatically set display: flex
// Should convert camelCase props to CSS
```

**Impact**: Core flexbox-first layout system doesn't work

**Affected props**:
- flexDirection
- justifyContent
- alignItems
- gap
- flex
- flexWrap

**Test**: `test/dom.test.mjs` - "render() converts flexbox props to CSS"

---

## High Priority Bugs

### 4. updateNode() doesn't apply prop changes
**File**: `/Users/wick/Documents/workspaces/flexium.js/src/renderers/dom/renderer.ts`

**Problem**: When updating node props, changes aren't applied.

```javascript
const node = renderer.createNode('div', { className: 'old' });
renderer.updateNode(node, { className: 'old' }, { className: 'new' });
console.log(node.className); // "" (should be "new")
```

**Impact**: Dynamic prop updates don't work (breaks reactivity)

**Test**: `test/dom.test.mjs` - "DOMRenderer updates node props"

---

### 5. Reactive children don't auto-update
**File**: `/Users/wick/Documents/workspaces/flexium.js/src/renderers/dom/reactive.ts`

**Problem**: When using computed/signal as children, they don't trigger automatic DOM updates.

```javascript
const count = signal(0);
const Counter = () => h('div', null, computed(() => `Count: ${count.value}`));

// Current: Needs manual re-render
count.value = 5; // DOM doesn't update

// Expected: Should auto-update DOM
count.value = 5; // DOM should show "Count: 5"
```

**Impact**: Core reactive rendering doesn't work as expected

**Test**: `test/integration.test.mjs` - "reactive text content updates"

---

## Medium Priority Bugs

### 6. root() function doesn't track/dispose effects
**File**: `/Users/wick/Documents/workspaces/flexium.js/src/core/signal.ts` (line 368)

**Problem**: The root() function creates a dispose callback but doesn't actually track effects created within its scope.

```javascript
const cleanup = root((dispose) => {
  effect(() => { /* ... */ });
  return dispose;
});

// Current behavior:
cleanup(); // Doesn't dispose the effect

// Expected behavior:
cleanup(); // Should dispose all effects created in root scope
```

**Current implementation**:
```typescript
export function root<T>(fn: (dispose: () => void) => T): T {
  const effects: (() => void)[] = [];
  const dispose = () => {
    for (const effect of effects) {
      effect();
    }
    effects.length = 0;
  };

  return fn(dispose); // Never populates effects array!
}
```

**Impact**: Component cleanup/disposal doesn't work properly. Can lead to memory leaks.

**Test**: `test/signal.test.mjs` - "root creates disposable scope"

---

### 7. Specific padding/margin props overridden by general props
**File**: `/Users/wick/Documents/workspaces/flexium.js/src/renderers/dom/renderer.ts`

**Problem**: When both general and specific props are provided, order matters incorrectly.

```javascript
// Current behavior:
const node = h('div', { padding: 20, paddingLeft: 10 });
// Results in: padding: 20px (paddingLeft is overridden)

// Expected behavior:
// padding: 20px for top/right/bottom
// paddingLeft: 10px (specific prop should override general)
```

**Impact**: Can't set general padding/margin with specific overrides

**Test**: `test/dom.test.mjs` - "render() handles padding props"

---

### 8. mountReactive doesn't append to container
**File**: `/Users/wick/Documents/workspaces/flexium.js/src/renderers/dom/reactive.ts`

**Problem**: mountReactive creates nodes but doesn't append them to the provided parent.

```javascript
const container = document.createElement('div');
const vnode = h('div', null, 'Hello');
mountReactive(vnode, container);

console.log(container.children.length); // 0 (should be 1)
```

**Impact**: mountReactive API doesn't work as expected

**Test**: `test/integration.test.mjs` - "mountReactive creates reactive node"

---

## Low Priority Bugs

### 9. Fragment type inconsistency
**File**: `/Users/wick/Documents/workspaces/flexium.js/src/renderers/dom/jsx.ts`

**Problem**: Fragment type is returned as string 'fragment' instead of Fragment function.

```javascript
const frag = Fragment({ children: ['a', 'b'] });
console.log(frag.type); // 'fragment' (expected: Fragment function)
```

**Impact**: Minor - Fragment functionality may still work, but type checking fails

**Test**: `test/dom.test.mjs` - "Fragment returns children without wrapper"

---

## Bug Fix Priority

### Must Fix (Before Any Release)
1. Flexbox props conversion (Critical feature)
2. className/style application (Basic styling)
3. Reactive children updates (Core reactivity)

### Should Fix (Before Alpha)
4. updateNode() implementation (Dynamic updates)
5. Padding/margin precedence (Layout control)

### Nice to Fix (Before Beta)
6. root() effect tracking (Cleanup/lifecycle)
7. mountReactive append (API consistency)
8. Fragment type (Type safety)

---

## Testing Commands

```bash
# Run all tests to verify fixes
npm test

# Run specific test suites
npm run test:signal
npm run test:dom
npm run test:integration
```

---

## Notes

- Signal system is solid (92% pass rate)
- DOM renderer needs the most work (72% pass rate)
- Integration tests show signal+DOM integration works when renderer is fixed
- Most bugs are in the renderer layer, not the reactivity layer
