/**
 * Flexium Counter Example - Beginner Level
 *
 * A simple counter app demonstrating Flexium's core reactivity features.
 * Perfect for learning the basics of signal-based state management.
 *
 * What you'll learn:
 * - signal() for reactive state
 * - Layout primitives (Column, Row)
 * - UI components (Text, Button)
 * - Event handling
 * - Fine-grained reactivity (only count updates, not full re-render)
 *
 * Key Concept: When count.value changes, ONLY the Text element displaying
 * the count updates. The entire component doesn't re-render like in React.
 * This is fine-grained reactivity in action!
 */

import { signal } from 'flexium'
import { render, Column, Row, Button, Text } from 'flexium/dom'

function Counter() {
  // ========================================
  // STATE: Create a reactive signal
  // ========================================

  /**
   * signal() creates a reactive primitive value.
   * - Reading count.value will automatically track dependencies
   * - Writing count.value will trigger updates in the UI
   * - No setState() or complex update logic needed!
   */
  const count = signal(0)

  // ========================================
  // EVENT HANDLERS: Define actions
  // ========================================

  /**
   * Event handlers are just regular functions that modify signals.
   * When they update count.value, Flexium automatically updates
   * only the parts of the UI that depend on count.
   */
  const increment = () => count.value++   // Direct mutation - simple and clear
  const decrement = () => count.value--   // No setState(), no dispatch()
  const reset = () => count.value = 0     // Just assign the new value

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
