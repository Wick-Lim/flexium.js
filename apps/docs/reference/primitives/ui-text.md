---
title: Text - Typography UI Primitives
description: API reference for Flexium's Text UI primitives. Create semantic text elements with comprehensive typography controls and accessibility features.
head:
  - - meta
    - property: og:title
      content: Text UI Primitives - Flexium API Reference
  - - meta
    - property: og:description
      content: Text primitives for creating semantic typography in Flexium with full styling and accessibility support.
---

# Text

Typography primitives with semantic HTML and comprehensive style controls.

The Text UI primitives provide functions for creating text elements that automatically select appropriate HTML tags (h1-h6, p, span, label, etc.) based on semantic meaning. These primitives support reactive content, extensive typography controls, and full accessibility features.

## Import

```typescript
import {
  createText,
  createHeading,
  createParagraph,
  createLabel,
  createCode,
} from 'flexium/primitives/ui';
```

## createText

Creates a text element with typography properties and semantic HTML.

### Function Signature

```typescript
function createText(props: TextProps): {
  element: HTMLElement;
  update: (newProps: Partial<TextProps>) => void;
  dispose: () => void;
}
```

### Usage

```typescript
import { createText } from 'flexium/primitives/ui';

// Basic paragraph
const text = createText({
  as: 'p',
  children: 'Hello World',
  fontSize: 16,
  color: '#333',
});

document.body.appendChild(text.element);
```

### With Reactive Content

```typescript
import { signal } from 'flexium/core';
import { createText } from 'flexium/primitives/ui';

const count = signal(0);

const text = createText({
  as: 'span',
  children: count,
  fontSize: 20,
  fontWeight: 'bold',
});

// Text automatically updates when signal changes
count.set(1);
count.set(2);
```

### With Truncation

```typescript
import { createText } from 'flexium/primitives/ui';

// Single-line truncation
const truncated = createText({
  as: 'p',
  children: 'This is a very long text that will be truncated with an ellipsis',
  truncate: true,
  maxWidth: 200,
});

// Multi-line truncation
const clamped = createText({
  as: 'p',
  children: 'This text will be truncated after 3 lines with an ellipsis',
  lineClamp: 3,
  maxWidth: 300,
});
```

### Props

#### Content

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `as` | `TextVariant` | `'p'` | HTML element to render. |
| `children` | `string \| number \| HTMLElement \| HTMLElement[] \| Signal<string \| number>` | - | Text content. |

#### Typography

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `fontSize` | `number \| string` | - | Font size (number in px or CSS string). |
| `fontWeight` | `number \| string` | - | Font weight (100-900 or CSS keyword). |
| `fontFamily` | `string` | - | Font family. |
| `lineHeight` | `number \| string` | - | Line height. |
| `letterSpacing` | `number \| string` | - | Letter spacing. |
| `textAlign` | `'left' \| 'center' \| 'right' \| 'justify'` | - | Text alignment. |
| `textDecoration` | `'none' \| 'underline' \| 'line-through' \| 'overline'` | - | Text decoration. |
| `textTransform` | `'none' \| 'uppercase' \| 'lowercase' \| 'capitalize'` | - | Text transform. |
| `color` | `string` | - | Text color. |
| `whiteSpace` | `'normal' \| 'nowrap' \| 'pre' \| 'pre-wrap' \| 'pre-line'` | - | White space handling. |

#### Responsive Font Sizes

| Prop | Type | Description |
| --- | --- | --- |
| `fontSizeBase` | `number \| string` | Base font size. |
| `fontSizeSm` | `number \| string` | Small breakpoint font size. |
| `fontSizeMd` | `number \| string` | Medium breakpoint font size. |
| `fontSizeLg` | `number \| string` | Large breakpoint font size. |
| `fontSizeXl` | `number \| string` | Extra large breakpoint font size. |

#### Layout

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `display` | `'inline' \| 'block' \| 'inline-block'` | - | Display mode. |
| `margin` | `number \| string` | - | Margin on all sides. |
| `marginTop` | `number \| string` | - | Top margin. |
| `marginRight` | `number \| string` | - | Right margin. |
| `marginBottom` | `number \| string` | - | Bottom margin. |
| `marginLeft` | `number \| string` | - | Left margin. |
| `padding` | `number \| string` | - | Padding on all sides. |
| `paddingTop` | `number \| string` | - | Top padding. |
| `paddingRight` | `number \| string` | - | Right padding. |
| `paddingBottom` | `number \| string` | - | Bottom padding. |
| `paddingLeft` | `number \| string` | - | Left padding. |
| `maxWidth` | `number \| string` | - | Maximum width. |

#### Text Truncation

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `truncate` | `boolean` | `false` | Enable single-line truncation with ellipsis. |
| `lineClamp` | `number` | - | Number of lines before truncation. |

#### Styling

| Prop | Type | Description |
| --- | --- | --- |
| `className` | `string` | Additional CSS class names. |
| `style` | `Partial<CSSStyleDeclaration>` | Inline styles. |

#### Accessibility

| Prop | Type | Description |
| --- | --- | --- |
| `id` | `string` | Element ID. |
| `role` | `string` | ARIA role attribute. |
| `ariaLabel` | `string` | Accessible label for screen readers. |
| `ariaDescribedby` | `string` | ID of element that describes this element. |
| `ariaLive` | `'off' \| 'polite' \| 'assertive'` | Live region for dynamic content. |

#### Events

| Prop | Type | Description |
| --- | --- | --- |
| `onClick` | `(event: MouseEvent) => void` | Called when text is clicked. |
| `onMouseEnter` | `(event: MouseEvent) => void` | Called when mouse enters. |
| `onMouseLeave` | `(event: MouseEvent) => void` | Called when mouse leaves. |

### Text Variants (as prop)

The `as` prop determines the semantic HTML element:

| Variant | HTML Element | Use Case |
| --- | --- | --- |
| `'h1'` | `<h1>` | Page title (most important heading) |
| `'h2'` | `<h2>` | Section heading |
| `'h3'` | `<h3>` | Subsection heading |
| `'h4'` | `<h4>` | Sub-subsection heading |
| `'h5'` | `<h5>` | Minor heading |
| `'h6'` | `<h6>` | Least important heading |
| `'p'` | `<p>` | Paragraph (default) |
| `'span'` | `<span>` | Inline text |
| `'label'` | `<label>` | Form label |
| `'strong'` | `<strong>` | Strong importance |
| `'em'` | `<em>` | Emphasis |
| `'code'` | `<code>` | Inline code |
| `'pre'` | `<pre>` | Preformatted text |

### Return Value

| Property | Type | Description |
| --- | --- | --- |
| `element` | `HTMLElement` | The text DOM element. |
| `update` | `(newProps: Partial<TextProps>) => void` | Function to update text props. |
| `dispose` | `() => void` | Cleanup function to remove event listeners. |

### CSS Classes Applied

- `text` - Base text class
- `text-{variant}` - Variant-specific class (e.g., `text-h1`, `text-p`)
- `text-truncate` - Applied when `truncate` is true
- `text-line-clamp` - Applied when `lineClamp` is set

## createHeading

Convenience function for creating heading elements.

### Function Signature

```typescript
function createHeading(
  level: 1 | 2 | 3 | 4 | 5 | 6,
  props: Omit<TextProps, 'as'>
): ReturnType<typeof createText>
```

### Usage

```typescript
import { createHeading } from 'flexium/primitives/ui';

// Create an h1
const title = createHeading(1, {
  children: 'Page Title',
  fontSize: 32,
  fontWeight: 'bold',
  marginBottom: 20,
});

// Create an h2
const subtitle = createHeading(2, {
  children: 'Section Title',
  fontSize: 24,
  fontWeight: '600',
});

document.body.appendChild(title.element);
document.body.appendChild(subtitle.element);
```

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `level` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | Heading level (1 is most important). |
| `props` | `Omit<TextProps, 'as'>` | Text props (excluding `as`). |

## createParagraph

Convenience function for creating paragraph elements.

### Function Signature

```typescript
function createParagraph(
  props: Omit<TextProps, 'as'>
): ReturnType<typeof createText>
```

### Usage

```typescript
import { createParagraph } from 'flexium/primitives/ui';

const paragraph = createParagraph({
  children: 'This is a paragraph of text.',
  fontSize: 16,
  lineHeight: 1.5,
  marginBottom: 16,
});

document.body.appendChild(paragraph.element);
```

## createLabel

Convenience function for creating label elements.

### Function Signature

```typescript
function createLabel(
  props: Omit<TextProps, 'as'>
): ReturnType<typeof createText>
```

### Usage

```typescript
import { createLabel } from 'flexium/primitives/ui';

const label = createLabel({
  children: 'Email Address',
  fontSize: 14,
  fontWeight: '500',
  marginBottom: 8,
});

document.body.appendChild(label.element);
```

### Form Label Usage

```typescript
import { createLabel } from 'flexium/primitives/ui';

const label = createLabel({
  children: 'Username',
  id: 'username-label',
});

const input = document.createElement('input');
input.type = 'text';
input.id = 'username-input';
input.setAttribute('aria-labelledby', 'username-label');

label.element.setAttribute('for', 'username-input');
```

## createCode

Convenience function for creating inline code elements.

### Function Signature

```typescript
function createCode(
  props: Omit<TextProps, 'as'>
): ReturnType<typeof createText>
```

### Usage

```typescript
import { createCode } from 'flexium/primitives/ui';

const code = createCode({
  children: 'const value = 42;',
  fontSize: 14,
  color: '#d73a49',
  padding: '2px 6px',
  style: {
    backgroundColor: '#f6f8fa',
    borderRadius: '3px',
  },
});

document.body.appendChild(code.element);
```

### Notes

- Automatically sets `fontFamily: 'monospace'` unless overridden
- Can be overridden with custom `fontFamily` prop

## Accessibility

### Semantic HTML

Always use the appropriate semantic element for your content:

```typescript
// Good - proper semantic hierarchy
createHeading(1, { children: 'Page Title' });
createHeading(2, { children: 'Section Title' });
createParagraph({ children: 'Body text...' });

// Bad - using divs or spans for headings
createText({ as: 'span', children: 'Title', fontSize: 32 });
```

### Heading Hierarchy

Maintain proper heading hierarchy for screen readers:

```typescript
// Good - proper hierarchy
createHeading(1, { children: 'Main Title' });
createHeading(2, { children: 'Section' });
createHeading(3, { children: 'Subsection' });

// Bad - skipping levels
createHeading(1, { children: 'Main Title' });
createHeading(3, { children: 'Subsection' }); // Skipped h2
```

### Dynamic Content

Use `ariaLive` for dynamic content that should be announced:

```typescript
import { signal } from 'flexium/core';
import { createText } from 'flexium/primitives/ui';

const status = signal('Loading...');

const statusText = createText({
  as: 'p',
  children: status,
  ariaLive: 'polite', // Announces changes to screen readers
});

// Later
status.set('Complete!'); // Screen reader will announce "Complete!"
```

### Clickable Text

When adding `onClick` handlers to non-interactive elements, accessibility attributes are automatically added:

```typescript
const clickableText = createText({
  as: 'span',
  children: 'Click me',
  onClick: () => console.log('Clicked'),
  // Automatically adds:
  // - role="button"
  // - tabindex="0"
  // - cursor: pointer
  // - keyboard support (Enter/Space)
});
```

## Text Truncation

### Single-Line Truncation

Use `truncate` for single-line truncation with ellipsis:

```typescript
const truncated = createText({
  as: 'p',
  children: 'This is a very long text that will be truncated',
  truncate: true,
  maxWidth: 200,
});
```

Applies these CSS properties:
```css
overflow: hidden;
text-overflow: ellipsis;
white-space: nowrap;
```

### Multi-Line Truncation

Use `lineClamp` for multi-line truncation:

```typescript
const clamped = createText({
  as: 'p',
  children: 'This text will be truncated after 3 lines',
  lineClamp: 3,
});
```

Applies these CSS properties:
```css
display: -webkit-box;
-webkit-line-clamp: 3;
-webkit-box-orient: vertical;
overflow: hidden;
```

## Reactive Content with Signals

Text content can be reactive using signals:

```typescript
import { signal } from 'flexium/core';
import { createText } from 'flexium/primitives/ui';

const username = signal('Guest');

const greeting = createText({
  as: 'p',
  children: username, // Pass signal directly
});

// Text automatically updates
username.set('John'); // Displays "John"
username.set('Jane'); // Displays "Jane"
```

### Computed Text

Combine with computed signals for derived text:

```typescript
import { signal, computed } from 'flexium/core';
import { createText } from 'flexium/primitives/ui';

const firstName = signal('John');
const lastName = signal('Doe');
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

const nameDisplay = createText({
  as: 'p',
  children: fullName,
});

// Updates automatically when either signal changes
firstName.set('Jane'); // Displays "Jane Doe"
```

## Number Formatting

Numeric values are automatically converted to strings:

```typescript
import { signal } from 'flexium/core';
import { createText } from 'flexium/primitives/ui';

const count = signal(0);

const counter = createText({
  as: 'span',
  children: count,
  fontSize: 24,
  fontWeight: 'bold',
});

count.set(42); // Displays "42"
count.set(100); // Displays "100"
```

## Cleanup

Always call `dispose` when removing text elements to prevent memory leaks:

```typescript
const text = createText({
  as: 'p',
  children: 'Hello',
  onClick: () => console.log('Clicked'),
});

document.body.appendChild(text.element);

// Later, when removing
document.body.removeChild(text.element);
text.dispose(); // Clean up event listeners and effects
```

## Notes

- Numeric values in props (like `fontSize`, `margin`) are automatically converted to `px` units
- String values are used as-is (e.g., `fontSize: '1.5rem'`)
- The `update` function allows updating props after creation
- All convenience functions (`createHeading`, `createParagraph`, etc.) return the same object structure as `createText`
- Responsive font size props are available but currently use the base value (future enhancement for media queries)
