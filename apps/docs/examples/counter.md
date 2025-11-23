# Counter Example

A simple counter application demonstrating signals and primitives.

## Code

```tsx
import { signal } from 'flexium'
import { View, Text, Pressable } from 'flexium'
import { mount } from 'flexium/dom'

function Counter() {
  const count = signal(0)
  const doubled = computed(() => count.value * 2)

  return (
    <View
      style={{
        padding: 40,
        gap: 20,
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 8
      }}
    >
      <Text style={{ fontSize: 48, fontWeight: 'bold' }}>
        {count}
      </Text>

      <Text style={{ fontSize: 20, color: '#666' }}>
        Doubled: {doubled}
      </Text>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Pressable
          onPress={() => count.value--}
          style={{
            padding: 15,
            paddingHorizontal: 30,
            backgroundColor: '#dc3545',
            borderRadius: 8
          }}
        >
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
            -
          </Text>
        </Pressable>

        <Pressable
          onPress={() => count.value = 0}
          style={{
            padding: 15,
            paddingHorizontal: 30,
            backgroundColor: '#6c757d',
            borderRadius: 8
          }}
        >
          <Text style={{ color: 'white', fontSize: 16 }}>
            Reset
          </Text>
        </Pressable>

        <Pressable
          onPress={() => count.value++}
          style={{
            padding: 15,
            paddingHorizontal: 30,
            backgroundColor: '#28a745',
            borderRadius: 8
          }}
        >
          <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>
            +
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

// Mount to DOM
mount(document.getElementById('app')!, <Counter />)
```

## Try It

<div id="counter-demo"></div>

<!--
<script setup lang="tsx">
import { signal, computed } from 'flexium'
import { View, Text, Pressable } from 'flexium'
import { mount } from 'flexium/dom'
import { onMounted } from 'vue'

onMounted(() => {
  const Counter = () => {
    const count = signal(0)
    const doubled = computed(() => count.value * 2)

    return (
      <View style={{ padding: 40, gap: 20, alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <Text style={{ fontSize: 48, fontWeight: 'bold' }}>{count}</Text>
        <Text style={{ fontSize: 20, color: '#666' }}>Doubled: {doubled}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable onPress={() => count.value--} style={{ padding: 15, paddingHorizontal: 30, backgroundColor: '#dc3545', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>-</Text>
          </Pressable>
          <Pressable onPress={() => count.value = 0} style={{ padding: 15, paddingHorizontal: 30, backgroundColor: '#6c757d', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 16 }}>Reset</Text>
          </Pressable>
          <Pressable onPress={() => count.value++} style={{ padding: 15, paddingHorizontal: 30, backgroundColor: '#28a745', borderRadius: 8 }}>
            <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>+</Text>
          </Pressable>
        </View>
      </View>
    )
  }

  mount(document.getElementById('counter-demo'), <Counter />)
})
</script>
-->

## Key Concepts

### Signals

```tsx
const count = signal(0)
```

Create reactive state with `signal()`. Updates automatically propagate to the UI.

### Computed Values

```tsx
const doubled = computed(() => count.value * 2)
```

Derive values that update automatically when dependencies change.

### Event Handlers

```tsx
<Pressable onPress={() => count.value++}>
  <Text>+</Text>
</Pressable>
```

Update signal values in event handlers. The UI updates automatically.

### Cross-Platform Primitives

```tsx
<View style={{ padding: 40, gap: 20 }}>
  <Text>Content</Text>
</View>
```

Use universal primitives that work on web and mobile.

## Next Steps

- Try the [Todo List Example](/examples/todo)
- Learn more about [Signals](/guide/signals)
- Explore [Primitives](/guide/primitives)
