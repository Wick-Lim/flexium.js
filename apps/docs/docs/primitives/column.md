---
title: Column - Vertical Layout Component
description: API reference for Flexium's Column component. Create vertical layouts with flexbox-based column direction.
head:
  - - meta
    - property: og:title
      content: Column Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Column is the primary primitive for vertical layouts in Flexium. Flexbox-based with cross-platform support.
---

# Column

The `Column` component is a fundamental layout primitive in Flexium for arranging child elements vertically. Built on flexbox with `flex-direction: column`, it provides an intuitive API for creating vertical layouts with precise control over alignment, spacing, and distribution.

## Overview

`Column` is the vertical counterpart to `Row`, making it essential for most UI layouts including forms, lists, cards, and content stacking. It renders as a flex container optimized for vertical arrangement of elements.

Like all Flexium layout primitives, Column supports responsive values, enabling you to create adaptive layouts that adjust to different screen sizes seamlessly.

## Basic Usage

```tsx
import { Column, Text } from 'flexium/primitives';

function App() {
  return (
    <Column gap={10} padding={20} align="center">
      <Text>First Item</Text>
      <Text>Second Item</Text>
    </Column>
  );
}
```

## Props

### children

- **Type:** `any`
- **Required:** No
- **Description:** The content to render inside the column. Can be any valid React children including components, text, or arrays.

```tsx
<Column>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</Column>
```

### gap

- **Type:** `ResponsiveValue<number | string>`
- **Required:** No
- **Description:** Vertical spacing between child elements. Numbers are converted to pixels. Supports responsive values.

```tsx
// Fixed gap
<Column gap={16}>
  <div>First</div>
  <div>Second</div>
</Column>

// Responsive gap
<Column gap={{ base: 8, md: 16, lg: 24 }}>
  <div>First</div>
  <div>Second</div>
</Column>
```

### align

- **Type:** `ResponsiveValue<'start' | 'center' | 'end' | 'stretch' | 'baseline'>`
- **Default:** `'stretch'`
- **Description:** Controls cross-axis (horizontal) alignment of children. Maps to CSS `align-items`.

| Value | CSS Equivalent | Description |
| --- | --- | --- |
| `'start'` | `flex-start` | Align items to the left |
| `'center'` | `center` | Horizontally center items |
| `'end'` | `flex-end` | Align items to the right |
| `'stretch'` | `stretch` | Stretch items to fill the container width |
| `'baseline'` | `baseline` | Align items along their text baseline |

```tsx
<Column align="center">
  <Text>Centered text</Text>
  <Button>Centered button</Button>
</Column>
```

### justify

- **Type:** `ResponsiveValue<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>`
- **Default:** `'start'`
- **Description:** Controls main-axis (vertical) alignment and distribution of children. Maps to CSS `justify-content`.

| Value | CSS Equivalent | Description |
| --- | --- | --- |
| `'start'` | `flex-start` | Align items to the top |
| `'center'` | `center` | Vertically center items |
| `'end'` | `flex-end` | Align items to the bottom |
| `'between'` | `space-between` | Distribute items with space between them |
| `'around'` | `space-around` | Distribute items with space around them |
| `'evenly'` | `space-evenly` | Distribute items with equal space |

```tsx
<Column justify="center" style={{ minHeight: '100vh' }}>
  <Text>Vertically centered content</Text>
</Column>
```

### wrap

- **Type:** `ResponsiveValue<boolean>`
- **Default:** `false`
- **Description:** Whether children should wrap to the next column when they exceed the container height. Rarely used in columns.

```tsx
<Column wrap={true} gap={8} style={{ maxHeight: 500 }}>
  {items.map(item => <Card key={item}>{item}</Card>)}
</Column>
```

### reverse

- **Type:** `boolean`
- **Default:** `false`
- **Description:** Reverses the order of children, setting `flex-direction: column-reverse`.

```tsx
<Column reverse={true}>
  <Text>This appears at bottom</Text>
  <Text>This appears at top</Text>
</Column>
```

### padding

- **Type:** `ResponsiveValue<number | string>`
- **Required:** No
- **Description:** Padding around the container. Shorthand for all sides. Supports responsive values.

```tsx
<Column padding={20}>
  <Text>Padded content</Text>
</Column>

// Responsive padding
<Column padding={{ base: 16, md: 24, lg: 32 }}>
  <Text>Content</Text>
</Column>
```

### style

- **Type:** `CSSProperties`
- **Required:** No
- **Description:** Additional CSS styles to apply to the container. Merged with generated styles.

```tsx
<Column style={{ backgroundColor: '#f5f5f5', borderRadius: 8 }}>
  <Text>Styled column</Text>
</Column>
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
<Column as="article">
  <h1>Article Title</h1>
  <p>Article content...</p>
</Column>
```

### id, role, aria-*

Standard HTML attributes for accessibility and testing.

### onClick, onMouseEnter, onMouseLeave

Standard mouse event handlers.

## Additional Style Props

`Column` supports all style props from `BaseStyleProps`, allowing you to set width, height, margins, borders, backgrounds, and more directly as props:

```tsx
<Column
  width="100%"
  maxWidth={600}
  backgroundColor="#fff"
  borderRadius={8}
  boxShadow="0 2px 8px rgba(0,0,0,0.1)"
>
  <Text>Fully styled column</Text>
</Column>
```

## Examples

### Basic Card Layout

```tsx
<Column
  gap={12}
  padding={24}
  backgroundColor="#fff"
  borderRadius={8}
  boxShadow="0 2px 4px rgba(0,0,0,0.1)"
>
  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Card Title</Text>
  <Text style={{ color: '#666' }}>Card description goes here</Text>
  <Row gap={8} justify="end">
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </Row>
</Column>
```

### Form Layout

```tsx
<Column gap={16} padding={20}>
  <Column gap={4}>
    <Text style={{ fontWeight: '500' }}>Email</Text>
    <Input type="email" placeholder="Enter your email" />
  </Column>

  <Column gap={4}>
    <Text style={{ fontWeight: '500' }}>Password</Text>
    <Input type="password" placeholder="Enter your password" />
  </Column>

  <Button variant="primary" style={{ marginTop: 8 }}>
    Sign In
  </Button>
</Column>
```

### Centered Content

```tsx
<Column
  justify="center"
  align="center"
  gap={16}
  style={{ minHeight: '100vh', padding: 20 }}
>
  <img src="/logo.png" width={80} height={80} />
  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Welcome</Text>
  <Text style={{ color: '#666', textAlign: 'center' }}>
    Sign in to continue to your account
  </Text>
  <Button variant="primary" style={{ width: '100%', maxWidth: 300 }}>
    Get Started
  </Button>
</Column>
```

### List with Dividers

```tsx
<Column gap={0}>
  {items.map((item, index) => (
    <Fragment key={item.id}>
      <Row
        padding={16}
        justify="between"
        align="center"
        style={{ cursor: 'pointer' }}
      >
        <Text>{item.title}</Text>
        <Text style={{ color: '#666' }}>{item.status}</Text>
      </Row>
      {index < items.length - 1 && (
        <div style={{ height: 1, backgroundColor: '#e0e0e0' }} />
      )}
    </Fragment>
  ))}
</Column>
```

### Sidebar Layout

```tsx
<Column
  gap={8}
  padding={16}
  backgroundColor="#f8f9fa"
  style={{ width: 240, height: '100vh' }}
>
  <Text style={{ fontSize: 18, fontWeight: 'bold', padding: '8px 0' }}>
    Navigation
  </Text>

  <NavLink href="/dashboard">Dashboard</NavLink>
  <NavLink href="/projects">Projects</NavLink>
  <NavLink href="/settings">Settings</NavLink>

  <div style={{ flex: 1 }} /> {/* Spacer */}

  <NavLink href="/logout">Logout</NavLink>
</Column>
```

### Responsive Card Grid

```tsx
<Column gap={{ base: 16, md: 24 }}>
  <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Products</Text>

  <Row gap={{ base: 12, md: 16 }} wrap={true}>
    {products.map(product => (
      <Column
        key={product.id}
        gap={8}
        padding={16}
        backgroundColor="#fff"
        borderRadius={8}
        style={{ flex: '1 1 300px', minWidth: 0 }}
      >
        <img src={product.image} width="100%" style={{ borderRadius: 4 }} />
        <Text style={{ fontWeight: 'bold' }}>{product.name}</Text>
        <Text style={{ color: '#666' }}>${product.price}</Text>
      </Column>
    ))}
  </Row>
</Column>
```

### Stats Dashboard

```tsx
<Column gap={24} padding={32}>
  <Text style={{ fontSize: 28, fontWeight: 'bold' }}>Overview</Text>

  <Row gap={16} wrap={true}>
    <Column
      gap={8}
      padding={20}
      backgroundColor="#fff"
      borderRadius={8}
      style={{ flex: '1 1 250px' }}
    >
      <Text style={{ fontSize: 14, color: '#666' }}>Total Users</Text>
      <Text style={{ fontSize: 32, fontWeight: 'bold' }}>12,543</Text>
      <Text style={{ fontSize: 12, color: '#22c55e' }}>+12% from last month</Text>
    </Column>

    <Column
      gap={8}
      padding={20}
      backgroundColor="#fff"
      borderRadius={8}
      style={{ flex: '1 1 250px' }}
    >
      <Text style={{ fontSize: 14, color: '#666' }}>Revenue</Text>
      <Text style={{ fontSize: 32, fontWeight: 'bold' }}>$45,231</Text>
      <Text style={{ fontSize: 12, color: '#22c55e' }}>+8% from last month</Text>
    </Column>
  </Row>
</Column>
```

## Common Patterns

### Full Height Layout

```tsx
<Column style={{ minHeight: '100vh' }}>
  <header style={{ padding: 16 }}>Header</header>
  <main style={{ flex: 1, padding: 20 }}>Content</main>
  <footer style={{ padding: 16 }}>Footer</footer>
</Column>
```

### Section with Header

```tsx
<Column gap={16}>
  <Row justify="between" align="center">
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Section Title</Text>
    <Button variant="ghost">View All</Button>
  </Row>

  <Column gap={12}>
    {items.map(item => <ItemCard key={item.id} {...item} />)}
  </Column>
</Column>
```

### Empty State

```tsx
<Column
  align="center"
  justify="center"
  gap={16}
  padding={40}
  style={{ minHeight: 300 }}
>
  <div style={{ fontSize: 48, opacity: 0.5 }}>📭</div>
  <Text style={{ fontSize: 18, fontWeight: '500' }}>No items found</Text>
  <Text style={{ color: '#666', textAlign: 'center' }}>
    Get started by creating your first item
  </Text>
  <Button variant="primary">Create Item</Button>
</Column>
```

### Sticky Footer

```tsx
<Column style={{ minHeight: '100vh' }}>
  <Column gap={20} padding={20} style={{ flex: 1 }}>
    {/* Main content */}
    <Text>Content goes here</Text>
  </Column>

  <Row
    justify="between"
    align="center"
    padding={16}
    backgroundColor="#f5f5f5"
    borderTop="1px solid #e0e0e0"
  >
    <Text style={{ color: '#666' }}>Total: $99.99</Text>
    <Button variant="primary">Checkout</Button>
  </Row>
</Column>
```

## Accessibility Considerations

### Semantic HTML

Use the `as` prop for semantic HTML elements:

```tsx
// Article
<Column as="article">
  <h1>Article Title</h1>
  <p>Content...</p>
</Column>

// Section
<Column as="section" aria-labelledby="section-title">
  <h2 id="section-title">Section Title</h2>
  <p>Content...</p>
</Column>

// Main content area
<Column as="main" role="main">
  <Content />
</Column>
```

### Landmark Regions

Mark major sections for screen readers:

```tsx
<Column>
  <Column as="header" role="banner">Header</Column>
  <Column as="main" role="main">Content</Column>
  <Column as="footer" role="contentinfo">Footer</Column>
</Column>
```

### Focus Management

Ensure proper focus order for interactive elements:

```tsx
<Column gap={12}>
  <Button tabIndex={1}>First</Button>
  <Button tabIndex={2}>Second</Button>
  <Button tabIndex={3}>Third</Button>
</Column>
```

## Styling Best Practices

### Consistent Spacing Scale

Use a consistent spacing system:

```tsx
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

<Column gap={spacing.lg} padding={spacing.xl}>
  <Content />
</Column>
```

### Content Width Constraints

Limit content width for readability:

```tsx
<Column
  gap={20}
  padding={20}
  style={{ maxWidth: 800, margin: '0 auto' }}
>
  <Text>Readable content width</Text>
</Column>
```

### Flexible vs Fixed Heights

Use flex properties for dynamic layouts:

```tsx
// Good - flexible
<Column style={{ minHeight: 400 }}>
  <div style={{ flex: 1 }}>Grows to fill</div>
  <div>Fixed height</div>
</Column>

// Avoid - overly rigid
<Column style={{ height: 400 }}>
  <div style={{ height: 350 }}>Fixed</div>
  <div style={{ height: 50 }}>Fixed</div>
</Column>
```

## Edge Cases and Gotchas

### Overflow Behavior

When content exceeds container height:

```tsx
// Allow scrolling
<Column
  gap={16}
  padding={20}
  style={{ maxHeight: 500, overflowY: 'auto' }}
>
  {longList.map(item => <Item key={item} />)}
</Column>
```

### Nested Columns

Columns can be nested for complex layouts:

```tsx
<Column gap={24}>
  <Column gap={8}>
    <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Header</Text>
    <Text style={{ color: '#666' }}>Subheader</Text>
  </Column>

  <Column gap={16}>
    {items.map(item => <Card key={item} />)}
  </Column>
</Column>
```

### Align with Different Widths

When children have different widths, `align` controls horizontal positioning:

```tsx
<Column align="start" gap={8}>
  <Button>Short</Button>
  <Button style={{ width: 200 }}>Much Longer Button</Button>
</Column>
```

### Gap vs Margin

Prefer `gap` over margins for consistent spacing:

```tsx
// Good - uses gap
<Column gap={16}>
  <Card />
  <Card />
</Column>

// Avoid - manual margins
<Column>
  <Card style={{ marginBottom: 16 }} />
  <Card />
</Column>
```

## Performance Tips

### Avoid Deep Nesting

Flatten your layout structure when possible:

```tsx
// Good
<Column gap={20}>
  <Header />
  <Content />
  <Footer />
</Column>

// Avoid
<Column>
  <Column>
    <Column>
      <Header />
    </Column>
  </Column>
</Column>
```

### Virtualize Long Lists

For long scrolling lists, use virtualization:

```tsx
import { List } from 'flexium';

<Column style={{ height: 600 }}>
  <List
    items={manyItems}
    virtual
    itemSize={60}
    height={600}
  >
    {(item) => <ItemCard item={item} />}
  </List>
</Column>
```

### Memoize Complex Children

Prevent unnecessary re-renders of column children:

```tsx
import { memo } from 'react';

const MemoizedCard = memo(Card);

<Column gap={16}>
  {items.map(item => (
    <MemoizedCard key={item.id} {...item} />
  ))}
</Column>
```

## Related Components

- [Row](/reference/primitives/row) - Horizontal layout container
- [Stack](/reference/layout/stack) - Layered layout for overlapping elements
- [Grid](/reference/layout/grid) - Two-dimensional grid layout
- [ScrollView](/reference/primitives/scrollview) - Scrollable container
