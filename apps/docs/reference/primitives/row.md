# Row

A horizontal layout component.

The `Row` component is the primary primitive for horizontal layouts. It renders a flex container with `flex-direction: row`.

## Usage

```tsx
import { Row, Text } from 'flexium';

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

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `any` | - | The content to render inside the row. |
| `gap` | `number` | - | Spacing between items. |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` | Alignment on the cross axis (vertical). |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around'` | `'start'` | Alignment on the main axis (horizontal). |
| `wrap` | `boolean` | `false` | Whether items should wrap. |
| `padding` | `number` | - | Padding around the content. |
| `style` | `object` | - | Additional styles. |
