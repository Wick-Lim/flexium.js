# Flexium API Documentation

Complete API reference for Flexium v1.0.

## Table of Contents

- [Core Reactivity](#core-reactivity)
  - [signal()](#signal)
  - [computed()](#computed)
  - [effect()](#effect)
- [Layout Primitives](#layout-primitives)
  - [Row](#row)
  - [Column](#column)
  - [Stack](#stack)
  - [Grid](#grid)
- [UI Components](#ui-components)
  - [Text](#text)
  - [Button](#button)
  - [Input](#input)
- [UX Components](#ux-components)
  - [Motion](#motion)
  - [Form](#form)
- [Rendering](#rendering)
  - [render()](#render)

---

## Core Reactivity

### signal()

Creates a reactive primitive value that automatically triggers updates when changed.

```typescript
function signal<T>(initialValue: T): Signal<T>
```

**Parameters:**
- `initialValue: T` - The initial value of the signal

**Returns:**
- `Signal<T>` - A signal object with a `.value` property

**Example:**

```typescript
import { signal } from 'flexium'

// Create a signal
const count = signal(0)

// Read the value
console.log(count.value) // 0

// Update the value
count.value = 10

// Subscribe to changes
count.subscribe((newValue) => {
  console.log('Count changed:', newValue)
})
```

**Key Features:**
- Fine-grained reactivity - only dependent code re-runs
- No Virtual DOM - direct DOM updates
- Memory efficient - < 1KB per signal
- Fast updates - < 0.1ms for 1000 signals

**Best Practices:**

```typescript
// Good - update signal value
const count = signal(0)
count.value++

// Bad - don't mutate objects directly
const user = signal({ name: 'Alice' })
user.value.name = 'Bob' // Won't trigger update!

// Good - create new object
user.value = { ...user.value, name: 'Bob' }

// Good - for arrays
const items = signal([1, 2, 3])
items.value = [...items.value, 4]
```

---

### computed()

Creates a derived value that automatically updates when its dependencies change.

```typescript
function computed<T>(fn: () => T): ComputedSignal<T>
```

**Parameters:**
- `fn: () => T` - Function that computes the derived value

**Returns:**
- `ComputedSignal<T>` - A read-only signal with computed value

**Example:**

```typescript
import { signal, computed } from 'flexium'

const count = signal(0)
const doubled = computed(() => count.value * 2)
const message = computed(() => `Count is ${count.value}`)

console.log(doubled.value) // 0
count.value = 5
console.log(doubled.value) // 10
console.log(message.value) // "Count is 5"
```

**Advanced Usage:**

```typescript
// Multiple dependencies
const firstName = signal('John')
const lastName = signal('Doe')
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// Chaining computed values
const todos = signal([...])
const remaining = computed(() => todos.value.filter(t => !t.done).length)
const allDone = computed(() => remaining.value === 0)

// Performance - computed values are memoized
const expensive = computed(() => {
  // This only runs when dependencies change
  return heavyComputation(data.value)
})
```

**Best Practices:**
- Keep computed functions pure (no side effects)
- Avoid async operations in computed
- Use for derived UI state, not side effects

---

### effect()

Runs a function when its dependencies change. Use for side effects like logging, localStorage, or API calls.

```typescript
function effect(fn: () => void | (() => void)): () => void
```

**Parameters:**
- `fn: () => void | (() => void)` - Effect function, optionally returns cleanup function

**Returns:**
- `() => void` - Cleanup function to stop the effect

**Example:**

```typescript
import { signal, effect } from 'flexium'

const count = signal(0)

// Basic effect
effect(() => {
  console.log('Count is now:', count.value)
})

// Effect with cleanup
effect(() => {
  const interval = setInterval(() => {
    console.log(count.value)
  }, 1000)

  // Cleanup function
  return () => clearInterval(interval)
})

// Manual cleanup
const stopEffect = effect(() => {
  document.title = `Count: ${count.value}`
})

// Later...
stopEffect() // Stop updating document title
```

**Common Use Cases:**

```typescript
// localStorage sync
effect(() => {
  localStorage.setItem('count', count.value.toString())
})

// API calls
effect(() => {
  if (userId.value) {
    fetch(`/api/users/${userId.value}`)
      .then(res => res.json())
      .then(data => userData.value = data)
  }
})

// DOM manipulation
effect(() => {
  if (isModalOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Analytics
effect(() => {
  analytics.track('page_view', {
    path: currentPath.value
  })
})
```

**Best Practices:**
- Always return cleanup functions for subscriptions/timers
- Avoid infinite loops (don't update signals read in the effect)
- Use for side effects, not for derived values (use `computed` instead)

---

## Layout Primitives

### Row

Horizontal flex layout container.

```typescript
interface RowProps extends FlexProps {
  gap?: number | string
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
  wrap?: boolean
  // ...all style props
}
```

**Example:**

```typescript
import { Row, Text, Button } from 'flexium/dom'

<Row gap={16} align="center" justify="space-between" padding={20}>
  <Text>Left content</Text>
  <Button>Action</Button>
</Row>

// Responsive gap
<Row gap={{ base: 8, md: 16, lg: 24 }}>
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Row>

// Wrapping row
<Row wrap gap={12}>
  {items.value.map(item => <Card>{item}</Card>)}
</Row>
```

**Style Props:**

All layout components accept inline style props:

```typescript
<Row
  padding={20}
  margin={10}
  backgroundColor="#fff"
  borderRadius={8}
  border="1px solid #ddd"
  boxShadow="0 2px 4px rgba(0,0,0,0.1)"
  width="100%"
  maxWidth={1200}
  hover={{ backgroundColor: '#f9f9f9' }}
  active={{ transform: 'scale(0.98)' }}
>
  Content
</Row>
```

---

### Column

Vertical flex layout container.

```typescript
interface ColumnProps extends FlexProps {
  gap?: number | string
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch'
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
  // ...all style props
}
```

**Example:**

```typescript
import { Column, Text } from 'flexium/dom'

<Column gap={12} padding={24} backgroundColor="white">
  <Text fontSize={24} fontWeight="bold">Title</Text>
  <Text color="#666">Description</Text>
</Column>

// Centered column
<Column align="center" justify="center" minHeight="100vh">
  <Text>Centered content</Text>
</Column>

// Full height sidebar
<Column gap={16} padding={20} backgroundColor="#f5f5f5" minHeight="100vh">
  <Text>Menu Item 1</Text>
  <Text>Menu Item 2</Text>
</Column>
```

---

### Stack

Overlapping layers with absolute positioning.

```typescript
interface StackProps extends BaseProps {
  // Children are stacked on top of each other
  // ...all style props
}
```

**Example:**

```typescript
import { Stack, Image, Text } from 'flexium/dom'

<Stack position="relative" width={400} height={300}>
  <Image src="background.jpg" width="100%" height="100%" />
  <Text
    position="absolute"
    top={20}
    left={20}
    color="white"
    fontSize={32}
    fontWeight="bold"
  >
    Overlay Text
  </Text>
</Stack>

// Card with badge
<Stack>
  <Card>Product Card</Card>
  <Text
    position="absolute"
    top={-10}
    right={-10}
    backgroundColor="red"
    color="white"
    padding="4px 8px"
    borderRadius={12}
  >
    Sale
  </Text>
</Stack>
```

---

### Grid

Responsive grid layout.

```typescript
interface GridProps extends BaseProps {
  cols?: number | ResponsiveValue<number>
  rows?: number | ResponsiveValue<number>
  gap?: number | string
  colGap?: number | string
  rowGap?: number | string
  // ...all style props
}

type ResponsiveValue<T> = {
  base?: T
  sm?: T  // 640px+
  md?: T  // 768px+
  lg?: T  // 1024px+
  xl?: T  // 1280px+
}
```

**Example:**

```typescript
import { Grid, Card } from 'flexium/dom'

// Responsive grid
<Grid
  cols={{ base: 1, sm: 2, lg: 3, xl: 4 }}
  gap={20}
  padding={20}
>
  {items.value.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</Grid>

// Fixed grid
<Grid cols={3} rows={2} gap={16}>
  <Card>1</Card>
  <Card>2</Card>
  <Card>3</Card>
  <Card>4</Card>
  <Card>5</Card>
  <Card>6</Card>
</Grid>

// Asymmetric grid
<Grid
  cols={3}
  gap={16}
  style={{
    gridTemplateColumns: '2fr 1fr 1fr'
  }}
>
  <Card>Main content</Card>
  <Card>Sidebar 1</Card>
  <Card>Sidebar 2</Card>
</Grid>
```

---

## UI Components

### Text

Styled text component with typography props.

```typescript
interface TextProps extends BaseProps {
  fontSize?: number | string
  fontWeight?: number | string
  fontFamily?: string
  color?: string
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  lineHeight?: number | string
  letterSpacing?: number | string
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textDecoration?: string
  // ...all style props
}
```

**Example:**

```typescript
import { Text } from 'flexium/dom'

<Text fontSize={24} fontWeight="bold" color="#333">
  Heading
</Text>

<Text fontSize={16} color="#666" lineHeight={1.5}>
  Body text with good readability
</Text>

<Text
  fontSize={12}
  color="#999"
  textTransform="uppercase"
  letterSpacing={1}
>
  Caption
</Text>

// Responsive text
<Text
  fontSize={{ base: 18, md: 24, lg: 32 }}
  fontWeight="bold"
>
  Responsive heading
</Text>
```

---

### Button

Interactive button with press handling and hover states.

```typescript
interface ButtonProps extends BaseProps {
  onPress?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  // ...all style props including hover/active states
}
```

**Example:**

```typescript
import { Button } from 'flexium/dom'

// Primary button
<Button
  onPress={() => console.log('clicked')}
  backgroundColor="#007bff"
  color="white"
  padding="12px 24px"
  borderRadius={8}
  border="none"
  fontSize={16}
  cursor="pointer"
  hover={{ backgroundColor: '#0056b3' }}
  active={{ transform: 'scale(0.98)' }}
>
  Click Me
</Button>

// Disabled button
<Button
  disabled
  backgroundColor="#ccc"
  color="#666"
  padding="12px 24px"
  borderRadius={8}
>
  Disabled
</Button>

// Icon button
<Button
  onPress={handleDelete}
  backgroundColor="transparent"
  color="#ef4444"
  padding={8}
  borderRadius="50%"
  hover={{ backgroundColor: '#fee2e2' }}
>
  🗑️
</Button>
```

---

### Input

Text input with controlled value.

```typescript
interface InputProps extends BaseProps {
  value?: string
  onChange?: (e: Event) => void
  onKeyPress?: (e: KeyboardEvent) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  required?: boolean
  name?: string
  // ...all style props
}
```

**Example:**

```typescript
import { signal } from 'flexium'
import { Input } from 'flexium/dom'

const email = signal('')

<Input
  value={email.value}
  onChange={(e) => email.value = e.target.value}
  type="email"
  placeholder="Enter your email"
  padding="12px 16px"
  border="1px solid #ddd"
  borderRadius={8}
  fontSize={16}
  width="100%"
/>

// With validation styling
<Input
  value={password.value}
  onChange={(e) => password.value = e.target.value}
  type="password"
  placeholder="Password"
  border={`1px solid ${isValid.value ? '#10b981' : '#ef4444'}`}
/>

// With enter key handler
<Input
  value={search.value}
  onChange={(e) => search.value = e.target.value}
  onKeyPress={(e) => {
    if (e.key === 'Enter') handleSearch()
  }}
  placeholder="Search..."
/>
```

---

## UX Components

### Motion

Declarative animations and transitions.

```typescript
interface MotionProps extends BaseProps {
  initial?: MotionState
  animate?: MotionState
  exit?: MotionState
  transition?: TransitionConfig
  hover?: MotionState
  tap?: MotionState
}

interface MotionState {
  opacity?: number
  x?: number
  y?: number
  scale?: number
  rotate?: number
  // ...transform properties
}

interface TransitionConfig {
  duration?: number
  delay?: number
  easing?: string | [number, number, number, number]
}
```

**Example:**

```typescript
import { Motion } from 'flexium/dom'

// Fade in animation
<Motion
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  <Text>Fades in</Text>
</Motion>

// Slide in from left
<Motion
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.3, easing: 'ease-out' }}
>
  <Card>Slides in</Card>
</Motion>

// Exit animation
<Motion
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
>
  {showModal.value && <Modal />}
</Motion>

// Hover animation
<Motion
  hover={{ scale: 1.05 }}
  tap={{ scale: 0.95 }}
  transition={{ duration: 0.2 }}
>
  <Button>Hover me</Button>
</Motion>

// Stagger children
<Column gap={8}>
  {items.value.map((item, i) => (
    <Motion
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: i * 0.1 }}
    >
      <Card>{item.name}</Card>
    </Motion>
  ))}
</Column>
```

**Performance:**
- Uses Web Animations API for 60fps performance
- GPU-accelerated transforms (x, y, scale, rotate, opacity)
- Automatic cleanup on unmount

---

### Form

Form with built-in validation.

```typescript
interface FormProps extends BaseProps {
  onSubmit: (data: Record<string, any>) => void
  validation?: Record<string, (value: any) => boolean | string>
  // ...all style props
}
```

**Example:**

```typescript
import { Form, Input, Button, Column } from 'flexium/dom'

<Form
  onSubmit={(data) => {
    console.log('Form submitted:', data)
  }}
  validation={{
    email: (v) => /\S+@\S+\.\S+/.test(v) || 'Invalid email',
    password: (v) => v.length >= 8 || 'Must be 8+ characters',
    age: (v) => v >= 18 || 'Must be 18 or older'
  }}
>
  <Column gap={16} padding={24}>
    <Input
      name="email"
      type="email"
      placeholder="Email"
      required
    />

    <Input
      name="password"
      type="password"
      placeholder="Password"
      required
    />

    <Input
      name="age"
      type="number"
      placeholder="Age"
    />

    <Button type="submit">
      Submit
    </Button>
  </Column>
</Form>
```

**Validation Features:**
- Real-time validation on blur
- Custom error messages
- Async validators supported
- Accessible error announcements

**Advanced Usage:**

```typescript
// Async validation
<Form
  validation={{
    username: async (v) => {
      const available = await checkUsernameAvailable(v)
      return available || 'Username taken'
    }
  }}
>
  ...
</Form>

// Dependent validation
<Form
  validation={{
    password: (v) => v.length >= 8 || 'Too short',
    confirmPassword: (v, formData) =>
      v === formData.password || 'Passwords must match'
  }}
>
  ...
</Form>
```

---

## Rendering

### render()

Renders a Flexium component to a target element or canvas.

```typescript
// DOM rendering
function render(
  component: JSX.Element,
  target: HTMLElement
): () => void

// Canvas rendering
function render(
  component: JSX.Element,
  canvas: HTMLCanvasElement,
  options?: CanvasRenderOptions
): () => void
```

**DOM Example:**

```typescript
import { render } from 'flexium/dom'

function App() {
  return <Column><Text>Hello</Text></Column>
}

// Render to existing element
const unmount = render(<App />, document.getElementById('root')!)

// Later...
unmount() // Remove from DOM
```

**Canvas Example:**

```typescript
import { render } from 'flexium/canvas'

function Game() {
  return (
    <Column width={800} height={600}>
      <Rect x={100} y={100} width={50} height={50} fill="blue" />
    </Column>
  )
}

const canvas = document.getElementById('game') as HTMLCanvasElement
render(<Game />, canvas, {
  antialias: true,
  pixelRatio: window.devicePixelRatio
})
```

**React Native Example:**

```typescript
import { render } from 'flexium/native'
import { AppRegistry } from 'react-native'

function MobileApp() {
  return (
    <Column>
      <Text>Mobile App</Text>
    </Column>
  )
}

AppRegistry.registerComponent('MyApp', () => {
  return (props) => render(<MobileApp />, props.rootTag)
})
```

---

## TypeScript Support

Flexium is written in TypeScript and provides full type safety.

```typescript
// Typed signals
const count = signal<number>(0)
const user = signal<User | null>(null)

// Typed props
interface CardProps {
  title: string
  description?: string
}

function Card({ title, description }: CardProps) {
  return (
    <Column gap={8}>
      <Text fontWeight="bold">{title}</Text>
      {description && <Text>{description}</Text>}
    </Column>
  )
}

// Generic components
function List<T>({ items, renderItem }: {
  items: T[]
  renderItem: (item: T) => JSX.Element
}) {
  return (
    <Column gap={8}>
      {items.map(renderItem)}
    </Column>
  )
}
```

---

## Next Steps

- Check out the [examples](/examples) for real-world usage
- Read the [Migration Guide](/docs/MIGRATION.md) if coming from React
- Join our [Discord community](https://discord.gg/flexium) for support
- Contribute on [GitHub](https://github.com/flexium/flexium)
