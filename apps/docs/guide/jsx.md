---
title: JSX & Rendering - Building UI with JSX
description: Learn how Flexium uses JSX for declarative UI. No Virtual DOM, just optimized direct DOM manipulation with fine-grained reactivity.
head:
  - - meta
    - property: og:title
      content: JSX & Rendering - Flexium
  - - meta
    - property: og:description
      content: Build UIs with JSX in Flexium. Optimized function calls, no Virtual DOM diffing, and built-in control flow components.
---

# JSX & Rendering

Flexium uses JSX to describe the UI. It looks like HTML but works with JavaScript logic.

## How it Works

Flexium's JSX compiler transforms your code into optimized function calls that create DOM nodes directly. There is no Virtual DOM diffing.

```tsx
const element = <div class="container">Hello</div>
```

## Control Flow

Flexium uses native JavaScript for control flow - just like React, but with signal performance.

### Conditionals

Use ternary operators and `&&` - exactly like React:

```tsx
{isLoggedIn ? <UserDashboard /> : <button>Login</button>}

{isLoggedIn && <UserDashboard />}
```

### Lists

Use `.map()` - exactly like React, but automatically optimized:

```tsx
{items.map((item, index) => (
  <li key={item.id}>{index}: {item.name}</li>
))}
```

### `<Switch>` & `<Match>`

Render one of multiple options.

```tsx
<Switch fallback={<p>Not found</p>}>
  <Match when={status === 'loading'}>Loading...</Match>  {/* status works directly */}
  <Match when={status === 'error'}>Error!</Match>
  <Match when={status === 'success'}>Data Loaded</Match>
</Switch>
```

## Event Handling

Use standard `on*` events (lowercase or camelCase works, but lowercase is preferred for native DOM events).

```tsx
<button onclick={handleClick}>Click Me</button>
```

## Fragments

Use `<>` and `</>` to group elements without adding an extra node to the DOM.

```tsx
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
)
```
