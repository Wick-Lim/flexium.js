# Image

Renders an image.

## Usage

```tsx
import { Image } from 'flexium';

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
