# Type Reference

Complete reference for all TypeScript types exported by Flexium.

## Core Types

### FNode

The Flexium Node - a lightweight element descriptor for JSX. This is not a Virtual DOM, just a simple descriptor that gets immediately converted to real DOM.

```typescript
interface FNode {
  type: string | Function
  props: Record<string, unknown>
  children: FNodeChild[]
  key?: string | number
  _node?: RenderNode // Internal reference to the rendered node
}
```

**Properties:**
- `type` - The element type (HTML tag name or component function)
- `props` - Properties/attributes for the element
- `children` - Array of child nodes
- `key` - Optional key for reconciliation (list rendering)
- `_node` - Internal reference to the rendered platform-specific node

**Usage:**
```tsx
// Created automatically by JSX:
const node = <div class="container">Hello</div>
// Results in FNode { type: 'div', props: { class: 'container' }, children: ['Hello'] }
```

**Related:** `FNodeChild`, `FNode`

### FNodeChild

Valid child types that can be rendered.

```typescript
type FNodeChild =
  | FNode
  | string
  | number
  | boolean
  | null
  | undefined
  | FNodeChild[]
```

**Usage:**
```tsx
function MyComponent(): FNodeChild {
  return <div>Hello</div> // FNode
  // Or: return "Hello" // string
  // Or: return 42 // number
  // Or: return null // null
}
```

**Related:** `FNode`, `FNodeChild`

## Reactivity Types

### StateValue (Proxy)

Reactive primitive that notifies subscribers on change. In Flexium, state is wrapped in a Proxy.

```typescript
type StateValue<T> = T & {
  set(value: T): void
  valueOf(): T
  peek(): T
}
```

**Properties:**
- `set(value)` - Update the value
- `valueOf()` - Get the raw value (useful for primitive comparisons)
- `peek()` - Read value without tracking dependency
- `[key]` - Access properties of T directly (reactive)

**Usage:**
```tsx
import { use } from 'flexium/core'

const [count, setCount] = use(0)

// Read value (tracks dependency)
console.log(count) // 0
console.log(count + 1) // 1 (implicit coercion works in some cases, but  is safer)

// Update value
setCount(count + 1)
setCount(5)

// Read without tracking
const current = count
```

**Related:** `Computed`, `use()`, `use()`

### Computed

Derived state that automatically recomputes when dependencies change. Returned as a Readonly StateValue.

```typescript
type Computed<T> = Readonly<StateValue<T>>
```

**Properties:**
- `valueOf()` - Get the computed value (reactive)
- `peek()` - Read value without tracking dependency
- `[key]` - Access properties of T directly (reactive)

**Usage:**
```tsx
import { use } from 'flexium/core'

const [count, setCount] = use(1)
const [doubled] = use(() => count * 2)

console.log(doubled) // 2
setCount(5)
console.log(doubled) // 10
```

**Related:** `StateValue`, `use()`

### Resource

Interface for async data with loading states. Attached to the StateValue proxy.

```typescript
type Resource<T> = StateValue<T | undefined> & {
  loading: StateValue<boolean>
  error: StateValue<any>
  status: StateValue<'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'>
  latest: StateValue<T | undefined>
  refetch(): Promise<void>
}
```

**Properties:**
- `valueOf()` - Current data (undefined while loading)
- `loading` - True if currently fetching (reactive)
- `error` - Error object if failed (reactive)
- `status` - Current resource state (reactive)
- `latest` - Latest successfully loaded value (reactive)
- `refetch()` - Manually trigger a refresh

**Usage:**
```tsx
import { use } from 'flexium/core'
// use() handles async functions as resources
const [user, setUser] = use(async () => fetchUser(userId))

return () => {
  if (user.status === 'loading') return <div>Loading...</div>
  if (user.error) return <div>Error: {user.error.message}</div>
  return <div>{user.name}</div>
}
```

**Related:** `use()`, `StateValue`

## Component Types

### Component

Component function type.

```typescript
type Component<P = Record<string, unknown>> = (props: P) => FNode | null
```

**Usage:**
```tsx
const Button: Component<{ label: string; onClick: () => void }> = (props) => {
  return <button onclick={props.onClick}>{props.label}</button>
}
```

### PropsWithChildren

Generic props interface that includes children.

```typescript
interface PropsWithChildren<P = unknown> {
  children?: Children
  [key: string]: P | Children | undefined
}
```

**Usage:**
```tsx
interface CardProps extends PropsWithChildren<string | number> {
  title: string
}

function Card(props: CardProps) {
  return (
    <div>
      <h2>{props.title}</h2>
      {props.children}
    </div>
  )
}
```

### Children / Child

Types for child elements.

```typescript
type Child = FNode | string | number | boolean | null | undefined
type Children = Child | Child[]
```

**Usage:**
```tsx
interface ContainerProps {
  children: Children
}
```

## Context Types

### Context

Context object for sharing data across the component tree.

```typescript
interface Context<T> {
  id: symbol
  Provider: (props: { value: T; children: FNodeChild }) => FNodeChild
  defaultValue: T
}
```

**Usage:**
```tsx
import { use } from 'flexium/core'

// Share theme globally - no Provider needed
const [theme, setTheme] = use<'light' | 'dark'>('dark', { key: ['app', 'theme'] })

function ThemedComponent() {
  const [theme, setTheme] = use('light', { key: ['app', 'theme'] })
  return <div>Current theme: {theme}</div>
}
```

**Related:** `use()` with `key` option (replaces Context API)

## Router Types

### Location

Current route location information.

```typescript
interface Location {
  pathname: string
  search: string
  hash: string
  query: Record<string, string>
}
```

**Properties:**
- `pathname` - Current path (e.g., "/users/123")
- `search` - Query string (e.g., "?page=1")
- `hash` - URL hash (e.g., "#section")
- `query` - Parsed query parameters

**Usage:**
```tsx
const r = useRouter()
console.log(r.location.pathname) // "/users/123"
console.log(r.location.query) // { page: "1" }
```

### RouterContext

Router context value provided to components.

```typescript
interface RouterContext {
  location: StateValue<Location>
  params: StateValue<Record<string, string>>
  navigate: (path: string) => void
  matches: StateValue<RouteMatch[]>
}
```

**Properties:**
- `location` - Current location (reactive)
- `params` - Route parameters (reactive)
- `navigate` - Function to navigate to a path
- `matches` - Matched routes for current URL

**Usage:**
```tsx
const r = useRouter()

// Navigate
r.navigate('/users/123')

// Access params
console.log(r.params.id) // "123"
```

### RouteProps

Props for Route component.

```typescript
interface RouteProps {
  path?: string
  index?: boolean
  component: Function
  children?: FNodeChild
  beforeEnter?: (params: Record<string, string>) => boolean | Promise<boolean>
}
```

**Properties:**
- `path` - Route pattern (e.g., "/users/:id")
- `index` - If true, matches parent's path exactly
- `component` - Component to render when matched
- `children` - Nested routes
- `beforeEnter` - Guard function called before entering route

**Usage:**
```tsx
<Route path="/users/:id" component={UserDetail} />
<Route path="/dashboard" component={Dashboard}>
  <Route index component={DashboardHome} />
  <Route path="settings" component={Settings} />
</Route>
```

### LinkProps

Props for Link component.

```typescript
interface LinkProps {
  to: string
  class?: string
  children?: FNodeChild
}
```

**Usage:**
```tsx
<Link to="/about" class="nav-link">About</Link>
```

## Primitive Component Types

### TextProps

Props for the Text component.

```typescript
interface TextProps {
  children?: any
  style?: TextStyle
  onClick?: () => void
  onPress?: () => void
  class?: string
  className?: string
}
```

**Usage:**
```tsx
<Text style={{ fontSize: 16, color: 'blue' }}>Hello World</Text>
```

### ImageProps

Props for the Image component.

```typescript
interface ImageProps {
  src: string
  alt?: string
  width?: number
  height?: number
  style?: CommonStyle
  onLoad?: () => void
  onError?: () => void
}
```

**Usage:**
```tsx
<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={100}
  onLoad={() => console.log('Loaded')}
/>
```

### PressableProps

Props for the Pressable component.

```typescript
interface PressableProps {
  children?: any
  onPress: () => void
  onPressIn?: () => void
  onPressOut?: () => void
  disabled?: boolean
  style?: CommonStyle
  activeOpacity?: number
}
```

**Usage:**
```tsx
<Pressable
  onPress={() => console.log('Pressed')}
  activeOpacity={0.7}
  style={{ padding: 10 }}
>
  <Text>Press me</Text>
</Pressable>
```

### ScrollViewProps

Props for the ScrollView component.

```typescript
interface ScrollViewProps {
  children?: any
  style?: CommonStyle
  horizontal?: boolean
  showsHorizontalScrollIndicator?: boolean
  showsVerticalScrollIndicator?: boolean
}
```

**Usage:**
```tsx
<ScrollView
  horizontal
  style={{ height: 300 }}
>
  {/* Long content */}
</ScrollView>
```

## Canvas Types

### CanvasProps

Props for the Canvas container component.

```typescript
interface CanvasProps {
  width: number
  height: number
  children?: any
  style?: CommonStyle
  id?: string
}
```

**Usage:**
```tsx
<Canvas width={800} height={600}>
  <DrawRect x={10} y={10} width={100} height={50} fill="blue" />
</Canvas>
```

### DrawRectProps

Props for drawing rectangles on canvas.

```typescript
interface DrawRectProps {
  x: number | Signal<number>
  y: number | Signal<number>
  width: number | Signal<number>
  height: number | Signal<number>
  fill?: string | Signal<string>
  stroke?: string | Signal<string>
  strokeWidth?: number | Signal<number>
  opacity?: number | Signal<number>
}
```

**Usage:**
```tsx
import { use } from 'flexium/core'

const [x, setX] = use(10)
const [fill, setFill] = use('red')

<DrawRect
  x={x}
  y={20}
  width={100}
  height={50}
  fill={fill}
  stroke="black"
  strokeWidth={2}
/>
```

### DrawCircleProps

Props for drawing circles on canvas.

```typescript
interface DrawCircleProps {
  x: number | Signal<number>
  y: number | Signal<number>
  radius: number | Signal<number>
  fill?: string | Signal<string>
  stroke?: string | Signal<string>
  strokeWidth?: number | Signal<number>
  opacity?: number | Signal<number>
}
```

**Usage:**
```tsx
<DrawCircle
  x={100}
  y={100}
  radius={50}
  fill="blue"
  stroke="white"
  strokeWidth={2}
/>
```

### DrawTextProps

Props for drawing text on canvas.

```typescript
interface DrawTextProps {
  x: number | Signal<number>
  y: number | Signal<number>
  text: string | Signal<string>
  fill?: string | Signal<string>
  fontSize?: number | Signal<number>
  fontFamily?: string
  fontWeight?: 'normal' | 'bold' | number
  textAlign?: 'left' | 'center' | 'right'
  textBaseline?: 'top' | 'middle' | 'bottom' | 'alphabetic'
}
```

**Usage:**
```tsx
<DrawText
  x={100}
  y={50}
  text="Hello Canvas"
  fill="black"
  fontSize={24}
  fontFamily="Arial"
  textAlign="center"
/>
```

### DrawLineProps

Props for drawing lines on canvas.

```typescript
interface DrawLineProps {
  x1: number | Signal<number>
  y1: number | Signal<number>
  x2: number | Signal<number>
  y2: number | Signal<number>
  stroke?: string | Signal<string>
  strokeWidth?: number | Signal<number>
  opacity?: number | Signal<number>
}
```

**Usage:**
```tsx
<DrawLine
  x1={0}
  y1={0}
  x2={100}
  y2={100}
  stroke="red"
  strokeWidth={2}
/>
```

### DrawPathProps

Props for drawing SVG-like paths on canvas.

```typescript
interface DrawPathProps {
  d: string | Signal<string>
  fill?: string | Signal<string>
  stroke?: string | Signal<string>
  strokeWidth?: number | Signal<number>
  opacity?: number | Signal<number>
}
```

**Usage:**
```tsx
<DrawPath
  d="M 10 10 L 100 10 L 100 100 Z"
  fill="green"
  stroke="black"
  strokeWidth={1}
/>
```

### DrawArcProps

Props for drawing arcs on canvas.

```typescript
interface DrawArcProps {
  x: number | Signal<number>
  y: number | Signal<number>
  radius: number | Signal<number>
  startAngle: number | Signal<number>
  endAngle: number | Signal<number>
  counterclockwise?: boolean
  fill?: string | Signal<string>
  stroke?: string | Signal<string>
  strokeWidth?: number | Signal<number>
  opacity?: number | Signal<number>
}
```

**Usage:**
```tsx
<DrawArc
  x={100}
  y={100}
  radius={50}
  startAngle={0}
  endAngle={Math.PI}
  fill="purple"
/>
```

## Style Types

### CommonStyle

Platform-agnostic style properties based on Flexbox.

```typescript
interface CommonStyle {
  // Layout
  display?: 'flex' | 'none'
  flex?: number
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline'
  alignSelf?: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch'
  gap?: number

  // Spacing
  padding?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  paddingHorizontal?: number
  paddingVertical?: number
  margin?: number
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  marginHorizontal?: number
  marginVertical?: number

  // Sizing
  width?: number | string
  height?: number | string
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number

  // Visual
  backgroundColor?: string
  borderRadius?: number
  borderTopLeftRadius?: number
  borderTopRightRadius?: number
  borderBottomLeftRadius?: number
  borderBottomRightRadius?: number
  opacity?: number

  // Border
  borderWidth?: number
  borderColor?: string
  borderTopWidth?: number
  borderRightWidth?: number
  borderBottomWidth?: number
  borderLeftWidth?: number

  // Position
  position?: 'relative' | 'absolute'
  top?: number
  right?: number
  bottom?: number
  left?: number
  zIndex?: number

  // Transform
  transform?: string
}
```

**Usage:**
```tsx
const style: CommonStyle = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  padding: 16,
  backgroundColor: '#f0f0f0',
  borderRadius: 8
}

<div style={style}>Content</div>
```

### TextStyle

Text-specific style properties extending CommonStyle.

```typescript
interface TextStyle extends CommonStyle {
  color?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | number
  fontFamily?: string
  fontStyle?: 'normal' | 'italic'
  textAlign?: 'left' | 'center' | 'right' | 'justify'
  textDecoration?: 'none' | 'underline' | 'line-through'
  lineHeight?: number
  letterSpacing?: number
}
```

**Usage:**
```tsx
const textStyle: TextStyle = {
  color: '#333',
  fontSize: 16,
  fontWeight: 'bold',
  textAlign: 'center',
  lineHeight: 1.5
}

<Text style={textStyle}>Styled Text</Text>
```

## Motion Types

### AnimatableProps

Properties that can be animated with the Motion component.

```typescript
interface AnimatableProps {
  x?: number
  y?: number
  scale?: number
  scaleX?: number
  scaleY?: number
  rotate?: number // in degrees
  opacity?: number
  width?: number | string
  height?: number | string
}
```

**Usage:**
```tsx
const initial: AnimatableProps = { opacity: 0, y: 20 }
const animate: AnimatableProps = { opacity: 1, y: 0 }
```

### SpringConfig

Spring physics configuration for animations.

```typescript
interface SpringConfig {
  tension?: number  // Default: 170
  friction?: number // Default: 26
  mass?: number     // Default: 1
}
```

**Usage:**
```tsx
const spring: SpringConfig = {
  tension: 200,
  friction: 20,
  mass: 1
}
```

### MotionProps

Props for motion-enabled animations.

```typescript
interface MotionProps {
  element?: HTMLElement | null
  initial?: AnimatableProps
  animate?: AnimatableProps
  exit?: AnimatableProps
  duration?: number // in milliseconds
  spring?: SpringConfig
  easing?: string // CSS easing function
  delay?: number
  onAnimationStart?: () => void
  onAnimationComplete?: () => void
}
```

**Usage:**
```tsx
const motionProps: MotionProps = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  duration: 300,
  easing: 'ease-out',
  onAnimationComplete: () => console.log('Done')
}
```

## List Types

### ListProps

Props for the List component (efficient rendering of lists with optional virtualization).

```typescript
interface ListProps<T> {
  items: ItemsGetter<T>
  children: (item: T, index: () => number) => FNode
  virtual?: boolean
  height?: number | string
  width?: number | string
  itemSize?: number | SizeConfig
  overscan?: number
  getKey?: (item: T, index: number) => string | number
  onScroll?: (scrollTop: number) => void
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void
}
```

**Properties:**
- `items` - Data source (reactive array or getter function)
- `children` - Render function for each item
- `virtual` - Enable virtualization (default: false)
- `height` - Container height (required when virtual is true)
- `width` - Container width (optional, defaults to 100%)
- `itemSize` - Item height (required when virtual is true)
- `overscan` - Extra items to render above/below viewport (default: 3, virtual only)
- `getKey` - Key extractor for stable identity
- `onScroll` - Scroll event callback (virtual only)
- `onVisibleRangeChange` - Callback when visible range changes (virtual only)

**Usage:**
```tsx
const items = signal([...Array(10000)].map((_, i) => ({ id: i, name: `Item ${i}` })))

<List
  items={items}
  virtual
  height={400}
  itemSize={50}
  getKey={(item) => item.id}
>
  {(item, index) => (
    <div style={{ height: '50px' }}>
      {index}: {item.name}
    </div>
  )}
</List>
```

### SizeConfig

Configuration for variable-height items in List (when virtual mode enabled).

```typescript
type SizeConfig = FixedSizeConfig | VariableSizeConfig

interface FixedSizeConfig {
  mode: 'fixed'
  itemHeight: number
}

interface VariableSizeConfig {
  mode: 'variable'
  estimatedItemHeight: number
  getItemHeight?: (index: number, item: unknown) => number
}
```

**Usage:**
```tsx
// Fixed size
const fixedSize: SizeConfig = {
  mode: 'fixed',
  itemHeight: 50
}

// Variable size
const variableSize: SizeConfig = {
  mode: 'variable',
  estimatedItemHeight: 60,
  getItemHeight: (index, item) => item.expanded ? 120 : 60
}
```

## Error Handling Types

### ErrorInfo

Error information passed to error boundaries.

```typescript
interface ErrorInfo {
  componentStack?: string
  timestamp: number
}
```

**Properties:**
- `componentStack` - Stack trace of component tree
- `timestamp` - When the error occurred

### ErrorFallbackProps

Props for error fallback components.

```typescript
interface ErrorFallbackProps {
  error: Error
  errorInfo: ErrorInfo | null
  reset: () => void
  retryCount: number
}
```

**Usage:**
```tsx
function ErrorFallback(props: ErrorFallbackProps) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <p>{props.error.message}</p>
      <button onclick={props.reset}>Try Again</button>
      <small>Retry count: {props.retryCount}</small>
    </div>
  )
}

<ErrorBoundary fallback={ErrorFallback}>
  <App />
</ErrorBoundary>
```

### ErrorBoundaryProps

Props for the ErrorBoundary component.

```typescript
interface ErrorBoundaryProps {
  fallback: FNodeChild | ((props: ErrorFallbackProps) => FNode | null)
  children: FNodeChild
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  onReset?: () => void
}
```

**Usage:**
```tsx
<ErrorBoundary
  fallback={({ error, reset }) => (
    <div>
      <p>Error: {error.message}</p>
      <button onclick={reset}>Retry</button>
    </div>
  )}
  onError={(error, info) => {
    console.error('Caught error:', error)
    logToService(error, info)
  }}
>
  <MyApp />
</ErrorBoundary>
```

## Event Types

### EventHandler

Generic event handler type.

```typescript
type EventHandler = (event: Event) => void
```

**Usage:**
```tsx
const handleClick: EventHandler = (event) => {
  console.log('Clicked:', event.target)
}

<button onclick={handleClick}>Click me</button>
```

## Renderer Types

### Renderer

Core renderer interface that platform-specific renderers must implement.

```typescript
interface Renderer {
  createNode(type: string, props: Record<string, unknown>): RenderNode
  updateNode(node: RenderNode, oldProps: Record<string, unknown>, newProps: Record<string, unknown>): void
  appendChild(parent: RenderNode, child: RenderNode): void
  insertBefore(parent: RenderNode, child: RenderNode, beforeChild: RenderNode | null): void
  removeChild(parent: RenderNode, child: RenderNode): void
  createTextNode(text: string): RenderNode
  updateTextNode(node: RenderNode, text: string): void
  addEventListener(node: RenderNode, event: string, handler: EventHandler): void
  removeEventListener(node: RenderNode, event: string, handler: EventHandler): void
}
```

This interface is used internally by Flexium to support multiple rendering targets (DOM, Canvas, etc.).

### RenderNode

Platform-specific node type.

```typescript
type RenderNode = any
```

This is intentionally `any` to allow flexibility across different platforms (DOM Node, Canvas, React Native, etc.).

## Utility Types

### RenderableNode

Types that can be rendered reactively.

```typescript
type RenderableNode =
  | FNode
  | string
  | number
  | boolean
  | null
  | undefined
  | Signal<unknown>
  | Computed<unknown>
  | RenderFunction
  | RenderableNode[]
```

### RenderFunction

Function that returns renderable content.

```typescript
type RenderFunction = () => Child | Children
```

**Usage:**
```tsx
const renderContent: RenderFunction = () => {
  return <div>Dynamic content</div>
}
```

### StateGetter

Function that returns a value (similar to signal getter).

```typescript
type StateGetter<T> = () => T
```

**Usage:**
```tsx
const getItems: StateGetter<Item[]> = () => items
```

## JSX Types

### JSX.Element

The result type of JSX expressions.

```typescript
namespace JSX {
  type Element = FNode
}
```

### JSX.IntrinsicAttributes

Props valid for all JSX elements.

```typescript
namespace JSX {
  interface IntrinsicAttributes {
    key?: string | number
  }
}
```

### HTMLAttributes

Base HTML attributes available on all elements.

```typescript
interface HTMLAttributes {
  key?: string | number
  id?: string
  class?: string
  className?: string
  style?: string | Record<string, any>
  title?: string
  // ... and many more standard HTML attributes

  // Event handlers
  onclick?: (event: MouseEvent) => void
  oninput?: (event: Event) => void
  // ... and all other DOM events

  // Children
  children?: any
}
```

See the [JSX documentation](/guide/jsx) for complete list of supported HTML attributes.

## Type Guards

### isSignal

Check if a value is a signal or computed.

```typescript
function isSignal(value: any): value is Signal<any> | Computed<any>
```

**Usage:**
```tsx
const value = signal(42)
if (isSignal(value)) {
  console.log(value) // TypeScript knows this is a Signal
}
```

## Deprecated Types

The following types are deprecated but maintained for backward compatibility:

- `FNode` - Flexium Node
- `FNodeChild` - Child of a Flexium Node

## See Also

- [Core API Guide](/guide/state)
- [Component Guide](/guide/jsx)
- [Router Guide](/guide/router)
- [Canvas Guide](/guide/canvas)
- [TypeScript Guide](/guide/typescript)
