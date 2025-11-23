# Styling

Flexium supports standard CSS, CSS Modules, and inline styles.

## Inline Styles

Pass an object to the `style` prop.

```tsx
<div style={{ color: 'red', fontSize: '20px' }}>
  Hello
</div>
```

## CSS Classes

Use the `class` attribute (not `className`).

```tsx
<div class="container active">
  Content
</div>
```

## CSS Modules

If using Vite, CSS Modules work out of the box.

```tsx
import styles from './App.module.css'

<div class={styles.container}>
  ...
</div>
```
