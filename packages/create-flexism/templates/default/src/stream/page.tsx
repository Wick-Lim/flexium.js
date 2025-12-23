import { use, SendableStream } from 'flexism'
import { css } from 'flexium/css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// Styles (module-level - works on both server and client)
const container = css({
  maxWidth: '800px',
  margin: '0 auto',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: '#0f172a',
})

const header = css({
  padding: '1rem 1.5rem',
  borderBottom: '1px solid #1e293b',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
})

const avatar = css({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.25rem',
})

const headerText = css({ flex: 1 })

const headerTitle = css({
  fontSize: '1.125rem',
  fontWeight: 600,
  color: '#f1f5f9',
})

const headerSub = css({
  fontSize: '0.75rem',
  color: '#64748b',
})

const chatArea = css({
  flex: 1,
  overflowY: 'auto',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
})

const messageRow = css({
  display: 'flex',
  gap: '0.75rem',
  maxWidth: '85%',
})

const userRow = css({
  display: 'flex',
  justifyContent: 'flex-end',
  maxWidth: '100%',
})

const msgAvatar = css({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.875rem',
  flexShrink: 0,
})

const bubble = css({
  padding: '0.75rem 1rem',
  borderRadius: '1rem',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap',
})

const assistantBubble = css({
  background: '#1e293b',
  color: '#e2e8f0',
  borderTopLeftRadius: '0.25rem',
})

const userBubble = css({
  background: '#3b82f6',
  color: '#fff',
  borderTopRightRadius: '0.25rem',
  maxWidth: '85%',
})

const inputArea = css({
  padding: '1rem 1.5rem',
  borderTop: '1px solid #1e293b',
  background: '#0f172a',
})

const inputWrapper = css({
  display: 'flex',
  gap: '0.75rem',
  background: '#1e293b',
  borderRadius: '1.5rem',
  padding: '0.5rem 0.5rem 0.5rem 1.25rem',
  alignItems: 'center',
})

const inputStyle = css({
  flex: 1,
  background: 'transparent',
  border: 'none',
  outline: 'none',
  color: '#f1f5f9',
  fontSize: '1rem',
})

const sendBtn = css({
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: '#3b82f6',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s',
})

const sendBtnDisabled = css({
  background: '#475569',
  cursor: 'not-allowed',
})

const emptyState = css({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#64748b',
  gap: '1rem',
})

const emptyIcon = css({
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2rem',
})

export default function StreamDemo() {
  const responses = [
    "Hello!", "I'm", "powered", "by", "Flexism's", "Stream", "API.",
    "Flexism", "uses", "SSE", "to", "stream", "data", "in", "real-time.",
    "Perfect", "for", "AI", "chat", "-", "responses", "shown", "as", "they're", "generated.",
  ]

  const Chat = new SendableStream<string, { message: string }>(
    async function* (_p) {
      let full = ''
      for (const word of responses) {
        full += word + ' '
        yield full
        await new Promise(r => setTimeout(r, 80))
      }
    },
    { initial: '' }
  )

  return () => {
    const [input, setInput] = use('')
    const [streaming, send] = use(Chat)
    const [messages, setMessages] = use<Message[]>([])
    const [isStreaming, setIsStreaming] = use(false)

    const handleSubmit = (e: Event) => {
      e.preventDefault()
      if (!input.trim() || isStreaming) return

      const userMessage = input.trim()
      setMessages(prev => [...prev, { role: 'user', content: userMessage }])
      setInput('')
      setIsStreaming(true)
      send({ message: userMessage })

      // Simulate end of streaming after responses complete
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: streaming || responses.join(' ') }])
        setIsStreaming(false)
      }, (responses.join('').length * 30) + (responses.length * 300) + 500)
    }

    return (
      <div class={container}>
        <div class={header}>
          <div class={avatar}>AI</div>
          <div class={headerText}>
            <div class={headerTitle}>Flexism AI</div>
            <div class={headerSub}>Powered by SendableStream</div>
          </div>
        </div>

        <div class={chatArea}>
          {messages.length === 0 && !isStreaming ? (
            <div class={emptyState}>
              <div class={emptyIcon}>AI</div>
              <div style={{ fontSize: '1.25rem', color: '#e2e8f0' }}>How can I help you today?</div>
              <div>Send a message to start streaming</div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                msg.role === 'user' ? (
                  <div class={userRow}>
                    <div class={`${bubble} ${userBubble}`}>{msg.content}</div>
                  </div>
                ) : (
                  <div class={messageRow}>
                    <div class={msgAvatar}>AI</div>
                    <div class={`${bubble} ${assistantBubble}`}>{msg.content}</div>
                  </div>
                )
              ))}
              {isStreaming && streaming && (
                <div class={messageRow}>
                  <div class={msgAvatar}>AI</div>
                  <div class={`${bubble} ${assistantBubble}`}>{streaming}</div>
                </div>
              )}
            </>
          )}
        </div>

        <div class={inputArea}>
          <form class={inputWrapper} onsubmit={handleSubmit}>
            <input
              class={inputStyle}
              value={input}
              oninput={(e: Event) => setInput((e.target as HTMLInputElement).value)}
              placeholder="Message Flexism AI..."
              disabled={isStreaming}
            />
            <button
              class={`${sendBtn} ${(!input.trim() || isStreaming) ? sendBtnDisabled : ''}`}
              type="submit"
              disabled={!input.trim() || isStreaming}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    )
  }
}
