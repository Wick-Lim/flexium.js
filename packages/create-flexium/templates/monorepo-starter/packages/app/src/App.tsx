import { signal } from 'flexium'
import { Counter } from '@monorepo/components'
import { formatNumber } from '@monorepo/utils'
import './App.css'

export function App() {
  const count = signal(0)
  const message = signal('Welcome to Flexium Monorepo!')

  const increment = () => count(count() + 1)
  const decrement = () => count(count() - 1)
  const reset = () => count(0)

  return (
    <div class="container">
      <div class="card">
        <h1 class="title">Flexium Monorepo</h1>
        <p class="subtitle">{message()}</p>

        <div class="info-boxes">
          <div class="info-box">
            <div class="box-icon">📦</div>
            <h3>@monorepo/app</h3>
            <p>Main application</p>
          </div>
          <div class="info-box">
            <div class="box-icon">🧩</div>
            <h3>@monorepo/components</h3>
            <p>Shared components</p>
          </div>
          <div class="info-box">
            <div class="box-icon">🛠️</div>
            <h3>@monorepo/utils</h3>
            <p>Utility functions</p>
          </div>
        </div>

        <div class="demo-section">
          <h2>Shared Component Demo</h2>
          <p class="demo-description">
            This counter uses the shared Counter component from @monorepo/components
          </p>
          <Counter
            value={count()}
            onIncrement={increment}
            onDecrement={decrement}
            onReset={reset}
          />
        </div>

        <div class="demo-section">
          <h2>Shared Utils Demo</h2>
          <p class="demo-description">
            Format utility from @monorepo/utils: <strong>{formatNumber(count())}</strong>
          </p>
        </div>

        <div class="features">
          <h2>Monorepo Features</h2>
          <ul>
            <li>✅ pnpm workspaces for efficient package management</li>
            <li>✅ Shared TypeScript configuration</li>
            <li>✅ Cross-package imports with workspace protocol</li>
            <li>✅ Unified build and lint scripts</li>
            <li>✅ Component library (@monorepo/components)</li>
            <li>✅ Utility library (@monorepo/utils)</li>
            <li>✅ Hot module replacement in development</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
