# Counter Example

This example demonstrates state management and interaction.

```tsx
import { Column, Row, Text, Pressable } from 'flexium'
import { signal } from 'flexium'

export default function Counter() {
  const count = signal(0)

  return (
    <Column align="center" gap={20} padding={40} style={{ backgroundColor: '#f5f5f5', borderRadius: 8 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Count: {count}
      </Text>

      <Row gap={10}>
        <Pressable
          onPress={() => count.value--}
          style={{ padding: 10, backgroundColor: '#ff4444', borderRadius: 4 }}
        >
          <Text style={{ color: 'white' }}>Decrement</Text>
        </Pressable>

        <Pressable
          onPress={() => count.value++}
          style={{ padding: 10, backgroundColor: '#44ff44', borderRadius: 4 }}
        >
          <Text style={{ color: 'white' }}>Increment</Text>
        </Pressable>
      </Row>
    </Column>
  )
}
```
