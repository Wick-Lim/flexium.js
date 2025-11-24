# ScrollView

A container that supports scrolling.

## Usage

```tsx
import { ScrollView, Column, Text } from 'flexium';

function App() {
  return (
    <ScrollView style={{ height: 300 }}>
      <Column padding={20} gap={10}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
        {/* ... more items */}
      </Column>
    </ScrollView>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `horizontal` | `boolean` | `false` | If true, scrolls horizontally. |
| `showsHorizontalScrollIndicator` | `boolean` | `true` | Whether to show the horizontal scroll indicator. |
| `showsVerticalScrollIndicator` | `boolean` | `true` | Whether to show the vertical scroll indicator. |
| `style` | `object` | - | Style object. |
