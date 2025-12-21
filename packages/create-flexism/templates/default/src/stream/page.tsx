import { use } from 'flexium/core'
import { css } from 'flexium/css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  return () => {
    const container = css({ maxWidth: '48rem', margin: '0 auto', padding: '4rem 1rem' })
    const title = css({ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' })
    const subtitle = css({ color: '#94a3b8', marginBottom: '2rem' })
    const card = css({ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '1rem', border: '1px solid #334155', overflow: 'hidden' })
    const messagesArea = css({ height: '400px', overflowY: 'auto', padding: '1.5rem' })
    const messageRow = css({ marginBottom: '1rem', display: 'flex' })
    const userRow = css({ justifyContent: 'flex-end' })
    const assistantRow = css({ justifyContent: 'flex-start' })
    const messageBubble = css({ maxWidth: '80%', padding: '0.75rem 1rem', borderRadius: '1rem', lineHeight: 1.5 })
    const userBubble = css({ background: '#2563eb', borderBottomRightRadius: '0.25rem' })
    const assistantBubble = css({ background: '#334155', borderBottomLeftRadius: '0.25rem' })
    const inputArea = css({ display: 'flex', gap: '0.75rem', padding: '1rem', borderTop: '1px solid #334155', background: 'rgba(15, 23, 42, 0.5)' })
    const input = css({ flex: 1, padding: '0.75rem 1rem', background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', color: '#fff', outline: 'none' })
    const sendBtn = css({ padding: '0.75rem 1.5rem', background: '#2563eb', borderRadius: '0.5rem', fontWeight: 500, transition: 'background 0.2s' })
    const sendBtnDisabled = css({ opacity: 0.5, cursor: 'not-allowed' })
    const cursor = css({ display: 'inline-block', width: '8px', height: '1em', background: '#60a5fa', marginLeft: '2px' })
    const emptyState = css({ textAlign: 'center', color: '#64748b', padding: '4rem 1rem' })
    const hint = css({ fontSize: '0.875rem', color: '#64748b', marginTop: '0.5rem' })

    const [messages, setMessages] = use<Message[]>([])
    const [inputValue, setInputValue] = use('')
    const [isStreaming, setIsStreaming] = use(false)

    const sendMessage = async () => {
      const text = inputValue.trim()
      if (!text || isStreaming) return

      // Add user message
      setMessages((prev: Message[]) => [...prev, { role: 'user', content: text }])
      setInputValue('')
      setIsStreaming(true)

      // Add empty assistant message
      setMessages((prev: Message[]) => [...prev, { role: 'assistant', content: '' }])

      try {
        const response = await fetch('/api/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        })

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6))
                  if (data.token) {
                    setMessages((prev: Message[]) => {
                      const updated = [...prev]
                      const last = updated[updated.length - 1]
                      if (last.role === 'assistant') {
                        last.content += data.token
                      }
                      return updated
                    })
                  }
                } catch {}
              }
            }
          }
        }
      } catch (err) {
        console.error('Stream error:', err)
      }

      setIsStreaming(false)
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    }

    return (
      <div class={container}>
        <h1 class={title}>AI Chat Demo</h1>
        <p class={subtitle}>Real-time streaming responses with Server-Sent Events</p>

        <div class={card}>
          <div class={messagesArea}>
            {messages.length === 0 ? (
              <div class={emptyState}>
                <div>Start a conversation!</div>
                <div class={hint}>Try: "What is Flexism?" or "How does SSE work?"</div>
              </div>
            ) : (
              messages.map((msg) => (
                <div class={`${messageRow} ${msg.role === 'user' ? userRow : assistantRow}`}>
                  <div class={`${messageBubble} ${msg.role === 'user' ? userBubble : assistantBubble}`}>
                    {msg.content}
                    {msg.role === 'assistant' && isStreaming && msg === messages[messages.length - 1] && (
                      <span class={cursor} />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div class={inputArea}>
            <input
              type="text"
              class={input}
              placeholder="Type a message..."
              value={inputValue}
              oninput={(e: Event) => setInputValue((e.target as HTMLInputElement).value)}
              onkeydown={handleKeyDown}
              disabled={isStreaming}
            />
            <button
              class={`${sendBtn} ${isStreaming ? sendBtnDisabled : ''}`}
              onclick={sendMessage}
              disabled={isStreaming}
            >
              {isStreaming ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    )
  }
}
