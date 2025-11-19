# Quick Start: DOM Renderer

This guide will help you get started with the Flexium DOM renderer.

## Installation

```bash
npm install flexium
# or
yarn add flexium
# or
pnpm add flexium
```

## Basic Setup

### 1. Configure TypeScript for JSX

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h",
    "jsxFragmentFactory": "Fragment"
  }
}
```

### 2. Create Your First Component

```typescript
// app.tsx
import { signal } from 'flexium';
import { h } from 'flexium/dom';

function Counter() {
  const count = signal(0);

  return (
    <div
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}
    >
      <span style={{ fontSize: '24px' }}>
        Count: {count.value}
      </span>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => count.value--}>-</button>
        <button onClick={() => count.value++}>+</button>
      </div>
    </div>
  );
}
```

### 3. Render to DOM

```typescript
// main.tsx
import { createReactiveRoot } from 'flexium/dom';
import { App } from './app';

const root = createReactiveRoot(document.getElementById('root')!);
root.render(<App />);
```

## Using Platform-Agnostic Components

Instead of HTML elements, use Flexium's platform-agnostic primitives:

```typescript
import { h } from 'flexium/dom';

function App() {
  const count = signal(0);

  return (
    <Column gap={16} padding={24}>
      <Text fontSize={24}>Count: {count.value}</Text>
      <Row gap={8}>
        <Button onPress={() => count.value--}>-</Button>
        <Button onPress={() => count.value++}>+</Button>
      </Row>
    </Column>
  );
}
```

These components will work across all renderers (DOM, Canvas, React Native).

## Component Reference

### Layout Components

#### Row
Horizontal flex layout:
```typescript
<Row
  gap={16}                    // Space between children
  padding={24}                // Inner padding
  justifyContent="center"     // Horizontal alignment
  alignItems="center"         // Vertical alignment
  bg="#f5f5f5"               // Background color
>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Row>
```

#### Column
Vertical flex layout:
```typescript
<Column
  gap={8}
  padding={24}
  alignItems="stretch"
  bg="white"
>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Column>
```

#### Stack
Overlapping layers:
```typescript
<Stack>
  <Image src="background.jpg" />
  <Text position="absolute" top={20} left={20}>
    Overlay Text
  </Text>
</Stack>
```

### Content Components

#### Text
Displays text:
```typescript
<Text
  fontSize={18}
  fontWeight="bold"
  color="#333"
  textAlign="center"
>
  Hello World
</Text>
```

#### Button
Interactive button:
```typescript
<Button
  onPress={() => console.log('clicked')}
  padding={12}
  bg="#4dabf7"
  color="white"
  borderRadius={4}
>
  Click Me
</Button>
```

#### Input
Text input field:
```typescript
<Input
  type="text"
  value={text.value}
  onChange={(e) => text.value = e.target.value}
  placeholder="Enter text..."
  padding={8}
  borderRadius={4}
/>
```

## Reactivity Examples

### Basic Signal

```typescript
import { signal } from 'flexium';

function Example() {
  const name = signal('World');

  return (
    <Column gap={16}>
      <Text>Hello, {name.value}!</Text>
      <Input
        value={name.value}
        onChange={(e) => name.value = e.target.value}
      />
    </Column>
  );
}
```

### Computed Values

```typescript
import { signal, computed } from 'flexium';

function Calculator() {
  const a = signal(5);
  const b = signal(3);
  const sum = computed(() => a.value + b.value);

  return (
    <Column gap={16}>
      <Text>Sum: {sum.value}</Text>
      <Input
        type="number"
        value={a.value}
        onChange={(e) => a.value = Number(e.target.value)}
      />
      <Input
        type="number"
        value={b.value}
        onChange={(e) => b.value = Number(e.target.value)}
      />
    </Column>
  );
}
```

### Effects

```typescript
import { signal, effect } from 'flexium';

function Logger() {
  const count = signal(0);

  // Run side effects when count changes
  effect(() => {
    console.log('Count changed to:', count.value);

    // Cleanup function (optional)
    return () => {
      console.log('Cleaning up');
    };
  });

  return (
    <Button onPress={() => count.value++}>
      Increment ({count.value})
    </Button>
  );
}
```

### Batching Updates

```typescript
import { signal, batch } from 'flexium';

function BatchExample() {
  const firstName = signal('John');
  const lastName = signal('Doe');

  const updateName = () => {
    // Both updates happen together - only one re-render
    batch(() => {
      firstName.value = 'Jane';
      lastName.value = 'Smith';
    });
  };

  return (
    <Column gap={16}>
      <Text>{firstName.value} {lastName.value}</Text>
      <Button onPress={updateName}>Update Name</Button>
    </Column>
  );
}
```

## Common Patterns

### Form with Validation

```typescript
import { signal, computed } from 'flexium';

function LoginForm() {
  const email = signal('');
  const password = signal('');

  const isValid = computed(() => {
    return email.value.includes('@') && password.value.length >= 8;
  });

  const handleSubmit = () => {
    if (isValid.value) {
      console.log('Logging in...', { email: email.value });
    }
  };

  return (
    <Column gap={16} padding={24}>
      <Input
        type="email"
        placeholder="Email"
        value={email.value}
        onChange={(e) => email.value = e.target.value}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password.value}
        onChange={(e) => password.value = e.target.value}
      />
      <Button
        onPress={handleSubmit}
        disabled={!isValid.value}
        opacity={isValid.value ? 1 : 0.5}
      >
        Login
      </Button>
    </Column>
  );
}
```

### List Rendering

```typescript
import { signal } from 'flexium';

function TodoList() {
  const todos = signal([
    { id: 1, text: 'Learn Flexium', done: false },
    { id: 2, text: 'Build app', done: false },
  ]);

  const addTodo = (text: string) => {
    todos.value = [
      ...todos.value,
      { id: Date.now(), text, done: false }
    ];
  };

  const toggleTodo = (id: number) => {
    todos.value = todos.value.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    );
  };

  return (
    <Column gap={8}>
      {todos.value.map(todo => (
        <Row key={todo.id} gap={8}>
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => toggleTodo(todo.id)}
          />
          <Text
            textDecoration={todo.done ? 'line-through' : 'none'}
          >
            {todo.text}
          </Text>
        </Row>
      ))}
    </Column>
  );
}
```

### Conditional Rendering

```typescript
import { signal } from 'flexium';

function ConditionalExample() {
  const showDetails = signal(false);

  return (
    <Column gap={16}>
      <Button onPress={() => showDetails.value = !showDetails.value}>
        Toggle Details
      </Button>

      {showDetails.value && (
        <Column gap={8} padding={16} bg="#f0f0f0">
          <Text>Detail 1</Text>
          <Text>Detail 2</Text>
          <Text>Detail 3</Text>
        </Column>
      )}
    </Column>
  );
}
```

## Performance Tips

### 1. Use Signals for Local State
```typescript
// ✅ Good - fine-grained updates
const count = signal(0);

// ❌ Avoid - causes re-renders
const [count, setCount] = useState(0);
```

### 2. Batch Multiple Updates
```typescript
// ✅ Good - single update
batch(() => {
  count.value++;
  name.value = 'new';
});

// ❌ Avoid - multiple updates
count.value++;
name.value = 'new';
```

### 3. Use Computed for Derived Values
```typescript
// ✅ Good - memoized
const doubled = computed(() => count.value * 2);

// ❌ Avoid - recalculates on every access
const doubled = count.value * 2;
```

### 4. Peek for Non-Reactive Reads
```typescript
effect(() => {
  // ✅ Good - doesn't create dependency
  console.log('Initial:', count.peek());

  // ❌ Avoid - creates unnecessary dependency
  console.log('Initial:', count.value);
});
```

## Next Steps

- Read [Renderer Architecture](./RENDERER_ARCHITECTURE.md) for deep dive
- Check [Signal System](./SIGNAL_SYSTEM.md) for reactivity details
- Explore [Examples](/examples) for complete applications
- See [API Reference](./API.md) for full API documentation

## Troubleshooting

### JSX not working
Make sure your `tsconfig.json` has the correct JSX settings:
```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h"
  }
}
```

### Signals not updating
Check that you're accessing `.value` property:
```typescript
// ✅ Correct
const count = signal(0);
count.value++;

// ❌ Wrong
count++;
```

### Event handlers not firing
Use `onPress` instead of `onClick` for platform-agnostic events:
```typescript
// ✅ Correct
<Button onPress={() => console.log('clicked')}>

// ❌ Wrong (DOM-specific)
<Button onClick={() => console.log('clicked')}>
```
