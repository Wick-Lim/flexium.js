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

Accessible button components with unified touch/click handlers and full ARIA support.

The Button UI primitives provide `createButton` and `createIconButton` functions for creating interactive button elements that work consistently across mouse, touch, and keyboard interactions. These primitives include built-in loading states, disabled states, and comprehensive accessibility features.

## Live Demo

<ClientOnly>
  <ButtonDemo />
</ClientOnly>

## Import

```typescript
import { createButton, createIconButton } from 'flexium/primitives/ui';
```

## createButton

Creates an accessible button element with unified press handling.

### Function Signature

```typescript
function createButton(props: ButtonProps): {
  element: HTMLButtonElement;
  update: (newProps: Partial<ButtonProps>) => void;
  dispose: () => void;
}
```

### Usage

```typescript
import { createButton } from 'flexium/primitives/ui';

// Basic button
const button = createButton({
  children: 'Click Me',
  variant: 'primary',
  onPress: () => console.log('Pressed'),
});

document.body.appendChild(button.element);
```

### With Loading State

```typescript
import { signal } from 'flexium/core';
import { createButton } from 'flexium/primitives/ui';

const isLoading = signal(false);

const button = createButton({
  children: 'Submit',
  loading: isLoading,
  loadingText: 'Submitting...',
  onPress: async () => {
    isLoading.set(true);
    await submitForm();
    isLoading.set(false);
  },
});
```

### With Icons

```typescript
import { createButton } from 'flexium/primitives/ui';

const icon = document.createElement('span');
icon.textContent = '→';

const button = createButton({
  children: 'Next',
  rightIcon: icon,
  variant: 'secondary',
  onPress: () => goToNext(),
});
```

### Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Button type attribute. |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'primary'` | Visual style variant. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size. |
| `disabled` | `Signal<boolean> \| boolean` | `false` | Whether the button is disabled. |
| `loading` | `Signal<boolean> \| boolean` | `false` | Whether the button is in loading state. |
| `fullWidth` | `boolean` | `false` | Whether the button spans full width. |
| `children` | `string \| HTMLElement \| HTMLElement[]` | - | Button content. |
| `leftIcon` | `HTMLElement` | - | Icon element to display on the left. |
| `rightIcon` | `HTMLElement` | - | Icon element to display on the right. |
| `loadingText` | `string` | `'Loading...'` | Text to display when loading. |
| `className` | `string` | - | Additional CSS class names. |
| `style` | `Partial<CSSStyleDeclaration>` | - | Inline styles. |
| `id` | `string` | - | Element ID. |
| `role` | `string` | - | ARIA role attribute. |
| `ariaLabel` | `string` | - | Accessible label for screen readers. |
| `ariaDescribedby` | `string` | - | ID of element that describes the button. |
| `ariaExpanded` | `boolean` | - | Indicates if controlled element is expanded. |
| `ariaPressed` | `boolean` | - | Indicates pressed state for toggle buttons. |
| `ariaControls` | `string` | - | ID of element controlled by the button. |
| `onPress` | `(event: Event) => void \| Promise<void>` | - | Called on click/tap/keyboard activation. |
| `onPressStart` | `(event: PointerEvent) => void` | - | Called when press begins. |
| `onPressEnd` | `(event: PointerEvent) => void` | - | Called when press ends. |
| `onFocus` | `(event: FocusEvent) => void` | - | Called when button receives focus. |
| `onBlur` | `(event: FocusEvent) => void` | - | Called when button loses focus. |
| `onKeyDown` | `(event: KeyboardEvent) => void` | - | Called on keyboard key down. |

### Return Value

| Property | Type | Description |
| --- | --- | --- |
| `element` | `HTMLButtonElement` | The button DOM element. |
| `update` | `(newProps: Partial<ButtonProps>) => void` | Function to update button props. |
| `dispose` | `() => void` | Cleanup function to remove event listeners. |

### CSS Classes Applied

- `button` - Base button class
- `button-{variant}` - Variant-specific class (e.g., `button-primary`)
- `button-{size}` - Size-specific class (e.g., `button-md`)
- `button-full-width` - Applied when `fullWidth` is true
- `button-pressed` - Applied during press interaction
- `button-content` - Wrapper for button content
- `button-icon` - Applied to icon elements
- `button-icon-left` - Applied to left icon
- `button-icon-right` - Applied to right icon
- `button-text` - Applied to text content
- `button-spinner` - Applied to loading spinner

## createIconButton

Creates an icon-only button (button with only an icon).

### Function Signature

```typescript
function createIconButton(props: ButtonProps & { icon: HTMLElement }): {
  element: HTMLButtonElement;
  dispose: () => void;
}
```

### Usage

```typescript
import { createIconButton } from 'flexium/primitives/ui';

const closeIcon = document.createElement('span');
closeIcon.textContent = '×';

const button = createIconButton({
  icon: closeIcon,
  ariaLabel: 'Close',
  variant: 'ghost',
  size: 'sm',
  onPress: () => closeDialog(),
});

document.body.appendChild(button.element);
```

### Props

All props from `createButton` are supported, plus:

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `icon` | `HTMLElement` | Yes | Icon element to display. |
| `ariaLabel` | `string` | Recommended | Accessible label (warning if omitted). |

### Return Value

| Property | Type | Description |
| --- | --- | --- |
| `element` | `HTMLButtonElement` | The button DOM element. |
| `dispose` | `() => void` | Cleanup function to remove event listeners. |

### CSS Classes Applied

All classes from `createButton`, plus:

- `icon-button` - Applied to icon-only buttons

## Unified Press Handling

The button primitives provide a unified press handler (`onPress`) that works consistently across:

- **Mouse clicks** - Standard click events
- **Touch interactions** - Touch start/end events
- **Keyboard activation** - Enter and Space key presses

This unified approach ensures consistent behavior across all input methods and platforms.

### Press States

The button automatically manages press states:

1. **Press Start** - `button-pressed` class applied, `onPressStart` called
2. **Press Active** - Button shows pressed state
3. **Press End** - `button-pressed` class removed, `onPressEnd` called
4. **Press Complete** - `onPress` handler called

### Press Cancellation

Press interactions are automatically cancelled if:

- Pointer leaves the button area
- Touch is interrupted
- Button becomes disabled during interaction

## Accessibility

The Button primitives include comprehensive accessibility features:

### Keyboard Support

- **Enter** - Activates the button
- **Space** - Activates the button
- **Tab** - Focuses the button (native browser behavior)

### Screen Reader Support

- Proper semantic HTML (`<button>` element)
- Full ARIA attribute support
- Disabled state announced via `aria-disabled`
- Loading state announced via `aria-busy`
- Press state support via `aria-pressed` for toggle buttons
- Expansion state support via `aria-expanded` for disclosure buttons

### Loading State Accessibility

When in loading state:

- Button is automatically disabled
- `aria-busy="true"` attribute is set
- Loading text is announced to screen readers
- Visual spinner is hidden from screen readers with `aria-hidden="true"`

### Icon Button Accessibility

Icon buttons should always include an `ariaLabel`:

```typescript
// Good - includes label
createIconButton({
  icon: closeIcon,
  ariaLabel: 'Close dialog',
  onPress: closeDialog,
});

// Bad - missing label (warning logged)
createIconButton({
  icon: closeIcon,
  onPress: closeDialog,
});
```

## Reactive State with Signals

Button props can accept signals for reactive state management:

```typescript
import { signal } from 'flexium/core';
import { createButton } from 'flexium/primitives/ui';

const isDisabled = signal(false);
const isLoading = signal(false);

const button = createButton({
  children: 'Submit',
  disabled: isDisabled,
  loading: isLoading,
  onPress: async () => {
    isLoading.set(true);
    await submitForm();
    isLoading.set(false);
  },
});

// Later, enable/disable the button
isDisabled.set(true);
```

## Cleanup

Always call the `dispose` function when removing buttons from the DOM to prevent memory leaks:

```typescript
const button = createButton({
  children: 'Click Me',
  onPress: () => console.log('Pressed'),
});

document.body.appendChild(button.element);

// Later, when removing the button
document.body.removeChild(button.element);
button.dispose(); // Clean up event listeners and effects
```

## Notes

- The `onPress` handler supports async functions for handling asynchronous operations
- Error handling is built-in - errors in `onPress` are caught and logged
- Loading state automatically disables the button to prevent duplicate submissions
- Button variants and sizes apply CSS classes that should be styled in your CSS
- The button preserves all native `<button>` element behaviors and attributes
