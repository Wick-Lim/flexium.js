# Stream

Reactive SSE (Server-Sent Events) data source that integrates with Flexium's `use()`.

## Import

```ts
import { Stream } from 'flexism'
```

## Overview

`Stream` provides real-time data streaming from server to client using SSE. It extends Flexium's `Useable` base class, allowing seamless integration with `use()`.

## Basic Usage

```tsx
import { use } from 'flexium/core'
import { Stream } from 'flexism'

// Define a stream
const messages = new Stream<Message>('/api/messages')

function Chat() {
  // Automatically connects to SSE endpoint
  const [message] = use(messages)

  return <div>{message?.text}</div>
}
```

## With Parameters

Pass dynamic parameters to construct the URL:

```tsx
const userStream = new Stream<User>((userId: string) => `/api/users/${userId}/events`)

function UserStatus({ userId }: { userId: string }) {
  const [user] = use(userStream, userId)

  return <span>{user?.status}</span>
}
```

## Options

```tsx
const stream = new Stream<Data>('/api/events', {
  // Initial value before first message
  initial: { count: 0 },

  // Only receive one message then close
  once: true,

  // SSE client options
  sse: {
    // Retry on error (default: true)
    retry: true,

    // Retry delay in ms (default: 1000)
    retryDelay: 3000,

    // Use POST instead of GET
    method: 'POST',

    // Request body for POST
    body: { filter: 'active' }
  }
})
```

## API Reference

### Constructor

```ts
new Stream<T, P = void>(
  source: string | ((params: P) => string),
  options?: StreamOptions<T>
)
```

### StreamOptions

```ts
interface StreamOptions<T> {
  initial?: T
  once?: boolean
  sse?: SSEClientOptions
}

interface SSEClientOptions {
  retry?: boolean
  retryDelay?: number
  method?: 'GET' | 'POST'
  body?: unknown
  headers?: Record<string, string>
}
```

## See Also

- [SSE Server Helpers](/docs/flexism/sse) - Create SSE endpoints
- [use()](/docs/core/use) - Unified reactive API
