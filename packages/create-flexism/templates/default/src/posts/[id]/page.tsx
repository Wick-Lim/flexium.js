import { css } from 'flexium/css'

interface PageProps { params: { id: string } }

export default function PostPage({ params }: PageProps) {
  const container = css({ maxWidth: '48rem', margin: '0 auto', padding: '4rem 1rem' })
  const backLink = css({ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', marginBottom: '2rem', transition: 'color 0.2s', '&:hover': { color: '#fff' } })
  const title = css({ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' })
  const meta = css({ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8', marginBottom: '2rem' })
  const content = css({ background: '#1e293b', borderRadius: '0.5rem', padding: '1.5rem', whiteSpace: 'pre-wrap', color: '#cbd5e1', fontFamily: 'monospace', fontSize: '0.875rem', marginBottom: '2rem' })
  const infoBox = css({ marginTop: '2rem', padding: '1rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.5rem', border: '1px solid #334155' })
  const infoTitle = css({ fontWeight: 600, marginBottom: '0.5rem' })
  const infoText = css({ color: '#94a3b8', fontSize: '0.875rem' })
  const code = css({ fontFamily: 'monospace' })
  const codeBlue = css({ color: '#60a5fa' })
  const codeGreen = css({ color: '#4ade80' })
  const tipBox = css({ marginTop: '1rem', padding: '1rem', background: 'rgba(30, 58, 138, 0.3)', borderRadius: '0.5rem', border: '1px solid #1d4ed8' })
  const tipText = css({ color: '#93c5fd', fontSize: '0.875rem' })
  const tipLink = css({ color: '#60a5fa', '&:hover': { textDecoration: 'underline' } })

  const posts: Record<string, { title: string; content: string; author: string; date: string }> = {
    '1': { title: 'Getting Started with Flexism', content: `Flexism is a modern fullstack framework.\n\nQuick Start:\n  npx create-flexism my-app\n  cd my-app\n  npm run dev\n\nKey Concepts:\n  1. File-Based Routing\n  2. Two-Function Pattern\n  3. Reactive State`, author: 'Dev Team', date: '2024-12-20' },
    '2': { title: 'Understanding the Two-Function Pattern', content: `The two-function pattern is the core of Flexism.\n\nHow It Works:\n  Outer function = Server\n  Inner function = Client\n\nExample:\n  export default function MyPage() {\n    const data = fetchData() // SERVER\n    return () => {\n      const [state] = use(data) // CLIENT\n      return <div>{state}</div>\n    }\n  }`, author: 'Dev Team', date: '2024-12-19' },
    '3': { title: 'Building Reactive UIs', content: `Flexism's use() hook is simple.\n\nBasic Usage:\n  const [count, setCount] = use(0)\n  setCount(count + 1)\n  setCount(c => c + 1)\n\nFeatures:\n  - Automatic DOM updates\n  - Fine-grained reactivity\n  - No boilerplate`, author: 'Dev Team', date: '2024-12-18' },
    '4': { title: 'API Routes Made Simple', content: `Create API endpoints easily.\n\nExample:\n  export function GET() {\n    return Response.json({ users: [] })\n  }\n\n  export function POST(req) {\n    const body = await req.json()\n    return Response.json({ created: body })\n  }`, author: 'Dev Team', date: '2024-12-17' },
  }

  const post = posts[params.id] || { title: 'Post Not Found', content: 'The requested post does not exist.', author: 'Unknown', date: 'N/A' }

  return (
    <div class={container}>
      <a href="/posts" class={backLink}>← Back to Posts</a>
      <article>
        <h1 class={title}>{post.title}</h1>
        <div class={meta}><span>By {post.author}</span><span>•</span><span>{post.date}</span></div>
        <pre class={content}>{post.content}</pre>
      </article>
      <div class={infoBox}>
        <h3 class={infoTitle}>Dynamic Route Parameter</h3>
        <p class={infoText}>This page is at <code class={`${code} ${codeBlue}`}>/posts/[id]</code> and received <code class={`${code} ${codeGreen}`}>id = "{params.id}"</code> from the URL.</p>
      </div>
      <div class={tipBox}>
        <p class={tipText}>For interactive examples, check out the <a href="/counter" class={tipLink}>Counter</a> or <a href="/todos" class={tipLink}>Todos</a> pages.</p>
      </div>
    </div>
  )
}
