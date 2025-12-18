---
title: Data Fetching Patterns Example
---

# Data Fetching Patterns Example

Data fetching pattern examples including caching, infinite scroll, optimistic updates, and error retry.

## Basic Data Fetching

```tsx
import { useState } from 'flexium/core'

function PostList() {
  const [posts, setPosts] = use(async () => {
    const res = await fetch('/api/posts')
    if (!res.ok) throw new Error('Failed to fetch posts')
    return res.json()
  }, { key: 'posts:all' })
  
  if (posts.status === 'loading') {
    return <div>Loading...</div>
  }
  
  if (posts.status === 'error') {
    return (
      <div>
        <p>Error: {posts.error?.message}</p>
        <button onclick={posts.refetch}>Retry</button>
      </div>
    )
  }
  
  return (
    <div>
      <button onclick={posts.refetch}>Refresh</button>
      {posts.map(post => (
        <Post key={post.id} {...post} />
      ))}
    </div>
  )
}
```

---

## Caching Strategy

### Using Global Cache

```tsx
// Share same data across multiple components
// Share same data across multiple components
function PostList() {
  // Cache with global key
  const [posts, setPosts] = use(async () => {
    return fetch('/api/posts').then(r => r.json())
  }, { key: ['posts', 'all'] })

  return <div>{posts.map(p => <Post key={p.id} {...p} />)}</div>
}

function PostDetail({ postId }: { postId: number }) {
  // Find from already cached posts
  const [allPosts, setAllPosts] = use(null, { key: ['posts', 'all'] })
  const [post, setPost] = use(() => {
    return allPosts?.find(p => p.id === postId)
  })

  // Fetch individually if not found
  const [fetchedPost, setFetchedPost] = use(async () => {
    const res = await fetch(`/api/posts/${postId}`)
    return res.json()
  }, { key: ['posts', postId] })

  return <div>{post || fetchedPost}</div>
}
```

---

## Infinite Scroll

```tsx
import { useState, useEffect } from 'flexium/core'

function InfiniteScrollList() {
  const [items, setItems] = useState<any[]>([])
  const [page, setPage] = use(1)
  const [hasMore, setHasMore] = use(true)
  const [isLoading, setIsLoading] = use(false)
  const [error, setError] = useState<Error | null>(null)
  
  const loadMore = async () => {
    if (isLoading || !hasMore) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/items?page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to load')

      const data = await res.json()

      setItems(prev => [...prev, ...data.items])
      setHasMore(data.hasMore)
      setPage(prev => prev + 1)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Scroll event listener
  use(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // Load 100px before bottom
      if (scrollTop + windowHeight >= documentHeight - 100) {
        loadMore()
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  })
  
  return (
    <div>
      {items.map(item => (
        <Item key={item.id} {...item} />
      ))}
      
      {isLoading && <div>Loading...</div>}
      {error && (
        <div>
          <p>Error: {error.message}</p>
          <button onclick={loadMore}>Retry</button>
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <div>No more data</div>
      )}
    </div>
  )
}
```

---

## Optimistic Updates

```tsx
import { useState, sync } from 'flexium/core'

function LikeButton({ postId }: { postId: number }) {
  const [post, setPost] = use(async () => {
    const res = await fetch(`/api/posts/${postId}`)
    return res.json()
  }, { key: ['posts', postId] })

  const [isLiked, setIsLiked] = use(() => post?.isLiked ?? false)
  const [likeCount, setLikeCount] = use(() => post?.likeCount ?? 0)
  const [isUpdating, setIsUpdating] = use(false)
  
  const toggleLike = async () => {
    const previousLiked = isLiked
    const previousCount = likeCount

    // Optimistic update
    sync(() => {
      setIsLiked(prev => !prev)
      setLikeCount(prev => previousLiked ? prev - 1 : prev + 1)
      setIsUpdating(true)
    })
    
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: !previousLiked })
      })
      
      if (!res.ok) throw new Error('Failed to update like')
      
      // Sync state with server response
      const data = await res.json()
      sync(() => {
        setIsLiked(data.isLiked)
        setLikeCount(data.likeCount)
      })

    } catch (error) {
      // Rollback on failure
      sync(() => {
        setIsLiked(previousLiked)
        setLikeCount(previousCount)
      })
      
      alert('Failed to update like')
    } finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <button onclick={toggleLike} disabled={isUpdating}>
      {isLiked ? '❤️' : '🤍'} {likeCount}
    </button>
  )
}
```

---

## Error Retry

```tsx
import { useState } from 'flexium/core'

function DataWithRetry() {
  const [retryCount, setRetryCount] = use(0)
  const maxRetries = 3

  const [data, setData] = use(async () => {
    const res = await fetch('/api/data')
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    return res.json()
  }, { key: 'data:with-retry' })
  
  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      data.refetch()
    }
  }
  
  if (data.status === 'loading') {
    return <div>Loading... (Attempt {retryCount + 1}/{maxRetries + 1})</div>
  }
  
  if (data.status === 'error') {
    return (
      <div>
        <p>Error: {data.error?.message}</p>
        {retryCount < maxRetries ? (
          <button onclick={handleRetry}>
            Retry ({retryCount}/{maxRetries})
          </button>
        ) : (
          <p>Maximum retry count exceeded</p>
        )}
      </div>
    )
  }
  
  return <div>{JSON.stringify(data)}</div>
}
```

---

## Automatic Retry (Exponential Backoff)

```tsx
import { useState, useEffect } from 'flexium/core'

function DataWithAutoRetry() {
  const [data, setData] = use(async () => {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  }, { key: 'data:auto-retry' })

  const [retryCount, setRetryCount] = use(0)
  const [shouldRetry, setShouldRetry] = use(false)
  const maxRetries = 3

  // Automatic retry on error
  use(() => {
    if (data.status === 'error' && retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000) // Exponential backoff
      
      const timeoutId = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        data.refetch()
      }, delay)
      
      return () => clearTimeout(timeoutId)
    }
  })
  
  if (data.status === 'loading') {
    return (
      <div>
        Loading...
        {retryCount > 0 && <span> (Retry {retryCount}/{maxRetries})</span>}
      </div>
    )
  }
  
  if (data.status === 'error') {
    return (
      <div>
        <p>Error: {data.error?.message}</p>
        {retryCount >= maxRetries ? (
          <p>Maximum retry count exceeded</p>
        ) : (
          <p>Retrying automatically...</p>
        )}
      </div>
    )
  }
  
  return <div>{JSON.stringify(data)}</div>
}
```

---

## Polling

```tsx
import { useState, useEffect } from 'flexium/core'

function PollingData({ interval = 5000 }: { interval?: number }) {
  const [data, setData] = use(async () => {
    const res = await fetch('/api/data')
    return res.json()
  }, { key: 'data:polling' })

  const [isPolling, setIsPolling] = use(true)

  // Polling setup
  use(() => {
    if (!isPolling) return
    
    const intervalId = setInterval(() => {
      data.refetch()
    }, interval)
    
    return () => clearInterval(intervalId)
  })
  
  return (
    <div>
      <div>
        <button onclick={() => setIsPolling(prev => !prev)}>
          {isPolling ? 'Stop Polling' : 'Start Polling'}
        </button>
        <button onclick={data.refetch}>Manual Refresh</button>
      </div>
      
      {data.status === 'loading' && <div>Loading...</div>}
      {data.status === 'success' && (
        <div>
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
```

---

## Related Documentation

- [use() API - Async State](/docs/core/state#async-state) - Async state API
- [Best Practices - Common Patterns](/docs/guide/best-practices/patterns) - Data fetching patterns
- [Best Practices - Performance Optimization](/docs/guide/best-practices/performance) - Performance optimization guide