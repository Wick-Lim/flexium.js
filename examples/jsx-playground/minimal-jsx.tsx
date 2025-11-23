import { signal } from '../../packages/flexium/dist/index.mjs'
import { render } from '../../packages/flexium/dist/dom.mjs'

// JSX is automatically handled - no h import needed!
// Create a reactive counter signal
const count = signal(0)

// Simple Counter component using JSX
function Counter() {
  return (
    <div>
      <h1>Minimal JSX Example</h1>
      <p>Count: {count.value}</p>
      <button onclick={() => count.value++}>Increment</button>
    </div>
  )
}

// Render the app
const app = document.getElementById('app')
if (app) {
  render(<Counter />, app)

  console.log('Minimal JSX demo loaded!')
}
