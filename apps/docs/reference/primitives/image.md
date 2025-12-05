---
title: Image - Image Rendering Component
description: API reference for Flexium's Image component. Display images with cross-platform support and reactive properties.
head:
  - - meta
    - property: og:title
      content: Image Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Image component for rendering images in Flexium. Universal primitive with cross-platform support.
---

# Image

Renders an image.

## Usage

```tsx
import { Image } from 'flexium/primitives';

function App() {
  return (
    <Image
      src="https://example.com/logo.png"
      alt="Logo"
      width={100}
      height={100}
      style={{ borderRadius: 8 }}
    />
  );
}
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `src` | `string` | Image source URL. |
| `alt` | `string` | Alternative text description. |
| `width` | `number` | Image width. |
| `height` | `number` | Image height. |
| `style` | `object` | Image styles. |
| `onLoad` | `() => void` | Called when image loads successfully. |
| `onError` | `() => void` | Called when image fails to load. |
