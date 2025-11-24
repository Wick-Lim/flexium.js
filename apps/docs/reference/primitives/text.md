# Text

Renders text content.

## Usage

```tsx
import { Text } from 'flexium';

function App() {
  return (
    <Text style={{ fontSize: 18, color: '#333' }}>
      Hello World
    </Text>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `any` | - | Text content. |
| `style` | `TextStyle` | - | Text styles (color, fontSize, etc.). |
| `onPress` | `() => void` | - | Click/Touch handler. |
| `numberOfLines` | `number` | - | Max number of lines (truncates if exceeded). |
