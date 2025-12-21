import { css } from 'flexium/css'

export default function PostsPage() {
  const container = css({ maxWidth: '48rem', margin: '0 auto', padding: '4rem 1rem' })
  const title = css({ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' })
  const subtitle = css({ color: '#94a3b8', marginBottom: '2rem' })
  const grid = css({ display: 'grid', gap: '1.5rem' })
  const postCard = css({
    display: 'block', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.75rem', padding: '1.5rem',
    border: '1px solid #334155', transition: 'border-color 0.2s',
    '&:hover': { borderColor: 'rgba(59, 130, 246, 0.5)' },
  })
  const postHeader = css({ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' })
  const postTitle = css({ fontSize: '1.25rem', fontWeight: 600, transition: 'color 0.2s' })
  const postDate = css({ fontSize: '0.875rem', color: '#64748b' })
  const postExcerpt = css({ color: '#94a3b8', marginBottom: '1rem' })
  const postMeta = css({ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' })
  const readMore = css({ color: '#60a5fa', transition: 'transform 0.2s', display: 'inline-block' })
  const infoBox = css({ marginTop: '2rem', padding: '1rem', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '0.5rem', border: '1px solid #334155' })
  const infoTitle = css({ fontWeight: 600, marginBottom: '0.5rem' })
  const infoText = css({ color: '#94a3b8', fontSize: '0.875rem' })
  const code = css({ color: '#60a5fa', fontFamily: 'monospace' })

  const posts = [
    { id: 1, title: 'Getting Started with Flexism', excerpt: 'Learn how to build your first Flexism application from scratch.', date: '2024-12-20', author: 'Dev Team' },
    { id: 2, title: 'Understanding the Two-Function Pattern', excerpt: 'Deep dive into the server/client architecture of Flexism components.', date: '2024-12-19', author: 'Dev Team' },
    { id: 3, title: 'Building Reactive UIs', excerpt: 'Explore the use() hook and reactive state management in Flexism.', date: '2024-12-18', author: 'Dev Team' },
    { id: 4, title: 'API Routes Made Simple', excerpt: 'Create backend endpoints directly in your Flexism application.', date: '2024-12-17', author: 'Dev Team' },
  ]

  return (
    <div class={container}>
      <h1 class={title}>Blog Posts</h1>
      <p class={subtitle}>Dynamic route example - click a post to see dynamic routing in action</p>
      <div class={grid}>
        {posts.map((post) => (
          <a key={post.id} href={`/posts/${post.id}`} class={postCard}>
            <div class={postHeader}>
              <h2 class={postTitle}>{post.title}</h2>
              <span class={postDate}>{post.date}</span>
            </div>
            <p class={postExcerpt}>{post.excerpt}</p>
            <div class={postMeta}>
              <span>By {post.author}</span>
              <span class={readMore}>Read more →</span>
            </div>
          </a>
        ))}
      </div>
      <div class={infoBox}>
        <h3 class={infoTitle}>How Dynamic Routes Work</h3>
        <p class={infoText}>
          The <code class={code}>/posts/[id]</code> folder contains a page.tsx that receives the <code class={code}>id</code> parameter. Click any post to see it in action!
        </p>
      </div>
    </div>
  )
}
