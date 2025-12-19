# Flexium UI

[![npm version](https://img.shields.io/npm/v/flexium-ui.svg)](https://www.npmjs.com/package/flexium-ui)
[![npm downloads](https://img.shields.io/npm/dm/flexium-ui.svg)](https://www.npmjs.com/package/flexium-ui)
[![license](https://img.shields.io/npm/l/flexium-ui.svg)](https://github.com/Wick-Lim/flexium.js/blob/main/LICENSE)

Column/Row based UI component library for Flexium.

## Installation

```bash
npm install flexium-ui flexium
```

## Components

### Layout Components

```tsx
import { Column, Row, Center, Spacer } from 'flexium-ui'

function Layout() {
  return (
    <Column gap={16}>
      <Row gap={8}>
        <Box>Left</Box>
        <Spacer />
        <Box>Right</Box>
      </Row>
      <Center>
        <Box>Centered Content</Box>
      </Center>
    </Column>
  )
}
```

### Column

Vertical flex container.

```tsx
<Column gap={8} align="center" justify="start">
  <Child />
  <Child />
</Column>
```

### Row

Horizontal flex container.

```tsx
<Row gap={8} align="center" justify="between">
  <Child />
  <Child />
</Row>
```

### Center

Centers content both horizontally and vertically.

```tsx
<Center width={200} height={200}>
  <Content />
</Center>
```

### Spacer

Flexible spacer that fills available space.

```tsx
<Row>
  <Logo />
  <Spacer />
  <NavLinks />
</Row>
```

### Portal

Renders children into a different DOM node.

```tsx
import { Portal } from 'flexium-ui'

<Portal target={document.body}>
  <Modal />
</Portal>
```

## Storybook

View component examples in Storybook:

```bash
npm run storybook
```

## Requirements

- Flexium >= 0.15.0

## License

MIT
