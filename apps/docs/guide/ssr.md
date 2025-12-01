---
title: Server-Side Rendering (SSR) - SEO & Performance
description: Implement SSR with Flexium for improved SEO and faster initial page loads. Server entry, hydration, and best practices.
head:
  - - meta
    - property: og:title
      content: Server-Side Rendering - Flexium SSR
  - - meta
    - property: og:description
      content: Generate HTML on the server for better SEO and initial load performance. Complete SSR guide for Flexium.
---

# Server-Side Rendering (SSR)

Flexium supports Server-Side Rendering to generate HTML on the server, improving SEO and initial load performance.

## Server Entry

Use `renderToString` to render your application to an HTML string.

```tsx
import { renderToString } from 'flexium/server'
import App from './App'

const html = renderToString(<App />)
```

## Client Entry

Use `hydrate` instead of `render` to attach event listeners to the existing HTML.

```tsx
import { hydrate } from 'flexium/dom'
import App from './App'

hydrate(<App />, document.getElementById('app')!)
```

## Hydration

Hydration assumes that the server-rendered HTML matches the structure of your application. Flexium will traverse the DOM and attach reactivity and event listeners without recreating nodes.
