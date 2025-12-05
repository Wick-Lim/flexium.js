import { App } from './App.js'

// Hydrate the server-rendered HTML
const app = App()

// Mount or hydrate the app
const root = document.getElementById('app')
if (root.innerHTML.trim()) {
  // Server-rendered content exists, hydrate it
  console.log('Hydrating server-rendered content...')
  // In a full SSR setup, you would hydrate existing DOM here
  // For now, we'll replace content
  root.innerHTML = ''
  root.appendChild(app)
} else {
  // No server-rendered content, render client-side
  root.appendChild(app)
}
