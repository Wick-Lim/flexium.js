---
title: Grid - 2D Layout Component
description: API reference for Flexium's Grid component. Create two-dimensional layouts with CSS Grid.
head:
  - - meta
    - property: og:title
      content: Grid Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Grid is a primitive layout component for 2D layouts in Flexium. Based on CSS Grid with responsive support.
---

# Grid

A two-dimensional layout component.

The `Grid` component is a primitive layout component based on CSS Grid. It supports responsive columns, rows, gaps, and all standard grid properties for creating complex layouts.

## Usage

```tsx
import { Grid } from 'flexium';

function App() {
  return (
    <Grid cols={3} gap={16}>
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
      <div>Item 4</div>
      <div>Item 5</div>
      <div>Item 6</div>
    </Grid>
  );
}
```

### Responsive Grid

```tsx
import { Grid } from 'flexium';

function App() {
  return (
    <Grid
      cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
      gap={20}
      padding={24}
    >
      <div>Item 1</div>
      <div>Item 2</div>
      <div>Item 3</div>
      <div>Item 4</div>
    </Grid>
  );
}
```

### Custom Template

```tsx
import { Grid } from 'flexium';

function App() {
  return (
    <Grid
      cols="200px 1fr 200px"
      rows="auto 1fr auto"
      columnGap={16}
      rowGap={8}
    >
      <div>Header</div>
      <div>Main Content</div>
      <div>Sidebar</div>
      <div>Footer</div>
    </Grid>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `any` | - | The content to render inside the grid. |
| `cols` | `ResponsiveValue<number \| string>` | - | Number of columns or column template. Numbers are converted to `repeat(n, 1fr)`. |
| `rows` | `ResponsiveValue<number \| string>` | - | Number of rows or row template. Numbers are converted to `repeat(n, 1fr)`. |
| `columnGap` | `ResponsiveValue<number \| string>` | - | Gap between columns. |
| `rowGap` | `ResponsiveValue<number \| string>` | - | Gap between rows. |
| `flow` | `'row' \| 'column' \| 'dense' \| 'row dense' \| 'column dense'` | - | Grid auto flow direction. |
| `autoColumns` | `ResponsiveValue<string>` | - | Size for auto-generated columns. |
| `autoRows` | `ResponsiveValue<string>` | - | Size for auto-generated rows. |
| `as` | `string` | `'div'` | HTML element to render. |
| `className` | `string` | - | CSS class name. |
| `style` | `object` | - | Additional styles. |

All [BaseComponentProps](/reference/types#basecomponentprops) are also supported, including spacing, sizing, and visual properties.

## Column and Row Templates

When a **number** is provided for `cols` or `rows`, it's automatically converted to a `repeat()` template:

- `cols={3}` becomes `grid-template-columns: repeat(3, 1fr)`
- `rows={2}` becomes `grid-template-rows: repeat(2, 1fr)`

When a **string** is provided, it's used as-is for the template:

- `cols="200px 1fr 200px"` becomes `grid-template-columns: 200px 1fr 200px`
- `rows="auto 1fr auto"` becomes `grid-template-rows: auto 1fr auto`

## Cross-Platform Notes

- **Web**: Renders as a `div` element with `display: grid` and CSS Grid properties
- **Canvas**: Grid layout is handled through the canvas renderer's layout calculations
