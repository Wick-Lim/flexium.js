import { signal, computed, effect } from '../../../packages/flexium/dist/index.mjs'
import { render } from '../../../packages/flexium/dist/dom.mjs'
import { List } from '../../../packages/flexium/dist/index.mjs'

// Types for our data
interface User {
  id: number
  name: string
  email: string
  role: string
  joinedDate: string
}

// Generate large dataset
function generateUsers(count: number): User[] {
  const roles = ['Admin', 'Developer', 'Designer', 'Manager', 'Analyst', 'QA Engineer']
  const users: User[] = []

  for (let i = 0; i < count; i++) {
    users.push({
      id: i,
      name: `User ${i.toString().padStart(5, '0')}`,
      email: `user${i}@example.com`,
      role: roles[i % roles.length],
      joinedDate: new Date(2020 + Math.floor(i / 3650), (i % 12), (i % 28) + 1).toLocaleDateString()
    })
  }

  return users
}

// Initial data
const totalItems = signal(10000)
const users = signal(generateUsers(10000))
const scrollPosition = signal(0)
const visibleRange = signal({ start: 0, end: 0 })
const renderCount = signal(0)
const itemHeight = signal(80)

// Computed values
const visibleCount = computed(() => visibleRange.value.end - visibleRange.value.start + 1)

// Track render performance
const startTime = performance.now()
effect(() => {
  renderCount.value++
})

// App Component
function App() {
  return (
    <div class="container">
      <div class="header">
        <h1>List Example</h1>
        <p>Efficiently rendering {totalItems.value.toLocaleString()} items with virtualization</p>
      </div>

      <div class="content">
        {/* Statistics Section */}
        <div class="section">
          <h2>Statistics</h2>
          <div class="stats">
            <div class="stat">
              <div class="stat-label">Total Items</div>
              <div class="stat-value">{totalItems.value.toLocaleString()}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Rendered Items</div>
              <div class="stat-value">{visibleCount.value}</div>
            </div>
            <div class="stat">
              <div class="stat-label">Scroll Position</div>
              <div class="stat-value">{Math.round(scrollPosition.value)}px</div>
            </div>
            <div class="stat">
              <div class="stat-label">Visible Range</div>
              <div class="stat-value">
                {visibleRange.value.start} - {visibleRange.value.end}
              </div>
            </div>
          </div>

          <div class="performance-note">
            <strong>Performance:</strong>
            <p>
              Only {visibleCount.value} items are rendered in the DOM at any time,
              regardless of the total list size. This provides smooth scrolling even
              with {totalItems.value.toLocaleString()} items. Try scrolling to see the
              visible range update!
            </p>
          </div>
        </div>

        {/* Controls Section */}
        <div class="section">
          <h2>Controls</h2>

          <div class="input-group">
            <label>Item Height:</label>
            <input
              type="number"
              value={itemHeight.value}
              min="40"
              max="200"
              step="10"
              oninput={(e: Event) => {
                const value = parseInt((e.target as HTMLInputElement).value)
                if (value >= 40 && value <= 200) {
                  itemHeight.value = value
                }
              }}
            />
            <span style="font-size: 12px; color: #6b7280;">px</span>
          </div>

          <div class="controls">
            <button
              class="button"
              onclick={() => {
                // Scroll to top by manipulating the container
                const container = document.querySelector('[role="list"]') as HTMLElement
                if (container) container.scrollTop = 0
              }}
            >
              Scroll to Top
            </button>

            <button
              class="button"
              onclick={() => {
                // Scroll to middle
                const container = document.querySelector('[role="list"]') as HTMLElement
                if (container) {
                  const totalHeight = users.value.length * itemHeight.value
                  container.scrollTop = totalHeight / 2
                }
              }}
            >
              Scroll to Middle
            </button>

            <button
              class="button"
              onclick={() => {
                // Scroll to bottom
                const container = document.querySelector('[role="list"]') as HTMLElement
                if (container) {
                  container.scrollTop = users.value.length * itemHeight.value
                }
              }}
            >
              Scroll to Bottom
            </button>

            <button
              class="button"
              onclick={() => {
                // Scroll to specific item
                const itemIndex = Math.floor(Math.random() * users.value.length)
                const container = document.querySelector('[role="list"]') as HTMLElement
                if (container) {
                  container.scrollTop = itemIndex * itemHeight.value
                  console.log(`Scrolled to item #${itemIndex}`)
                }
              }}
            >
              Scroll to Random Item
            </button>

            <button
              class="button secondary"
              onclick={() => {
                const newCount = 1000
                totalItems.value = newCount
                users.value = generateUsers(newCount)
                console.log(`Generated ${newCount} items`)
              }}
            >
              Load 1K Items
            </button>

            <button
              class="button secondary"
              onclick={() => {
                const newCount = 10000
                totalItems.value = newCount
                users.value = generateUsers(newCount)
                console.log(`Generated ${newCount} items`)
              }}
            >
              Load 10K Items
            </button>

            <button
              class="button secondary"
              onclick={() => {
                const newCount = 100000
                totalItems.value = newCount
                users.value = generateUsers(newCount)
                console.log(`Generated ${newCount} items`)
              }}
            >
              Load 100K Items
            </button>
          </div>
        </div>

        {/* List Section */}
        <div class="section">
          <h2>User List</h2>
          <div class="list-container">
            <List
              items={users}
              virtual
              height={600}
              itemSize={itemHeight.value}
              overscan={5}
              getKey={(user: User) => user.id}
              onScroll={(scrollTop) => {
                scrollPosition.value = scrollTop
              }}
              onVisibleRangeChange={(start, end) => {
                visibleRange.value = { start, end }
              }}
            >
              {(user: User, index: () => number) => (
                <div class="item">
                  <div class="item-avatar">
                    {user.name.substring(5, 7)}
                  </div>
                  <div class="item-content">
                    <div class="item-title">{user.name}</div>
                    <div class="item-description">{user.email}</div>
                  </div>
                  <div class="item-meta">
                    <div>{user.role}</div>
                    <div style="margin-top: 4px;">Joined: {user.joinedDate}</div>
                  </div>
                </div>
              )}
            </List>
          </div>
        </div>

        {/* Performance Comparison */}
        <div class="section">
          <h2>Performance Comparison</h2>
          <div class="performance-note" style="background: #dbeafe; border-color: #3b82f6;">
            <strong style="color: #1e40af;">Without Virtualization:</strong>
            <p style="color: #1e3a8a; margin-top: 8px;">
              Rendering 100,000 DOM nodes would consume approximately 50-100MB of memory
              and cause significant lag during scrolling and interactions.
            </p>
            <strong style="color: #1e40af; display: block; margin-top: 12px;">
              With List (virtual mode):
            </strong>
            <p style="color: #1e3a8a; margin-top: 8px;">
              Only ~20-30 DOM nodes are rendered at any time (visible items + overscan),
              using less than 1MB of memory regardless of total item count. Scrolling
              remains smooth even with millions of items.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div class="section">
          <h2>Features Demonstrated</h2>
          <div style="display: grid; gap: 12px; line-height: 1.6; color: #4b5563;">
            <div>✓ <strong>10,000+ items</strong> rendered efficiently</div>
            <div>✓ <strong>Custom item rendering</strong> with avatar, title, description, and metadata</div>
            <div>✓ <strong>Fixed item heights</strong> (configurable via controls)</div>
            <div>✓ <strong>Scroll to specific item</strong> programmatically</div>
            <div>✓ <strong>Overscan buffer</strong> (5 items) for smooth scrolling</div>
            <div>✓ <strong>Real-time statistics</strong> showing visible range and render count</div>
            <div>✓ <strong>Dynamic data loading</strong> - switch between 1K, 10K, and 100K items</div>
            <div>✓ <strong>Keyboard accessible</strong> - container is focusable with proper ARIA attributes</div>
            <div>✓ <strong>Memory efficient</strong> - only visible items exist in the DOM</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mount the app
const app = document.getElementById('app')
if (app) {
  const rootElement = App()
  render(rootElement, app)

  const endTime = performance.now()
  console.log(`✅ List demo rendered in ${(endTime - startTime).toFixed(2)}ms`)
  console.log(`📊 Initial render: ${visibleCount.value} items visible out of ${totalItems.value}`)
  console.log('🎯 Try scrolling, changing item heights, or loading different dataset sizes!')
}

// Log performance metrics
effect(() => {
  console.log(
    `📍 Visible range: ${visibleRange.value.start}-${visibleRange.value.end} ` +
    `(${visibleCount.value} items) at scroll position ${Math.round(scrollPosition.value)}px`
  )
})
