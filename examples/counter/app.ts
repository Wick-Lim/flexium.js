/**
 * Flexium Counter Example
 *
 * This example demonstrates:
 * - signal() for reactive state
 * - Layout primitives (Column, Row)
 * - UI components (Text, Button)
 * - Event handling
 * - Fine-grained reactivity (only count updates, not full re-render)
 */

import { signal } from 'flexium'
import { render, Column, Row, Button, Text } from 'flexium/dom'

function Counter() {
  // Create a reactive signal
  const count = signal(0)

  // Handlers
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = 0

  return (
    <Column
      gap={24}
      padding={48}
      align="center"
    >
      {/* Header */}
      <Text
        fontSize={32}
        fontWeight="bold"
        color="#667eea"
      >
        Flexium Counter
      </Text>

      {/* Counter Display */}
      <Column
        align="center"
        gap={8}
      >
        <Text fontSize={14} color="#666">
          Current Count
        </Text>
        <Text
          fontSize={64}
          fontWeight="bold"
          color="#333"
        >
          {count.value}
        </Text>
      </Column>

      {/* Controls */}
      <Row gap={12}>
        <Button
          onPress={decrement}
          backgroundColor="#ef4444"
          color="white"
          padding="12px 24px"
          borderRadius={8}
          border="none"
          fontSize={16}
          cursor="pointer"
          hover={{ backgroundColor: '#dc2626' }}
        >
          - Decrement
        </Button>

        <Button
          onPress={reset}
          backgroundColor="#6b7280"
          color="white"
          padding="12px 24px"
          borderRadius={8}
          border="none"
          fontSize={16}
          cursor="pointer"
          hover={{ backgroundColor: '#4b5563' }}
        >
          Reset
        </Button>

        <Button
          onPress={increment}
          backgroundColor="#10b981"
          color="white"
          padding="12px 24px"
          borderRadius={8}
          border="none"
          fontSize={16}
          cursor="pointer"
          hover={{ backgroundColor: '#059669' }}
        >
          + Increment
        </Button>
      </Row>

      {/* Info */}
      <Text fontSize={12} color="#999" textAlign="center" maxWidth={400}>
        Try clicking the buttons. Notice how only the count updates,
        not the entire component. This is fine-grained reactivity!
      </Text>
    </Column>
  )
}

// Render to DOM
render(<Counter />, document.getElementById('app')!)
