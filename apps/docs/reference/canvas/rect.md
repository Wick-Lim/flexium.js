# Rect

Draws a rectangle on the canvas.

## Usage

```tsx
import { Canvas, Rect } from 'flexium';

<Canvas width={200} height={200}>
  <Rect
    x={10}
    y={10}
    width={100}
    height={50}
    fill="green"
    stroke="black"
    strokeWidth={2}
  />
</Canvas>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `x` | `number \| Signal<number>` | The x-coordinate of the top-left corner. |
| `y` | `number \| Signal<number>` | The y-coordinate of the top-left corner. |
| `width` | `number \| Signal<number>` | The width of the rectangle. |
| `height` | `number \| Signal<number>` | The height of the rectangle. |
| `fill` | `string \| Signal<string>` | The fill color. |
| `stroke` | `string \| Signal<string>` | The stroke color. |
| `strokeWidth` | `number \| Signal<number>` | The width of the stroke. |
| `opacity` | `number \| Signal<number>` | Opacity (0 to 1). |
