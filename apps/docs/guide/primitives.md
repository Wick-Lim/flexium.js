# Core Primitives

Flexium provides a set of universal primitives that work across Web and Native platforms (Flexium Native). Instead of using platform-specific tags like `div` or `span`, use these components to build your UI.

## Layout

Flexium uses `Row` and `Column` for all layout needs. This aligns with the Flexbox model and simplifies cross-platform development.

### Column

Vertical layout container.

```tsx
import { Column } from 'flexium'

<Column gap={10} padding={20}>
  <Text>Top</Text>
  <Text>Bottom</Text>
</Column>
```

- Web: `<div style="display: flex; flex-direction: column">`
- React Native: `<View style={{flexDirection: 'column'}}>`

### Row

Horizontal layout container.

```tsx
import { Row } from 'flexium'

<Row justify="between" align="center">
  <Text>Left</Text>
  <Text>Right</Text>
</Row>
```

- Web: `<div style="display: flex; flex-direction: row">`
- React Native: `<View style={{flexDirection: 'row'}}>`

## Content

### Text

Renders text content.

```tsx
import { Text } from 'flexium'

<Text style={{ fontSize: 20, color: 'blue' }}>
  Hello World
</Text>
```

- Web: `<span>` or `<p>`
- React Native: `<Text>`

### Image

Renders images.

```tsx
import { Image } from 'flexium'

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
import { Pressable, Text } from 'flexium'

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
import { ScrollView, Column } from 'flexium'

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
import { Column, Row, Text, Image, Pressable, ScrollView } from 'flexium'

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
