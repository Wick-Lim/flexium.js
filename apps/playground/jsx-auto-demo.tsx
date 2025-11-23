/**
 * Automatic JSX Runtime Demo
 *
 * This demonstrates the React 17+ automatic JSX transform.
 * Notice: NO h import needed!
 */

import { signal, effect } from '../packages/flexium/dist/index.mjs'
import { render } from '../packages/flexium/dist/dom.mjs'
// NOTE: No h import! TypeScript will automatically use jsx-runtime

// Create reactive signals
const count = signal(0)
const name = signal('World')

// Counter component using JSX WITHOUT h import
function Counter() {
  return (
    <div class="counter-container">
      <h1>Automatic JSX Runtime Demo</h1>

      <div class="greeting">
        Hello, {name.value}!
      </div>

      {/* Display current count - reactive signal binding */}
      <div class="count-display" id="count-display">
        {count.value}
      </div>

      {/* Button group */}
      <div class="button-group">
        <button
          onclick={() => {
            count.value--
            console.log('[-] Decremented to:', count.value)
          }}
          title="Decrement"
        >
          -
        </button>

        <button
          onclick={() => {
            count.value = 0
            console.log('[Reset] Count reset to:', count.value)
          }}
        >
          Reset
        </button>

        <button
          onclick={() => {
            count.value++
            console.log('[+] Incremented to:', count.value)
          }}
          title="Increment"
        >
          +
        </button>
      </div>

      {/* Info section */}
      <div class="info">
        <div>No h import needed with automatic JSX transform!</div>
        <div class="badge">Powered by Flexium.js JSX Runtime</div>
      </div>
    </div>
  )
}

// Render the app
const appContainer = document.getElementById('app')
if (appContainer) {
  // Use render() to mount the component
  const counterVNode = <Counter />
  render(counterVNode, appContainer)

  // Setup reactive updates with effect
  effect(() => {
    const countDisplay = document.getElementById('count-display')
    if (countDisplay) {
      countDisplay.textContent = String(count.value)
      console.log('Count changed to:', count.value)
    }
  })

  console.log('✅ Automatic JSX Runtime Demo loaded!')
  console.log('Initial count:', count.value)
  console.log('NOTE: This file does NOT import h!')
}
