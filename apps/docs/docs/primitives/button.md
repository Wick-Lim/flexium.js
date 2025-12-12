---
title: Button - Accessible Button Component
description: API reference for Flexium's Button UI primitives. Create accessible buttons with unified touch/click handlers and full ARIA support.
head:
  - - meta
    - property: og:title
      content: Button Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Button primitives for creating accessible, interactive buttons in Flexium with unified press handling.
---

<script setup>
import ButtonDemo from '../../components/ButtonDemo.vue'
</script>

# Button

Accessible button component with unified touch/click handlers and full ARIA support.

The Button component provides a `<Button>` element for creating interactive buttons that work consistently across mouse, touch, and keyboard interactions. It includes built-in loading states, disabled states, and comprehensive accessibility features.

## Live Demo

<ClientOnly>
  <ButtonDemo />
</ClientOnly>

## Import

```tsx
import { Button } from 'flexium/primitives'
```

## Usage

### Basic Button

```tsx
import { Button } from 'flexium/primitives'

function MyComponent() {
  return (
    <Button
      variant="primary"
      onClick={() => console.log('Clicked')}
    >
      Click Me
    </Button>
  )
}
```

### With Loading State

```tsx
import { state } from 'flexium/core'
import { Button } from 'flexium/primitives'

function SubmitButton() {
  const isLoading = state(false)

  const handleSubmit = async () => {
    isLoading.set(true)
    await submitForm()
    isLoading.set(false)
  }

  return (
    <Button
      loading={isLoading}
      onClick={handleSubmit}
    >
      Submit
    </Button>
  )
}
```

### With Icons

```tsx
import { Button } from 'flexium/primitives'

function NextButton() {
  return (
    <Button
      variant="secondary"
      onClick={() => goToNext()}
    >
      Next →
    </Button>
  )
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type attribute |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| `disabled` | `boolean` | `false` | Whether the button is disabled |
| `loading` | `boolean` | `false` | Whether the button is in loading state |
| `fullWidth` | `boolean` | `false` | Whether the button spans full width |
| `class` | `string` | - | Additional CSS class names |
| `onClick` | `(event: MouseEvent) => void` | - | Click handler |
| `children` | `JSX.Element` | - | Button content |

## Examples

### Button Variants

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
```

### Button Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

### Disabled Button

```tsx
<Button disabled>Disabled</Button>
```

### Full Width Button

```tsx
<Button fullWidth>Full Width</Button>
```

## Accessibility

The Button component includes comprehensive accessibility features:

### Keyboard Support

- **Enter** - Activates the button
- **Space** - Activates the button
- **Tab** - Focuses the button (native browser behavior)

### Screen Reader Support

- Proper semantic HTML (`<button>` element)
- Disabled state announced automatically
- Loading state can be announced with ARIA attributes

### Loading State

When in loading state:

- Button is automatically disabled
- Click handlers are prevented from executing

## Styling

The Button component applies CSS classes based on props:

- `button` - Base button class
- `button-{variant}` - Variant-specific class (e.g., `button-primary`)
- `button-{size}` - Size-specific class (e.g., `button-md`)
- `button-loading` - Applied when loading is true
- `button-disabled` - Applied when disabled is true
- `button-full-width` - Applied when fullWidth is true

## Notes

- The `onClick` handler supports async functions
- Loading state automatically disables the button to prevent duplicate submissions
- Button variants and sizes apply CSS classes that should be styled in your CSS
- Use `state()` for reactive button states
