---
title: DrawText - Canvas Text Rendering Component
description: API reference for Flexium's DrawText component. Draw text on canvas with fonts, colors, and alignment options.
head:
  - - meta
    - property: og:title
      content: DrawText Component - Flexium Canvas API
  - - meta
    - property: og:description
      content: DrawText component for rendering text on canvas. Support for fonts, colors, and text alignment.
---

# DrawText

Draws text on the canvas.

## Usage

```tsx
import { Canvas, DrawText } from 'flexium-canvas';

<Canvas width={300} height={100}>
  <DrawText
    x={10}
    y={50}
    text="Hello Canvas"
    fill="black"
    fontSize={24}
  />
</Canvas>
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `text` | `string \| StateValue<string>` | The text content. |
| `x` | `number \| StateValue<number>` | The x-coordinate. |
| `y` | `number \| StateValue<number>` | The y-coordinate. |
| `fill` | `string \| StateValue<string>` | The text color. |
| `fontSize` | `number \| StateValue<number>` | Font size in pixels. |
| `fontFamily` | `string` | Font family. |
| `textAlign` | `'left' \| 'center' \| 'right'` | Text alignment. |
