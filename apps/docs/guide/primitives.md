---
title: Core Primitives - Universal UI Components
description: Learn about Flexium's universal primitives like Row, Column, Text, Image, and Pressable for cross-platform UI development.
head:
  - - meta
    - property: og:title
      content: Core Primitives - Flexium
  - - meta
    - property: og:description
      content: Universal UI components that work across Web and Canvas. Build with Row, Column, Text, Image, and Pressable.
---

# Core Primitives

Flexium provides a set of universal primitives that work across Web and Canvas platforms. Native iOS/Android support is coming soon. Instead of using platform-specific tags like `div` or `span`, use these components to build your UI.

## Layout

Flexium uses `Row` and `Column` for all layout needs. This aligns with the Flexbox model and simplifies cross-platform development.

### Column

Vertical layout container.

```tsx
import { Column } from 'flexium/primitives'

<Column gap={10} padding={20}>
  <Text>Top</Text>
  <Text>Bottom</Text>
</Column>
```

- Web: `<div style="display: flex; flex-direction: column">`
- React Native: <code>&lt;View style=&#123;&#123;flexDirection: 'column'&#125;&#125;&gt;</code>

### Row

Horizontal layout container.

```tsx
import { Row } from 'flexium/primitives'

<Row justify="between" align="center">
  <Text>Left</Text>
  <Text>Right</Text>
</Row>
```

- Web: `<div style="display: flex; flex-direction: row">`
- React Native: <code>&lt;View style=&#123;&#123;flexDirection: 'row'&#125;&#125;&gt;</code>

## Content

### Text

Renders text content.

```tsx
import { Text } from 'flexium/primitives'

<Text style={{ fontSize: 20, color: 'blue' }}>
  Hello World
</Text>
```

- Web: `<span>` or `<p>`
- React Native: `<Text>`

### Image

Renders images.

```tsx
import { Image } from 'flexium/primitives'

<Image
  src="/logo.png"
  width={100}
  height={100}
  alt="Logo"
/>
```

- Web: `<img>`
- React Native: `<Image>`

## Interaction

### Pressable

A wrapper for making views respond to touches or clicks.

```tsx
import { Pressable, Text } from 'flexium/primitives'

<Pressable onPress={() => console.log('Pressed')}>
  <Text>Button</Text>
</Pressable>
```

- Web: `<div role="button">` or `<button>`
- React Native: `<Pressable>` or `<TouchableOpacity>`

## Scrolling

### ScrollView

A scrolling container.

```tsx
import { ScrollView, Column } from 'flexium/primitives'

<ScrollView style={{ height: 400 }}>
  <Column>
    {/* Content */}
  </Column>
</ScrollView>
```

- Web: `<div style="overflow: scroll">`
- React Native: `<ScrollView>`

## Full Example

```tsx
import { Column, Row, Text, Image, Pressable, ScrollView } from 'flexium/primitives'

function App() {
  return (
    <ScrollView>
      <Column padding={20} gap={16}>
        <Row align="center" gap={12}>
          <Image src="avatar.png" width={50} height={50} />
          <Column>
             <Text style={{ fontWeight: 'bold' }}>John Doe</Text>
             <Text style={{ color: 'gray' }}>Software Engineer</Text>
          </Column>
        </Row>

        <Text>
          Welcome to Flexium! This UI works on Web and Native.
        </Text>

        <Pressable
          onPress={() => alert('Clicked!')}
          style={{ backgroundColor: 'blue', padding: 12, borderRadius: 8 }}
        >
          <Text style={{ color: 'white', textAlign: 'center' }}>
            Get Started
          </Text>
        </Pressable>
      </Column>
    </ScrollView>
  )
}
```

- Check [Column API Reference](/reference/primitives/column)
- Check [Row API Reference](/reference/primitives/row)
