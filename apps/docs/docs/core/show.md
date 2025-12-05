---
title: Show - Conditional Rendering
---

<script setup>
import ShowDemo from '../../components/ShowDemo.vue'
</script>

# &lt;Show /&gt;

Conditionally render content based on a boolean condition.

## Live Demo

<ClientOnly>
  <ShowDemo />
</ClientOnly>

## Import

```tsx
import { Show } from 'flexium/core'
```

## Signature

```tsx
<Show when={condition} fallback={fallbackElement}>
  {children}
</Show>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `when` | `boolean \| Accessor<boolean>` | Condition to evaluate |
| `fallback` | `JSX.Element` | Optional content to show when condition is false |
| `children` | `JSX.Element` | Content to show when condition is true |

## Usage

### Basic Usage

```tsx
const [isLoggedIn, setIsLoggedIn] = state(false)

<Show when={isLoggedIn}>
  <UserProfile />
</Show>
```

### With Fallback

```tsx
const [isLoading, setIsLoading] = state(true)

<Show when={() => !isLoading()} fallback={<LoadingSpinner />}>
  <Content />
</Show>
```

### Authentication

```tsx
const [user, setUser] = state(null)

<Show
  when={() => user() !== null}
  fallback={<LoginForm />}
>
  <Dashboard user={user()} />
</Show>
```

### Feature Flags

```tsx
const [features, setFeatures] = state({ darkMode: true, beta: false })

<Show when={() => features().darkMode}>
  <DarkModeToggle />
</Show>

<Show when={() => features().beta}>
  <BetaFeatures />
</Show>
```

### Nested Shows

```tsx
<Show when={isAuthenticated}>
  <Show when={hasPermission} fallback={<AccessDenied />}>
    <AdminPanel />
  </Show>
</Show>
```

### With Computed

```tsx
const [items, setItems] = state([])
const hasItems = computed(() => items().length > 0)

<Show when={hasItems} fallback={<EmptyState />}>
  <ItemList items={items()} />
</Show>
```

## Behavior

- Content is **created/destroyed** when condition changes
- Fallback is rendered when condition is **falsy**
- Supports both **static booleans** and **reactive accessors**
- Children are evaluated **lazily**

## Notes

- Use `Show` for simple true/false conditions
- Use `Switch` for multiple conditions
- The `when` prop can be a signal accessor for reactive conditions

## See Also

- [&lt;For /&gt;](/docs/core/for)
- [&lt;Switch /&gt;](/docs/core/switch)
