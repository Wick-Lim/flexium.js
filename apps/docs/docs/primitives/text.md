---
title: Text - Text Rendering Component
description: API reference for Flexium's Text component. Render and style text content with cross-platform support.
head:
  - - meta
    - property: og:title
      content: Text Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Text component for rendering text content in Flexium. Universal primitive with styling options.
---

<script setup>
import TextDemo from '../../components/TextDemo.vue'
</script>

# Text

The `Text` component is the universal primitive for rendering text content in Flexium. It provides a consistent API across web and React Native platforms while supporting rich styling options, interactivity, and accessibility features.

## Live Demo

<ClientOnly>
  <TextDemo />
</ClientOnly>

## Overview

On the web, `Text` renders as a `<span>` element, while on React Native it maps to the native `<Text>` component. This abstraction allows you to write text rendering code once and deploy it anywhere.

## Basic Usage

```tsx
import { Text } from 'flexium/primitives';

function App() {
  return (
    <Text style={{ fontSize: 18, color: '#333' }}>
      Hello World
    </Text>
  );
}
```

## Props

### children

- **Type:** `any`
- **Required:** No
- **Description:** The text content to render. Can be a string, number, or any renderable content.

```tsx
<Text>Simple string</Text>
<Text>{dynamicValue}</Text>
<Text>
  Multi-line text
  with line breaks
</Text>
```

### style

- **Type:** `TextStyle`
- **Required:** No
- **Description:** Style object for customizing the appearance of text.

**TextStyle Properties:**

| Property | Type | Description |
| --- | --- | --- |
| `color` | `string` | Text color (hex, rgb, named colors) |
| `fontSize` | `number` | Font size in pixels |
| `fontWeight` | `'normal' \| 'bold' \| number` | Font weight (100-900 or keywords) |
| `fontFamily` | `string` | Font family name or stack |
| `fontStyle` | `'normal' \| 'italic'` | Font style |
| `textAlign` | `'left' \| 'center' \| 'right' \| 'justify'` | Text alignment |
| `textDecoration` | `'none' \| 'underline' \| 'line-through'` | Text decoration |
| `lineHeight` | `number` | Line height in pixels |
| `letterSpacing` | `number` | Letter spacing in pixels |

Plus all properties from [CommonStyle](/reference/types#commonstyle) for layout, spacing, and positioning.

### onPress / onClick

- **Type:** `() => void`
- **Required:** No
- **Description:** Callback function executed when the text is clicked or tapped. Both `onPress` and `onClick` are supported for cross-platform compatibility.

```tsx
<Text onPress={() => console.log('Clicked')}>
  Clickable Text
</Text>
```

### numberOfLines

- **Type:** `number`
- **Required:** No
- **Description:** Maximum number of lines to display. Text exceeding this limit will be truncated with an ellipsis.

```tsx
<Text numberOfLines={2}>
  This is a very long text that will be truncated after two lines
  no matter how much content there is.
</Text>
```

### className / class

- **Type:** `string`
- **Required:** No
- **Description:** CSS class name for additional styling via external stylesheets.

## Examples

### Basic Text Styling

```tsx
<Text style={{
  fontSize: 24,
  fontWeight: 'bold',
  color: '#2c3e50'
}}>
  Bold Headline
</Text>
```

### Multi-Style Text

```tsx
<Column gap={8}>
  <Text style={{ fontSize: 32, fontWeight: 'bold' }}>
    Main Title
  </Text>
  <Text style={{ fontSize: 18, color: '#666' }}>
    Subtitle with secondary color
  </Text>
  <Text style={{ fontSize: 14, fontStyle: 'italic' }}>
    Small italic text
  </Text>
</Column>
```

### Interactive Text Links

```tsx
<Text
  onPress={() => window.open('https://example.com')}
  style={{
    color: '#3498db',
    textDecoration: 'underline',
    cursor: 'pointer'
  }}
>
  Visit our website
</Text>
```

### Truncated Text

```tsx
<Text
  numberOfLines={3}
  style={{
    fontSize: 14,
    lineHeight: 20,
    color: '#333'
  }}
>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
  This text will be truncated after three lines.
</Text>
```

### Responsive Typography

```tsx
<Text style={{
  fontSize: window.innerWidth > 768 ? 24 : 18,
  fontWeight: 'bold',
  textAlign: 'center',
  padding: 16
}}>
  Responsive Heading
</Text>
```

### Custom Font Families

```tsx
<Text style={{
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontSize: 16,
  letterSpacing: 0.5
}}>
  Text with custom font stack
</Text>
```

## Common Patterns

### Label-Value Pairs

```tsx
<Row gap={8} align="baseline">
  <Text style={{ fontWeight: 'bold', fontSize: 14 }}>
    Name:
  </Text>
  <Text style={{ fontSize: 14, color: '#666' }}>
    John Doe
  </Text>
</Row>
```

### Error Messages

```tsx
<Text style={{
  color: '#e74c3c',
  fontSize: 12,
  marginTop: 4
}}>
  This field is required
</Text>
```

### Badge or Tag Text

```tsx
<Text style={{
  fontSize: 12,
  fontWeight: 'bold',
  color: 'white',
  backgroundColor: '#3498db',
  padding: 4,
  borderRadius: 4
}}>
  NEW
</Text>
```

## Accessibility Considerations

### Readable Font Sizes

Always ensure text is readable across devices. A minimum font size of 14px is recommended for body text.

```tsx
// Good
<Text style={{ fontSize: 16 }}>Readable text</Text>

// Avoid
<Text style={{ fontSize: 10 }}>Too small</Text>
```

### Color Contrast

Maintain sufficient color contrast between text and background for accessibility compliance (WCAG AA minimum ratio of 4.5:1 for normal text).

```tsx
// Good contrast
<Text style={{ color: '#333', backgroundColor: '#fff' }}>
  High contrast text
</Text>

// Poor contrast - avoid
<Text style={{ color: '#ccc', backgroundColor: '#fff' }}>
  Low contrast text
</Text>
```

### Semantic HTML via className

For better accessibility on the web, use className to apply semantic styling:

```tsx
<Text className="sr-only">
  Screen reader only text
</Text>
```

## Styling Best Practices

### Use Consistent Typography Scale

Define a type scale for your application:

```tsx
const typography = {
  h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
  h2: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
  h3: { fontSize: 20, fontWeight: 'bold', lineHeight: 28 },
  body: { fontSize: 16, lineHeight: 24 },
  small: { fontSize: 14, lineHeight: 20 },
  caption: { fontSize: 12, lineHeight: 16 }
};

// Usage
<Text style={typography.h1}>Heading</Text>
<Text style={typography.body}>Body text</Text>
```

### Line Height for Readability

Set appropriate line heights for better readability, typically 1.5x the font size:

```tsx
<Text style={{
  fontSize: 16,
  lineHeight: 24  // 1.5x font size
}}>
  Well-spaced text is easier to read over long passages.
</Text>
```

### Letter Spacing for Headers

Add subtle letter spacing to uppercase or large text:

```tsx
<Text style={{
  fontSize: 12,
  fontWeight: 'bold',
  letterSpacing: 1.2,
  textTransform: 'uppercase'
}}>
  Section Header
</Text>
```

## Edge Cases and Gotchas

### Nested Text Components

Avoid deeply nesting Text components as it can lead to unexpected styling inheritance:

```tsx
// Avoid
<Text style={{ fontSize: 16 }}>
  <Text style={{ fontWeight: 'bold' }}>
    <Text style={{ color: 'red' }}>Nested</Text>
  </Text>
</Text>

// Prefer
<Text style={{ fontSize: 16, fontWeight: 'bold', color: 'red' }}>
  Flat structure
</Text>
```

### Whitespace Handling

Text whitespace is preserved by default. Use CSS properties to control it:

```tsx
<Text style={{ whiteSpace: 'nowrap' }}>
  This text will not wrap
</Text>
```

### Number Children Auto-Conversion

Numbers are automatically converted to strings:

```tsx
<Text>{42}</Text> // Renders as "42"
<Text>{0}</Text>  // Renders as "0"
```

### Undefined or Null Children

Undefined or null values are safely ignored:

```tsx
<Text>{undefined}</Text> // Renders nothing
<Text>{null}</Text>      // Renders nothing
```

## Performance Tips

### Avoid Inline Style Objects

Create style objects outside of render to prevent unnecessary re-renders:

```tsx
// Good
const titleStyle = { fontSize: 24, fontWeight: 'bold' };

function Component() {
  return <Text style={titleStyle}>Title</Text>;
}

// Avoid - creates new object each render
function Component() {
  return <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Title</Text>;
}
```

### Conditional Styles

Use conditional logic efficiently:

```tsx
const baseStyle = { fontSize: 16 };
const errorStyle = { ...baseStyle, color: 'red' };

<Text style={hasError ? errorStyle : baseStyle}>
  Message
</Text>
```

## Related Components

- [Row](/reference/primitives/row) - Horizontal layout container
- [Column](/reference/primitives/column) - Vertical layout container
- [Pressable](/reference/primitives/pressable) - For more complex interactive text elements
- [Button](/reference/ui/button) - Pre-styled button component with text
