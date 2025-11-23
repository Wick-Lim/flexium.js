import { signal, effect } from '../../packages/flexium/dist/index.mjs'
import { render } from '../../packages/flexium/dist/dom.mjs'

// JSX is automatically handled by the new JSX transform - no h import needed!
// Create reactive signals
const count = signal(0)

// Counter component using JSX
function Counter() {
  return (
    <div class="counter-container">
      <h1>Flexium Counter (JSX)</h1>

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
        <div>Click + or - to change the counter</div>
        <div class="badge">Powered by Flexium.js</div>
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

  console.log('✅ Flexium Counter Demo (JSX) loaded!')
  console.log('Initial count:', count.value)
}
