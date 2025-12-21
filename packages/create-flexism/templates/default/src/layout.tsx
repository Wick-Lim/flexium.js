import { css } from 'flexium/css'

interface LayoutProps {
  children: any
}

export default function RootLayout({ children }: LayoutProps) {
  const globalStyles = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.5; -webkit-font-smoothing: antialiased; }
    body { background: #0f172a; color: #fff; min-height: 100vh; }
    a { color: inherit; text-decoration: none; }
    button { cursor: pointer; border: none; background: none; font: inherit; color: inherit; }
    input, textarea { font: inherit; }
  `
  const nav = css({ borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', zIndex: 50 })
  const navContainer = css({ maxWidth: '72rem', margin: '0 auto', padding: '0 1rem' })
  const navInner = css({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4rem' })
  const logo = css({ fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(to right, #60a5fa, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' })
  const navLinks = css({ display: 'flex', gap: '0.25rem' })
  const navLink = css({ padding: '0.5rem 0.75rem', borderRadius: '0.5rem', color: '#94a3b8', transition: 'all 0.2s', '&:hover': { color: '#fff', background: 'rgba(255, 255, 255, 0.05)' } })
  const footer = css({ borderTop: '1px solid #1e293b', padding: '2rem 0', marginTop: '4rem' })
  const footerText = css({ maxWidth: '72rem', margin: '0 auto', padding: '0 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' })

  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Flexism App</title>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      </head>
      <body>
        <nav class={nav}>
          <div class={navContainer}>
            <div class={navInner}>
              <a href="/" class={logo}>Flexism</a>
              <div class={navLinks}>
                <a href="/" class={navLink}>Home</a>
                <a href="/counter" class={navLink}>Counter</a>
                <a href="/todos" class={navLink}>Todos</a>
                <a href="/posts" class={navLink}>Posts</a>
                <a href="/stream" class={navLink}>Chat</a>
                <a href="/about" class={navLink}>About</a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer class={footer}>
          <div class={footerText}>
            Built with Flexism - The Realtime-first Fullstack Framework
          </div>
        </footer>
      </body>
    </html>
  )
}
