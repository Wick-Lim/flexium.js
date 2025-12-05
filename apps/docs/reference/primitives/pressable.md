---
title: Pressable - Touch & Click Handler Component
description: API reference for Flexium's Pressable component. Handle touch and click interactions with cross-platform support.
head:
  - - meta
    - property: og:title
      content: Pressable Component - Flexium API Reference
  - - meta
    - property: og:description
      content: Pressable component for handling touch and click events. Universal interaction primitive for Flexium.
---

# Pressable

A wrapper for making views respond to touches or clicks.

## Usage

```tsx
import { Pressable, Text } from 'flexium/primitives';

function Button() {
  return (
    <Pressable
      onPress={() => console.log('Pressed')}
      style={{ padding: 10, backgroundColor: 'blue' }}
    >
      <Text style={{ color: 'white' }}>Click Me</Text>
    </Pressable>
  );
}
```

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `any` | Content to be made pressable. |
| `onPress` | `() => void` | Called when a single tap/click is detected. |
| `onPressIn` | `() => void` | Called when a touch is activated. |
| `onPressOut` | `() => void` | Called when a touch is deactivated. |
| `disabled` | `boolean` | Whether the press interaction is disabled. |
| `style` | `object` | Container styles. |
