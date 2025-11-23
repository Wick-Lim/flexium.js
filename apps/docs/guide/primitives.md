# Cross-Platform Primitives

Flexium provides universal primitives that work seamlessly across web and React Native.

## Philosophy

Write once, run everywhere. The same code works on:

- **Web**: Compiles to standard HTML elements
- **React Native**: Compiles to React Native components (coming soon)

## Available Primitives

### View

Universal container component.

```tsx
import { View } from 'flexium'

<View style={{ flex: 1, padding: 20, backgroundColor: '#f0f0f0' }}>
  <Text>Content here</Text>
</View>
```

**Compiles to:**
- Web: `<div>`
- React Native: `<View>`

### Text

Universal text component.

```tsx
import { Text } from 'flexium'

<Text style={{ fontSize: 16, color: '#333' }}>
  Hello World
</Text>
```

**Compiles to:**
- Web: `<span>`
- React Native: `<Text>`

### Image

Universal image component.

```tsx
import { Image } from 'flexium'

<Image
  src="/logo.png"
  style={{ width: 100, height: 100 }}
  alt="Logo"
/>
```

**Compiles to:**
- Web: `<img>`
- React Native: `<Image>`

### Pressable

Universal touchable/button component.

```tsx
import { Pressable } from 'flexium'

<Pressable
  onPress={() => console.log('Pressed!')}
  style={{ padding: 10, backgroundColor: 'blue' }}
>
  <Text>Click Me</Text>
</Pressable>
```

**Compiles to:**
- Web: `<button>`
- React Native: `<Pressable>`

### ScrollView

Universal scrollable container.

```tsx
import { ScrollView } from 'flexium'

<ScrollView style={{ height: 400 }}>
  <View>
    {/* Long content */}
  </View>
</ScrollView>
```

**Compiles to:**
- Web: `<div style="overflow: auto">`
- React Native: `<ScrollView>`

## CommonStyle

All primitives support a universal style object based on Flexbox:

```tsx
interface CommonStyle {
  // Layout
  display?: 'flex' | 'none'
  flex?: number
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around'
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'
  gap?: number

  // Spacing
  padding?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  margin?: number
  marginTop?: number
  // ... etc

  // Sizing
  width?: number | string
  height?: number | string
  minWidth?: number
  maxWidth?: number

  // Visual
  backgroundColor?: string
  borderRadius?: number
  borderWidth?: number
  borderColor?: string
  opacity?: number
  // ... etc
}
```

## Example: Complete UI

```tsx
import { signal } from 'flexium'
import { View, Text, Image, Pressable, ScrollView } from 'flexium'

function UserProfile() {
  const likes = signal(42)

  return (
    <ScrollView>
      <View style={{ padding: 20, gap: 15 }}>
        {/* Avatar */}
        <Image
          src="/avatar.jpg"
          style={{
            width: 100,
            height: 100,
            borderRadius: 50
          }}
        />

        {/* Info */}
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
            Alice Smith
          </Text>
          <Text style={{ color: '#666' }}>
            Product Designer
          </Text>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable
            onPress={() => likes.value++}
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: '#007bff',
              borderRadius: 8
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Like ({likes})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => console.log('Follow')}
            style={{
              flex: 1,
              padding: 12,
              backgroundColor: '#28a745',
              borderRadius: 8
            }}
          >
            <Text style={{ color: 'white', textAlign: 'center' }}>
              Follow
            </Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  )
}
```

This exact code runs on both web and React Native with zero changes!

## Platform-Specific Code

If you need platform-specific behavior:

```tsx
// vite.config.ts (Web)
export default defineConfig({
  resolve: {
    alias: {
      'flexium/primitives': 'flexium/primitives/web'
    }
  }
})

// metro.config.js (React Native)
module.exports = {
  resolver: {
    resolveRequest: (context, moduleName) => {
      if (moduleName === 'flexium/primitives') {
        return context.resolveRequest(
          context,
          'flexium/primitives/native'
        )
      }
      return context.resolveRequest(context, moduleName)
    }
  }
}
```

## Next Steps

- Learn about [Canvas Rendering](/guide/canvas)
- Explore [Styling](/guide/styling)
- Check [API Reference](/api/primitives/view)
