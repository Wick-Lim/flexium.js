---
title: Spacer - Flexible Spacing Component
description: API reference for Flexium's Spacer component. Create flexible space between elements or push elements apart.
head:
  - - meta
    - property: og:title
      content: Spacer Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Spacer is a flexible spacing component in Flexium. Grows to fill available space or creates fixed-size gaps.
---

# Spacer

A flexible spacing component.

The `Spacer` component is used to create space between elements or push elements apart. By default, it grows to fill available space using `flex: 1`. It can be used in both horizontal (Row) and vertical (Column) layouts.

## Usage

```tsx
import { Row, Text, Spacer } from 'flexium';

function App() {
  return (
    <Row>
      <Text>Left</Text>
      <Spacer />
      <Text>Right</Text>
    </Row>
  );
}
```

### Fixed Size Spacer

```tsx
import { Column, Text, Spacer } from 'flexium';

function App() {
  return (
    <Column>
      <Text>Top</Text>
      <Spacer size={20} />
      <Text>Bottom</Text>
    </Column>
  );
}
```

### Explicit Dimensions

```tsx
import { Row, Spacer } from 'flexium';

function App() {
  return (
    <Row>
      <Spacer width={100} height={50} backgroundColor="lightblue" />
    </Row>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `size` | `ResponsiveValue<number \| string>` | - | Size on main axis (width for Row, height for Column). When specified, creates a fixed-size spacer. |
| `width` | `ResponsiveValue<number \| string>` | - | Explicit width of the spacer. |
| `height` | `ResponsiveValue<number \| string>` | - | Explicit height of the spacer. |
| `flex` | `ResponsiveValue<number>` | `1` | Flex grow factor. Defaults to 1 if no size specified. |
| `as` | `string` | `'div'` | HTML element to render. |
| `className` | `string` | - | CSS class name. |
| `style` | `object` | - | Additional styles. |

All [BaseComponentProps](/reference/types#basecomponentprops) are also supported, including spacing, sizing, and visual properties.

## Behavior

The Spacer component adapts its behavior based on the props provided:

1. **No props**: Acts as a flexible spacer with `flex: 1`, growing to fill available space
2. **With `size` prop**: Creates a fixed-size spacer on the main axis
3. **With `width` or `height`**: Creates a spacer with explicit dimensions
4. **With `flex` prop**: Controls the grow factor for flexible spacing

## Cross-Platform Notes

- **Web**: Renders as a `div` element with flexbox properties
- **Canvas**: Spacer behavior is handled through layout calculations in the canvas renderer
