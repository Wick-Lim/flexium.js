---
title: Pressable - Touch & Click Handler Component
description: API reference for Flexium's Pressable component. Handle touch and click interactions with cross-platform support.
head:
  - - meta
    - property: og:title
      content: Pressable Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Pressable component for handling touch and click events. Universal interaction primitive for Flexium.
---

<script setup>
import PressableDemo from '../../components/PressableDemo.vue'
</script>

# Pressable

The `Pressable` component is Flexium's universal primitive for handling user interactions through touch, click, and press events. It provides a cross-platform abstraction for making any content interactive with consistent behavior across web and mobile platforms.

## Live Demo

<ClientOnly>
  <PressableDemo />
</ClientOnly>

## Overview

On the web, `Pressable` renders as a `<button>` element with proper accessibility attributes, while on React Native it maps to the native `<Pressable>` component. This ensures your interactive elements work seamlessly across platforms with appropriate touch and mouse event handling.

Unlike traditional button elements, `Pressable` is unstyled by default, giving you complete control over the appearance while maintaining proper semantic markup and accessibility.

## Basic Usage

```tsx
import { Pressable, Text } from 'flexium/primitives';

function Button() {
  return (
    <Pressable
      onPress={() => console.log('Pressed')}
      style={{ padding: 10, backgroundColor: 'blue' }}
    >
      <Text style={{ color: 'white' }}>Click Me</Text>
    </Pressable>
  );
}
```

## Props

### children

- **Type:** `any`
- **Required:** No
- **Description:** Content to be made pressable. Can be any valid React children including text, components, or complex layouts.

```tsx
<Pressable onPress={handlePress}>
  <Text>Simple Text</Text>
</Pressable>

<Pressable onPress={handlePress}>
  <Row gap={8} align="center">
    <Icon name="heart" />
    <Text>Complex Content</Text>
  </Row>
</Pressable>
```

### onPress

- **Type:** `() => void`
- **Required:** Yes
- **Description:** Callback function executed when a tap or click is detected. This is the primary interaction handler.

```tsx
<Pressable onPress={() => console.log('Button pressed')}>
  <Text>Press Me</Text>
</Pressable>

<Pressable onPress={() => navigate('/profile')}>
  <Text>Go to Profile</Text>
</Pressable>
```

### onPressIn

- **Type:** `() => void`
- **Required:** No
- **Description:** Called when a touch is activated (mouse down or touch start). Useful for providing immediate visual feedback.

```tsx
<Pressable
  onPress={handlePress}
  onPressIn={() => setPressed(true)}
>
  <Text>Interactive</Text>
</Pressable>
```

### onPressOut

- **Type:** `() => void`
- **Required:** No
- **Description:** Called when a touch is deactivated (mouse up or touch end). Pairs with `onPressIn` for state management.

```tsx
<Pressable
  onPress={handlePress}
  onPressIn={() => setPressed(true)}
  onPressOut={() => setPressed(false)}
>
  <Text>Interactive</Text>
</Pressable>
```

### disabled

- **Type:** `boolean`
- **Default:** `false`
- **Description:** When true, prevents all press interactions and applies disabled styling (reduced opacity, not-allowed cursor).

```tsx
<Pressable
  onPress={handleSubmit}
  disabled={!isValid}
>
  <Text>Submit</Text>
</Pressable>
```

### style

- **Type:** `CommonStyle`
- **Required:** No
- **Description:** Style object for customizing the appearance. Note that Pressable applies default styles (no border, no background, no padding).

**Default Applied Styles:**
- `border: 'none'`
- `background: 'none'`
- `padding: 0`
- `cursor: 'pointer'` (or `'not-allowed'` when disabled)
- `opacity: 0.5` (when disabled)

```tsx
<Pressable
  onPress={handlePress}
  style={{
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 6
  }}
>
  <Text style={{ color: 'white' }}>Styled Button</Text>
</Pressable>
```

### activeOpacity

- **Type:** `number`
- **Default:** `0.7`
- **Description:** Opacity value when pressed (between 0 and 1). Currently reserved for future implementation.

## Examples

### Basic Button

```tsx
<Pressable
  onPress={() => alert('Clicked!')}
  style={{
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 6
  }}
>
  <Text style={{ color: 'white', fontWeight: 'bold' }}>
    Click Me
  </Text>
</Pressable>
```

### Card with Press Action

```tsx
<Pressable
  onPress={() => navigate(`/product/${product.id}`)}
  style={{
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}
>
  <Column gap={8}>
    <Image src={product.image} alt={product.name} width={200} height={150} />
    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{product.name}</Text>
    <Text style={{ color: '#666' }}>${product.price}</Text>
  </Column>
</Pressable>
```

### Icon Button

```tsx
<Pressable
  onPress={handleLike}
  style={{
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isLiked ? '#ff4444' : '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  <Icon name="heart" color={isLiked ? 'white' : '#666'} size={20} />
</Pressable>
```

### Interactive List Item

```tsx
<Pressable
  onPress={() => selectItem(item.id)}
  style={{
    padding: 16,
    backgroundColor: selected ? '#e3f2fd' : 'white',
    borderLeft: selected ? '4px solid #2196f3' : '4px solid transparent'
  }}
>
  <Row justify="between" align="center">
    <Column gap={4}>
      <Text style={{ fontWeight: 'bold' }}>{item.title}</Text>
      <Text style={{ fontSize: 14, color: '#666' }}>{item.subtitle}</Text>
    </Column>
    <Icon name="chevron-right" />
  </Row>
</Pressable>
```

### Visual Feedback on Press

```tsx
function PressableButton({ onPress, children }) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{
        padding: 12,
        backgroundColor: pressed ? '#0056b3' : '#007bff',
        borderRadius: 6,
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        transition: 'all 0.1s'
      }}
    >
      <Text style={{ color: 'white' }}>{children}</Text>
    </Pressable>
  );
}
```

### Disabled State

```tsx
<Pressable
  onPress={handleSubmit}
  disabled={isSubmitting}
  style={{
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 6,
    opacity: isSubmitting ? 0.6 : 1
  }}
>
  <Text style={{ color: 'white' }}>
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </Text>
</Pressable>
```

### Link Replacement

```tsx
<Pressable
  onPress={() => window.open('https://example.com', '_blank')}
  style={{
    color: '#007bff',
    textDecoration: 'underline',
    cursor: 'pointer'
  }}
>
  <Text style={{ color: 'inherit' }}>Visit Website</Text>
</Pressable>
```

### Custom Ripple Effect

```tsx
function RippleButton({ onPress, children }) {
  const [ripples, setRipples] = useState([]);

  const handlePress = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setRipples([...ripples, { x, y, id: Date.now() }]);
    setTimeout(() => {
      setRipples(r => r.slice(1));
    }, 600);

    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 12,
        backgroundColor: '#007bff',
        borderRadius: 6
      }}
    >
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.6)',
            transform: 'scale(0)',
            animation: 'ripple 0.6s ease-out'
          }}
        />
      ))}
      <Text style={{ color: 'white' }}>{children}</Text>
    </Pressable>
  );
}
```

## Common Patterns

### Primary Button

```tsx
<Pressable
  onPress={handleSubmit}
  style={{
    padding: '12px 24px',
    backgroundColor: '#007bff',
    borderRadius: 6,
    textAlign: 'center'
  }}
>
  <Text style={{ color: 'white', fontWeight: 'bold' }}>Submit</Text>
</Pressable>
```

### Secondary Button

```tsx
<Pressable
  onPress={handleCancel}
  style={{
    padding: '12px 24px',
    backgroundColor: 'transparent',
    border: '1px solid #007bff',
    borderRadius: 6,
    textAlign: 'center'
  }}
>
  <Text style={{ color: '#007bff', fontWeight: 'bold' }}>Cancel</Text>
</Pressable>
```

### Ghost Button

```tsx
<Pressable
  onPress={handleAction}
  style={{
    padding: '12px 24px',
    backgroundColor: 'transparent',
    borderRadius: 6
  }}
>
  <Text style={{ color: '#007bff', fontWeight: 'bold' }}>Action</Text>
</Pressable>
```

### Danger Button

```tsx
<Pressable
  onPress={handleDelete}
  style={{
    padding: '12px 24px',
    backgroundColor: '#dc3545',
    borderRadius: 6,
    textAlign: 'center'
  }}
>
  <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete</Text>
</Pressable>
```

### Chip/Tag

```tsx
<Pressable
  onPress={() => toggleTag(tag)}
  style={{
    padding: '4px 12px',
    backgroundColor: isSelected ? '#007bff' : '#f0f0f0',
    borderRadius: 16
  }}
>
  <Text style={{
    fontSize: 14,
    color: isSelected ? 'white' : '#333'
  }}>
    {tag}
  </Text>
</Pressable>
```

### Menu Item

```tsx
<Pressable
  onPress={handleMenuAction}
  style={{
    padding: 12,
    backgroundColor: 'transparent'
  }}
>
  <Row gap={12} align="center">
    <Icon name={icon} size={20} />
    <Text>{label}</Text>
  </Row>
</Pressable>
```

## Accessibility Considerations

### Semantic HTML

Pressable renders as a `<button>` element on web, providing proper semantics:

```tsx
// Automatically gets button role and keyboard support
<Pressable onPress={handlePress}>
  <Text>Accessible Button</Text>
</Pressable>
```

### ARIA Labels

Provide descriptive labels for screen readers:

```tsx
<Pressable
  onPress={handleDelete}
  aria-label="Delete item"
>
  <Icon name="trash" />
</Pressable>
```

### Keyboard Support

Pressable automatically supports keyboard interaction (Enter and Space keys):

```tsx
<Pressable onPress={handlePress}>
  <Text>Keyboard Accessible</Text>
</Pressable>
```

### Disabled State

Properly communicate disabled state:

```tsx
<Pressable
  onPress={handleSubmit}
  disabled={!isValid}
  aria-disabled={!isValid}
>
  <Text>Submit</Text>
</Pressable>
```

### Focus Indicators

Ensure visible focus indicators for keyboard navigation:

```tsx
<Pressable
  onPress={handlePress}
  style={{
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 6,
    outline: 'none',
    ':focus-visible': {
      boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.5)'
    }
  }}
>
  <Text>Focusable</Text>
</Pressable>
```

## Styling Best Practices

### Consistent Touch Targets

Ensure minimum touch target size of 44x44 pixels for mobile:

```tsx
// Good - large enough touch target
<Pressable
  onPress={handlePress}
  style={{
    minWidth: 44,
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }}
>
  <Icon name="settings" />
</Pressable>
```

### Visual Feedback

Provide clear visual feedback for interactions:

```tsx
<Pressable
  onPress={handlePress}
  style={{
    padding: 12,
    backgroundColor: '#007bff',
    borderRadius: 6,
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#0056b3'
    },
    ':active': {
      transform: 'scale(0.98)'
    }
  }}
>
  <Text>Interactive</Text>
</Pressable>
```

### Disabled State Styling

Make disabled state visually distinct:

```tsx
<Pressable
  onPress={handlePress}
  disabled={disabled}
  style={{
    padding: 12,
    backgroundColor: disabled ? '#cccccc' : '#007bff',
    borderRadius: 6,
    cursor: disabled ? 'not-allowed' : 'pointer'
  }}
>
  <Text style={{ color: disabled ? '#666' : 'white' }}>
    Submit
  </Text>
</Pressable>
```

## Edge Cases and Gotchas

### Event Propagation

Pressable stops event propagation by default:

```tsx
<Pressable onPress={() => console.log('Outer')}>
  <Pressable onPress={() => console.log('Inner')}>
    <Text>Click</Text>
  </Pressable>
</Pressable>
// Only logs "Inner" when inner button is clicked
```

### No Default Reset Styles Override

Pressable applies minimal reset styles. For complete customization:

```tsx
<Pressable
  onPress={handlePress}
  style={{
    // Override all defaults
    padding: 0,
    margin: 0,
    border: 'none',
    background: 'none',
    font: 'inherit',
    cursor: 'pointer'
  }}
>
  <CustomContent />
</Pressable>
```

### Disabled Cursor

When disabled, cursor changes to `not-allowed`:

```tsx
<Pressable disabled={true} onPress={handlePress}>
  <Text>Disabled (not-allowed cursor)</Text>
</Pressable>
```

### Form Submission

By default, Pressable renders as `<button>` which can submit forms:

```tsx
// Prevent form submission
<Pressable
  onPress={handleClick}
  type="button" // Add type to prevent form submission
>
  <Text>Click Me</Text>
</Pressable>
```

## Performance Tips

### Avoid Inline Functions

Define handlers outside render for better performance:

```tsx
// Good
function Component() {
  const handlePress = useCallback(() => {
    console.log('Pressed');
  }, []);

  return (
    <Pressable onPress={handlePress}>
      <Text>Press Me</Text>
    </Pressable>
  );
}

// Avoid - creates new function each render
function Component() {
  return (
    <Pressable onPress={() => console.log('Pressed')}>
      <Text>Press Me</Text>
    </Pressable>
  );
}
```

### Memoize Complex Children

For complex pressable content, use memoization:

```tsx
const ComplexButton = memo(({ onPress, data }) => (
  <Pressable onPress={onPress}>
    <ComplexContent data={data} />
  </Pressable>
));
```

### Debounce Rapid Presses

Prevent rapid repeated presses:

```tsx
function DebouncedPressable({ onPress, delay = 300, ...props }) {
  const timeoutRef = useRef(null);

  const handlePress = () => {
    if (timeoutRef.current) return;

    onPress();
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
    }, delay);
  };

  return <Pressable onPress={handlePress} {...props} />;
}
```

## Advanced Examples

### Loading Button

```tsx
function LoadingButton({ loading, onPress, children }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={{
        padding: 12,
        backgroundColor: '#007bff',
        borderRadius: 6,
        position: 'relative'
      }}
    >
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Spinner color="white" size={20} />
        </div>
      )}
      <Text style={{
        color: 'white',
        opacity: loading ? 0 : 1
      }}>
        {children}
      </Text>
    </Pressable>
  );
}
```

### Toggle Button

```tsx
function ToggleButton({ active, onToggle, children }) {
  return (
    <Pressable
      onPress={onToggle}
      style={{
        padding: 12,
        backgroundColor: active ? '#007bff' : '#f0f0f0',
        borderRadius: 6,
        border: active ? '2px solid #007bff' : '2px solid transparent'
      }}
    >
      <Text style={{ color: active ? 'white' : '#333' }}>
        {children}
      </Text>
    </Pressable>
  );
}
```

## Related Components

- [Text](/reference/primitives/text) - For clickable text content
- [Row](/reference/primitives/row) - For horizontal button groups
- [Column](/reference/primitives/column) - For vertical button stacks
- [Button](/reference/ui/button) - Pre-styled button component
