---
title: Data Fetching Patterns Example
---

# Data Fetching Patterns Example

Data fetching pattern examples including caching, infinite scroll, optimistic updates, and error retry.

## Basic Data Fetching

```tsx
import { state } from 'flexium/core'

function PostList() {
  const posts = state(async () => {
    const res = await fetch('/api/posts')
    if (!res.ok) throw new Error('Failed to fetch posts')
    return res.json()
  }, { key: 'posts:all' })
  
  if (posts.status.valueOf() === 'loading') {
    return <div>Loading...</div>
  }
  
  if (posts.status.valueOf() === 'error') {
    return (
      <div>
        <p>Error: {posts.error.valueOf()?.message}</p>
        <button onclick={posts.refetch}>Retry</button>
      </div>
    )
  }
  
  return (
    <div>
      <button onclick={posts.refetch}>Refresh</button>
      {posts.valueOf().map(post => (
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
  const posts = state(async () => {
    return fetch('/api/posts').then(r => r.json())
  }, { key: ['posts', 'all'] })
  
  return <div>{posts.valueOf().map(p => <Post key={p.id} {...p} />)}</div>
}

function PostDetail({ postId }: { postId: number }) {
  // Find from already cached posts
  const allPosts = state(null, { key: ['posts', 'all'] })
  const post = state(() => {
    return allPosts.valueOf()?.find(p => p.id === postId)
  })
  
  // Fetch individually if not found
  const fetchedPost = state(async () => {
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
  const items = state<any[]>([])
  const page = state(1)
  const hasMore = state(true)
  const isLoading = state(false)
  const error = state<Error | null>(null)
  
  const loadMore = async () => {
    if (isLoading.valueOf() || !hasMore.valueOf()) return
    
    isLoading.set(true)
    error.set(null)
    
    try {
      const res = await fetch(`/api/items?page=${page}&limit=20`)
      if (!res.ok) throw new Error('Failed to load')

      const data = await res.json()

      items.set(prev => [...prev, ...data.items])
      hasMore.set(data.hasMore)
      page.set(prev => prev + 1)
    } catch (err) {
      error.set(err as Error)
    } finally {
      isLoading.set(false)
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
      {items.valueOf().map(item => (
        <Item key={item.id} {...item} />
      ))}
      
      {isLoading.valueOf() && <div>Loading...</div>}
      {error.valueOf() && (
        <div>
          <p>Error: {error.valueOf().message}</p>
          <button onclick={loadMore}>Retry</button>
        </div>
      )}
      {!hasMore.valueOf() && items.valueOf().length > 0 && (
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
  const post = state(async () => {
    const res = await fetch(`/api/posts/${postId}`)
    return res.json()
  }, { key: ['posts', postId] })
  
  const isLiked = state(() => post.valueOf()?.isLiked ?? false)
  const likeCount = state(() => post.valueOf()?.likeCount ?? 0)
  const isUpdating = state(false)
  
  const toggleLike = async () => {
    const previousLiked = isLiked.valueOf()
    const previousCount = likeCount.valueOf()

    // Optimistic update
    sync(() => {
      isLiked.set(prev => !prev)
      likeCount.set(prev => previousLiked ? prev - 1 : prev + 1)
      isUpdating.set(true)
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
        isLiked.set(data.isLiked)
        likeCount.set(data.likeCount)
      })
      
    } catch (error) {
      // Rollback on failure
      sync(() => {
        isLiked.set(previousLiked)
        likeCount.set(previousCount)
      })
      
      alert('Failed to update like')
    } finally {
      isUpdating.set(false)
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
  const retryCount = state(0)
  const maxRetries = 3
  
  const data = state(async () => {
    const res = await fetch('/api/data')
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    return res.json()
  }, { key: 'data:with-retry' })
  
  const handleRetry = () => {
    if (retryCount.valueOf() < maxRetries) {
      retryCount.set(prev => prev + 1)
      data.refetch()
    }
  }
  
  if (data.status.valueOf() === 'loading') {
    return <div>Loading... (Attempt {retryCount.valueOf() + 1}/{maxRetries + 1})</div>
  }
  
  if (data.status.valueOf() === 'error') {
    return (
      <div>
        <p>Error: {data.error.valueOf()?.message}</p>
        {retryCount.valueOf() < maxRetries ? (
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
  const data = state(async () => {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
  }, { key: 'data:auto-retry' })
  
  const retryCount = state(0)
  const shouldRetry = state(false)
  const maxRetries = 3
  
  // Automatic retry on error
  effect(() => {
    if (data.status.valueOf() === 'error' && retryCount.valueOf() < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, retryCount.valueOf()), 10000) // Exponential backoff
      
      const timeoutId = setTimeout(() => {
        retryCount.set(prev => prev + 1)
        data.refetch()
      }, delay)
      
      return () => clearTimeout(timeoutId)
    }
  })
  
  if (data.status.valueOf() === 'loading') {
    return (
      <div>
        Loading...
        {retryCount.valueOf() > 0 && <span> (Retry {retryCount}/{maxRetries})</span>}
      </div>
    )
  }
  
  if (data.status.valueOf() === 'error') {
    return (
      <div>
        <p>Error: {data.error.valueOf()?.message}</p>
        {retryCount.valueOf() >= maxRetries ? (
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
  const data = state(async () => {
    const res = await fetch('/api/data')
    return res.json()
  }, { key: 'data:polling' })
  
  const isPolling = state(true)
  
  // Polling setup
  effect(() => {
    if (!isPolling.valueOf()) return
    
    const intervalId = setInterval(() => {
      data.refetch()
    }, interval)
    
    return () => clearInterval(intervalId)
  })
  
  return (
    <div>
      <div>
        <button onclick={() => isPolling.set(prev => !prev)}>
          {isPolling ? 'Stop Polling' : 'Start Polling'}
        </button>
        <button onclick={data.refetch}>Manual Refresh</button>
      </div>
      
      {data.status.valueOf() === 'loading' && <div>Loading...</div>}
      {data.status.valueOf() === 'success' && (
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