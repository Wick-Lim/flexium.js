---
title: Button - Accessible Button Component
description: API reference for Flexium's Button component. Create accessible buttons with unified touch/click handlers and full ARIA support.
head:
  - - meta
    - property: og:title
      content: Button Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Button component for creating accessible, interactive buttons in Flexium with unified press handling.
---

# Button

Accessible button component with unified touch/click handlers and full ARIA support.

The Button component provides an interactive button element that works consistently across mouse, touch, and keyboard interactions. It includes built-in loading states, disabled states, and comprehensive accessibility features.

## Import

```typescript
import { Button } from 'flexium/components';
```

## Button

Creates an accessible button element with unified press handling.

### Usage

```tsx
import { Button } from 'flexium/components';

// Basic button
function MyComponent() {
  return (
    <Button variant="primary" onclick={() => console.log('Clicked')}>
      Click Me
    </Button>
  );
}
```

### With Loading State

```tsx
import { Button } from 'flexium/components';
import { state } from 'flexium';

function SubmitForm() {
  const [isLoading, setLoading] = state(false);

  const handleSubmit = async () => {
    setLoading(true);
    await submitForm();
    setLoading(false);
  };

  return (
    <Button
      variant="primary"
      loading={isLoading}
      onclick={handleSubmit}
    >
      Submit
    </Button>
  );
}
```

### With Disabled State

```tsx
import { Button } from 'flexium/components';
import { state } from 'flexium';

function FormButton() {
  const [isValid, setValid] = state(false);

  return (
    <Button
      variant="primary"
      disabled={!isValid}
      onclick={() => console.log('Submit')}
    >
      Submit Form
    </Button>
  );
}
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type attribute. |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style variant. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size. |
| `disabled` | `boolean` | `false` | Whether the button is disabled. |
| `loading` | `boolean` | `false` | Whether the button is in loading state. |
| `fullWidth` | `boolean` | `false` | Whether the button spans full width. |
| `children` | `JSX.Element \| string` | - | Button content. |
| `class` | `string` | - | Additional CSS class names. |
| `onclick` | `(event: Event) => void` | - | Click event handler. |
| `aria-label` | `string` | - | Accessible label for screen readers. |
| `aria-describedby` | `string` | - | ID of element that describes the button. |
| `aria-expanded` | `boolean` | - | Indicates if controlled element is expanded. |
| `aria-pressed` | `boolean` | - | Indicates pressed state for toggle buttons. |
| `aria-controls` | `string` | - | ID of element controlled by the button. |

### CSS Classes Applied

- `button` - Base button class
- `button-{variant}` - Variant-specific class (e.g., `button-primary`)
- `button-{size}` - Size-specific class (e.g., `button-md`)
- `button-full-width` - Applied when `fullWidth` is true
- `button-loading` - Applied when loading state is active

## Examples

### Different Variants

```tsx
import { Button } from 'flexium/components';

function VariantExamples() {
  return (
    <div>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="outline">Outline Button</Button>
      <Button variant="ghost">Ghost Button</Button>
      <Button variant="danger">Danger Button</Button>
    </div>
  );
}
```

### Different Sizes

```tsx
import { Button } from 'flexium/components';

function SizeExamples() {
  return (
    <div>
      <Button size="sm">Small Button</Button>
      <Button size="md">Medium Button</Button>
      <Button size="lg">Large Button</Button>
    </div>
  );
}
```

### Form Submit Button

```tsx
import { Button } from 'flexium/components';

function FormExample() {
  return (
    <form onsubmit={(e) => {
      e.preventDefault();
      console.log('Form submitted');
    }}>
      <input type="text" placeholder="Enter text" />
      <Button type="submit" variant="primary">
        Submit
      </Button>
    </form>
  );
}
```

## Interaction Handling

The Button component handles interactions consistently across:

- **Mouse clicks** - Standard click events
- **Touch interactions** - Touch tap events
- **Keyboard activation** - Enter and Space key presses

This ensures consistent behavior across all input methods and platforms.

## Accessibility

The Button component includes comprehensive accessibility features:

### Keyboard Support

- **Enter** - Activates the button
- **Space** - Activates the button
- **Tab** - Focuses the button (native browser behavior)

### Screen Reader Support

- Proper semantic HTML (`<button>` element)
- Full ARIA attribute support
- Disabled state announced automatically
- Loading state announced automatically
- Press state support via `aria-pressed` for toggle buttons
- Expansion state support via `aria-expanded` for disclosure buttons

### Loading State Accessibility

When in loading state:

- Button is automatically disabled
- Loading state is announced to screen readers
- Visual loading indicator is displayed

### Icon-Only Buttons

When using buttons with only icons (no text), always provide an `aria-label`:

```tsx
<Button variant="ghost" aria-label="Close dialog" onclick={closeDialog}>
  <CloseIcon />
</Button>
```

## Reactive State

Button props can work with reactive state from `state()`:

```tsx
import { state } from 'flexium';
import { Button } from 'flexium/components';

function DynamicButton() {
  const [isDisabled, setDisabled] = state(false);
  const [isLoading, setLoading] = state(false);

  const handleClick = async () => {
    setLoading(true);
    await submitForm();
    setLoading(false);
  };

  return (
    <div>
      <Button
        variant="primary"
        disabled={isDisabled}
        loading={isLoading}
        onclick={handleClick}
      >
        Submit
      </Button>

      <Button
        variant="secondary"
        onclick={() => setDisabled(!isDisabled)}
      >
        Toggle Disabled
      </Button>
    </div>
  );
}
```

## Notes

- The `onclick` handler supports async functions for handling asynchronous operations
- Loading state automatically disables the button to prevent duplicate submissions
- Button variants and sizes apply CSS classes that should be styled in your CSS
- The button preserves all native `<button>` element behaviors and attributes

## See Also

- [State Management](/guide/state) - Managing button state with state()
- [Forms](/reference/primitives/form) - Building forms with buttons
