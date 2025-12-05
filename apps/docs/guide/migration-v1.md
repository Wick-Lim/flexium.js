---
title: Migration to v1.0 - Breaking Changes and Updates
description: Guide for migrating from Flexium v0.x to v1.0. Learn about new primitives import paths, breaking changes, and upgrade steps.
head:
  - - meta
    - property: og:title
      content: Migration to v1.0 - Flexium
  - - meta
    - property: og:description
      content: Complete guide for upgrading from Flexium v0.x to v1.0 with new primitives and breaking changes.
---

# Migration to v1.0

This guide helps you migrate from Flexium v0.x to v1.0, which introduces new primitives and reorganized import paths for better modularity and tree-shaking.

## Overview of Changes

Flexium v1.0 introduces:

- **New Primitives**: Form and Motion components
- **Reorganized Exports**: Primitives now use dedicated import paths
- **Better Tree-Shaking**: Import only what you need
- **TypeScript Improvements**: Better type inference and safety
- **No Breaking Changes to Core**: Signal, computed, and effect APIs remain unchanged

## Current Version Check

First, check your current version:

```bash
npm list flexium
```

If you're on v0.4.x, follow this guide to upgrade to v1.0.

## Installation

Update to the latest version:

```bash
npm install flexium@latest
```

Or with yarn:

```bash
yarn upgrade flexium
```

## Import Path Changes

### Primitives

Primitives are now organized into dedicated submodules for better tree-shaking.

#### Before (v0.x)

```tsx
import { Column, Row, Text, Image, Pressable } from 'flexium/primitives'
```

#### After (v1.0)

**Option 1: Import from specific submodules** (recommended)

```tsx
import { Column, Row } from 'flexium/primitives/layout'
import { Text, Image } from 'flexium/primitives/ui'
import { Pressable } from 'flexium/primitives/ui'
```

**Option 2: Import from main primitives module** (still supported)

```tsx
import { Column, Row, Text, Image, Pressable } from 'flexium/primitives'
```

### New Primitives

#### Form Components

```tsx
// New in v1.0
import {
  createForm,
  validators,
  createInput,
  createInputField
} from 'flexium/primitives/form'
```

#### Motion Components

```tsx
// New in v1.0
import {
  createMotion,
  MotionController,
  useMotion
} from 'flexium/primitives/motion'
```

### Core Imports

Core signal APIs remain unchanged:

```tsx
// No changes needed
import { signal, computed, effect } from 'flexium/core'
```

### Other Imports

```tsx
// Router - No changes
import { Router, Route, Link, useRouter } from 'flexium/router'

// DOM utilities - No changes
import { render, mount } from 'flexium/dom'

// Canvas - No changes
import { createCanvasRenderer } from 'flexium/canvas'

// Server - No changes
import { renderToString } from 'flexium/server'
```

## Submodule Organization

Primitives are now organized by category:

```tsx
// Layout primitives
'flexium/primitives/layout'  → Column, Row, ScrollView

// UI primitives
'flexium/primitives/ui'      → Text, Image, Pressable

// Form primitives (new)
'flexium/primitives/form'    → createForm, validators, createInput, createInputField

// Motion primitives (new)
'flexium/primitives/motion'  → createMotion, MotionController, useMotion
```

## Migration Steps

### Step 1: Update Package Version

```bash
npm install flexium@latest
```

### Step 2: Update Imports

Search your codebase for primitive imports and update them:

```bash
# Find all primitive imports
grep -r "from 'flexium/primitives'" src/
```

**Quick Migration**: If you prefer minimal changes, keep using the main primitives module:

```tsx
// This still works in v1.0
import { Column, Row, Text } from 'flexium/primitives'
```

**Recommended Migration**: Use specific submodules for better tree-shaking:

```tsx
// Replace with specific imports
import { Column, Row } from 'flexium/primitives/layout'
import { Text } from 'flexium/primitives/ui'
```

### Step 3: Adopt New Features (Optional)

If you have custom form handling or animation logic, consider migrating to the new primitives.

#### Forms

**Before - Custom form handling:**

```tsx
function LoginForm() {
  const email = signal('')
  const password = signal('')
  const errors = signal({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Manual validation
    const newErrors = {}
    if (!email.value) newErrors.email = 'Required'
    if (password.value.length < 8) newErrors.password = 'Too short'

    if (Object.keys(newErrors).length > 0) {
      errors.set(newErrors)
      return
    }

    await login(email.value, password.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onInput={(e) => email.set(e.target.value)}
      />
      {errors.value.email && <span>{errors.value.email}</span>}

      <input
        type="password"
        value={password}
        onInput={(e) => password.set(e.target.value)}
      />
      {errors.value.password && <span>{errors.value.password}</span>}

      <button type="submit">Login</button>
    </form>
  )
}
```

**After - Using createForm:**

```tsx
import { createForm, validators } from 'flexium/primitives/form'

function LoginForm() {
  const form = createForm({
    initialValues: { email: '', password: '' },
    validation: {
      email: validators.required(),
      password: validators.minLength(8),
    },
    onSubmit: async (data) => {
      await login(data.email, data.password)
    },
  })

  const emailField = form.getField('email')
  const passwordField = form.getField('password')

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        value={emailField.value}
        onInput={(e) => form.setFieldValue('email', e.target.value)}
        onBlur={() => form.setFieldTouched('email', true)}
      />
      {emailField.error.value && <span>{emailField.error.value}</span>}

      <input
        type="password"
        value={passwordField.value}
        onInput={(e) => form.setFieldValue('password', e.target.value)}
        onBlur={() => form.setFieldTouched('password', true)}
      />
      {passwordField.error.value && <span>{passwordField.error.value}</span>}

      <button type="submit" disabled={!form.state.isValid.value}>
        Login
      </button>
    </form>
  )
}
```

#### Animations

**Before - Manual animations:**

```tsx
function FadeIn({ children }) {
  const ref = signal(null)

  effect(() => {
    const el = ref.value
    if (!el) return

    el.style.opacity = '0'
    el.animate(
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: 300, fill: 'forwards' }
    )
  })

  return <div ref={ref}>{children}</div>
}
```

**After - Using createMotion:**

```tsx
import { createMotion } from 'flexium/primitives/motion'

function FadeIn({ children }) {
  const { element } = createMotion({
    tagName: 'div',
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    duration: 300,
  })

  return element
}
```

### Step 4: Run Tests

After updating imports, run your test suite:

```bash
npm test
```

### Step 5: Check TypeScript

If using TypeScript, verify types are correct:

```bash
npm run typecheck
```

## Breaking Changes

### None in Core APIs

The core signal system has **no breaking changes**:

- `signal()`, `computed()`, `effect()` work exactly the same
- DOM rendering (`render()`, `mount()`) unchanged
- Router APIs unchanged
- Canvas APIs unchanged

### Import Paths (Non-Breaking)

While primitives can now be imported from submodules, the main `flexium/primitives` export still works:

```tsx
// Both work in v1.0
import { Column } from 'flexium/primitives'           // Still works
import { Column } from 'flexium/primitives/layout'    // New recommended way
```

### Package Exports

The package.json exports have been expanded to include new submodules. If you're using a bundler, ensure it supports the `exports` field:

- Vite: Supported by default
- Webpack 5+: Supported by default
- Rollup: Requires @rollup/plugin-node-resolve v13+
- Parcel 2+: Supported by default

## Automated Migration

For large codebases, use find-and-replace to update imports:

### VS Code

1. Open Find in Files (Cmd/Ctrl + Shift + F)
2. Enable regex mode
3. Find: `from 'flexium/primitives'`
4. Review each occurrence and update to appropriate submodule

### Codemod (Advanced)

Create a simple codemod to automate the migration:

```js
// migrate-imports.js
const fs = require('fs')
const path = require('path')

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')

  // Replace with specific imports (customize as needed)
  content = content.replace(
    /import\s+{\s*Column,\s*Row\s*}\s+from\s+'flexium\/primitives'/g,
    "import { Column, Row } from 'flexium/primitives/layout'"
  )

  content = content.replace(
    /import\s+{\s*Text,\s*Image\s*}\s+from\s+'flexium\/primitives'/g,
    "import { Text, Image } from 'flexium/primitives/ui'"
  )

  fs.writeFileSync(filePath, content, 'utf8')
}

// Run on your src directory
// node migrate-imports.js
```

## Bundle Size Impact

The new submodule organization improves tree-shaking:

### Before (v0.x)

```tsx
import { Column } from 'flexium/primitives'
// May bundle all primitives
```

### After (v1.0)

```tsx
import { Column } from 'flexium/primitives/layout'
// Only bundles layout primitives
```

**Size savings**: Up to 30% reduction in bundle size when using specific imports.

## TypeScript Changes

### Improved Type Inference

Form and Motion primitives have full TypeScript support:

```tsx
import { createForm } from 'flexium/primitives/form'

interface LoginData {
  email: string
  password: string
}

const form = createForm<LoginData>({
  initialValues: {
    email: '',
    password: '',
  }
})

// TypeScript knows field names
form.getField('email')      // ✓ Valid
form.getField('username')   // ✗ Error: invalid field name
```

### Type Exports

All types are now exported from submodules:

```tsx
import type {
  FormConfig,
  FieldState,
  ValidationRule,
} from 'flexium/primitives/form'

import type {
  MotionProps,
  AnimatableProps,
  SpringConfig,
} from 'flexium/primitives/motion'
```

## Common Issues

### Issue: Import not found

**Error:**
```
Cannot find module 'flexium/primitives/form'
```

**Solution:**
Ensure you're using Flexium v1.0+:

```bash
npm install flexium@latest
```

### Issue: TypeScript errors after upgrade

**Error:**
```
Module '"flexium/primitives"' has no exported member 'createForm'
```

**Solution:**
Import from the correct submodule:

```tsx
import { createForm } from 'flexium/primitives/form'
```

### Issue: Bundle size increased

**Solution:**
Use specific submodule imports instead of `flexium/primitives`:

```tsx
// Instead of this
import { Column, Row, Text } from 'flexium/primitives'

// Use this
import { Column, Row } from 'flexium/primitives/layout'
import { Text } from 'flexium/primitives/ui'
```

## Rollback Plan

If you encounter issues, you can stay on v0.x:

```bash
npm install flexium@0.4.8
```

Or pin the version in package.json:

```json
{
  "dependencies": {
    "flexium": "0.4.8"
  }
}
```

## Getting Help

If you encounter migration issues:

1. Check the [GitHub Issues](https://github.com/Wick-Lim/flexium.js/issues)
2. Read the [Forms Guide](/guide/forms) and [Motion Guide](/guide/motion)
3. Join the community discussions
4. Report bugs with a minimal reproduction

## What's Next

After migrating, explore the new features:

- [Forms Guide](/guide/forms) - Learn about form handling and validation
- [Motion Guide](/guide/motion) - Learn about animations and transitions
- [Primitives Overview](/guide/primitives) - Overview of all primitives

## Migration Checklist

Use this checklist to track your migration progress:

- [ ] Update package version to v1.0+
- [ ] Update TypeScript (if using)
- [ ] Update primitive imports (or keep as-is)
- [ ] Consider adopting Form primitives
- [ ] Consider adopting Motion primitives
- [ ] Run test suite
- [ ] Run TypeScript checks
- [ ] Test in production build
- [ ] Monitor bundle size
- [ ] Update documentation

## Summary

Flexium v1.0 is a **non-breaking release** with additive features:

- Core APIs unchanged
- Old imports still work
- New primitives available for forms and motion
- Better tree-shaking with submodule imports
- Full TypeScript support

You can migrate incrementally - no need to update everything at once!
