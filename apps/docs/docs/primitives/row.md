---
title: Row - Horizontal Layout Component
description: API reference for Flexium's Row component. Create horizontal layouts with flexbox-based row direction.
head:
  - - meta
    - property: og:title
      content: Row Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Row is the primary primitive for horizontal layouts in Flexium. Flexbox-based with cross-platform support.
---

# Row

The `Row` component is a fundamental layout primitive in Flexium for arranging child elements horizontally. Built on flexbox, it provides a simple yet powerful API for creating horizontal layouts with precise control over alignment, spacing, and distribution.

<script setup>
import RowDemo from '../../components/RowDemo.vue'
</script>

## Live Demo

<ClientOnly>
  <RowDemo />
</ClientOnly>

## Overview

`Row` renders as a flex container with `flex-direction: row`, making it ideal for horizontal arrangements such as navigation bars, button groups, form fields, and any UI pattern requiring side-by-side elements.

The component supports responsive values, allowing you to create adaptive layouts that respond to different screen sizes and breakpoints.

## Basic Usage

```tsx
import { Row, Text } from 'flexium/primitives';

function App() {
  return (
    <Row gap={10} padding={20} justify="between">
      <Text>Left Item</Text>
      <Text>Right Item</Text>
    </Row>
  );
}
```

## Props

### children

- **Type:** `any`
- **Required:** No
- **Description:** The content to render inside the row. Can be any valid React children including other components, text, or arrays.

```tsx
<Row>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</Row>
```

### gap

- **Type:** `ResponsiveValue<number | string>`
- **Required:** No
- **Description:** Spacing between child elements. Numbers are converted to pixels. Supports responsive values.

```tsx
// Fixed gap
<Row gap={16}>
  <div>A</div>
  <div>B</div>
</Row>

// Responsive gap
<Row gap={{ base: 8, md: 16, lg: 24 }}>
  <div>A</div>
  <div>B</div>
</Row>
```

### align

- **Type:** `ResponsiveValue<'start' | 'center' | 'end' | 'stretch' | 'baseline'>`
- **Default:** `'stretch'`
- **Description:** Controls cross-axis (vertical) alignment of children. Maps to CSS `align-items`.

| Value | CSS Equivalent | Description |
| --- | --- | --- |
| `'start'` | `flex-start` | Align items to the top |
| `'center'` | `center` | Vertically center items |
| `'end'` | `flex-end` | Align items to the bottom |
| `'stretch'` | `stretch` | Stretch items to fill the container height |
| `'baseline'` | `baseline` | Align items along their text baseline |

```tsx
<Row align="center">
  <img src="icon.png" width={24} height={24} />
  <Text>Vertically centered with icon</Text>
</Row>
```

### justify

- **Type:** `ResponsiveValue<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>`
- **Default:** `'start'`
- **Description:** Controls main-axis (horizontal) alignment and distribution of children. Maps to CSS `justify-content`.

| Value | CSS Equivalent | Description |
| --- | --- | --- |
| `'start'` | `flex-start` | Align items to the left |
| `'center'` | `center` | Horizontally center items |
| `'end'` | `flex-end` | Align items to the right |
| `'between'` | `space-between` | Distribute items with space between them |
| `'around'` | `space-around` | Distribute items with space around them |
| `'evenly'` | `space-evenly` | Distribute items with equal space |

```tsx
<Row justify="between">
  <Text>Left</Text>
  <Text>Right</Text>
</Row>
```

### wrap

- **Type:** `ResponsiveValue<boolean>`
- **Default:** `false`
- **Description:** Whether children should wrap to the next line when they exceed the container width.

```tsx
<Row wrap={true} gap={8}>
  {items.map(item => <Tag key={item}>{item}</Tag>)}
</Row>
```

### reverse

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Reverses the order of children, setting `flex-direction: row-reverse`.

```tsx
<Row reverse={true}>
  <Text>This appears second</Text>
  <Text>This appears first</Text>
</Row>
```

### padding

- **Type:** `ResponsiveValue<number | string>`
- **Required:** No
- **Description:** Padding around the container. Shorthand for all sides. Supports responsive values.

```tsx
<Row padding={20}>
  <Text>Padded content</Text>
</Row>

// Responsive padding
<Row padding={{ base: 16, md: 24, lg: 32 }}>
  <Text>Content</Text>
</Row>
```

### style

- **Type:** `CSSProperties`
- **Required:** No
- **Description:** Additional CSS styles to apply to the container. Merged with generated styles.

```tsx
<Row style={{ backgroundColor: '#f5f5f5', borderRadius: 8 }}>
  <Text>Styled row</Text>
</Row>
```

### className

- **Type:** `string`
- **Required:** No
- **Description:** CSS class name for external styling.

### as

- **Type:** `string`
- **Default:** `'div'`
- **Description:** HTML element type to render. Useful for semantic HTML.

```tsx
<Row as="nav">
  <a href="/">Home</a>
  <a href="/about">About</a>
</Row>
```

### id, role, aria-*

Standard HTML attributes for accessibility and testing.

### onClick, onMouseEnter, onMouseLeave

Standard mouse event handlers.

## Additional Style Props

`Row` supports all style props from `BaseStyleProps`, allowing you to set width, height, margins, borders, backgrounds, and more directly as props:

```tsx
<Row
  width="100%"
  maxWidth={1200}
  backgroundColor="#fff"
  borderRadius={8}
  boxShadow="0 2px 8px rgba(0,0,0,0.1)"
>
  <Text>Fully styled row</Text>
</Row>
```

## Examples

### Navigation Bar

```tsx
<Row
  justify="between"
  align="center"
  padding={16}
  backgroundColor="#fff"
  borderBottom="1px solid #e0e0e0"
>
  <Row gap={24} align="center">
    <img src="/logo.png" width={32} height={32} />
    <Text style={{ fontWeight: 'bold' }}>My App</Text>
  </Row>

  <Row gap={16}>
    <Button variant="ghost">Sign In</Button>
    <Button variant="primary">Sign Up</Button>
  </Row>
</Row>
```

### Button Group

```tsx
<Row gap={8}>
  <Button>Cancel</Button>
  <Button>Save Draft</Button>
  <Button variant="primary">Publish</Button>
</Row>
```

### Form Field with Label

```tsx
<Row gap={12} align="center">
  <Text style={{ minWidth: 100, fontWeight: '500' }}>
    Username:
  </Text>
  <Input placeholder="Enter username" style={{ flex: 1 }} />
</Row>
```

### Card with Icon

```tsx
<Row
  gap={16}
  padding={20}
  backgroundColor="#f8f9fa"
  borderRadius={8}
  align="start"
>
  <div style={{ fontSize: 24 }}>📧</div>
  <Column gap={4} style={{ flex: 1 }}>
    <Text style={{ fontWeight: 'bold' }}>New Message</Text>
    <Text style={{ fontSize: 14, color: '#666' }}>
      You have 3 unread messages
    </Text>
  </Column>
</Row>
```

### Responsive Layout

```tsx
<Row
  gap={{ base: 8, md: 16, lg: 24 }}
  padding={{ base: 12, md: 20, lg: 32 }}
  justify={{ base: 'center', md: 'between' }}
  wrap={true}
>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Row>
```

### Tag List

```tsx
<Row gap={8} wrap={true}>
  {tags.map(tag => (
    <Text
      key={tag}
      style={{
        padding: '4px 12px',
        backgroundColor: '#e3f2fd',
        borderRadius: 16,
        fontSize: 14
      }}
    >
      {tag}
    </Text>
  ))}
</Row>
```

### Evenly Distributed Items

```tsx
<Row justify="evenly" padding={20}>
  <Column align="center" gap={8}>
    <div style={{ fontSize: 32 }}>🎯</div>
    <Text>Focus</Text>
  </Column>
  <Column align="center" gap={8}>
    <div style={{ fontSize: 32 }}>⚡</div>
    <Text>Speed</Text>
  </Column>
  <Column align="center" gap={8}>
    <div style={{ fontSize: 32 }}>✨</div>
    <Text>Quality</Text>
  </Column>
</Row>
```

## Common Patterns

### Split Layout (Left/Right)

```tsx
<Row justify="between" align="center">
  <div>Left content</div>
  <div>Right content</div>
</Row>
```

### Centered Content

```tsx
<Row justify="center" align="center" style={{ minHeight: '100vh' }}>
  <LoginForm />
</Row>
```

### Icon with Text

```tsx
<Row gap={8} align="center">
  <Icon name="user" />
  <Text>Profile</Text>
</Row>
```

### Toolbar

```tsx
<Row gap={4} padding={8} backgroundColor="#f5f5f5" borderRadius={6}>
  <IconButton icon="bold" />
  <IconButton icon="italic" />
  <IconButton icon="underline" />
  <div style={{ width: 1, backgroundColor: '#ddd', margin: '0 4px' }} />
  <IconButton icon="link" />
</Row>
```

## Accessibility Considerations

### Semantic HTML

Use the `as` prop to render semantic HTML for better accessibility:

```tsx
// Navigation
<Row as="nav" role="navigation" aria-label="Main navigation">
  <a href="/">Home</a>
  <a href="/about">About</a>
</Row>

// Toolbar
<Row as="section" role="toolbar" aria-label="Text formatting">
  <button>Bold</button>
  <button>Italic</button>
</Row>
```

### Keyboard Navigation

Ensure interactive elements within rows are keyboard accessible:

```tsx
<Row gap={8}>
  <button tabIndex={0}>First</button>
  <button tabIndex={0}>Second</button>
  <button tabIndex={0}>Third</button>
</Row>
```

### Screen Readers

Use ARIA attributes to provide context:

```tsx
<Row aria-label="User actions">
  <Button aria-label="Edit profile">Edit</Button>
  <Button aria-label="Delete account">Delete</Button>
</Row>
```

## Styling Best Practices

### Consistent Spacing

Define spacing constants for consistency:

```tsx
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32
};

<Row gap={spacing.md}>
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</Row>
```

### Responsive Breakpoints

Use consistent breakpoints across your app:

```tsx
const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280
};

<Row gap={{ base: 8, md: 16, lg: 24 }}>
  <Content />
</Row>
```

### Avoid Fixed Widths

Let Row's flexbox handle sizing:

```tsx
// Good - flexible
<Row gap={16}>
  <div style={{ flex: 1 }}>Flexible</div>
  <div style={{ flex: 1 }}>Flexible</div>
</Row>

// Avoid - rigid
<Row gap={16}>
  <div style={{ width: 500 }}>Fixed</div>
  <div style={{ width: 500 }}>Fixed</div>
</Row>
```

## Edge Cases and Gotchas

### Overflow Handling

When content exceeds container width, consider wrapping:

```tsx
<Row wrap={true} gap={8}>
  {manyItems.map(item => <Tag key={item}>{item}</Tag>)}
</Row>
```

### Nested Rows

Rows can be nested, but ensure proper alignment:

```tsx
<Row gap={16}>
  <Column gap={8}>
    <Row gap={4}>
      <Icon />
      <Text>Nested</Text>
    </Row>
  </Column>
</Row>
```

### Align with Different Heights

When children have different heights, `align` controls vertical positioning:

```tsx
<Row align="start" gap={12}>
  <img src="tall.png" height={100} />
  <Text>This text aligns to the top</Text>
</Row>
```

### Gap vs Margin

Prefer `gap` over margins for spacing between items:

```tsx
// Good - uses gap
<Row gap={16}>
  <Button>A</Button>
  <Button>B</Button>
</Row>

// Avoid - manual margins
<Row>
  <Button style={{ marginRight: 16 }}>A</Button>
  <Button>B</Button>
</Row>
```

## Performance Tips

### Avoid Unnecessary Wrappers

Row handles layout, so avoid extra divs:

```tsx
// Good
<Row gap={8}>
  <Button>A</Button>
  <Button>B</Button>
</Row>

// Avoid
<Row gap={8}>
  <div><Button>A</Button></div>
  <div><Button>B</Button></div>
</Row>
```

### Memoize Style Objects

For dynamic styles, memoize to prevent re-renders:

```tsx
import { useMemo } from 'react';

function Component({ theme }) {
  const rowStyle = useMemo(() => ({
    backgroundColor: theme.background,
    padding: theme.spacing
  }), [theme]);

  return <Row style={rowStyle}>Content</Row>;
}
```

## Related Components

- [Column](/reference/primitives/column) - Vertical layout container
- [Stack](/reference/primitives/stack) - Layered layout for overlapping elements
- [Grid](/reference/primitives/grid) - Two-dimensional grid layout
- [Spacer](/reference/primitives/spacer) - Flexible spacing component
