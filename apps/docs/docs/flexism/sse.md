# SSE Server Helpers

Server-side utilities for creating SSE (Server-Sent Events) endpoints.

## Import

```ts
import { sse } from 'flexism/server'
```

## Overview

The `sse()` helper creates SSE responses that work with any JavaScript runtime (Node.js, Bun, Deno, Cloudflare Workers).

## Basic Usage

```ts
import { sse } from 'flexism/server'

export function GET() {
  return sse(async (send) => {
    send({ message: 'Connected!' })

    // Send periodic updates
    const interval = setInterval(() => {
      send({ time: Date.now() })
    }, 1000)

    // Cleanup when client disconnects
    return () => clearInterval(interval)
  })
}
```

## Stream from Async Iterable

Use `sse.from()` to stream from any async iterable:

```ts
import { sse } from 'flexism/server'

async function* generateEvents() {
  for (let i = 0; i < 10; i++) {
    yield { count: i }
    await new Promise(r => setTimeout(r, 1000))
  }
}

export function GET() {
  return sse.from(generateEvents())
}
```

## With AI Streaming

Perfect for streaming AI responses:

```ts
import { sse } from 'flexism/server'
import { OpenAI } from 'openai'

const openai = new OpenAI()

export async function POST(request: Request) {
  const { prompt } = await request.json()

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true
  })

  return sse.from(
    (async function* () {
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content
        if (content) yield { content }
      }
    })()
  )
}
```

## Response Format

SSE messages are formatted as:

```
data: {"message":"hello"}

data: {"time":1234567890}

```

Each message is JSON-encoded and followed by two newlines.

## API Reference

### sse()

```ts
function sse(handler: SSEHandler): Response

type SSEHandler = (
  send: <T>(data: T) => void
) => void | (() => void) | Promise<void | (() => void)>
```

### sse.from()

```ts
function from<T>(source: AsyncIterable<T>): Response
```

## See Also

- [Stream](/docs/flexism/stream) - Client-side SSE consumption
- [use()](/docs/core/use) - Unified reactive API
