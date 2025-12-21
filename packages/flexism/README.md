# Flexism

[![npm version](https://img.shields.io/npm/v/flexism.svg)](https://www.npmjs.com/package/flexism)
[![npm downloads](https://img.shields.io/npm/dm/flexism.svg)](https://www.npmjs.com/package/flexism)
[![license](https://img.shields.io/npm/l/flexism.svg)](https://github.com/Wick-Lim/flexium.js/blob/main/LICENSE)

**Realtime-first Fullstack Framework for Flexium**

Flexism is a fullstack framework built on top of Flexium, designed for building realtime applications with Server-Sent Events (SSE) and fine-grained reactivity.

## Features

- **File-based Routing** - page.tsx, route.ts, layout.tsx conventions
- **Two-function Pattern** - Server loader + Client component in one file
- **SSE Streaming** - Real-time data with automatic reconnection
- **Hot Module Replacement** - CSS hot reload without page refresh
- **Incremental Builds** - Only changed files recompile
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

## File-based Routing

```
src/
├── page.tsx              # / (home)
├── layout.tsx            # Root layout
├── about/
│   └── page.tsx          # /about
├── users/
│   ├── page.tsx          # /users
│   └── [id]/
│       └── page.tsx      # /users/:id
└── api/
    └── messages/
        └── route.ts      # /api/messages
```

## Page (Two-function Pattern)

Server logic and client component in one function:

```tsx
// src/users/[id]/page.tsx
export default async function UserPage({ params }) {
  // Server: runs on server, fetches data
  const user = await db.users.find(params.id)

  // Client: hydrates on client with server data
  return ({ user }) => (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

The outer function is the **server loader** (async, has DB access).
The returned inner function is the **client component** (hydrated in browser).

## API Route (SSE Streaming)

```ts
// src/api/messages/route.ts
import { sse } from 'flexism/server'

// SSE endpoint with async generator
export function GET() {
  return sse(async function* () {
    yield { text: 'Connected!' }

    for await (const msg of db.messages.subscribe()) {
      yield msg
    }
  })
}

// Regular JSON API
export async function POST(request) {
  const body = await request.json()
  const message = await db.messages.create(body)
  return Response.json(message)
}
```

## Stream (Reactive SSE)

Declare real-time streams with the two-function pattern:

```tsx
// src/chat/[roomId]/page.tsx
import { use } from 'flexium/core'
import { Stream } from 'flexism/stream'

export default async function ChatPage({ params }) {
  // Server: Create stream with callback (runs on server)
  const Messages = new Stream<Message[]>(() =>
    db.messages.subscribe(params.roomId)
  )

  // Client: Receive StreamRef and subscribe reactively
  return ({ Messages }) => {
    const [messages] = use(Messages)

    return (
      <ul>
        {messages?.map(m => <li key={m.id}>{m.text}</li>)}
      </ul>
    )
  }
}
```

### How It Works

1. **Server**: `Stream` captures the callback and runtime params
2. **Compiler**: Generates SSE handler at `/_flexism/sse/{id}`
3. **Client**: Receives `StreamRef` that auto-connects to SSE endpoint
4. **Reactive**: `use()` hook updates UI when new data arrives

### Stream with Options

```tsx
const Notifications = new Stream<Notification>(
  () => notificationService.subscribe(userId),
  {
    initial: [],     // Initial value before connection
    once: true       // Close after first complete response
  }
)
```

## Layout

Wrap pages with shared UI:

```tsx
// src/layout.tsx
export function Component({ children }) {
  return (
    <html>
      <head><title>My App</title></head>
      <body>
        <nav>...</nav>
        {children}
      </body>
    </html>
  )
}
```

## Requirements

- Node.js 18.0.0 or higher
- Flexium >= 0.15.8

## Documentation

Full documentation available at [https://flexium.junhyuk.im](https://flexium.junhyuk.im)

## License

MIT
