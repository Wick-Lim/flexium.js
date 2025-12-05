---
title: Stack - Layered Positioning Component
description: API reference for Flexium's Stack component. Create layered layouts with children stacked on top of each other.
head:
  - - meta
    - property: og:title
      content: Stack Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Stack is a primitive layout component for layering children in Flexium. Uses CSS Grid for perfect overlap.
---

# Stack

A layered positioning component.

The `Stack` component is a primitive layout component for layering children on top of each other. It uses CSS Grid to create perfect overlap, making it ideal for creating overlays, backgrounds, and layered UI elements.

## Usage

```tsx
import { Stack, Image, Text } from 'flexium/primitives';

function App() {
  return (
    <Stack>
      <Image src="background.jpg" />
      <Text color="white">Overlay Text</Text>
    </Stack>
  );
}
```

### Centered Overlay

```tsx
import { Stack, Image, Text } from 'flexium/primitives';

function App() {
  return (
    <Stack align="center" justify="center">
      <Image src="hero.jpg" width="100%" height={400} />
      <Text fontSize={32} fontWeight="bold" color="white">
        Hero Title
      </Text>
    </Stack>
  );
}
```

### Multiple Layers

```tsx
import { Stack } from 'flexium/primitives';

function App() {
  return (
    <Stack width={400} height={300}>
      <div style={{ backgroundColor: 'blue', opacity: 0.5 }} />
      <div style={{ backgroundColor: 'red', opacity: 0.3 }} />
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        margin: '20px',
        borderRadius: '8px'
      }}>
        Content on top
      </div>
    </Stack>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `any` | - | The content to render inside the stack. All children will be layered on top of each other. |
| `align` | `ResponsiveValue<AlignItems>` | - | Vertical alignment of children (`'start'`, `'center'`, `'end'`, `'stretch'`). |
| `justify` | `ResponsiveValue<JustifyContent>` | - | Horizontal alignment of children (`'start'`, `'center'`, `'end'`, `'between'`, `'around'`). |
| `as` | `string` | `'div'` | HTML element to render. |
| `className` | `string` | - | CSS class name. |
| `style` | `object` | - | Additional styles. |

All [BaseComponentProps](/reference/types#basecomponentprops) are also supported, including spacing, sizing, and visual properties.

## Alignment

The `align` and `justify` props control how children are positioned within the stack:

- `align`: Controls vertical alignment (maps to `align-items` in CSS Grid)
- `justify`: Controls horizontal alignment (maps to `justify-items` in CSS Grid)

Common patterns:

```tsx
// Center everything
<Stack align="center" justify="center">
  {children}
</Stack>

// Bottom-right corner
<Stack align="end" justify="end">
  {children}
</Stack>

// Top-left corner (default)
<Stack align="start" justify="start">
  {children}
</Stack>
```

## How It Works

Stack uses CSS Grid with a single cell configuration:

```css
display: grid;
grid-template-columns: 1fr;
grid-template-rows: 1fr;
```

All children are placed in the same grid cell (row 1, column 1), causing them to overlap. The order in the children array determines the stacking order, with later children appearing on top.

## Cross-Platform Notes

- **Web**: Renders as a `div` element with `display: grid` and overlapping grid cells
- **Canvas**: Stack layout is handled through the canvas renderer's layering system
