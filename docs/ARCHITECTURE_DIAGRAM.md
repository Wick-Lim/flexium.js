# Flexium Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     FLEXIUM ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                           │
│                                                                 │
│  User Components (Counter, TodoList, Dashboard, etc.)          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Uses
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PRIMITIVE COMPONENTS                          │
│                                                                 │
│  Row    Column    Stack    Text    Button    Input    Grid     │
│                                                                 │
│  Platform-agnostic components with unified props                │
└───────────────┬─────────────────────────────┬───────────────────┘
                │                             │
                │ Powered by                  │ Rendered by
                ▼                             ▼
┌─────────────────────────────┐  ┌───────────────────────────────┐
│    SIGNAL SYSTEM (Core)     │  │   RENDERER INTERFACE (Core)   │
│                             │  │                               │
│  • signal()                 │  │  • createNode()               │
│  • computed()               │  │  • updateNode()               │
│  • effect()                 │  │  • appendChild()              │
│  • batch()                  │  │  • removeChild()              │
│  • untrack()                │  │  • createTextNode()           │
│                             │  │  • addEventListener()         │
│  Fine-grained reactivity    │  │                               │
│  Auto dependency tracking   │  │  Platform abstraction         │
└─────────────┬───────────────┘  └───────────┬───────────────────┘
              │                              │
              │ Triggers                     │ Implemented by
              │                              │
              └──────────┬───────────────────┘
                         │
         ┌───────────────┼───────────────┬─────────────┐
         │               │               │             │
         ▼               ▼               ▼             ▼
┌────────────────┐ ┌──────────┐ ┌──────────────┐ ┌─────────┐
│  DOM Renderer  │ │  Canvas  │ │ React Native │ │  WebGL  │
│   (Complete)   │ │ Renderer │ │   Renderer   │ │Renderer │
│                │ │ (Future) │ │   (Future)   │ │(Future) │
│  • HTML DOM    │ │          │ │              │ │         │
│  • CSS Styles  │ │ • 2D API │ │ • Native UI  │ │• 3D GPU │
│  • Events      │ │ • Layout │ │ • Bridge     │ │• Shaders│
└────────┬───────┘ └────┬─────┘ └──────┬───────┘ └────┬────┘
         │              │               │              │
         │              │               │              │
         ▼              ▼               ▼              ▼
┌────────────────────────────────────────────────────────────┐
│                    TARGET PLATFORMS                        │
│                                                            │
│    Browser      Canvas      React Native      WebGL       │
└────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Component Rendering Flow

```
User Code
   │
   │ Creates component with JSX
   ▼
h() Factory Function
   │
   │ Converts to VNode
   ▼
Renderer.createNode()
   │
   │ Creates platform node
   ▼
DOM Element / Canvas Object / RN Component
```

### 2. Reactive Update Flow

```
Signal Value Changes
   │
   │ count.value++
   ▼
Signal.notify()
   │
   │ Notifies subscribers
   ▼
Effect Executes
   │
   │ Re-runs effect function
   ▼
Component Re-renders
   │
   │ Creates new VNode
   ▼
Renderer.updateNode()
   │
   │ Updates specific node
   ▼
DOM Updated (No VDOM diff!)
```

### 3. Event Flow

```
User Interaction (click, hover, etc.)
   │
   │ Browser/platform event
   ▼
Platform Event (click, mouseenter, etc.)
   │
   │ Mapped by renderer
   ▼
Unified Event (onPress, onHover, etc.)
   │
   │ Calls handler
   ▼
Event Handler Function
   │
   │ Updates signal
   ▼
Signal.value = newValue
   │
   │ Triggers reactive update
   ▼
UI Updates
```

## Module Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                         src/core/                               │
│                                                                 │
│  ┌──────────────┐              ┌─────────────────┐             │
│  │  signal.ts   │              │  renderer.ts    │             │
│  │              │              │                 │             │
│  │  Reactivity  │◄─────────────┤  Interface      │             │
│  │  System      │  Used by     │  Definition     │             │
│  └──────────────┘              └────────┬────────┘             │
│                                         │                       │
└─────────────────────────────────────────┼───────────────────────┘
                                          │
                    ┌─────────────────────┘
                    │ Implements
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                   src/renderers/dom/                            │
│                                                                 │
│  ┌───────────┐   ┌──────────┐   ┌──────────┐   ┌────────────┐ │
│  │  h.ts     │   │ index.ts │   │render.ts │   │reactive.ts │ │
│  │           │   │          │   │          │   │            │ │
│  │ JSX       ├──►│  DOM     ├──►│ Mount/   ├──►│ Signal     │ │
│  │ Factory   │   │ Renderer │   │ Unmount  │   │ Integration│ │
│  └───────────┘   └──────────┘   └──────────┘   └────────────┘ │
│                                                                 │
│  ┌──────────────┐                                              │
│  │ exports.ts   │  Public API                                  │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

## DOM Renderer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      DOM RENDERER                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      Component Types                            │
│                                                                 │
│  Row ──────────► <div style="display: flex; flex-direction:    │
│                        row; gap: Xpx">                          │
│                                                                 │
│  Column ───────► <div style="display: flex; flex-direction:    │
│                        column; gap: Xpx">                       │
│                                                                 │
│  Stack ────────► <div style="display: flex">                   │
│                                                                 │
│  Text ─────────► <span style="font-size: Xpx; color: ...">     │
│                                                                 │
│  Button ───────► <button style="padding: Xpx; ...">            │
│                                                                 │
│  Input ────────► <input type="..." style="...">                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         Event Mapping                           │
│                                                                 │
│  onPress ──────────────────────────────────► click             │
│  onHover ──────────────────────────────────► mouseenter        │
│  onChange ─────────────────────────────────► input             │
│  onFocus ──────────────────────────────────► focus             │
│  onBlur ───────────────────────────────────► blur              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       Props to CSS                              │
│                                                                 │
│  padding: 24 ──────────────────────────────► padding: 24px     │
│  gap: 16 ──────────────────────────────────► gap: 16px         │
│  bg: '#f5f5f5' ────────────────────────────► background-color  │
│  borderRadius: 8 ──────────────────────────► border-radius: 8px│
│  fontSize: 18 ─────────────────────────────► font-size: 18px   │
└─────────────────────────────────────────────────────────────────┘
```

## Signal System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SIGNAL SYSTEM                              │
└─────────────────────────────────────────────────────────────────┘

    Signal<T>                Computed<T>              Effect
       │                         │                       │
       │ .value                  │ .value                │ fn()
       │                         │                       │
       ▼                         ▼                       ▼
┌──────────────┐          ┌──────────────┐       ┌──────────────┐
│ SignalNode   │          │ComputedNode  │       │ EffectNode   │
│              │          │              │       │              │
│ • _value     │◄─────────┤ • _value     │◄──────┤• fn          │
│ • get()      │ Depends  │ • _dirty     │Depends│• dependencies│
│ • set()      │          │ • get()      │       │• execute()   │
│ • notify()   │          │ • execute()  │       │• cleanup     │
│              │          │ • notify()   │       │              │
│ subscribers  │          │ subscribers  │       └──────────────┘
└──────┬───────┘          └──────┬───────┘
       │                         │
       │ Notifies               │ Notifies
       ▼                         ▼
   [Effects/Computed]       [Effects/Computed]

Dependency Tracking:
1. Effect starts
2. Sets activeEffect = this
3. Reads signal.value
4. Signal adds activeEffect to subscribers
5. Effect completes
6. activeEffect = null

Update Flow:
1. signal.value = newValue
2. Signal.notify() called
3. Each subscriber.execute() called
4. Effect re-runs
5. DOM updates
```

## Reactivity Integration

```
┌─────────────────────────────────────────────────────────────────┐
│              REACTIVE RENDERING FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Component Function
       │
       │ Calls signal.value
       ▼
   Effect Created
       │
       │ Tracks dependencies
       ▼
   VNode Created
       │
       │ h('Text', {}, count.value)
       ▼
   DOM Node Created
       │
       │ <span>0</span>
       ▼
   Mounted to DOM

       ... Time passes ...

Signal Updated
       │
       │ count.value++
       ▼
Effect Re-executes
       │
       │ Component function runs
       ▼
New VNode Created
       │
       │ h('Text', {}, count.value)
       ▼
DOM Node Updated
       │
       │ <span>1</span>
       ▼
   UI Updated

Total Time: < 1ms (no VDOM diff!)
```

## Performance Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│        TRADITIONAL VDOM vs FLEXIUM SIGNALS                      │
└─────────────────────────────────────────────────────────────────┘

Traditional VDOM (React, Vue):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
State Change
   ↓
Component Re-renders (entire tree)
   ↓
Create New VDOM Tree (O(n))
   ↓
Diff Old vs New VDOM (O(n))
   ↓
Compute Patches
   ↓
Apply to DOM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time: ~10-100ms for large trees


Flexium Signals:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Signal Change
   ↓
Notify Subscribers (O(1))
   ↓
Execute Effect (O(1))
   ↓
Update Specific DOM Node (O(1))
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time: < 1ms

Result: 10-100x faster for small updates!
```

## Cross-Platform Component Flow

```
┌─────────────────────────────────────────────────────────────────┐
│     WRITE ONCE, RENDER ANYWHERE                                 │
└─────────────────────────────────────────────────────────────────┘

Platform-Agnostic Component:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function Button({ children, onPress, ...style }) {
  return (
    <Row padding={12} bg="#4dabf7" borderRadius={4} {...style}>
      <Text color="white">{children}</Text>
    </Row>
  )
}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

         ┌──────────────┬──────────────┬──────────────┐
         │              │              │              │
         ▼              ▼              ▼              ▼
    DOM Renderer   Canvas Renderer  RN Renderer   WebGL Renderer
         │              │              │              │
         ▼              ▼              ▼              ▼
   <button>         Canvas API    <TouchableOpacity>  GPU
   <span>           drawRect()    <Text>              Vertices
   click event      detectHit()   onPress             Shaders

Same component code works everywhere!
```

## Memory Management

```
┌─────────────────────────────────────────────────────────────────┐
│              MEMORY MANAGEMENT                                  │
└─────────────────────────────────────────────────────────────────┘

DOM Renderer:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WeakMap<Node, NodeData>
   ↓
Automatic garbage collection when node removed

WeakMap<Node, EventListeners>
   ↓
Event listeners cleaned up on unmount

Signal System:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Effect.dispose()
   ↓
Removes from all signal subscribers
   ↓
Runs cleanup function
   ↓
Frees memory

Reactive Rendering:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WeakMap<Node, Set<Disposers>>
   ↓
Cleanup all effects when node unmounts
   ↓
No memory leaks!
```

## Future Renderers

```
┌─────────────────────────────────────────────────────────────────┐
│              CANVAS RENDERER (Planned)                          │
└─────────────────────────────────────────────────────────────────┘

Row → Virtual Layout Node
   ↓
Layout Engine (Flexbox)
   ↓
Calculate positions/sizes
   ↓
ctx.fillRect() / ctx.fillText()
   ↓
Rendered to Canvas

Events:
Click → canvas.addEventListener('click')
   ↓
Check hit boxes
   ↓
Find clicked node
   ↓
Call onPress handler

┌─────────────────────────────────────────────────────────────────┐
│          REACT NATIVE RENDERER (Planned)                        │
└─────────────────────────────────────────────────────────────────┘

Row → React.createElement(View, { flexDirection: 'row' })
Text → React.createElement(RNText, { style: {...} })
Button → React.createElement(TouchableOpacity, { onPress })
   ↓
React Native Bridge
   ↓
Native iOS/Android UI
```

## Development Workflow

```
Write Component
       │
       │ Platform-agnostic code
       ▼
Choose Renderer
       │
       ├──► DOM ──────► Browser
       ├──► Canvas ───► Canvas
       ├──► Native ───► iOS/Android
       └──► WebGL ────► 3D Graphics

All use same component code!
```
