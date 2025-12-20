# Flexism

[![npm version](https://img.shields.io/npm/v/flexism.svg)](https://www.npmjs.com/package/flexism)
[![npm downloads](https://img.shields.io/npm/dm/flexism.svg)](https://www.npmjs.com/package/flexism)
[![license](https://img.shields.io/npm/l/flexism.svg)](https://github.com/Wick-Lim/flexium.js/blob/main/LICENSE)

**Realtime-first Fullstack Framework for Flexium**

Flexism is a fullstack framework built on top of Flexium, designed for building realtime applications with Server-Sent Events (SSE) and fine-grained reactivity.

## Features

- **SSE-based Streaming** - Real-time data streaming with automatic reconnection
- **Stream API** - Reactive data sources that integrate with Flexium's `use()`
- **Hot Module Replacement** - CSS hot reload without page refresh
- **Incremental Builds** - Only changed files recompile
- **Memory Optimization** - LRU cache with automatic cleanup
- **CLI Tools** - Development server, build, and production commands


## Installation

```bash
npm install flexism flexium
```

## Quick Start

```bash
npm create flexism@latest my-app
cd my-app
npm install
npm run dev
```

## CLI Commands

```bash
flexism dev     # Start development server with HMR
flexism build   # Build for production
flexism start   # Start production server
```

## Stream API

Stream provides reactive SSE data sources that work with Flexium's `use()`.

### Client-side

```tsx
import { use } from 'flexium/core'
import { Stream } from 'flexism'

// Define a stream
const messages = new Stream<Message>('/api/messages')

function Chat() {
  // Automatically subscribes to SSE
  const [message] = use(messages)

  return <div>{message?.text}</div>
}
```

### Server-side

```ts
import { sse } from 'flexism/server'

// With async generator (recommended)
export function GET() {
  return sse(async function* () {
    yield { text: 'Hello!' }

    // Stream updates over time
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 1000))
      yield { text: `Time: ${Date.now()}` }
    }
  })
}

// With context callback
export function GET() {
  return sse((ctx) => {
    ctx.send({ text: 'Hello!' })

    const interval = setInterval(() => {
      if (!ctx.isOpen) {
        clearInterval(interval)
        return
      }
      ctx.send({ text: `Time: ${Date.now()}` })
    }, 1000)
  })
}

// From async iterable
export function GET() {
  return sse.from(db.posts.subscribe())
}
```

## Package Structure

```
flexism
├── /           # Stream class for reactive SSE
├── /server     # SSE helpers for server-side
└── /client     # SSEClient for client-side connections
```

## Requirements

- Node.js 18.0.0 or higher
- Flexium >= 0.15.0

## Documentation

Full documentation available at [https://flexium.junhyuk.im](https://flexium.junhyuk.im)

## License

MIT
