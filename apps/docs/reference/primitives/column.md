# Column

A vertical layout component.

The `Column` component is the primary primitive for vertical layouts. It renders a flex container with `flex-direction: column`.

## Usage

```tsx
import { Column, Text } from 'flexium';

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

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `any` | - | The content to render inside the column. |
| `gap` | `number` | - | Spacing between items. |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | `'stretch'` | Alignment on the cross axis (horizontal). |
| `justify` | `'start' \| 'center' \| 'end' \| 'between' \| 'around'` | `'start'` | Alignment on the main axis (vertical). |
| `wrap` | `boolean` | `false` | Whether items should wrap. |
| `padding` | `number` | - | Padding around the content. |
| `style` | `object` | - | Additional styles. |
