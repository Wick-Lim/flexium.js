// Import from the built library
import { signal, computed, effect } from '../packages/flexium/dist/index.mjs'
import { h, render } from '../packages/flexium/dist/dom.mjs'

console.log('✅ Flexium loaded successfully!')

// Create a counter using signals
const count = signal(0)
const doubled = computed(() => count.value * 2)

// Log changes
effect(() => {
  console.log('Count:', count.value, 'Doubled:', doubled.value)
})

// Create DOM using h() function (JSX alternative)
function Counter() {
  const container = h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '24px'
    }
  }, [
    // Title
    h('h1', {
      style: {
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: '16px'
      }
    }, ['Flexium Playground']),

    // Count display
    h('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }
    }, [
      h('div', {
        style: {
          fontSize: '14px',
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }
      }, ['Current Count']),

      h('div', {
        id: 'count-display',
        style: {
          fontSize: '64px',
          fontWeight: 'bold',
          color: '#333'
        }
      }, [String(count.value)])
    ]),

    // Doubled display
    h('div', {
      style: {
        fontSize: '18px',
        color: '#666'
      }
    }, [
      h('span', {}, ['Doubled: ']),
      h('span', {
        id: 'doubled-display',
        style: { fontWeight: 'bold', color: '#667eea' }
      }, [String(doubled.value)])
    ]),

    // Buttons
    h('div', {
      style: {
        display: 'flex',
        gap: '12px'
      }
    }, [
      h('button', {
        onclick: () => { count.value-- },
        style: {
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          background: '#ef4444',
          color: 'white',
          transition: 'all 0.2s'
        }
      }, ['- Decrement']),

      h('button', {
        onclick: () => { count.value = 0 },
        style: {
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          background: '#6b7280',
          color: 'white',
          transition: 'all 0.2s'
        }
      }, ['Reset']),

      h('button', {
        onclick: () => { count.value++ },
        style: {
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer',
          background: '#10b981',
          color: 'white',
          transition: 'all 0.2s'
        }
      }, ['+ Increment'])
    ]),

    // Info text
    h('p', {
      style: {
        fontSize: '12px',
        color: '#999',
        textAlign: 'center',
        maxWidth: '400px',
        lineHeight: '1.6'
      }
    }, [
      'Try clicking the buttons. Notice how only the count updates, not the entire component. This is fine-grained reactivity with Flexium signals!'
    ])
  ])

  return container
}

// Render to DOM
const app = document.getElementById('app')
const counterElement = Counter()
render(counterElement, app)

// Setup reactive updates
const countDisplay = document.getElementById('count-display')
const doubledDisplay = document.getElementById('doubled-display')

effect(() => {
  if (countDisplay) {
    countDisplay.textContent = String(count.value)
  }
})

effect(() => {
  if (doubledDisplay) {
    doubledDisplay.textContent = String(doubled.value)
  }
})

console.log('🎉 Counter rendered! Try clicking the buttons.')
console.log('Open the console to see signal updates.')
