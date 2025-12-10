---
title: Data Fetching Patterns Example
---

# Data Fetching Patterns Example

Data fetching pattern examples including caching, infinite scroll, optimistic updates, and error retry.

## Basic Data Fetching

```tsx
import { state } from 'flexium/core'

function PostList() {
  const [posts, refetch, status, error] = state(async () => {
    const res = await fetch('/api/posts')
    if (!res.ok) throw new Error('Failed to fetch posts')
    return res.json()
  }, { key: 'posts:all' })
  
  if (String(status) === 'loading') {
    return <div>Loading...</div>
  }
  
  if (String(status) === 'error') {
    return (
      <div>
        <p>Error: {error?.message}</p>
        <button onclick={refetch}>Retry</button>
      </div>
    )
  }
  
  return (
    <div>
      <button onclick={refetch}>Refresh</button>
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
function PostList() {
  // Cache with global key
  const [posts] = state(async () => {
    return fetch('/api/posts').then(r => r.json())
  }, { key: ['posts', 'all'] })
  
  return <div>{posts.map(p => <Post key={p.id} {...p} />)}</div>
}

function PostDetail({ postId }: { postId: number }) {
  // Find from already cached posts
  const [allPosts] = state(null, { key: ['posts', 'all'] })
  const [post] = state(() => {
    return allPosts?.find(p => p.id === postId)
  })
  
  // Fetch individually if not found
  const [fetchedPost, refetch] = state(async () => {
    const res = await fetch(`/api/posts/${postId}`)
    return res.json()
  }, { key: ['posts', postId] })
  
  return <div>{post || fetchedPost}</div>
}
```

---

## Infinite Scroll

```tsx
import { state, effect } from 'flexium/core'

function InfiniteScrollList() {
  const [items, setItems] = state<any[]>([])
  const [page, setPage] = state(1)
  const [hasMore, setHasMore] = state(true)
  const [isLoading, setIsLoading] = state(false)
  const [error, setError] = state<Error | null>(null)
  
  const loadMore = async () => {
    if (isLoading || !hasMore) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/items?page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to load')
      
      const data = await res.json()
      
      setItems([...items, ...data.items])
      setHasMore(data.hasMore)
      setPage(page + 1)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Scroll event listener
  effect(() => {
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
import { state, sync } from 'flexium/core'

function LikeButton({ postId }: { postId: number }) {
  const [post, refetch] = state(async () => {
    const res = await fetch(`/api/posts/${postId}`)
    return res.json()
  }, { key: ['posts', postId] })
  
  const [isLiked, setIsLiked] = state(() => post?.isLiked ?? false)
  const [likeCount, setLikeCount] = state(() => post?.likeCount ?? 0)
  const [isUpdating, setIsUpdating] = state(false)
  
  const toggleLike = async () => {
    const previousLiked = isLiked
    const previousCount = likeCount
    
    // Optimistic update
    sync(() => {
      setIsLiked(!previousLiked)
      setLikeCount(previousLiked ? likeCount - 1 : likeCount + 1)
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
import { state } from 'flexium/core'

function DataWithRetry() {
  const [retryCount, setRetryCount] = state(0)
  const maxRetries = 3
  
  const [data, refetch, status, error] = state(async () => {
    const res = await fetch('/api/data')
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    return res.json()
  }, { key: 'data:with-retry' })
  
  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(retryCount + 1)
      refetch()
    }
  }
  
  if (String(status) === 'loading') {
    return <div>Loading... (Attempt {retryCount + 1}/{maxRetries + 1})</div>
  }
  
  if (String(status) === 'error') {
    return (
      <div>
        <p>Error: {error?.message}</p>
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
import { state, effect } from 'flexium/core'

function DataWithAutoRetry() {
  const [data, refetch, status, error] = state(async () => {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  }, { key: 'data:auto-retry' })
  
  const [retryCount, setRetryCount] = state(0)
  const [shouldRetry, setShouldRetry] = state(false)
  const maxRetries = 3
  
  // Automatic retry on error
  effect(() => {
    if (String(status) === 'error' && retryCount < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000) // Exponential backoff
      
      const timeoutId = setTimeout(() => {
        setRetryCount(retryCount + 1)
        refetch()
      }, delay)
      
      return () => clearTimeout(timeoutId)
    }
  })
  
  if (String(status) === 'loading') {
    return (
      <div>
        Loading...
        {retryCount > 0 && <span> (Retry {retryCount}/{maxRetries})</span>}
      </div>
    )
  }
  
  if (String(status) === 'error') {
    return (
      <div>
        <p>Error: {error?.message}</p>
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
import { state, effect } from 'flexium/core'

function PollingData({ interval = 5000 }: { interval?: number }) {
  const [data, refetch, status] = state(async () => {
    const res = await fetch('/api/data')
    return res.json()
  }, { key: 'data:polling' })
  
  const [isPolling, setIsPolling] = state(true)
  
  // Polling setup
  effect(() => {
    if (!isPolling) return
    
    const intervalId = setInterval(() => {
      refetch()
    }, interval)
    
    return () => clearInterval(intervalId)
  })
  
  return (
    <div>
      <div>
        <button onclick={() => setIsPolling(!isPolling)}>
          {isPolling ? 'Stop Polling' : 'Start Polling'}
        </button>
        <button onclick={refetch}>Manual Refresh</button>
      </div>
      
      {String(status) === 'loading' && <div>Loading...</div>}
      {String(status) === 'success' && (
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

- [state() API - Async State](/docs/core/state#async-state) - Async state API
- [Best Practices - Common Patterns](/docs/guide/best-practices/patterns) - Data fetching patterns
- [Best Practices - Performance Optimization](/docs/guide/best-practices/performance) - Performance optimization guide