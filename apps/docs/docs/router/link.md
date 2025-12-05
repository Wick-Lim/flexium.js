---
title: Link - Navigation Component
---

# &lt;Link /&gt;

Navigate between routes without full page reload.

## Import

```tsx
import { Link } from 'flexium/router'
```

## Signature

```tsx
<Link href={path} class={className}>
  {children}
</Link>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `href` | `string` | Target path to navigate to |
| `class` | `string` | CSS class names |
| `activeClass` | `string` | Class added when route is active |
| `replace` | `boolean` | Replace history instead of push |
| `children` | `JSX.Element` | Link content |

## Usage

### Basic Link

```tsx
<Link href="/about">About Us</Link>
```

### With Active Styling

```tsx
<Link href="/dashboard" activeClass="active">
  Dashboard
</Link>
```

### Navigation Menu

```tsx
function Nav() {
  return (
    <nav>
      <Link href="/" activeClass="active">Home</Link>
      <Link href="/products" activeClass="active">Products</Link>
      <Link href="/about" activeClass="active">About</Link>
      <Link href="/contact" activeClass="active">Contact</Link>
    </nav>
  )
}
```

### With Query Parameters

```tsx
<Link href="/search?q=hello&page=1">
  Search for "hello"
</Link>
```

### Dynamic Links

```tsx
function ProductCard({ product }) {
  return (
    <div class="card">
      <h3>{product.name}</h3>
      <Link href={`/products/${product.id}`}>
        View Details
      </Link>
    </div>
  )
}
```

### Replace History

```tsx
// Won't add to history stack
<Link href="/login" replace>
  Login
</Link>
```

### External Link Detection

```tsx
// External links open normally
<a href="https://example.com" target="_blank">
  External Site
</a>

// Internal links use router
<Link href="/internal">Internal Page</Link>
```

### Styled Links

```tsx
<Link
  href="/premium"
  class="btn btn-primary"
  activeClass="btn-active"
>
  Upgrade to Premium
</Link>
```

### Breadcrumbs

```tsx
function Breadcrumbs({ items }) {
  return (
    <nav class="breadcrumbs">
      <For each={items}>
        {(item, index) => (
          <>
            <Link href={item.href}>{item.label}</Link>
            <Show when={() => index < items.length - 1}>
              <span>/</span>
            </Show>
          </>
        )}
      </For>
    </nav>
  )
}
```

## Behavior

- **Prevents default** anchor behavior
- Uses **History API** for navigation
- **Preserves scroll** position in history
- Applies `activeClass` when **path matches**

## Notes

- Use `Link` for internal navigation
- Use regular `<a>` for external links
- `activeClass` matches current route path

## See Also

- [&lt;Router /&gt;](/docs/router/router)
- [&lt;Route /&gt;](/docs/router/route)
- [useRouter()](/docs/router/use-router)
