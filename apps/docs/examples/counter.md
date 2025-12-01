---
title: Counter Example - Basic State Management
description: Learn Flexium's state management with a simple counter example. Demonstrates reactive state updates and event handling.
head:
  - - meta
    - property: og:title
      content: Counter Example - Flexium
  - - meta
    - property: og:description
      content: Simple counter example demonstrating Flexium's state management and reactive updates.
---

# Counter Example

This example demonstrates state management and interaction.

```tsx
import { state } from 'flexium'
import { Column, Row, Text, Pressable } from 'flexium'

export default function Counter() {
  const [count, setCount] = state(0)

  return (
    <Column align="center" gap={20} padding={40} style={{ backgroundColor: '#f5f5f5', borderRadius: 8 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Count: {count}
      </Text>

      <Row gap={10}>
        <Pressable
          onPress={() => setCount(c => c - 1)}
          style={{ padding: 10, backgroundColor: '#ff4444', borderRadius: 4 }}
        >
          <Text style={{ color: 'white' }}>Decrement</Text>
        </Pressable>

        <Pressable
          onPress={() => setCount(c => c + 1)}
          style={{ padding: 10, backgroundColor: '#44ff44', borderRadius: 4 }}
        >
          <Text style={{ color: 'white' }}>Increment</Text>
        </Pressable>
      </Row>
    </Column>
  )
}
```
