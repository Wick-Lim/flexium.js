import { css } from 'flexium/css'

export default function HomePage() {
  const container = css({ maxWidth: '72rem', margin: '0 auto', padding: '4rem 1rem' })
  const hero = css({ textAlign: 'center', marginBottom: '4rem' })
  const title = css({
    fontSize: '3.5rem', fontWeight: 700,
    background: 'linear-gradient(to right, #60a5fa, #a855f7, #ec4899)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
    marginBottom: '1.5rem',
  })
  const subtitle = css({ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '42rem', margin: '0 auto 2rem' })
  const buttons = css({ display: 'flex', gap: '1rem', justifyContent: 'center' })
  const btnPrimary = css({ padding: '0.75rem 1.5rem', background: '#2563eb', borderRadius: '0.5rem', fontWeight: 500, transition: 'background 0.2s', '&:hover': { background: '#1d4ed8' } })
  const btnSecondary = css({ padding: '0.75rem 1.5rem', background: '#334155', borderRadius: '0.5rem', fontWeight: 500, transition: 'background 0.2s', '&:hover': { background: '#475569' } })
  const grid = css({ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '4rem', '@media (max-width: 768px)': { gridTemplateColumns: '1fr' } })
  const card = css({ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155' })
  const cardIcon = css({ fontSize: '2rem', marginBottom: '1rem' })
  const cardTitle = css({ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' })
  const cardText = css({ color: '#94a3b8', fontSize: '0.875rem' })
  const codeSection = css({ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155' })
  const codeTitle = css({ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' })
  const codeBlock = css({ background: '#0f172a', borderRadius: '0.5rem', padding: '1rem', overflow: 'auto', fontSize: '0.875rem', color: '#cbd5e1', fontFamily: 'monospace', whiteSpace: 'pre' })

  return (
    <div class={container}>
      <div class={hero}>
        <h1 class={title}>Welcome to Flexism</h1>
        <p class={subtitle}>
          The realtime-first fullstack framework. Build interactive web apps with
          server-side rendering, client hydration, and reactive state management.
        </p>
        <div class={buttons}>
          <a href="/counter" class={btnPrimary}>Try Counter Demo</a>
          <a href="/todos" class={btnSecondary}>View Todos</a>
        </div>
      </div>

      <div class={grid}>
        <div class={card}>
          <div class={cardIcon}>&#9889;</div>
          <h3 class={cardTitle}>Two-Function Pattern</h3>
          <p class={cardText}>
            Outer function runs on server for data loading. Inner function renders on client with reactivity.
          </p>
        </div>
        <div class={card}>
          <div class={cardIcon}>&#128640;</div>
          <h3 class={cardTitle}>File-Based Routing</h3>
          <p class={cardText}>
            Next.js-style routing. Create page.tsx files and they become routes automatically.
          </p>
        </div>
        <div class={card}>
          <div class={cardIcon}>&#127919;</div>
          <h3 class={cardTitle}>Reactive State</h3>
          <p class={cardText}>
            Simple use() hook for reactive state. Changes automatically update the DOM.
          </p>
        </div>
      </div>

      <div class={codeSection}>
        <h2 class={codeTitle}>Quick Example</h2>
        <pre class={codeBlock}>{`// src/page.tsx
import { use } from 'flexium/core'

export default function Counter() {
  // Server: fetch initial data
  const initialCount = 0

  // Client: reactive component
  return () => {
    const [count, setCount] = use(initialCount)
    return (
      <button onclick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    )
  }
}`}</pre>
      </div>
    </div>
  )
}
