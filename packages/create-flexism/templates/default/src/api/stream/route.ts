import { sse } from 'flexism/server'

/**
 * AI Chat Stream API
 * Streams response tokens one by one, simulating LLM output
 */
export async function POST(request: Request) {
  // Simulated AI responses
  const responses: Record<string, string> = {
    hello: "Hi there! I'm a demo AI assistant built with Flexism's SSE streaming. How can I help you today?",
    flexism: "Flexism is a realtime-first fullstack framework featuring two-function pattern for server/client separation, file-based routing, reactive state with use() hook, and built-in SSE streaming support!",
    sse: "Server-Sent Events (SSE) enable real-time one-way communication from server to client. Perfect for live updates, notifications, and streaming AI responses like this one!",
    default: "I'm a demo AI that streams responses token by token. Try asking about 'flexism' or 'sse' to learn more!",
  }

  let message = ''
  try {
    const body = await request.json()
    message = (body.message || '').toLowerCase()
  } catch {
    message = ''
  }

  // Pick response based on keywords
  let response = responses.default
  if (message.includes('hello') || message.includes('hi')) {
    response = responses.hello
  } else if (message.includes('flexism') || message.includes('framework')) {
    response = responses.flexism
  } else if (message.includes('sse') || message.includes('stream')) {
    response = responses.sse
  }

  const { headers, body: streamBody } = sse(async function* () {
    const words = response.split(' ')
    for (let i = 0; i < words.length; i++) {
      yield { token: words[i] + (i < words.length - 1 ? ' ' : ''), done: false }
      await new Promise((r) => setTimeout(r, 30 + Math.random() * 50))
    }
    yield { token: '', done: true }
  })

  return new Response(streamBody, { headers })
}
