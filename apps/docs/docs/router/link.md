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
<Link to={path} class={className}>
  {children}
</Link>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `to` | `string` | Target path to navigate to |
| `class` | `string` | CSS class names |
| `activeClass` | `string` | Class added when route is active (optional) |
| `replace` | `boolean` | Replace history instead of push (optional) |
| `children` | `JSX.Element` | Link content |

## Usage

### Basic Link

```tsx
<Link to="/about">About Us</Link>
```

### With Active Styling

```tsx
<Link to="/dashboard" activeClass="active">
  Dashboard
</Link>
```

### Navigation Menu

```tsx
function Nav() {
  return (
    <nav>
      <Link to="/" activeClass="active">Home</Link>
      <Link to="/products" activeClass="active">Products</Link>
      <Link to="/about" activeClass="active">About</Link>
      <Link to="/contact" activeClass="active">Contact</Link>
    </nav>
  )
}
```

### With Query Parameters

```tsx
<Link to="/search?q=hello&page=1">
  Search for "hello"
</Link>
```

### Dynamic Links

```tsx
function ProductCard({ product }) {
  return (
    <div class="card">
      <h3>{product.name}</h3>
      <Link to={`/products/${product.id}`}>
        View Details
      </Link>
    </div>
  )
}
```

### Replace History

```tsx
// Won't add to history stack
<Link to="/login" replace>
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
<Link to="/internal">Internal Page</Link>
```

### Styled Links

```tsx
<Link
  to="/premium"
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
      {items.map((item, index) => (
        <span key={item.to}>
          <Link to={item.to}>{item.label}</Link>
          {index < items.length - 1 && <span>/</span>}
        </span>
      ))}
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

## Demo

<script setup>
import LinkDemo from '../../components/LinkDemo.vue'
</script>

<LinkDemo />

## See Also

- [&lt;Routes /&gt;](/docs/router/routes)
- [&lt;Route /&gt;](/docs/router/route)
- [useRouter()](/docs/router/router)
