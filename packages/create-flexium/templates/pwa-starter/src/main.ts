import { App } from './App'
import { registerServiceWorker, setupInstallPrompt } from './pwa'

// Mount the app
const root = document.getElementById('app')
if (root) {
  root.appendChild(App())
}

// Register service worker
registerServiceWorker()

// Setup install prompt
setupInstallPrompt()
