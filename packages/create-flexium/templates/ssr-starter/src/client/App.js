import { state, effect } from 'flexium/core'
import { f } from 'flexium/dom'

// State declared outside component
const [count, setCount] = state(0)
const [message] = state('Hello from SSR!')
const [doubleCount] = state(() => count * 2)

// Effects
effect(() => {
  console.log('Count changed:', +count)
})

// Event handlers
const increment = () => setCount(c => c + 1)
const decrement = () => setCount(c => c - 1)
const reset = () => setCount(0)

export function App() {
  return f('div', { class: 'container' }, [
    f('div', { class: 'card' }, [
      f('h1', { class: 'title' }, message),
      f('p', { class: 'subtitle' }, 'Server-Side Rendered with Flexium'),

      f('div', { class: 'counter' }, [
        f('div', { class: 'count-display' }, [
          f('div', { class: 'count' }, count),
          f('div', { class: 'label' }, 'Count'),
        ]),
        f('div', { class: 'count-display' }, [
          f('div', { class: 'count secondary' }, doubleCount),
          f('div', { class: 'label' }, 'Double'),
        ]),
      ]),

      f('div', { class: 'buttons' }, [
        f(
          'button',
          {
            class: 'btn btn-primary',
            onclick: increment,
          },
          '+ Increment'
        ),
        f(
          'button',
          {
            class: 'btn btn-secondary',
            onclick: decrement,
          },
          '- Decrement'
        ),
        f(
          'button',
          {
            class: 'btn btn-reset',
            onclick: reset,
          },
          'Reset'
        ),
      ]),

      f('div', { class: 'info' }, [
        f('p', {}, [
          'This app is rendered on the server and hydrated on the client for optimal performance.',
        ]),
      ]),
    ]),
  ])
}

// Add styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    .container {
      width: 100%;
    }

    .card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }

    .title {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      color: #666;
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    .counter {
      display: flex;
      gap: 2rem;
      margin: 2rem 0;
      justify-content: center;
    }

    .count-display {
      text-align: center;
    }

    .count {
      font-size: 4rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1;
    }

    .count.secondary {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .label {
      color: #666;
      font-size: 0.9rem;
      margin-top: 0.5rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .buttons {
      display: flex;
      gap: 1rem;
      margin: 2rem 0;
      flex-wrap: wrap;
      justify-content: center;
    }

    .btn {
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      flex: 1;
      min-width: 150px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(240, 147, 251, 0.4);
    }

    .btn-reset {
      background: #f0f0f0;
      color: #333;
    }

    .btn-reset:hover {
      background: #e0e0e0;
      transform: translateY(-2px);
    }

    .info {
      margin-top: 2rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-radius: 10px;
      color: #666;
      font-size: 0.95rem;
      line-height: 1.6;
    }

    @media (max-width: 640px) {
      .card {
        padding: 2rem 1.5rem;
      }

      .title {
        font-size: 2rem;
      }

      .count {
        font-size: 3rem;
      }

      .buttons {
        flex-direction: column;
      }

      .btn {
        min-width: 100%;
      }

      .counter {
        gap: 1rem;
      }
    }
  `
  document.head.appendChild(style)
}
