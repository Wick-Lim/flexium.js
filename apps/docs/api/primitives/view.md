# View

A fundamental container component for building UIs. 
It renders a `<div>` on the web and a `<View>` in React Native (via adapter).

## Props

- `style`: Style object or array.
- `class`: CSS class name.
- `children`: Child components.

## Usage

```tsx
import { View, Text } from 'flexium';

<View style={{ padding: 20, backgroundColor: '#f0f0f0' }}>
  <Text>Inside a View</Text>
</View>
```
