import { render } from 'flexium'
import { signal, createResource } from 'flexium'
import { Suspense, SuspenseCtx } from 'flexium'
import { ErrorBoundary } from 'flexium'
import { useContext } from 'flexium'

// ============================================================================
// Mock API Functions
// ============================================================================

interface User {
  id: number
  name: string
  email: string
}

interface Post {
  id: number
  userId: number
  title: string
  body: string
}

interface Comment {
  id: number
  postId: number
  name: string
  body: string
}

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API functions
const fetchUser = async (id: number): Promise<User> => {
  await delay(1500)
  return {
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`
  }
}

const fetchPosts = async (userId: number): Promise<Post[]> => {
  await delay(2000)
  return [
    { id: 1, userId, title: 'First Post', body: 'This is the first post content.' },
    { id: 2, userId, title: 'Second Post', body: 'This is the second post content.' },
    { id: 3, userId, title: 'Third Post', body: 'This is the third post content.' }
  ]
}

const fetchComments = async (postId: number): Promise<Comment[]> => {
  await delay(1000)
  return [
    { id: 1, postId, name: 'Alice', body: 'Great post!' },
    { id: 2, postId, name: 'Bob', body: 'Thanks for sharing.' },
    { id: 3, postId, name: 'Charlie', body: 'Interesting perspective.' }
  ]
}

const fetchSlowData = async (): Promise<string> => {
  await delay(3000)
  return 'This data took 3 seconds to load!'
}

const fetchFastData = async (): Promise<string> => {
  await delay(500)
  return 'This data loaded quickly (500ms)!'
}

// API that can fail
let failureCount = 0
const fetchUnstableData = async (): Promise<string> => {
  await delay(1000)
  failureCount++
  if (failureCount % 3 === 0) {
    throw new Error('Network error: Failed to fetch data')
  }
  return `Data loaded successfully (attempt ${failureCount})`
}

// ============================================================================
// Example 1: Basic Suspense with Loading Fallback
// ============================================================================

function BasicSuspenseExample() {
  const [data, { refetch }] = createResource(
    () => true,
    async () => {
      await delay(2000)
      return 'Data loaded after 2 seconds!'
    }
  )

  return (
    <div class="example-section">
      <h3>1. Basic Suspense Example</h3>
      <p class="description">
        Simple Suspense boundary with a loading fallback. The content loads after 2 seconds.
      </p>

      <Suspense fallback={<LoadingFallback message="Loading basic content..." />}>
        <div class="content">
          <p><strong>Status:</strong> {data.state}</p>
          <p><strong>Content:</strong> {data.value}</p>
          <button onClick={refetch}>Reload Data</button>
        </div>
      </Suspense>
    </div>
  )
}

// ============================================================================
// Example 2: Multiple Suspense Boundaries
// ============================================================================

function MultipleBoundariesExample() {
  const [fastData, { refetch: refetchFast }] = createResource(
    () => true,
    async () => fetchFastData()
  )

  const [slowData, { refetch: refetchSlow }] = createResource(
    () => true,
    async () => fetchSlowData()
  )

  return (
    <div class="example-section">
      <h3>2. Multiple Independent Suspense Boundaries</h3>
      <p class="description">
        Two separate Suspense boundaries load independently. The fast one (500ms) appears first,
        while the slow one (3s) continues loading.
      </p>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <Suspense fallback={<LoadingFallback message="Loading fast data..." />}>
          <div class="content">
            <h4>Fast Loading</h4>
            <p>{fastData.value}</p>
            <button onClick={refetchFast}>Reload</button>
          </div>
        </Suspense>

        <Suspense fallback={<LoadingFallback message="Loading slow data..." />}>
          <div class="content">
            <h4>Slow Loading</h4>
            <p>{slowData.value}</p>
            <button onClick={refetchSlow}>Reload</button>
          </div>
        </Suspense>
      </div>
    </div>
  )
}

// ============================================================================
// Example 3: Nested Suspense Boundaries
// ============================================================================

function UserProfile(props: { userId: number }) {
  const [user] = createResource(
    () => props.userId,
    async (id) => fetchUser(id)
  )

  return (
    <div class="user-card">
      <h4>{user.value?.name}</h4>
      <p>Email: {user.value?.email}</p>

      <Suspense fallback={<LoadingFallback message="Loading posts..." />}>
        <UserPosts userId={props.userId} />
      </Suspense>
    </div>
  )
}

function UserPosts(props: { userId: number }) {
  const [posts] = createResource(
    () => props.userId,
    async (userId) => fetchPosts(userId)
  )

  return (
    <div style="margin-top: 15px;">
      <h4>Posts</h4>
      {posts.value?.map(post => (
        <div class="post-card" key={post.id}>
          <h5>{post.title}</h5>
          <p>{post.body}</p>

          <Suspense fallback={<LoadingFallback message="Loading comments..." />}>
            <PostComments postId={post.id} />
          </Suspense>
        </div>
      ))}
    </div>
  )
}

function PostComments(props: { postId: number }) {
  const [comments] = createResource(
    () => props.postId,
    async (postId) => fetchComments(postId)
  )

  return (
    <div style="margin-left: 20px; margin-top: 10px;">
      <strong>Comments:</strong>
      {comments.value?.map(comment => (
        <div key={comment.id} class="comment-card">
          <strong>{comment.name}:</strong> {comment.body}
        </div>
      ))}
    </div>
  )
}

function NestedSuspenseExample() {
  const userId = signal(1)

  return (
    <div class="example-section">
      <h3>3. Nested Suspense Boundaries</h3>
      <p class="description">
        Demonstrates nested Suspense boundaries. The user loads first (1.5s), then posts (2s),
        then comments for each post (1s). Each level has its own loading state.
      </p>

      <div class="controls">
        <button onClick={() => userId.value = 1}>Load User 1</button>
        <button onClick={() => userId.value = 2}>Load User 2</button>
        <button onClick={() => userId.value = 3}>Load User 3</button>
      </div>

      <Suspense fallback={<LoadingFallback message="Loading user profile..." />}>
        <UserProfile userId={userId.value} />
      </Suspense>
    </div>
  )
}

// ============================================================================
// Example 4: Suspense with Error Boundary
// ============================================================================

function UnstableDataComponent() {
  const [data, { refetch }] = createResource(
    () => true,
    async () => fetchUnstableData()
  )

  return (
    <div class="content">
      <p><strong>Result:</strong> {data.value}</p>
      <p><strong>Status:</strong> {data.state}</p>
      <button onClick={refetch}>Try Again</button>
    </div>
  )
}

function ErrorBoundaryWithSuspenseExample() {
  return (
    <div class="example-section">
      <h3>4. Suspense with Error Handling</h3>
      <p class="description">
        This example shows how to combine Suspense with ErrorBoundary.
        The API fails every 3rd attempt. Try clicking "Try Again" multiple times.
      </p>

      <ErrorBoundary
        fallback={({ error, reset, retryCount }) => (
          <div class="error">
            <h4>Error Occurred</h4>
            <p><strong>Message:</strong> {error.message}</p>
            <p><strong>Attempt #{retryCount + 1}</strong></p>
            <button onClick={reset}>Try Again</button>
          </div>
        )}
      >
        <Suspense fallback={<LoadingFallback message="Loading unstable data..." />}>
          <UnstableDataComponent />
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}

// ============================================================================
// Example 5: Using createResource with state() API
// ============================================================================

function StateAPIExample() {
  const [data, { refetch }] = createResource(
    () => Math.random(), // Changes on each refetch
    async () => {
      await delay(1500)
      const random = Math.floor(Math.random() * 100)
      return `Random number: ${random}`
    }
  )

  return (
    <div class="example-section">
      <h3>5. createResource API</h3>
      <p class="description">
        Using <code>createResource</code> for async data fetching with automatic Suspense integration.
        The resource exposes loading state, error state, and data.
      </p>

      <div class="controls">
        <span class={`status ${data.loading ? 'loading' : 'ready'}`}>
          {data.loading ? 'Loading...' : 'Ready'}
        </span>
        <button onClick={refetch} disabled={data.loading}>
          Fetch New Number
        </button>
      </div>

      <Suspense fallback={<LoadingFallback message="Fetching random number..." />}>
        <div class="content">
          <p><strong>State:</strong> {data.state}</p>
          <p><strong>Loading:</strong> {data.loading ? 'Yes' : 'No'}</p>
          <p><strong>Value:</strong> {data.value}</p>
          <p><strong>Latest:</strong> {data.latest || 'None'}</p>
        </div>
      </Suspense>
    </div>
  )
}

// ============================================================================
// Example 6: Manual Promise Registration
// ============================================================================

function ManualPromiseExample() {
  const loadingState = signal<'idle' | 'loading' | 'success' | 'error'>('idle')
  const result = signal<string>('')

  const handleLoad = () => {
    const ctx = useContext(SuspenseCtx)
    if (!ctx) return

    loadingState.value = 'loading'

    const promise = delay(2000).then(() => {
      loadingState.value = 'success'
      result.value = 'Manually triggered load complete!'
    }).catch(() => {
      loadingState.value = 'error'
      result.value = 'Load failed!'
    })

    ctx.registerPromise(promise)
  }

  return (
    <div class="example-section">
      <h3>6. Manual Promise Registration</h3>
      <p class="description">
        Manually registering promises with Suspense context using <code>SuspenseCtx</code>.
        This is useful for imperative data fetching scenarios.
      </p>

      <div class="controls">
        <button onClick={handleLoad} disabled={loadingState.value === 'loading'}>
          Trigger Manual Load
        </button>
        <span class={`status ${loadingState.value === 'loading' ? 'loading' : 'ready'}`}>
          State: {loadingState.value}
        </span>
      </div>

      <Suspense fallback={<LoadingFallback message="Manually loading data..." />}>
        <div class="content">
          {result.value ? (
            <p><strong>Result:</strong> {result.value}</p>
          ) : (
            <p>Click the button to start loading</p>
          )}
        </div>
      </Suspense>
    </div>
  )
}

// ============================================================================
// Example 7: Parallel Data Fetching
// ============================================================================

function ParallelFetchExample() {
  const [user] = createResource(
    () => 1,
    async (id) => fetchUser(id)
  )

  const [posts] = createResource(
    () => 1,
    async (userId) => fetchPosts(userId)
  )

  return (
    <div class="example-section">
      <h3>7. Parallel Data Fetching</h3>
      <p class="description">
        Multiple resources loading in parallel within the same Suspense boundary.
        The fallback shows until ALL resources are ready.
      </p>

      <Suspense fallback={<LoadingFallback message="Loading user and posts in parallel..." />}>
        <div class="content">
          <div class="user-card">
            <h4>User Information</h4>
            <p><strong>Name:</strong> {user.value?.name}</p>
            <p><strong>Email:</strong> {user.value?.email}</p>
          </div>

          <div style="margin-top: 20px;">
            <h4>User Posts ({posts.value?.length || 0})</h4>
            {posts.value?.map(post => (
              <div key={post.id} class="post-card">
                <h5>{post.title}</h5>
                <p>{post.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Suspense>
    </div>
  )
}

// ============================================================================
// Shared Components
// ============================================================================

function LoadingFallback(props: { message: string }) {
  return (
    <div class="loading">
      <span class="spinner"></span>
      {props.message}
    </div>
  )
}

// ============================================================================
// Main App Component
// ============================================================================

function App() {
  return (
    <div class="container">
      <h1>Flexium Suspense Demo</h1>
      <p class="description">
        This demo showcases Flexium's Suspense implementation for handling async data loading
        with elegant loading states, error boundaries, and nested suspense boundaries.
      </p>

      <h2>Features Demonstrated</h2>

      <BasicSuspenseExample />
      <MultipleBoundariesExample />
      <NestedSuspenseExample />
      <ErrorBoundaryWithSuspenseExample />
      <StateAPIExample />
      <ManualPromiseExample />
      <ParallelFetchExample />

      <div style="margin-top: 40px; padding: 20px; background: #f0f4ff; border-radius: 8px;">
        <h3>Key Concepts</h3>
        <ul style="margin-left: 20px; line-height: 1.8;">
          <li><code>Suspense</code> - Component that shows a fallback while content is loading</li>
          <li><code>createResource</code> - Hook for async data fetching with automatic Suspense integration</li>
          <li><code>SuspenseCtx</code> - Context for manually registering promises with Suspense</li>
          <li><code>ErrorBoundary</code> - Catches errors in child components with Suspense</li>
          <li>Nested boundaries allow granular loading states</li>
          <li>Multiple boundaries can load independently</li>
          <li>Resources expose loading, error, and state properties</li>
        </ul>
      </div>
    </div>
  )
}

// ============================================================================
// Render App
// ============================================================================

const container = document.getElementById('app')
if (container) {
  render(App, container)
}
