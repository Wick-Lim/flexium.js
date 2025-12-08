import { state, effect } from 'flexium/core'
import './App.css'

export function App() {
  // State using unified state() API
  const [count, setCount] = state(0)
  const [isOnline, setIsOnline] = state(navigator.onLine)
  const [installStatus, setInstallStatus] = state('not-installed')

  // Check if app is installed
  if ('standalone' in window.navigator && (window.navigator as any).standalone) {
    setInstallStatus('installed')
  } else if (window.matchMedia('(display-mode: standalone)').matches) {
    setInstallStatus('installed')
  }

  // Online/Offline detection
  window.addEventListener('online', () => setIsOnline(true))
  window.addEventListener('offline', () => setIsOnline(false))

  // Event handlers
  const increment = () => setCount(c => c + 1)
  const decrement = () => setCount(c => c - 1)
  const reset = () => setCount(0)

  // Request notification permission
  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        new Notification('Notifications enabled!', {
          body: 'You will now receive notifications from this app.',
          icon: '/icons/icon-192x192.png',
        })
      }
    }
  }

  // Effect for count changes
  effect(() => {
    console.log('Count changed:', +count)
    // Store count in localStorage for persistence
    localStorage.setItem('count', String(+count))
  })

  // Load saved count
  const savedCount = localStorage.getItem('count')
  if (savedCount) {
    setCount(parseInt(savedCount, 10))
  }

  return (
    <div class="container">
      <div class="card">
        <div class="header">
          <h1 class="title">Flexium PWA</h1>
          <p class="subtitle">Progressive Web App with Offline Support</p>

          <div class="status-bar">
            <div class={`status ${isOnline ? 'online' : 'offline'}`}>
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </div>
            <div class={`status ${String(installStatus) === 'installed' ? 'installed' : ''}`}>
              {String(installStatus) === 'installed' ? '📱 Installed' : '🌐 Browser'}
            </div>
          </div>
        </div>

        <div class="counter">
          <div class="count-display">
            <div class="count">{count}</div>
            <div class="label">Counter</div>
          </div>
        </div>

        <div class="buttons">
          <button class="btn btn-primary" onclick={increment}>
            + Increment
          </button>
          <button class="btn btn-secondary" onclick={decrement}>
            - Decrement
          </button>
          <button class="btn btn-reset" onclick={reset}>
            Reset
          </button>
        </div>

        <div class="features">
          <h2>PWA Features</h2>
          <ul>
            <li>✅ Offline support with service worker</li>
            <li>✅ Install to home screen</li>
            <li>✅ Background sync</li>
            <li>✅ Push notifications</li>
            <li>✅ Responsive design</li>
            <li>✅ Fast loading with caching</li>
          </ul>

          <button class="btn btn-notification" onclick={requestNotifications}>
            🔔 Enable Notifications
          </button>
        </div>

        <div class="info">
          <p>
            This counter persists across sessions and works offline. Try
            disconnecting from the internet!
          </p>
        </div>
      </div>
    </div>
  )
}
