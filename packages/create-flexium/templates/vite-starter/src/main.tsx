import { useState, useEffect } from 'flexium/core'
import { render } from 'flexium/dom'
import './style.css'

function App() {
  const [count, setCount] = useState(0)
  const [doubled] = useState(() => count * 2, { deps: [count] })
  const [tripled] = useState(() => count * 3, { deps: [count] })

  useEffect(() => {
    console.log('Count:', count)
  }, [count])

  return (
    <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div class="max-w-2xl mx-auto">
        <header class="text-center mb-16">
          <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            Flexium
          </h1>
          <p class="text-slate-400 text-lg">
            Fine-grained Reactivity Framework
          </p>
        </header>

        <div class="bg-slate-800/50 backdrop-blur rounded-2xl p-8 border border-slate-700 mb-8">
          <h2 class="text-xl font-semibold mb-6 flex items-center gap-3">
            <span class="w-1 h-6 bg-blue-500 rounded"></span>
            Counter
          </h2>

          <div class="text-7xl font-bold text-center py-8 text-white">
            {count}
          </div>

          <div class="grid grid-cols-2 gap-4 mb-8">
            <div class="bg-slate-900/50 rounded-xl p-6 text-center border border-slate-700">
              <div class="text-3xl font-bold mb-2">{doubled}</div>
              <div class="text-xs text-slate-500 uppercase tracking-wide">Double</div>
            </div>
            <div class="bg-slate-900/50 rounded-xl p-6 text-center border border-slate-700">
              <div class="text-3xl font-bold mb-2">{tripled}</div>
              <div class="text-xs text-slate-500 uppercase tracking-wide">Triple</div>
            </div>
          </div>

          <div class="flex gap-4 justify-center">
            <button
              class="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
              onclick={() => setCount(c => c + 1)}
            >
              + Increment
            </button>
            <button
              class="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
              onclick={() => setCount(c => c - 1)}
            >
              - Decrement
            </button>
            <button
              class="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
              onclick={() => setCount(0)}
            >
              Reset
            </button>
          </div>
        </div>

        <footer class="text-center text-slate-500 text-sm">
          Built with Flexium + Tailwind CSS
        </footer>
      </div>
    </div>
  )
}

render(<App />, document.getElementById('root')!)
