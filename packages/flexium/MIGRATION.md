# Migration Guide

## v1.0 Breaking Changes (Deprecated API Removal)

### Overview
Flexium v1.0 removes deprecated APIs that were marked for removal. These were legacy names from earlier versions that have been replaced with clearer, more descriptive alternatives.

### Breaking Changes

#### 1. Type Aliases Removed

**VNode → FNode**
```typescript
// ❌ Before (no longer works)
import type { VNode } from 'flexium'
const node: VNode = { ... }

// ✅ After
import type { FNode } from 'flexium'
const node: FNode = { ... }
```

**VNodeChild → FNodeChild**
```typescript
// ❌ Before (no longer works)
import type { VNodeChild } from 'flexium'
const child: VNodeChild = ...

// ✅ After
import type { FNodeChild } from 'flexium'
const child: FNodeChild = ...
```

#### 2. Function Exports Removed

**h() → f()**
```typescript
// ❌ Before (no longer works)
import { h } from 'flexium/dom'
const element = h('div', { class: 'container' }, 'Hello')

// ✅ After
import { f } from 'flexium/dom'
const element = f('div', { class: 'container' }, 'Hello')
```

**isVNode() → isFNode()**
```typescript
// ❌ Before (no longer works)
import { isVNode } from 'flexium/dom'
if (isVNode(value)) { ... }

// ✅ After
import { isFNode } from 'flexium/dom'
if (isFNode(value)) { ... }
```

**createVNode() → createFNode()**
```typescript
// ❌ Before (no longer works)
import { createVNode } from 'flexium'
const node = createVNode('div', {}, [])

// ✅ After
import { createFNode } from 'flexium'
const node = createFNode('div', {}, [])
```

### Migration Steps

#### Automated Migration with Find & Replace

1. **Update Type Imports**:
   - Find: `VNode`
   - Replace with: `FNode`
   - Find: `VNodeChild`
   - Replace with: `FNodeChild`

2. **Update Function Calls**:
   - Find: `\bh\(`
   - Replace with: `f(`
   - Find: `isVNode(`
   - Replace with: `isFNode(`
   - Find: `createVNode(`
   - Replace with: `createFNode(`

3. **Update Imports**:
```typescript
// Before
import { h, isVNode } from 'flexium/dom'
import type { VNode, VNodeChild } from 'flexium'

// After
import { f, isFNode } from 'flexium/dom'
import type { FNode, FNodeChild } from 'flexium'
```

### Why These Changes?

The old "VNode" (Virtual Node) naming was misleading because Flexium doesn't use a traditional Virtual DOM. Instead, Flexium uses a lightweight element descriptor system called "FNode" (Flexium Node) that's immediately converted to real DOM, making it more accurate and less confusing for developers familiar with other frameworks.

### Need Help?

If you encounter issues during migration:
- File an issue: https://github.com/Wick-Lim/flexium.js/issues
- Check the examples in the repository for updated patterns

---

## v0.4.7+ Optimized Primitives Imports

### Overview
Flexium v0.4.7+ introduces split entry points for primitives, reducing the core bundle from ~71KB to ~1.7KB.

## Quick Migration

### Option 1: Keep Current Behavior (No Changes Needed)
Your existing code will continue to work:
```typescript
import { Row, Column, Text } from 'flexium/primitives'
```

However, if you were importing Motion/Form/UI components, you should migrate to the new imports for better tree-shaking.

### Option 2: Optimize Your Bundle (Recommended)

#### Before (Heavy Bundle)
```typescript
import {
  Row,
  Column,
  createMotion,
  useMotion,
  createForm,
  createInput,
  createButton,
  createText
} from 'flexium/primitives'
```

#### After (Optimized Bundle)
```typescript
// Core primitives (~1.7KB)
import { Row, Column } from 'flexium/primitives'

// Only import what you need:
import { createMotion, useMotion } from 'flexium/primitives/motion'  // +5.8KB
import { createForm, createInput } from 'flexium/primitives/form'    // +6.5KB
import { createButton, createText } from 'flexium/primitives/ui'     // +7.2KB
```

## Breaking Changes

### Core Primitives Bundle Changed
The main `flexium/primitives` export **NO LONGER** includes:
- Motion components (`createMotion`, `useMotion`, `MotionController`, `Transition`, etc.)
- Form components (`createForm`, `createInput`, `createInputField`, `validators`)
- UI components (`createButton`, `createText`, `createHeading`, etc.)

### What's Still Included
The core `flexium/primitives` bundle includes:
- Layout: `Row`, `Column`, `Stack`, `Grid`, `Spacer`
- Basic primitives: `Text`, `Image`, `Pressable`, `ScrollView`
- Canvas: `Canvas`, `DrawRect`, `DrawCircle`, `DrawPath`, etc.
- Reactivity: `effect`, `root`, `state`
- Utils: `normalizeStyle`

## Migration Examples

### Example 1: Simple Layout App
**Before:**
```typescript
import { Row, Column, Text } from 'flexium/primitives'

function App() {
  return (
    <Column>
      <Row><Text>Hello World</Text></Row>
    </Column>
  )
}
```

**After:** ✅ No changes needed! This continues to work.

### Example 2: App with Animations
**Before:**
```typescript
import {
  Row,
  Column,
  Text,
  createMotion,
  useMotion
} from 'flexium/primitives'

function App() {
  const motion = createMotion({ opacity: 0 })
  // ...
}
```

**After:**
```typescript
import { Row, Column, Text } from 'flexium/primitives'
import { createMotion, useMotion } from 'flexium/primitives/motion'  // 👈 NEW

function App() {
  const motion = createMotion({ opacity: 0 })
  // ...
}
```

### Example 3: Form Application
**Before:**
```typescript
import {
  Column,
  createForm,
  createInput,
  createButton
} from 'flexium/primitives'

function LoginForm() {
  const form = createForm({
    username: '',
    password: ''
  })
  // ...
}
```

**After:**
```typescript
import { Column } from 'flexium/primitives'
import { createForm, createInput } from 'flexium/primitives/form'  // 👈 NEW
import { createButton } from 'flexium/primitives/ui'                // 👈 NEW

function LoginForm() {
  const form = createForm({
    username: '',
    password: ''
  })
  // ...
}
```

### Example 4: Full-Featured App
**Before:**
```typescript
import {
  Row,
  Column,
  Text,
  createMotion,
  createForm,
  createInput,
  createButton,
  createText,
  createHeading
} from 'flexium/primitives'
```

**After:**
```typescript
import { Row, Column, Text } from 'flexium/primitives'
import { createMotion } from 'flexium/primitives/motion'
import { createForm, createInput } from 'flexium/primitives/form'
import { createButton, createText, createHeading } from 'flexium/primitives/ui'
```

## Automated Migration

### Using Find & Replace

1. **Motion Imports:**
   - Find: `from 'flexium/primitives'` (where imports include createMotion, useMotion, etc.)
   - Add: `import { createMotion, useMotion, ... } from 'flexium/primitives/motion'`

2. **Form Imports:**
   - Find: `from 'flexium/primitives'` (where imports include createForm, createInput, etc.)
   - Add: `import { createForm, createInput, ... } from 'flexium/primitives/form'`

3. **UI Imports:**
   - Find: `from 'flexium/primitives'` (where imports include createButton, createText, etc.)
   - Add: `import { createButton, createText, ... } from 'flexium/primitives/ui'`

## Bundle Size Impact

| Import Pattern | Bundle Size | Savings |
|---------------|-------------|---------|
| Old way (everything) | ~71KB | - |
| Core only | ~1.7KB | 97% smaller |
| Core + Motion | ~7.5KB | 89% smaller |
| Core + Form | ~8.2KB | 88% smaller |
| Core + UI | ~8.9KB | 87% smaller |
| Core + All specialized | ~21.7KB | 69% smaller |

## TypeScript Support

All new entry points have full TypeScript support with declaration files:
```typescript
import type { MotionProps, SpringConfig } from 'flexium/primitives/motion'
import type { FormState, FieldState } from 'flexium/primitives/form'
import type { ButtonProps, ButtonVariant } from 'flexium/primitives/ui'
```

## Lazy Loading

You can now easily lazy-load heavy features:
```typescript
import { Row, Column } from 'flexium/primitives'

// Lazy load motion when needed
async function enableAnimations() {
  const { createMotion } = await import('flexium/primitives/motion')
  // Use motion...
}

// Lazy load forms on-demand
async function showLoginForm() {
  const { createForm } = await import('flexium/primitives/form')
  const { createButton } = await import('flexium/primitives/ui')
  // Render form...
}
```

## Troubleshooting

### Error: "Cannot find module 'flexium/primitives/motion'"

**Cause:** You haven't upgraded to Flexium v0.4.7+

**Solution:** Update your package:
```bash
npm update flexium
# or
yarn upgrade flexium
```

### Build fails with "Export not found"

**Cause:** You're trying to import Motion/Form/UI from the core primitives bundle

**Solution:** Use the specialized imports:
```typescript
// ❌ Old way (no longer works)
import { createMotion } from 'flexium/primitives'

// ✅ New way
import { createMotion } from 'flexium/primitives/motion'
```

## Benefits Summary

✅ **75% smaller core bundle** - From ~71KB to ~1.7KB
✅ **Better tree-shaking** - Import only what you need
✅ **Lazy loading support** - Load features on-demand
✅ **Explicit dependencies** - Clear what your app uses
✅ **No breaking changes** - for apps using core primitives only

## Questions?

- File an issue: https://github.com/Wick-Lim/flexium.js/issues
- Read docs: https://github.com/Wick-Lim/flexium.js
