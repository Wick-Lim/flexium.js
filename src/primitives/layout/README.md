# Layout Primitives

A comprehensive set of layout primitives for building flexible, responsive interfaces with type-safe style props.

## Overview

The layout system provides five core primitives:

- **Row** - Horizontal flex container
- **Column** - Vertical flex container
- **Stack** - Layered positioning (z-index stacking)
- **Grid** - CSS Grid wrapper
- **Spacer** - Flexible spacing element

All components:
- Accept style props (padding, margin, gap, align, justify, etc.)
- Support responsive props: `{ base: value, md: value, lg: value }`
- Map props to inline styles efficiently
- Include full TypeScript interfaces
- Have zero CSS-in-JS dependencies

## Components

### Row

Horizontal flex container for arranging children in a row.

```tsx
import { Row } from './primitives/layout';

// Basic usage
<Row gap={16} align="center" justify="between">
  <div>Left</div>
  <div>Right</div>
</Row>

// Responsive gap
<Row gap={{ base: 8, md: 16, lg: 24 }}>
  <Button>One</Button>
  <Button>Two</Button>
</Row>

// Wrapped row
<Row wrap gap={8} padding={16}>
  <Tag>Tag 1</Tag>
  <Tag>Tag 2</Tag>
  <Tag>Tag 3</Tag>
</Row>
```

**Props:**
- `align` - Align items on cross axis (vertical): `'start' | 'center' | 'end' | 'stretch' | 'baseline'`
- `justify` - Justify items on main axis (horizontal): `'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'`
- `wrap` - Enable wrapping of items
- `reverse` - Reverse the direction
- Plus all `StyleProps`

### Column

Vertical flex container for arranging children in a column.

```tsx
import { Column } from './primitives/layout';

// Basic usage
<Column gap={8} padding={16}>
  <div>Top</div>
  <div>Bottom</div>
</Column>

// Centered content
<Column align="center" justify="center" height="100vh">
  <h1>Centered Content</h1>
</Column>

// Full-height column with header/footer
<Column height="100vh">
  <Header />
  <Main flex={1} />
  <Footer />
</Column>
```

**Props:**
- `align` - Align items on cross axis (horizontal): `'start' | 'center' | 'end' | 'stretch' | 'baseline'`
- `justify` - Justify items on main axis (vertical): `'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'`
- `wrap` - Enable wrapping of items
- `reverse` - Reverse the direction
- Plus all `StyleProps`

### Stack

Layered positioning container for overlaying content.

```tsx
import { Stack } from './primitives/layout';

// Basic overlay
<Stack>
  <Image src="background.jpg" />
  <Text color="white">Overlay text</Text>
</Stack>

// Centered overlay
<Stack align="center" justify="center" height={400}>
  <Image src="hero.jpg" />
  <Column gap={16} zIndex={1}>
    <h1>Hero Title</h1>
    <Button>Call to Action</Button>
  </Column>
</Stack>

// Badge on avatar
<Stack width={64} height={64}>
  <Avatar src={user.avatar} />
  <Badge position="absolute" top={0} right={0} />
</Stack>
```

**Props:**
- `align` - Align items on cross axis
- `justify` - Justify items on main axis
- Plus all `StyleProps`

**Note:** Stack uses CSS Grid to position all children in the same cell. Children are automatically positioned using `grid-column: 1` and `grid-row: 1`. Use `zIndex` prop on children to control stacking order.

### Grid

CSS Grid container for grid-based layouts.

```tsx
import { Grid } from './primitives/layout';

// 3-column grid
<Grid cols={3} gap={16}>
  <Card />
  <Card />
  <Card />
</Grid>

// Responsive grid
<Grid cols={{ base: 1, md: 2, lg: 3 }} gap={16}>
  <Card />
  <Card />
  <Card />
</Grid>

// Custom template
<Grid cols="200px 1fr 200px" rows="auto 1fr auto" gap={16}>
  <Header />
  <Sidebar />
  <Main />
  <Footer />
</Grid>

// Named areas
<Grid
  cols="200px 1fr"
  rows="auto 1fr auto"
  areas={`
    "header header"
    "sidebar main"
    "footer footer"
  `}
>
  <Header style={{ gridArea: 'header' }} />
  <Sidebar style={{ gridArea: 'sidebar' }} />
  <Main style={{ gridArea: 'main' }} />
  <Footer style={{ gridArea: 'footer' }} />
</Grid>
```

**Props:**
- `cols` - Number of columns or column template (e.g., `3` or `"200px 1fr 200px"`)
- `rows` - Number of rows or row template
- `columnGap` - Gap between columns
- `rowGap` - Gap between rows
- `flow` - Grid auto-flow direction: `'row' | 'column' | 'dense' | 'row dense' | 'column dense'`
- `autoColumns` - Size of auto-generated columns
- `autoRows` - Size of auto-generated rows
- `areas` - Grid template areas
- `alignItems` - Align items in their grid areas
- `justifyItems` - Justify items in their grid areas
- `alignContent` - Align content within the grid
- `justifyContent` - Justify content within the grid
- Plus all `StyleProps`

### Spacer

Flexible spacing component that creates space between elements.

```tsx
import { Spacer } from './primitives/layout';

// Push button to the right
<Row>
  <Button>Left</Button>
  <Spacer />
  <Button>Right</Button>
</Row>

// Fixed size spacer
<Column>
  <Header />
  <Spacer size={32} />
  <Content />
</Column>

// Spacer with constraints
<Row>
  <Sidebar />
  <Spacer minSize={16} maxSize={64} />
  <Main />
</Row>

// Vertical spacer in column
<Column>
  <div>Top</div>
  <Spacer direction="vertical" size={24} />
  <div>Bottom</div>
</Column>
```

**Props:**
- `size` - Size of spacer (defaults to `flex: 1` if not specified)
- `minSize` - Minimum size
- `maxSize` - Maximum size
- `direction` - Direction of the spacer: `'horizontal' | 'vertical'`
- Plus all `StyleProps`

## Style Props System

All layout components accept a comprehensive set of style props that map directly to CSS properties:

### Spacing

```tsx
<Row
  padding={16}           // All sides
  paddingX={24}          // Left and right
  paddingY={12}          // Top and bottom
  paddingTop={8}         // Individual sides
  margin={16}
  marginX={24}
  marginY={12}
  gap={8}               // Flex/grid gap
/>
```

### Sizing

```tsx
<Column
  width={300}
  height="100vh"
  minWidth={200}
  maxWidth={600}
  minHeight="50vh"
  maxHeight="100%"
/>
```

### Flex Properties

```tsx
<Row flex={1} />
<Column flexGrow={1} flexShrink={0} flexBasis="auto" />
```

### Colors

```tsx
<Row bg="#f0f0f0" color="#333" />
<Column backgroundColor="white" />
```

### Borders

```tsx
<Row
  border="1px solid #ccc"
  borderRadius={8}
  borderWidth={2}
  borderColor="blue"
  borderStyle="dashed"
/>
```

### Typography

```tsx
<Column
  fontSize={16}
  fontWeight={600}
  fontFamily="Arial, sans-serif"
  lineHeight={1.5}
  textAlign="center"
/>
```

### Position

```tsx
<Stack
  position="relative"
  top={0}
  left={0}
  zIndex={10}
/>
```

### Other

```tsx
<Row
  opacity={0.8}
  cursor="pointer"
  boxShadow="0 2px 8px rgba(0,0,0,0.1)"
  transition="all 0.3s ease"
  overflow="hidden"
/>
```

## Responsive Props

All style props support responsive values using breakpoint objects:

```tsx
<Row
  gap={{ base: 8, md: 16, lg: 24 }}
  padding={{ base: 16, md: 24, lg: 32 }}
  flexDirection={{ base: 'column', md: 'row' }}
>
  <Card />
  <Card />
</Row>
```

**Breakpoints:**
- `base` - Base value (mobile-first)
- `sm` - Small screens (640px)
- `md` - Medium screens (768px)
- `lg` - Large screens (1024px)
- `xl` - Extra large screens (1280px)

**Note:** Currently, only the base value is applied to inline styles. Full responsive support with media queries will be added in a future update.

## TypeScript Support

All components are fully typed with TypeScript:

```tsx
import type { RowProps, ColumnProps, StyleProps } from './primitives/layout';

// Custom component with style props
interface CardProps extends StyleProps {
  title: string;
  children: any;
}

function Card({ title, children, ...styleProps }: CardProps) {
  return (
    <Column {...styleProps}>
      <h2>{title}</h2>
      {children}
    </Column>
  );
}
```

## Utility Functions

The layout system exports several utility functions:

### `toCSSValue(value: number | string | undefined): string | undefined`

Converts a value to a CSS string (adds 'px' if it's a number).

```tsx
toCSSValue(16) // "16px"
toCSSValue("1rem") // "1rem"
```

### `isResponsiveValue<T>(value: any): boolean`

Checks if a value is a responsive object.

```tsx
isResponsiveValue({ base: 8, md: 16 }) // true
isResponsiveValue(16) // false
```

### `getBaseValue<T>(value: ResponsiveValue<T>): T | undefined`

Gets the base value from a responsive value or returns the value as-is.

```tsx
getBaseValue({ base: 8, md: 16 }) // 8
getBaseValue(16) // 16
```

### `stylePropsToCSS(props: StyleProps): CSSProperties`

Converts style props to inline CSS styles.

```tsx
const styles = stylePropsToCSS({
  padding: 16,
  margin: 8,
  bg: "#f0f0f0"
});
// { padding: "16px", margin: "8px", backgroundColor: "#f0f0f0" }
```

### `mergeStyles(generated: CSSProperties, user?: CSSProperties): CSSProperties`

Merges generated styles with user-provided styles.

```tsx
const merged = mergeStyles(
  { padding: "16px" },
  { margin: "8px" }
);
// { padding: "16px", margin: "8px" }
```

## Examples

### App Layout

```tsx
import { Column, Row, Spacer } from './primitives/layout';

function AppLayout({ children }) {
  return (
    <Column height="100vh">
      {/* Header */}
      <Row
        padding={16}
        bg="white"
        borderBottom="1px solid #e0e0e0"
        align="center"
      >
        <Logo />
        <Spacer />
        <Navigation />
        <UserMenu />
      </Row>

      {/* Main content */}
      <Row flex={1} overflow="hidden">
        {/* Sidebar */}
        <Column
          width={240}
          bg="#f5f5f5"
          padding={16}
          borderRight="1px solid #e0e0e0"
        >
          <Sidebar />
        </Column>

        {/* Content area */}
        <Column flex={1} padding={24} overflow="auto">
          {children}
        </Column>
      </Row>
    </Column>
  );
}
```

### Card Grid

```tsx
import { Grid } from './primitives/layout';

function CardGrid({ items }) {
  return (
    <Grid
      cols={{ base: 1, md: 2, lg: 3 }}
      gap={24}
      padding={24}
    >
      {items.map(item => (
        <Card key={item.id} {...item} />
      ))}
    </Grid>
  );
}
```

### Hero Section

```tsx
import { Stack, Column } from './primitives/layout';

function Hero() {
  return (
    <Stack height="60vh" align="center" justify="center">
      <Image
        src="hero-bg.jpg"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
      <Column
        gap={24}
        align="center"
        padding={32}
        zIndex={1}
        bg="rgba(0, 0, 0, 0.5)"
        borderRadius={16}
      >
        <h1 style={{ color: 'white', fontSize: '3rem' }}>
          Welcome to Flexium
        </h1>
        <Button size="lg">Get Started</Button>
      </Column>
    </Stack>
  );
}
```

### Form Layout

```tsx
import { Column, Row, Spacer } from './primitives/layout';

function LoginForm() {
  return (
    <Column gap={16} padding={32} maxWidth={400}>
      <h2>Login</h2>

      <Column gap={8}>
        <label>Email</label>
        <Input type="email" />
      </Column>

      <Column gap={8}>
        <label>Password</label>
        <Input type="password" />
      </Column>

      <Row gap={8} marginTop={16}>
        <Button variant="outline" flex={1}>
          Cancel
        </Button>
        <Button variant="primary" flex={1}>
          Login
        </Button>
      </Row>
    </Column>
  );
}
```

## Performance

The layout system is designed for optimal performance:

- **Zero runtime overhead** - Props map directly to inline styles
- **No CSS-in-JS library** - No styled-components or emotion dependency
- **Lightweight** - < 5KB total for all primitives
- **Tree-shakeable** - Import only what you need
- **Type-safe** - Full TypeScript support with no runtime cost

## Design Principles

1. **Composition over inheritance** - Build complex layouts from simple primitives
2. **Inline props over CSS classes** - Faster iteration and better DX
3. **Type-safe styling** - TypeScript autocomplete for all props
4. **Mobile-first responsive** - Base values with breakpoint overrides
5. **Zero dependencies** - No CSS-in-JS runtime required

## Future Enhancements

- [ ] Media query generation for responsive props
- [ ] CSS variable theming support
- [ ] Animation/transition utilities
- [ ] Layout debugging tools
- [ ] Server-side rendering optimizations
