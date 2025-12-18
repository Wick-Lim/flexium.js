---
title: Styling - CSS, Modules & Inline Styles
description: Style Flexium components with CSS, CSS Modules, and inline styles. Learn best practices for reactive UI styling.
head:
  - - meta
    - property: og:title
      content: Styling Guide - Flexium
  - - meta
    - property: og:description
      content: Multiple styling options for Flexium - standard CSS, CSS Modules, and inline styles. Flexible and performant.
---

# Styling

Flexium supports standard CSS, CSS Modules, and inline styles. Choose the approach that fits your project's needs, from traditional CSS files to fully reactive inline styles powered by signals.

## Inline Styles

Pass an object to the `style` prop for inline styling.

### Static Inline Styles

Use a plain object for static styles:

```tsx
<div style={{ color: 'red', fontSize: '20px' }}>
  Hello
</div>
```

Style properties use camelCase (JavaScript convention) rather than kebab-case:

```tsx
<div style={{
  backgroundColor: '#f5f5f5',
  borderRadius: '8px',
  padding: '16px',
  marginTop: '20px'
}}>
  Content
</div>
```

### Reactive Styles with Signals

For dynamic, reactive styling, pass a function that returns a style object. The function automatically tracks signal dependencies:

```tsx
import { useState } from 'flexium/core'

function ThemedButton() {
  const [isDark, setIsDark] = useState(false)

  return (
    <button
      style={() => ({
        background: isDark ? '#333' : '#fff',
        color: isDark ? '#fff' : '#333',
        border: `1px solid ${isDark ? '#555' : '#ddd'}`,
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer'
      })}
      onclick={() => setIsDark(d => !d)}
    >
      Toggle Theme
    </button>
  )
}
```

The style function re-evaluates automatically when any referenced signal changes, providing fine-grained reactivity without re-rendering the entire component.

### Individual Reactive Properties

Mix static and reactive properties within the same style object:

```tsx
const [size, setSize] = useState(16)
const [color, setColor] = useState('#333')

<div style={{
  fontSize: size + 'px',     // Reactive - coercion works in concatenation
  color: color,              // Reactive - used directly in style
  padding: '8px',            // Static
  fontWeight: 'bold'         // Static
}}>
  Styled text
</div>
```

### Computed Styles

Use computed values for derived styles:

```tsx
import { useState } from 'flexium/core'

function ProgressBar() {
  const [progress, setProgress] = useState(0)

  return (
    <div style={{
      width: '100%',
      height: '20px',
      background: '#e0e0e0',
      borderRadius: '10px',
      overflow: 'hidden'
    }}>
      <div style={() => ({
        width: `${+progress}%`,
        height: '100%',
        background: +progress > 75 ? '#4caf50' :
                    +progress > 50 ? '#ff9800' : '#f44336',
        transition: 'all 0.3s ease'
      })} />
    </div>
  )
}
```

## CSS Classes

Use the `class` attribute (not `className`) to apply CSS classes.

### Static Classes

```tsx
<div class="container active">
  Content
</div>
```

### Conditional Classes

Use template literals or helper functions for conditional classes:

```tsx
const [isActive, setIsActive] = useState(false)
const [isPrimary, setIsPrimary] = useState(true)

// Using template literal
<button class={`btn ${isActive ? 'active' : ''} ${isPrimary ? 'primary' : 'secondary'}`}>
  Click Me
</button>

// Using helper function
function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

<button class={() => classNames(
  'btn',
  isActive && 'active',
  isPrimary ? 'primary' : 'secondary'
)}>
  Click Me
</button>
```

### Reactive Classes

The `class` attribute can also accept a function for reactive class names:

```tsx
const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

<div class={() => `status-badge ${status}`}>
  {status}
</div>
```

## CSS Modules

CSS Modules provide scoped, component-level styling with generated unique class names to avoid conflicts.

### Setup with Vite

If using Vite, CSS Modules work out of the box. Create a file with the `.module.css` extension:

```css
/* Button.module.css */
.container {
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.active {
  background: #e3f2fd;
  border: 2px solid #2196f3;
}
```

Import and use in your component:

```tsx
import styles from './Button.module.css'

function Button() {
  return (
    <div class={styles.container}>
      <h1 class={styles.title}>Hello</h1>
    </div>
  )
}
```

### Combining CSS Modules with Conditional Classes

```tsx
import styles from './App.module.css'

function App() {
  const [isActive, setIsActive] = useState(false)

  return (
    <div class={() => `${styles.container} ${isActive ? styles.active : ''}`}>
      Content
    </div>
  )
}
```

## CSS Variables and Custom Properties

CSS custom properties provide a powerful way to create themeable, maintainable styles.

### Defining CSS Variables

```css
:root {
  --primary-color: #2196f3;
  --secondary-color: #ff9800;
  --text-color: #333;
  --background: #fff;
  --border-radius: 8px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
}
```

### Using CSS Variables in Styles

```tsx
<div style={{
  color: 'var(--text-color)',
  background: 'var(--background)',
  padding: 'var(--spacing-md)',
  borderRadius: 'var(--border-radius)'
}}>
  Content
</div>
```

### Dynamic CSS Variables with Signals

Update CSS variables reactively for instant theme changes:

```tsx
import { useState, useEffect } from 'flexium/core'

function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const root = document.documentElement
    if (String(theme) === 'dark') {
      root.style.setProperty('--background', '#1a1a1a')
      root.style.setProperty('--text-color', '#f5f5f5')
      root.style.setProperty('--primary-color', '#64b5f6')
    } else {
      root.style.setProperty('--background', '#fff')
      root.style.setProperty('--text-color', '#333')
      root.style.setProperty('--primary-color', '#2196f3')
    }
  })

  return (
    <div style={{
      background: 'var(--background)',
      color: 'var(--text-color)',
      minHeight: '100vh'
    }}>
      <button onclick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  )
}
```

## Dynamic Styles Based on State

Create responsive, interactive UIs by deriving styles from application state.

### State-Driven Styling

```tsx
function StatusIndicator() {
  const [status, setStatus] = useState<'online' | 'offline' | 'away'>('offline')

  const statusStyles = {
    online: { background: '#4caf50', color: '#fff' },
    offline: { background: '#f44336', color: '#fff' },
    away: { background: '#ff9800', color: '#fff' }
  }

  return (
    <div style={() => ({
      ...statusStyles[status],
      padding: '8px 16px',
      borderRadius: '20px',
      display: 'inline-block'
    })}>
      {status}
    </div>
  )
}
```

### Transition Between States

Combine state-driven styles with CSS transitions for smooth animations:

```tsx
const [isExpanded, setIsExpanded] = useState(false)

<div style={() => ({
  maxHeight: isExpanded ? '500px' : '0',
  overflow: 'hidden',
  transition: 'max-height 0.3s ease-in-out'
})}>
  <p>Expandable content goes here...</p>
</div>
```

### Style Based on Multiple Conditions

```tsx
function Card() {
  const [isHovered, setIsHovered] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  return (
    <div
      style={() => ({
        padding: '16px',
        borderRadius: '8px',
        background: isDisabled ? '#f5f5f5' :
                    isSelected ? '#e3f2fd' :
                    isHovered ? '#f9f9f9' : '#fff',
        border: `2px solid ${isSelected ? '#2196f3' : '#ddd'}`,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transform: isHovered && !isDisabled ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s ease',
        boxShadow: isHovered && !isDisabled ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
      })}
      onmouseenter={() => !isDisabled && setIsHovered(true)}
      onmouseleave={() => setIsHovered(false)}
      onclick={() => !isDisabled && setIsSelected(s => !s)}
    >
      Card Content
    </div>
  )
}
```

## Responsive Design Patterns

Build responsive layouts using media queries and container queries.

### Media Queries in CSS

Traditional CSS media queries work seamlessly with Flexium:

```css
.container {
  padding: 16px;
  max-width: 1200px;
}

@media (max-width: 768px) {
  .container {
    padding: 8px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 4px;
  }
}
```

### JavaScript-Based Responsive Styles

Use matchMedia API with signals for JavaScript-driven responsive behavior:

```tsx
import { useState, useEffect } from 'flexium/core'

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mediaQuery.addEventListener('change', handler)

    return () => mediaQuery.removeEventListener('change', handler)
  })

  return matches
}

function ResponsiveLayout() {
  const isMobile = useMediaQuery('(max-width: 768px)')

  return (
    <div style={() => ({
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '8px' : '16px',
      padding: isMobile ? '8px' : '24px'
    })}>
      <div>Content 1</div>
      <div>Content 2</div>
    </div>
  )
}
```

### Container Queries

For component-level responsive design:

```css
.card-container {
  container-type: inline-size;
}

.card {
  padding: 16px;
}

@container (max-width: 400px) {
  .card {
    padding: 8px;
    font-size: 14px;
  }
}
```

## Theming Strategies

Implement light/dark mode and custom themes.

### Simple Theme Toggle

```tsx
import { useState } from 'flexium/core'

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light', { key: 'app-theme' })

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return { theme, setTheme, toggleTheme }
}

function App() {
  const { theme, toggleTheme } = useTheme()

  const themes = {
    light: {
      background: '#ffffff',
      text: '#333333',
      primary: '#2196f3',
      secondary: '#f5f5f5',
      border: '#ddd'
    },
    dark: {
      background: '#1a1a1a',
      text: '#f5f5f5',
      primary: '#64b5f6',
      secondary: '#2a2a2a',
      border: '#444'
    }
  }

  return (
    <div style={() => ({
      background: themes[theme].background,
      color: themes[theme].text,
      minHeight: '100vh',
      padding: '24px'
    })}>
      <button
        style={() => ({
          background: themes[theme].primary,
          color: '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        })}
        onclick={toggleTheme}
      >
        Toggle Theme
      </button>
    </div>
  )
}
```

### Context-Based Theming

Use context to provide theme throughout your app:

```tsx
import { useState } from 'flexium/core'

// Theme state - shared globally with key
const [theme, setTheme] = useState<'light' | 'dark'>('light', { key: 'app:theme' })

const lightColors = {
  background: '#ffffff',
  text: '#333333',
  primary: '#2196f3',
  secondary: '#f5f5f5'
}

const darkColors = {
  background: '#1a1a1a',
  text: '#f5f5f5',
  primary: '#64b5f6',
  secondary: '#2a2a2a'
}

const [colors, setColors] = useState(() => String(theme) === 'light' ? lightColors : darkColors, { key: 'app:theme:colors' })
const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

function ThemedButton() {
  const [theme, setTheme2] = useState('light', { key: 'app:theme' })
  const [colors, setColors2] = useState(() => String(theme) === 'light' ? lightColors : darkColors, { key: 'app:theme:colors' })

  return (
    <button style={() => ({
      background: colors.primary,
      color: '#fff',
      padding: '8px 16px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    })}>
      Themed Button
    </button>
  )
}
```

### System Preference Detection

Detect and respect user's system theme preference:

```tsx
function useSystemTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  })

  return theme
}
```

## Style Composition and Reusability

Create reusable style utilities and mixins.

### Style Objects as Constants

```tsx
const buttonBaseStyle = {
  padding: '8px 16px',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.2s ease'
}

const buttonVariants = {
  primary: {
    ...buttonBaseStyle,
    background: '#2196f3',
    color: '#fff'
  },
  secondary: {
    ...buttonBaseStyle,
    background: '#f5f5f5',
    color: '#333'
  },
  danger: {
    ...buttonBaseStyle,
    background: '#f44336',
    color: '#fff'
  }
}

function Button({ variant = 'primary', children }) {
  return (
    <button style={buttonVariants[variant]}>
      {children}
    </button>
  )
}
```

### Style Utility Functions

```tsx
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px'
}

const flexCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

const truncate = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap' as const
}

function Card() {
  return (
    <div style={{
      ...flexCenter,
      padding: spacing.md,
      borderRadius: '8px'
    }}>
      <p style={truncate}>
        This text will be truncated with ellipsis
      </p>
    </div>
  )
}
```

### Composable Style Functions

```tsx
type StyleObject = Record<string, string | number>

function mergeStyles(...styles: (StyleObject | undefined)[]): StyleObject {
  return Object.assign({}, ...styles.filter(Boolean))
}

function withHover(baseStyle: StyleObject, hoverStyle: StyleObject) {
  const [isHovered, setIsHovered] = useState(false)

  return {
    style: () => isHovered ? mergeStyles(baseStyle, hoverStyle) : baseStyle,
    handlers: {
      onmouseenter: () => setIsHovered(true),
      onmouseleave: () => setIsHovered(false)
    }
  }
}

function InteractiveCard() {
  const { style, handlers } = withHover(
    { background: '#fff', padding: '16px' },
    { background: '#f5f5f5', transform: 'scale(1.02)' }
  )

  return <div style={style} {...handlers}>Hover me!</div>
}
```

## Common Styling Patterns

### Hover, Focus, and Active States

```tsx
function InteractiveButton() {
  const [isHovered, setIsHovered] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  return (
    <button
      style={() => ({
        background: isPressed ? '#1565c0' :
                    isHovered ? '#1976d2' :
                    '#2196f3',
        color: '#fff',
        padding: '8px 16px',
        border: isFocused ? '2px solid #64b5f6' : 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        transform: isPressed ? 'scale(0.98)' : 'scale(1)',
        boxShadow: isHovered && !isPressed ? '0 4px 8px rgba(0,0,0,0.2)' : 'none',
        transition: 'all 0.2s ease'
      })}
      onmouseenter={() => setIsHovered(true)}
      onmouseleave={() => { setIsHovered(false); setIsPressed(false) }}
      onfocus={() => setIsFocused(true)}
      onblur={() => setIsFocused(false)}
      onmousedown={() => setIsPressed(true)}
      onmouseup={() => setIsPressed(false)}
    >
      Interactive Button
    </button>
  )
}
```

### CSS-Only Pseudo States

For simpler interactions, use CSS pseudo-classes:

```css
.button {
  background: #2196f3;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  background: #1976d2;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.button:active {
  background: #1565c0;
  transform: scale(0.98);
}

.button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(33, 150, 243, 0.3);
}

.button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}
```

## Animation Styling

Integrate CSS animations with Flexium's reactive system.

### CSS Keyframe Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animated {
  animation: fadeIn 0.3s ease-out;
}

.slide-in {
  animation: slideUp 0.4s ease-out;
}
```

Use in components:

```tsx
<div class="animated">
  Fades in on mount
</div>
```

### Triggering Animations with State

```tsx
function AnimatedCard() {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <>
      <button onclick={() => setIsVisible(v => !v)}>
        Toggle
      </button>

      {isVisible && (
        <div style={{
          animation: 'slideUp 0.3s ease-out'
        }}>
          Animated content
        </div>
      )}
    </>
  )
}
```

### Transition-Based Animations

```tsx
function ExpandablePanel() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <button onclick={() => setIsExpanded(e => !e)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>

      <div style={() => ({
        maxHeight: isExpanded ? '300px' : '0',
        opacity: isExpanded ? 1 : 0,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      })}>
        <div style={{ padding: '16px' }}>
          Panel content here...
        </div>
      </div>
    </div>
  )
}
```

For advanced animations, see the [Animation Guide](/guide/animation).

## Performance Considerations

### Minimize Style Recalculations

```tsx
// Bad: Creates new style object on every render
<div style={{ color: 'red', padding: '8px' }}>Content</div>

// Good: Reuse style object
const staticStyle = { color: 'red', padding: '8px' }
<div style={staticStyle}>Content</div>
```

### Use CSS for Static Styles

```tsx
// Less performant: Inline styles for everything
<button style={{
  background: '#2196f3',
  color: '#fff',
  padding: '8px 16px',
  borderRadius: '4px',
  border: 'none',
  cursor: 'pointer'
}}>
  Click Me
</button>

// More performant: CSS classes for static styles
// styles.css
.btn-primary {
  background: #2196f3;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

<button class="btn-primary">Click Me</button>
```

### Sync Style Updates

Group multiple style changes together:

```tsx
import { sync } from 'flexium/core'

const [color, setColor] = useState('#333')
const [size, setSize] = useState(16)
const [weight, setWeight] = useState(400)

// Bad: Multiple separate updates
function updateTheme() {
  setColor('#fff')
  setSize(18)
  setWeight(500)
}

// Good: Synced updates (advanced API)
import { sync } from 'flexium/core'

function updateTheme() {
  sync(() => {
    setColor('#fff')
    setSize(18)
    setWeight(500)
  })
}
```

### Prefer Transform and Opacity

For smooth animations, prefer `transform` and `opacity` over layout-affecting properties:

```tsx
// Better performance
<div style={() => ({
  opacity: isVisible ? 1 : 0,
  transform: `translateY(${isVisible ? 0 : 20}px)`,
  transition: 'all 0.3s ease'
})}>
  Content
</div>

// Worse performance (triggers layout)
<div style={() => ({
  marginTop: isVisible ? '0' : '20px',
  height: isVisible ? 'auto' : '0'
})}>
  Content
</div>
```

### Avoid Inline Styles for Large Lists

For lists with many items, use CSS classes instead of inline styles:

```tsx
// Less efficient for large lists
{items.map(item => (
  <div key={item.id} style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
    {item.name}
  </div>
))}

// More efficient
// styles.css: .list-item { padding: 8px; border-bottom: 1px solid #ddd; }
{items.map(item => (
  <div key={item.id} class="list-item">
    {item.name}
  </div>
))}
```

## Best Practices

1. **Use CSS classes for static styles**: Reserve inline styles for dynamic, state-driven styling
2. **Leverage CSS variables**: They provide excellent performance for theme changes
3. **Prefer reactive functions over manual DOM manipulation**: Let Flexium handle updates
4. **Extract reusable styles**: Create style utilities and constants for consistency
5. **Use CSS Modules for component isolation**: Prevent class name conflicts in larger apps
6. **Sync related state updates**: Reduce unnecessary re-renders
7. **Keep specificity low**: Avoid overly specific selectors that are hard to override
8. **Use semantic class names**: Make styles maintainable and self-documenting
9. **Test responsive behavior**: Use browser dev tools to test different screen sizes
10. **Profile performance**: Use browser dev tools to identify styling bottlenecks

## Related Resources

- [State Management](/guide/state) - Managing reactive state
- [Animation Guide](/guide/animation) - Advanced animations with Flexium
- [Primitives](/guide/primitives) - Pre-styled UI components
- [Performance](/guide/performance) - Optimization strategies
