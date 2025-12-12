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

The `Image` component is Flexium's universal primitive for displaying images across web and React Native platforms. It provides a consistent API for loading, sizing, and styling images with built-in error handling and lifecycle callbacks.

## Overview

On the web, `Image` renders as an `<img>` element, while on React Native it maps to the native `<Image>` component. This abstraction ensures your image code works seamlessly across all platforms while maintaining native performance characteristics.

The component supports various image sources including URLs, local paths, and data URIs, with automatic handling of loading states and errors.

## Basic Usage

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

### src

- **Type:** `string`
- **Required:** Yes
- **Description:** The image source URL or path. Can be an HTTP/HTTPS URL, relative path, or data URI.

```tsx
// Remote URL
<Image src="https://example.com/photo.jpg" alt="Photo" />

// Relative path
<Image src="/assets/logo.png" alt="Logo" />

// Data URI
<Image src="data:image/png;base64,iVBORw0KG..." alt="Inline" />
```

### alt

- **Type:** `string`
- **Required:** Highly recommended
- **Description:** Alternative text description for accessibility and SEO. Displayed when image fails to load.

```tsx
<Image
  src="/profile.jpg"
  alt="John Doe's profile picture"
  width={80}
  height={80}
/>
```

### width

- **Type:** `number`
- **Required:** No
- **Description:** Image width in pixels. If not specified, uses natural image width or CSS width from style.

```tsx
<Image src="/banner.jpg" width={800} alt="Banner" />
```

### height

- **Type:** `number`
- **Required:** No
- **Description:** Image height in pixels. If not specified, uses natural image height or CSS height from style.

```tsx
<Image src="/banner.jpg" width={800} height={200} alt="Banner" />
```

### style

- **Type:** `CommonStyle`
- **Required:** No
- **Description:** Style object for customizing image appearance. Supports all common style properties.

**Common Style Properties:**

| Property | Type | Description |
| --- | --- | --- |
| `borderRadius` | `number` | Corner radius in pixels |
| `opacity` | `number` | Opacity from 0 to 1 |
| `objectFit` | `string` | How image should resize (cover, contain, fill) |
| `width` | `number \| string` | CSS width (overrides width prop) |
| `height` | `number \| string` | CSS height (overrides height prop) |
| `backgroundColor` | `string` | Background color (visible during load) |
| `border` | `string` | Border styling |

Plus all properties from [CommonStyle](/reference/types#commonstyle) for layout, spacing, and positioning.

```tsx
<Image
  src="/photo.jpg"
  alt="Photo"
  style={{
    borderRadius: 12,
    border: '2px solid #ddd',
    objectFit: 'cover'
  }}
/>
```

### onLoad

- **Type:** `() => void`
- **Required:** No
- **Description:** Callback function executed when the image successfully loads.

```tsx
<Image
  src="/photo.jpg"
  alt="Photo"
  onLoad={() => console.log('Image loaded successfully')}
/>
```

### onError

- **Type:** `() => void`
- **Required:** No
- **Description:** Callback function executed when the image fails to load.

```tsx
<Image
  src="/photo.jpg"
  alt="Photo"
  onError={() => console.log('Image failed to load')}
/>
```

## Examples

### Profile Avatar

```tsx
<Image
  src={user.avatarUrl}
  alt={`${user.name}'s avatar`}
  width={48}
  height={48}
  style={{
    borderRadius: 24,
    border: '2px solid #fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}
/>
```

### Responsive Image

```tsx
<Image
  src="/hero.jpg"
  alt="Hero banner"
  style={{
    width: '100%',
    height: 'auto',
    maxWidth: 1200,
    borderRadius: 8
  }}
/>
```

### Card Thumbnail

```tsx
<Column gap={12}>
  <Image
    src={product.image}
    alt={product.name}
    width={300}
    height={200}
    style={{
      borderRadius: 8,
      objectFit: 'cover'
    }}
  />
  <Text style={{ fontWeight: 'bold' }}>{product.name}</Text>
  <Text style={{ color: '#666' }}>${product.price}</Text>
</Column>
```

### Image with Loading State

```tsx
function ImageWithLoading({ src, alt }) {
  const loading = state(true);
  const error = state(false);

  return (
    <div style={{ position: 'relative' }}>
      {loading.valueOf() && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text>Loading...</Text>
        </div>
      )}

      {error.valueOf() && (
        <div style={{
          backgroundColor: '#fee',
          padding: 20,
          borderRadius: 8
        }}>
          <Text style={{ color: '#c00' }}>Failed to load image</Text>
        </div>
      )}

      <Image
        src={src}
        alt={alt}
        width={400}
        height={300}
        onLoad={() => loading.set(false)}
        onError={() => {
          loading.set(false);
          error.set(true);
        }}
        style={{
          display: error.valueOf() ? 'none' : 'block',
          borderRadius: 8
        }}
      />
    </div>
  );
}
```

### Image Gallery Grid

```tsx
<Row gap={16} wrap={true}>
  {images.map((img, index) => (
    <Image
      key={index}
      src={img.url}
      alt={img.caption}
      width={200}
      height={200}
      style={{
        borderRadius: 8,
        objectFit: 'cover',
        cursor: 'pointer',
        transition: 'transform 0.2s'
      }}
      onClick={() => openLightbox(img)}
    />
  ))}
</Row>
```

### Circular Profile Picture

```tsx
<Image
  src={user.photo}
  alt={user.name}
  width={120}
  height={120}
  style={{
    borderRadius: 60,
    border: '4px solid #fff',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
  }}
/>
```

### Background Image Pattern

```tsx
<Column
  style={{
    position: 'relative',
    padding: 40,
    minHeight: 400
  }}
>
  <Image
    src="/pattern.png"
    alt=""
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: 0.1,
      objectFit: 'cover',
      zIndex: 0
    }}
  />

  <Column gap={16} style={{ position: 'relative', zIndex: 1 }}>
    <Text style={{ fontSize: 32, fontWeight: 'bold' }}>Content</Text>
    <Text>This content appears over the background pattern</Text>
  </Column>
</Column>
```

### Image with Fallback

```tsx
function ImageWithFallback({ src, fallbackSrc, alt, ...props }) {
  const imgSrc = state(src);

  return (
    <Image
      src={imgSrc.valueOf()}
      alt={alt}
      onError={() => imgSrc.set(fallbackSrc)}
      {...props}
    />
  );
}

// Usage
<ImageWithFallback
  src="/user-avatar.jpg"
  fallbackSrc="/default-avatar.png"
  alt="User avatar"
  width={80}
  height={80}
/>
```

## Common Patterns

### Cover Image for Cards

```tsx
<Image
  src={card.image}
  alt={card.title}
  width={350}
  height={200}
  style={{
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    objectFit: 'cover'
  }}
/>
```

### Logo in Header

```tsx
<Row gap={12} align="center">
  <Image
    src="/logo.svg"
    alt="Company Logo"
    width={32}
    height={32}
  />
  <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
    Company Name
  </Text>
</Row>
```

### Thumbnail List

```tsx
<Row gap={8}>
  {thumbnails.map(thumb => (
    <Image
      key={thumb.id}
      src={thumb.url}
      alt={thumb.title}
      width={60}
      height={60}
      style={{
        borderRadius: 4,
        objectFit: 'cover',
        cursor: 'pointer',
        border: selectedId === thumb.id ? '2px solid blue' : 'none'
      }}
      onClick={() => setSelectedId(thumb.id)}
    />
  ))}
</Row>
```

### Hero Section

```tsx
<div style={{ position: 'relative', height: 500 }}>
  <Image
    src="/hero-bg.jpg"
    alt="Hero background"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }}
  />

  <Column
    justify="center"
    align="center"
    gap={20}
    style={{
      position: 'relative',
      height: '100%',
      color: 'white',
      textAlign: 'center'
    }}
  >
    <Text style={{ fontSize: 48, fontWeight: 'bold' }}>
      Welcome to Our Platform
    </Text>
    <Button variant="primary">Get Started</Button>
  </Column>
</div>
```

## Accessibility Considerations

### Always Provide Alt Text

Alt text is crucial for screen readers and SEO:

```tsx
// Good - descriptive alt text
<Image
  src="/product.jpg"
  alt="Red leather handbag with gold hardware"
  width={300}
  height={300}
/>

// Avoid - missing or poor alt text
<Image src="/product.jpg" alt="image" /> // Too vague
<Image src="/product.jpg" /> // Missing alt
```

### Decorative Images

For purely decorative images, use empty alt text:

```tsx
<Image
  src="/decorative-pattern.png"
  alt="" // Empty for decorative images
  style={{ opacity: 0.1 }}
/>
```

### Loading State Announcements

Announce loading states to screen reader users:

```tsx
<div role="img" aria-label="Profile photo" aria-busy={loading}>
  {loading ? (
    <div>Loading...</div>
  ) : (
    <Image src={photoUrl} alt="" />
  )}
</div>
```

## Styling Best Practices

### Object Fit for Consistent Sizing

Use `objectFit` to control how images fill their container:

```tsx
// Cover - fills container, may crop
<Image
  src="/photo.jpg"
  alt="Photo"
  width={300}
  height={200}
  style={{ objectFit: 'cover' }}
/>

// Contain - fits within container, may show gaps
<Image
  src="/photo.jpg"
  alt="Photo"
  width={300}
  height={200}
  style={{ objectFit: 'contain' }}
/>

// Fill - stretches to fill, may distort
<Image
  src="/photo.jpg"
  alt="Photo"
  width={300}
  height={200}
  style={{ objectFit: 'fill' }}
/>
```

### Maintain Aspect Ratio

For responsive images, set only width or height:

```tsx
// Good - maintains aspect ratio
<Image
  src="/photo.jpg"
  alt="Photo"
  style={{ width: '100%', height: 'auto' }}
/>

// Avoid - may distort
<Image
  src="/photo.jpg"
  alt="Photo"
  style={{ width: '100%', height: 200 }}
/>
```

### Background Colors During Load

Provide background color to reduce layout shift:

```tsx
<Image
  src="/photo.jpg"
  alt="Photo"
  width={400}
  height={300}
  style={{
    backgroundColor: '#f0f0f0',
    borderRadius: 8
  }}
/>
```

## Edge Cases and Gotchas

### Image Dimensions and Layout Shift

Always specify dimensions to prevent layout shift:

```tsx
// Good - prevents layout shift
<Image src="/photo.jpg" alt="Photo" width={400} height={300} />

// May cause layout shift
<Image src="/photo.jpg" alt="Photo" />
```

### CORS Issues

For cross-origin images that need to be processed:

```tsx
<Image
  src="https://external.com/photo.jpg"
  alt="Photo"
  crossOrigin="anonymous" // May be needed for canvas manipulation
/>
```

### Data URIs for Small Images

For small icons or images, consider data URIs:

```tsx
<Image
  src="data:image/svg+xml,%3Csvg..."
  alt="Icon"
  width={24}
  height={24}
/>
```

### Lazy Loading

For images below the fold, consider lazy loading:

```tsx
<Image
  src="/large-image.jpg"
  alt="Large image"
  loading="lazy" // Native lazy loading
  width={800}
  height={600}
/>
```

## Performance Tips

### Optimize Image Sources

Use appropriately sized images for your use case:

```tsx
// Good - multiple sizes for responsive
<Image
  src={`/photos/${selectedSize}.jpg`}
  alt="Photo"
  width={width}
  height={height}
/>

// Consider using srcset for responsive images
```

### Preload Critical Images

For above-the-fold images, consider preloading:

```tsx
// In your HTML head
<link rel="preload" as="image" href="/hero.jpg" />

<Image src="/hero.jpg" alt="Hero" width={1200} height={600} />
```

### Use Modern Formats

Serve WebP or AVIF when supported:

```tsx
<Image
  src="/photo.webp"
  alt="Photo"
  onError={(e) => {
    // Fallback to JPEG
    e.target.src = '/photo.jpg';
  }}
/>
```

### Memoize Image Components

For lists of images, memoize to prevent re-renders:

```tsx
import { memo } from 'react';

const MemoizedImage = memo(({ src, alt, width, height }) => (
  <Image src={src} alt={alt} width={width} height={height} />
));

// Usage in list
{images.map(img => (
  <MemoizedImage key={img.id} {...img} />
))}
```

## Advanced Examples

### Progressive Image Loading

```tsx
function ProgressiveImage({ src, placeholder, alt, ...props }) {
  const currentSrc = state(placeholder);

  effect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => currentSrc.set(src);
  });

  return (
    <Image
      src={currentSrc.valueOf()}
      alt={alt}
      {...props}
      style={{
        ...props.style,
        filter: currentSrc.valueOf() === placeholder ? 'blur(10px)' : 'none',
        transition: 'filter 0.3s'
      }}
    />
  );
}
```

### Image with Overlay

```tsx
<div style={{ position: 'relative', width: 400, height: 300 }}>
  <Image
    src="/photo.jpg"
    alt="Photo"
    width={400}
    height={300}
    style={{ borderRadius: 8 }}
  />

  <Column
    justify="end"
    padding={16}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
      borderRadius: 8
    }}
  >
    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
      Image Title
    </Text>
  </Column>
</div>
```

## Related Components

- [Row](/reference/primitives/row) - For horizontal image layouts
- [Column](/reference/primitives/column) - For vertical image layouts
- [Pressable](/reference/primitives/pressable) - For clickable images
- [ScrollView](/reference/primitives/scrollview) - For scrollable image galleries
