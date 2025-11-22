/**
 * Flexium Vite Starter
 *
 * This is the entry point for your Flexium application.
 * It demonstrates the basic setup with signals and JSX.
 */

import { signal } from 'flexium'
import { render } from 'flexium/dom'
import './style.css'

/**
 * Counter Component
 *
 * A simple counter demonstrating:
 * - Signal creation and usage
 * - Event handling
 * - Reactive UI updates
 */
function Counter() {
  // Create a reactive signal for the count
  const count = signal(0)

  // Event handlers - these update the signal
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => (count.value = 0)

  return (
    <div class="counter">
      <h2>Counter Example</h2>
      <div class="count-display">
        <span class="label">Count:</span>
        <span class="value">{count.value}</span>
      </div>
      <div class="controls">
        <button onclick={decrement} class="btn btn-danger">
          -
        </button>
        <button onclick={reset} class="btn btn-secondary">
          Reset
        </button>
        <button onclick={increment} class="btn btn-success">
          +
        </button>
      </div>
    </div>
  )
}

/**
 * App Component
 *
 * The root component of your application.
 */
function App() {
  return (
    <div class="app">
      <header class="header">
        <h1>Flexium Vite Starter</h1>
        <p>A modern starter template with TypeScript and Vite</p>
      </header>

      <main class="main">
        <Counter />

        <div class="info">
          <h3>Next Steps:</h3>
          <ul>
            <li>Modify this component in <code>src/main.tsx</code></li>
            <li>Add new components in the <code>src/</code> directory</li>
            <li>Style your app in <code>src/style.css</code></li>
            <li>Check out the Flexium docs for more features</li>
          </ul>
        </div>
      </main>

      <footer class="footer">
        Built with Flexium - Fine-grained reactivity for modern UIs
      </footer>
    </div>
  )
}

// Render the app to the DOM
render(<App />, document.getElementById('root')!)
