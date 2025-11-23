# Canvas

The root component for the Flexium Canvas renderer.

## Props

- `width`: Canvas width in pixels.
- `height`: Canvas height in pixels.
- `style`: CSS styles for the canvas element.

## Usage

```tsx
import { Canvas, Circle } from 'flexium';

<Canvas width={400} height={300}>
  <Circle x={50} y={50} radius={20} fill="red" />
</Canvas>
```
