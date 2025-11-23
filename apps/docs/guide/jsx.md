# JSX & Rendering

Flexium uses JSX to describe the UI. It looks like HTML but works with JavaScript logic.

## How it Works

Flexium's JSX compiler transforms your code into optimized function calls that create DOM nodes directly. There is no Virtual DOM diffing.

```tsx
const element = <div class="container">Hello</div>
```

## Control Flow

Since components run once, you should use Flexium's control flow components instead of `map` or `if` statements for dynamic content that depends on state.

### `<Show>`

Conditionally render content.

```tsx
<Show when={isLoggedIn()} fallback={<button>Login</button>}>
  <UserDashboard />
</Show>
```

### `<For>`

Efficiently render lists.

```tsx
<For each={items()}>
  {(item, index) => (
    <li>{index()}: {item.name}</li>
  )}
</For>
```

### `<Switch>` & `<Match>`

Render one of multiple options.

```tsx
<Switch fallback={<p>Not found</p>}>
  <Match when={status() === 'loading'}>Loading...</Match>
  <Match when={status() === 'error'}>Error!</Match>
  <Match when={status() === 'success'}>Data Loaded</Match>
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
