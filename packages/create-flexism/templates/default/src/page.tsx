import { use } from 'flexium/core'

export default function HomePage() {
  // Server: Initialize count (could fetch from DB)
  const initialCount = 0

  // Client: Interactive counter component
  return ({ initialCount }) => {
    const [count, setCount] = use(initialCount)

    return (
      <div class="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div class="text-center">
          <h1 class="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-8">
            Flexism
          </h1>
          <p class="text-slate-400 mb-8">
            Realtime-first Fullstack Framework
          </p>

          <div class="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
            <div class="text-6xl font-bold mb-6">{count}</div>
            <div class="flex gap-4 justify-center">
              <button
                class="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                onclick={() => setCount(c => c + 1)}
              >
                Increment
              </button>
              <button
                class="px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
                onclick={() => setCount(0)}
              >
                Reset
              </button>
            </div>
          </div>

          <p class="mt-8 text-slate-500 text-sm">
            Edit <code class="text-blue-400">src/page.tsx</code> to get started
          </p>
        </div>
      </div>
    )
  }
}
