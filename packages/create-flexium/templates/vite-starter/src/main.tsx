import { state, effect } from 'flexium/core'
import { render } from 'flexium/dom'
import './style.css'

function App() {
  // State inside component - now works with hook system!
  const [count, setCount] = state(0)
  const [doubled] = state(() => count * 2)
  const [tripled] = state(() => count * 3)

  // Effect for logging
  effect(() => {
    console.log('Count changed:', +count)
  })

  // Event handlers
  const increment = () => setCount(c => c + 1)
  const decrement = () => setCount(c => c - 1)
  const reset = () => setCount(0)

  return (
    <div class="container">
      <div class="hero">
        <h1>Flexium</h1>
        <p class="subtitle">Fine-grained Reactivity Framework</p>
        <div class="tags">
          <span class="tag">State</span>
          <span class="tag">Computed</span>
          <span class="tag">Effects</span>
          <span class="tag">Zero Dependencies</span>
        </div>
      </div>

      <div class="card">
        <h2>Interactive Counter</h2>
        <div class="display">{count}</div>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">{doubled}</div>
            <div class="stat-label">Double</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{tripled}</div>
            <div class="stat-label">Triple</div>
          </div>
        </div>
        <div class="buttons">
          <button class="btn btn-success" onclick={increment}>
            + Increment
          </button>
          <button class="btn btn-danger" onclick={decrement}>
            - Decrement
          </button>
          <button class="btn btn-secondary" onclick={reset}>
            Reset
          </button>
        </div>
      </div>

      <div class="card">
        <h2>Features</h2>
        <ul class="features">
          <li>
            <strong>State</strong> - Reactive primitives for state management
          </li>
          <li>
            <strong>Computed</strong> - Automatically derived values
          </li>
          <li>
            <strong>Effects</strong> - Side effects that react to changes
          </li>
          <li>
            <strong>JSX</strong> - Familiar syntax with fine-grained updates
          </li>
        </ul>
      </div>

      <div class="footer">
        Built with Flexium
      </div>
    </div>
  )
}

render(<App />, document.getElementById('root')!)
