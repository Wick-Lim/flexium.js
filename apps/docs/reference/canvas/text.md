---
title: CanvasText - Canvas Text Rendering Component
description: API reference for Flexium's CanvasText component. Draw text on canvas with fonts, colors, and alignment options.
head:
  - - meta
    - property: og:title
      content: CanvasText Component - Flexium Canvas API
  - - meta
    - property: og:description
      content: CanvasText component for rendering text on canvas. Support for fonts, colors, and text alignment.
---

# CanvasText

Draws text on the canvas. Note: This component is exported as `CanvasText` to avoid conflict with the core `Text` primitive, but inside the docs we refer to it as Text in the context of Canvas, or you can import it as `CanvasText`.

## Usage

```tsx
import { Canvas, CanvasText } from 'flexium';

<Canvas width={300} height={100}>
  <CanvasText
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
| `text` | `string \| Signal<string>` | The text content. |
| `x` | `number \| Signal<number>` | The x-coordinate. |
| `y` | `number \| Signal<number>` | The y-coordinate. |
| `fill` | `string \| Signal<string>` | The text color. |
| `fontSize` | `number \| Signal<number>` | Font size in pixels. |
| `fontFamily` | `string` | Font family. |
| `textAlign` | `'left' \| 'center' \| 'right'` | Text alignment. |
