import { css } from 'flexium/css'

export default function AboutPage() {
  const container = css({ maxWidth: '48rem', margin: '0 auto', padding: '4rem 1rem' })
  const title = css({ fontSize: '2.5rem', fontWeight: 700, marginBottom: '2rem' })
  const intro = css({ fontSize: '1.125rem', color: '#cbd5e1', marginBottom: '1.5rem' })
  const sectionTitle = css({ fontSize: '1.5rem', fontWeight: 600, marginTop: '2rem', marginBottom: '1rem' })
  const features = css({ display: 'grid', gap: '1rem' })
  const featureCard = css({ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.5rem', padding: '1rem', border: '1px solid #334155' })
  const featureTitle = css({ fontWeight: 600, marginBottom: '0.5rem' })
  const featureBlue = css({ color: '#60a5fa' })
  const featurePurple = css({ color: '#a855f7' })
  const featurePink = css({ color: '#ec4899' })
  const featureGreen = css({ color: '#4ade80' })
  const featureText = css({ color: '#94a3b8', fontSize: '0.875rem' })
  const codeBlock = css({ background: '#1e293b', borderRadius: '0.5rem', padding: '1rem', overflow: 'auto', fontSize: '0.875rem', fontFamily: 'monospace', whiteSpace: 'pre', color: '#cbd5e1' })

  return (
    <div class={container}>
      <h1 class={title}>About Flexism</h1>
      <p class={intro}>
        Flexism is a realtime-first fullstack framework built on top of Flexium,
        designed for building modern web applications with minimal boilerplate.
      </p>

      <h2 class={sectionTitle}>Key Features</h2>
      <div class={features}>
        <div class={featureCard}>
          <h3 class={`${featureTitle} ${featureBlue}`}>File-Based Routing</h3>
          <p class={featureText}>Create files in the src directory and they automatically become routes. No configuration needed.</p>
        </div>
        <div class={featureCard}>
          <h3 class={`${featureTitle} ${featurePurple}`}>Two-Function Pattern</h3>
          <p class={featureText}>The outer function runs on the server for data fetching. The inner function hydrates on the client with full reactivity.</p>
        </div>
        <div class={featureCard}>
          <h3 class={`${featureTitle} ${featurePink}`}>API Routes</h3>
          <p class={featureText}>Export GET, POST, PUT, DELETE functions from any route file to create API endpoints.</p>
        </div>
        <div class={featureCard}>
          <h3 class={`${featureTitle} ${featureGreen}`}>Dynamic Routes</h3>
          <p class={featureText}>Use [param] folder names to create dynamic routes. Access params in your loader function.</p>
        </div>
      </div>

      <h2 class={sectionTitle}>Project Structure</h2>
      <pre class={codeBlock}>{`src/
  layout.tsx      # Root layout (wraps all pages)
  page.tsx        # Home page (/)
  about/
    page.tsx      # About page (/about)
  counter/
    page.tsx      # Counter page (/counter)
  todos/
    page.tsx      # Todos page (/todos)
  posts/
    page.tsx      # Posts list (/posts)
    [id]/
      page.tsx    # Dynamic post (/posts/:id)`}</pre>
    </div>
  )
}
