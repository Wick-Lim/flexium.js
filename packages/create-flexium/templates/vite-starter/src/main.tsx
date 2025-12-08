import { state, effect } from 'flexium/core'
import { render } from 'flexium/dom'
import './style.css'

function App() {
  // Local state
  const [count, setCount] = state(0)

  // Derived state
  const [doubled] = state(() => count * 2)

  // Global state with array key
  const [theme, setTheme] = state<'light' | 'dark'>('light', { key: ['app', 'theme'] })

  // Effect for logging
  effect(() => {
    console.log('Count changed:', +count)
  })

  // Event handlers
  const increment = () => setCount(c => c + 1)
  const decrement = () => setCount(c => c - 1)
  const reset = () => setCount(0)
  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light')

  return (
    <div class={`app ${theme}`}>
      <div class="card">
        <h1>Flexium Vite Starter</h1>
        <p class="subtitle">Fine-grained reactivity with unified state() API</p>

        <div class="counter">
          <div class="count-display">
            <div class="count">{count}</div>
            <div class="label">Count</div>
          </div>
          <div class="count-display">
            <div class="count secondary">{doubled}</div>
            <div class="label">Doubled</div>
          </div>
        </div>

        <div class="buttons">
          <button class="btn btn-primary" onclick={increment}>+ Increment</button>
          <button class="btn btn-secondary" onclick={decrement}>- Decrement</button>
          <button class="btn btn-reset" onclick={reset}>Reset</button>
        </div>

        <div class="theme-section">
          <p>Current theme: <strong>{theme}</strong></p>
          <button class="btn btn-theme" onclick={toggleTheme}>
            Toggle Theme
          </button>
        </div>

        <div class="info">
          <h3>Features demonstrated:</h3>
          <ul>
            <li>Local state: <code>const [count, setCount] = state(0)</code></li>
            <li>Derived state: <code>const [doubled] = state(() ={'>'} count * 2)</code></li>
            <li>Global state: <code>state('light', {'{'} key: ['app', 'theme'] {'}'})</code></li>
            <li>Effects: <code>effect(() ={'>'} console.log(count))</code></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

render(<App />, document.getElementById('root')!)
