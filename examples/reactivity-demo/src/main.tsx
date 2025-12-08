import { render } from 'flexium/dom'
import { signal, computed, effect, batch, untrack, root, isSignal, state } from 'flexium/core'

/**
 * Flexium Reactivity System Deep Dive
 *
 * This demo showcases all the core reactivity APIs:
 * - signal(): Basic reactive primitives
 * - computed(): Derived values with automatic memoization
 * - effect(): Side effects that auto-track dependencies
 * - batch(): Batched updates for performance
 * - untrack(): Breaking dependency tracking
 * - root(): Cleanup scopes for effects
 * - state(): Unified state API
 */

function App() {
  return (
    <div class="container">
      <h1>Flexium Reactivity System Deep Dive</h1>
      <p class="description">
        A comprehensive demonstration of Flexium's fine-grained reactivity system.
        Explore signals, computed values, effects, batching, and advanced patterns.
      </p>

      <SignalBasicsDemo />
      <ComputedDemo />
      <EffectDemo />
      <BatchingDemo />
      <UntrackDemo />
      <RootCleanupDemo />
      <StateAPIDemo />
      <PerformanceDemo />
      <DependencyVisualization />
      <AdvancedPatterns />
    </div>
  )
}

// ============================================================================
// 1. Signal Basics
// ============================================================================
function SignalBasicsDemo() {
  const count = signal(0)
  const name = signal('Alice')

  return (
    <div class="demo-section">
      <h2>1. Signal Basics</h2>
      <p class="description">
        Signals are reactive primitives that notify subscribers when their value changes.
        They form the foundation of Flexium's reactivity system.
      </p>

      <div class="demo-card">
        <h3>Counter Signal</h3>
        <div class="controls">
          <button onClick={() => count.value++}>Increment</button>
          <button onClick={() => count.value--}>Decrement</button>
          <button class="secondary" onClick={() => count.value = 0}>Reset</button>
          <span class="value-display">{count.value}</span>
        </div>
        <div class="info-box">
          <strong>How it works:</strong> Each button click updates the signal's value,
          which automatically triggers re-renders of any components that depend on it.
          No manual subscriptions needed!
        </div>
      </div>

      <div class="demo-card">
        <h3>Text Signal</h3>
        <div class="input-group">
          <label>Name:</label>
          <input
            type="text"
            value={name.value}
            onInput={(e) => name.value = (e.target as HTMLInputElement).value}
            placeholder="Enter your name"
          />
        </div>
        <p>Hello, <span class="highlight">{name.value}</span>!</p>
        <div class="info-box">
          <strong>API Usage:</strong> <code>const s = signal(initialValue)</code>
          <br/>Read: <code>s.value</code> or <code>s()</code>
          <br/>Write: <code>s.value = newValue</code> or <code>s.set(newValue)</code>
          <br/>Read without tracking: <code>s.peek()</code>
        </div>
      </div>

      <div class="api-ref">
        <h4>API Reference: signal()</h4>
        <div class="api-signature">
          function signal&lt;T&gt;(initialValue: T): Signal&lt;T&gt;
        </div>
        <p>
          Creates a reactive signal with getter/setter. The signal will notify all subscribers
          when its value changes (using strict equality check).
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// 2. Computed Values
// ============================================================================
function ComputedDemo() {
  const firstName = signal('John')
  const lastName = signal('Doe')
  const age = signal(25)

  // Computed values automatically track their dependencies
  const fullName = computed(() => `${firstName.value} ${lastName.value}`)
  const isAdult = computed(() => age.value >= 18)
  const greeting = computed(() =>
    `${fullName.value} is ${age.value} years old and is ${isAdult.value ? 'an adult' : 'a minor'}`
  )

  // Track computation count
  let computeCount = 0
  const expensiveComputed = computed(() => {
    computeCount++
    // Simulate expensive computation
    let result = 0
    for (let i = 0; i < 1000000; i++) {
      result += age.value
    }
    return result
  })

  return (
    <div class="demo-section">
      <h2>2. Computed Values</h2>
      <p class="description">
        Computed values are derived from signals and automatically memoize their results.
        They only recompute when their dependencies change.
      </p>

      <div class="demo-card">
        <h3>Name Composition</h3>
        <div class="input-group">
          <label>First Name:</label>
          <input
            type="text"
            value={firstName.value}
            onInput={(e) => firstName.value = (e.target as HTMLInputElement).value}
          />
        </div>
        <div class="input-group">
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName.value}
            onInput={(e) => lastName.value = (e.target as HTMLInputElement).value}
          />
        </div>
        <div class="input-group">
          <label>Age:</label>
          <input
            type="number"
            value={age.value}
            onInput={(e) => age.value = parseInt((e.target as HTMLInputElement).value) || 0}
          />
        </div>

        <div class="success-box">
          <strong>Full Name (computed):</strong> {fullName.value}
          <br/>
          <strong>Adult Status (computed):</strong> {isAdult.value ? 'Yes' : 'No'}
          <br/>
          <strong>Greeting (computed):</strong> {greeting.value}
        </div>
      </div>

      <div class="demo-card">
        <h3>Memoization Demo</h3>
        <p>The computed value below performs 1 million operations. Thanks to memoization,
           it only recomputes when age changes:</p>
        <div class="controls">
          <button onClick={() => age.value++}>Change Age (triggers recompute)</button>
          <button class="secondary" onClick={() => firstName.value += '!'}>
            Change Name (no recompute)
          </button>
          <button class="secondary" onClick={() => expensiveComputed.value}>
            Read Value (no recompute)
          </button>
        </div>
        <div class="info-box">
          <strong>Expensive Result:</strong> {expensiveComputed.value.toLocaleString()}
          <br/>
          <strong>Compute Count:</strong> <span class="highlight">{computeCount}</span>
          <br/>
          <em>Notice: Clicking "Read Value" or changing the name doesn't increase the count!</em>
        </div>
      </div>

      <div class="api-ref">
        <h4>API Reference: computed()</h4>
        <div class="api-signature">
          function computed&lt;T&gt;(fn: () =&gt; T): Computed&lt;T&gt;
        </div>
        <p>
          Creates a read-only computed signal that automatically tracks dependencies.
          The value is cached and only recomputed when dependencies change.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// 3. Effects
// ============================================================================
function EffectDemo() {
  const count = signal(0)
  const enabled = signal(true)
  const logs: string[] = []
  const logsSignal = signal(logs)

  // Basic effect
  effect(() => {
    if (enabled.value) {
      logs.push(`Effect ran: count is ${count.value}`)
      logsSignal.value = [...logs]
    }
  })

  // Effect with cleanup
  const intervalCount = signal(0)
  effect(() => {
    if (enabled.value) {
      const id = setInterval(() => {
        intervalCount.value++
      }, 1000)

      // Return cleanup function
      return () => {
        clearInterval(id)
        logs.push('Effect cleanup: interval cleared')
        logsSignal.value = [...logs]
      }
    }
  })

  return (
    <div class="demo-section">
      <h2>3. Effects</h2>
      <p class="description">
        Effects are side effects that automatically track and re-run when their dependencies change.
        They can return cleanup functions that run before re-execution or disposal.
      </p>

      <div class="demo-card">
        <h3>Effect Tracking</h3>
        <div class="controls">
          <button onClick={() => count.value++}>Increment Count</button>
          <button class="secondary" onClick={() => count.value = 0}>Reset Count</button>
          <button
            class={enabled.value ? 'danger' : 'success'}
            onClick={() => enabled.value = !enabled.value}
          >
            {enabled.value ? 'Disable' : 'Enable'} Effects
          </button>
          <button class="secondary" onClick={() => {
            logs.length = 0
            logsSignal.value = [...logs]
          }}>Clear Logs</button>
        </div>

        <div class="info-box">
          <strong>Current Count:</strong> {count.value}
          <br/>
          <strong>Effects Enabled:</strong> {enabled.value ? 'Yes' : 'No'}
          <br/>
          <strong>Interval Counter:</strong> {intervalCount.value} seconds
        </div>

        <div class="log-output">
          <strong>Effect Logs:</strong>
          {logsSignal.value.length === 0 ? (
            <div class="log-entry">No logs yet...</div>
          ) : (
            logsSignal.value.map((log, i) => (
              <div key={i} class="log-entry">{log}</div>
            ))
          )}
        </div>

        <div class="warning-box">
          <strong>Note:</strong> When you disable effects, the cleanup function runs and clears the interval.
          When you re-enable, the effect runs again and creates a new interval.
        </div>
      </div>

      <div class="api-ref">
        <h4>API Reference: effect()</h4>
        <div class="api-signature">
          function effect(fn: () =&gt; void | (() =&gt; void)): () =&gt; void
        </div>
        <p>
          Creates a side effect that runs immediately and re-runs when dependencies change.
          Can return a cleanup function. The effect function returns a dispose function.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// 4. Batching
// ============================================================================
function BatchingDemo() {
  const x = signal(0)
  const y = signal(0)
  const z = signal(0)

  let effectRunCount = 0
  const runCount = signal(0)

  effect(() => {
    // This effect depends on all three signals
    const sum = x.value + y.value + z.value
    effectRunCount++
    runCount.value = effectRunCount
  })

  const updateWithoutBatch = () => {
    effectRunCount = 0 // Reset counter
    x.value++  // Effect runs (1)
    y.value++  // Effect runs (2)
    z.value++  // Effect runs (3)
    // Total: 3 effect executions
  }

  const updateWithBatch = () => {
    effectRunCount = 0 // Reset counter
    batch(() => {
      x.value++  // Queued
      y.value++  // Queued
      z.value++  // Queued
    }) // Effect runs once here
    // Total: 1 effect execution
  }

  return (
    <div class="demo-section">
      <h2>4. Batching Updates</h2>
      <p class="description">
        Batching allows you to group multiple signal updates together, ensuring effects
        run only once after all updates complete. This is crucial for performance.
      </p>

      <div class="demo-card">
        <h3>Performance Comparison</h3>
        <div class="stats">
          <div class="stat-card">
            <div class="stat-value">{x.value}</div>
            <div class="stat-label">X Value</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{y.value}</div>
            <div class="stat-label">Y Value</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{z.value}</div>
            <div class="stat-label">Z Value</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{runCount.value}</div>
            <div class="stat-label">Effect Runs</div>
          </div>
        </div>

        <div class="controls">
          <button onClick={updateWithoutBatch}>
            Update WITHOUT Batching
          </button>
          <button class="success" onClick={updateWithBatch}>
            Update WITH Batching
          </button>
        </div>

        <div class="info-box">
          <strong>Without Batching:</strong> Effect runs 3 times (once per signal update)
          <br/>
          <strong>With Batching:</strong> Effect runs only 1 time (after all updates)
          <br/>
          <em>Click the buttons above and watch the "Effect Runs" counter!</em>
        </div>

        <div class="warning-box">
          <strong>Best Practice:</strong> Always use <code>batch()</code> when updating multiple
          signals that share common dependencies. This prevents cascading updates and improves performance.
        </div>
      </div>

      <div class="api-ref">
        <h4>API Reference: batch()</h4>
        <div class="api-signature">
          function batch&lt;T&gt;(fn: () =&gt; T): T
        </div>
        <p>
          Batches multiple signal updates together. Effects will only run once after
          all updates in the batch complete.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// 5. Untrack
// ============================================================================
function UntrackDemo() {
  const count = signal(0)
  const multiplier = signal(2)

  let trackedEffectRuns = 0
  let untrackedEffectRuns = 0

  const trackedRuns = signal(0)
  const untrackedRuns = signal(0)

  // Effect that tracks both signals
  effect(() => {
    const result = count.value * multiplier.value
    trackedEffectRuns++
    trackedRuns.value = trackedEffectRuns
  })

  // Effect that only tracks count, not multiplier
  effect(() => {
    const result = count.value * untrack(() => multiplier.value)
    untrackedEffectRuns++
    untrackedRuns.value = untrackedEffectRuns
  })

  return (
    <div class="demo-section">
      <h2>5. Untrack - Breaking Dependency Tracking</h2>
      <p class="description">
        <code>untrack()</code> allows you to read signals inside an effect without creating
        a dependency. This is useful when you want to access a value without re-running
        the effect when it changes.
      </p>

      <div class="demo-card">
        <h3>Tracked vs Untracked Dependencies</h3>

        <div class="grid">
          <div>
            <h4>Signals</h4>
            <div class="controls">
              <button onClick={() => count.value++}>
                Increment Count
              </button>
              <span class="value-display">{count.value}</span>
            </div>
            <div class="controls">
              <button onClick={() => multiplier.value++}>
                Increment Multiplier
              </button>
              <span class="value-display">{multiplier.value}</span>
            </div>
          </div>

          <div>
            <h4>Effect Run Counts</h4>
            <div class="stat-card">
              <div class="stat-value">{trackedRuns.value}</div>
              <div class="stat-label">Tracked Effect Runs</div>
              <small>Depends on: count AND multiplier</small>
            </div>
            <div class="stat-card">
              <div class="stat-value">{untrackedRuns.value}</div>
              <div class="stat-label">Untracked Effect Runs</div>
              <small>Depends on: count ONLY</small>
            </div>
          </div>
        </div>

        <div class="info-box">
          <strong>Experiment:</strong>
          <br/>1. Click "Increment Count" - Both effects run
          <br/>2. Click "Increment Multiplier" - Only the tracked effect runs
          <br/><br/>
          The untracked effect reads <code>multiplier</code> inside <code>untrack()</code>,
          so it doesn't create a dependency on it.
        </div>

        <pre>{`// Tracked effect (runs when count OR multiplier changes)
effect(() => {
  const result = count.value * multiplier.value;
});

// Untracked effect (runs only when count changes)
effect(() => {
  const result = count.value * untrack(() => multiplier.value);
});`}</pre>
      </div>

      <div class="api-ref">
        <h4>API Reference: untrack()</h4>
        <div class="api-signature">
          function untrack&lt;T&gt;(fn: () =&gt; T): T
        </div>
        <p>
          Executes a function without tracking signal dependencies. Useful for reading
          signals inside effects without creating dependencies.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// 6. Root and Cleanup
// ============================================================================
function RootCleanupDemo() {
  const activeEffects = signal(0)
  const logs: string[] = []
  const logsSignal = signal(logs)

  let disposeRoot: (() => void) | null = null

  const createEffects = () => {
    // Clear old root if exists
    if (disposeRoot) {
      disposeRoot()
    }

    disposeRoot = root((dispose) => {
      // Create multiple effects within this root
      effect(() => {
        logs.push('Effect 1 created')
        logsSignal.value = [...logs]
        activeEffects.value++
        return () => {
          logs.push('Effect 1 disposed')
          logsSignal.value = [...logs]
          activeEffects.value--
        }
      })

      effect(() => {
        logs.push('Effect 2 created')
        logsSignal.value = [...logs]
        activeEffects.value++
        return () => {
          logs.push('Effect 2 disposed')
          logsSignal.value = [...logs]
          activeEffects.value--
        }
      })

      effect(() => {
        logs.push('Effect 3 created')
        logsSignal.value = [...logs]
        activeEffects.value++
        return () => {
          logs.push('Effect 3 disposed')
          logsSignal.value = [...logs]
          activeEffects.value--
        }
      })

      return dispose
    })
  }

  const disposeAll = () => {
    if (disposeRoot) {
      disposeRoot()
      disposeRoot = null
      logs.push('All effects disposed via root.dispose()')
      logsSignal.value = [...logs]
    }
  }

  return (
    <div class="demo-section">
      <h2>6. Root and Cleanup Scopes</h2>
      <p class="description">
        <code>root()</code> creates a cleanup scope where all effects can be disposed together.
        This is essential for managing effect lifecycles in complex applications.
      </p>

      <div class="demo-card">
        <h3>Collective Effect Management</h3>

        <div class="controls">
          <button class="success" onClick={createEffects}>
            Create Effects in Root
          </button>
          <button class="danger" onClick={disposeAll}>
            Dispose All Effects
          </button>
          <button class="secondary" onClick={() => {
            logs.length = 0
            logsSignal.value = [...logs]
          }}>Clear Logs</button>
        </div>

        <div class="info-box">
          <strong>Active Effects:</strong> <span class="highlight">{activeEffects.value}</span>
        </div>

        <div class="log-output">
          <strong>Lifecycle Logs:</strong>
          {logsSignal.value.length === 0 ? (
            <div class="log-entry">No effects created yet...</div>
          ) : (
            logsSignal.value.map((log, i) => (
              <div key={i} class="log-entry">{log}</div>
            ))
          )}
        </div>

        <div class="warning-box">
          <strong>Use Case:</strong> Roots are perfect for component lifecycles, modals,
          or any scenario where you need to clean up multiple effects at once.
        </div>

        <pre>{`root((dispose) => {
  effect(() => { /* ... */ });
  effect(() => { /* ... */ });

  // Return dispose to clean up all effects
  return dispose;
});`}</pre>
      </div>

      <div class="api-ref">
        <h4>API Reference: root()</h4>
        <div class="api-signature">
          function root&lt;T&gt;(fn: (dispose: () =&gt; void) =&gt; T): T
        </div>
        <p>
          Creates a cleanup scope. All effects created within the scope can be disposed
          together by calling the provided dispose function.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// 7. State API
// ============================================================================
function StateAPIDemo() {
  // Local state (like signal)
  const [count, setCount] = state(0)

  // Derived state (like computed)
  const [doubled] = state(() => count() * 2)

  // Global state with array key
  const [theme, setTheme] = state('light', { key: ['app', 'theme'] })

  return (
    <div class="demo-section">
      <h2>7. Unified State API</h2>
      <p class="description">
        The <code>state()</code> API provides a unified interface for signals, computed values,
        and global state management with a React-like tuple syntax.
      </p>

      <div class="demo-card">
        <h3>Local State</h3>
        <div class="controls">
          <button onClick={() => setCount(count() + 1)}>Increment</button>
          <button onClick={() => setCount(c => c - 1)}>Decrement (with updater)</button>
          <button class="secondary" onClick={() => setCount(0)}>Reset</button>
          <span class="value-display">{count()}</span>
        </div>

        <div class="info-box">
          <strong>Doubled (computed):</strong> {doubled()}
        </div>

        <pre>{`const [count, setCount] = state(0);
const [doubled] = state(() => count() * 2);

setCount(5);              // Direct value
setCount(c => c + 1);     // Updater function`}</pre>
      </div>

      <div class="demo-card">
        <h3>Global State</h3>
        <p>Global state persists across component instances using a unique key:</p>
        <div class="controls">
          <button
            class={theme() === 'light' ? 'success' : 'secondary'}
            onClick={() => setTheme('light')}
          >
            Light Theme
          </button>
          <button
            class={theme() === 'dark' ? 'success' : 'secondary'}
            onClick={() => setTheme('dark')}
          >
            Dark Theme
          </button>
        </div>
        <div class="success-box">
          <strong>Current Theme:</strong> <span class="highlight">{theme()}</span>
          <br/><em>This state is shared globally via the key ['app', 'theme']</em>
        </div>

        <pre>{`// Global state with array key
const [theme, setTheme] = state('light', { key: ['app', 'theme'] });

// Accessing the same state elsewhere with the same key
// will return the same state instance

// Array keys are great for dynamic IDs:
// const [user] = state(null, { key: ['users', userId] })`}</pre>
      </div>

      <div class="api-ref">
        <h4>API Reference: state()</h4>
        <div class="api-signature">
          function state&lt;T&gt;(value: T | (() =&gt; T), options?: {'{'}key?: StateKey, params?: P{'}'}): [getter, setter]
        </div>
        <p>
          Unified API for creating local signals, computed values, or global state.
          Keys can be strings or arrays for hierarchical namespacing (e.g., ['app', 'theme']).
          Returns a tuple similar to React's useState.
        </p>
      </div>
    </div>
  )
}

// ============================================================================
// 8. Performance Comparison
// ============================================================================
function PerformanceDemo() {
  const [iterations, setIterations] = state(100)
  const [withBatchTime, setWithBatchTime] = state(0)
  const [withoutBatchTime, setWithoutBatchTime] = state(0)

  const runBenchmark = () => {
    // Test WITHOUT batching
    const signals = Array.from({ length: 10 }, () => signal(0))
    let effectRuns = 0

    effect(() => {
      signals.forEach(s => s.value)
      effectRuns++
    })

    const startWithout = performance.now()
    for (let i = 0; i < iterations(); i++) {
      signals.forEach(s => s.value++)
    }
    const timeWithout = performance.now() - startWithout
    setWithoutBatchTime(timeWithout)

    // Test WITH batching
    const signals2 = Array.from({ length: 10 }, () => signal(0))
    let effectRuns2 = 0

    effect(() => {
      signals2.forEach(s => s.value)
      effectRuns2++
    })

    const startWith = performance.now()
    for (let i = 0; i < iterations(); i++) {
      batch(() => {
        signals2.forEach(s => s.value++)
      })
    }
    const timeWith = performance.now() - startWith
    setWithBatchTime(timeWith)
  }

  const speedup = withoutBatchTime() > 0
    ? (withoutBatchTime() / withBatchTime()).toFixed(1)
    : '0'

  return (
    <div class="demo-section">
      <h2>8. Performance Comparison</h2>
      <p class="description">
        Measure the performance impact of batching with real benchmarks.
        This demo updates 10 signals multiple times and measures execution time.
      </p>

      <div class="demo-card">
        <h3>Batching Benchmark</h3>

        <div class="input-group">
          <label>Iterations:</label>
          <input
            type="number"
            value={iterations()}
            onInput={(e) => setIterations(parseInt((e.target as HTMLInputElement).value) || 100)}
            min="10"
            max="10000"
          />
          <button class="success" onClick={runBenchmark}>
            Run Benchmark
          </button>
        </div>

        <div class="performance-chart">
          <h4>Results (lower is better)</h4>
          <div>
            <strong>Without Batching:</strong> {withoutBatchTime().toFixed(2)}ms
            <div
              class="bar slow"
              style={{ width: `${withoutBatchTime() > 0 ? 100 : 0}%` }}
            >
              {withoutBatchTime().toFixed(2)}ms
            </div>
          </div>
          <div>
            <strong>With Batching:</strong> {withBatchTime().toFixed(2)}ms
            <div
              class="bar fast"
              style={{
                width: `${withBatchTime() > 0 ? (withBatchTime() / withoutBatchTime() * 100) : 0}%`
              }}
            >
              {withBatchTime().toFixed(2)}ms
            </div>
          </div>
        </div>

        {withoutBatchTime() > 0 && (
          <div class="success-box">
            <strong>Performance Improvement:</strong> {speedup}x faster with batching!
            <br/><em>Batching reduced execution time by {((1 - withBatchTime() / withoutBatchTime()) * 100).toFixed(1)}%</em>
          </div>
        )}

        <div class="info-box">
          <strong>What's being tested:</strong>
          <br/>- Creating 10 signals with a shared effect
          <br/>- Updating all 10 signals {iterations()} times
          <br/>- Measuring total execution time
          <br/>- Without batching: effect runs {iterations() * 10} times
          <br/>- With batching: effect runs {iterations()} times
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// 9. Dependency Visualization
// ============================================================================
function DependencyVisualization() {
  const a = signal(1)
  const b = signal(2)
  const c = computed(() => a.value + b.value)
  const d = computed(() => c.value * 2)
  const e = computed(() => c.value + b.value)

  return (
    <div class="demo-section">
      <h2>9. Dependency Visualization</h2>
      <p class="description">
        Understand how signals and computed values form a dependency graph.
        Changes propagate through the graph automatically.
      </p>

      <div class="demo-card">
        <h3>Dependency Graph</h3>

        <div class="controls">
          <button onClick={() => a.value++}>Update A</button>
          <span class="value-display">{a.value}</span>
          <button onClick={() => b.value++}>Update B</button>
          <span class="value-display">{b.value}</span>
        </div>

        <div class="dependency-graph">
          <div style={{ textAlign: 'center', lineHeight: '2' }}>
            <div>
              <span class="dep-node">A = {a.value}</span>
              <span class="dep-arrow">→</span>
              <span class="dep-node">C = A + B = {c.value}</span>
              <span class="dep-arrow">→</span>
              <span class="dep-node">D = C × 2 = {d.value}</span>
            </div>
            <div style={{ marginTop: '20px' }}>
              <span class="dep-node">B = {b.value}</span>
              <span class="dep-arrow">→</span>
              <span class="dep-node">C = A + B = {c.value}</span>
              <span class="dep-arrow">→</span>
              <span class="dep-node">E = C + B = {e.value}</span>
            </div>
          </div>
        </div>

        <div class="info-box">
          <strong>How it works:</strong>
          <br/>- Updating <strong>A</strong> triggers: C → D and E
          <br/>- Updating <strong>B</strong> triggers: C → D and E
          <br/>- Each computed value only recalculates when its dependencies change
          <br/>- The graph prevents unnecessary computations through memoization
        </div>

        <pre>{`const a = signal(1);
const b = signal(2);
const c = computed(() => a.value + b.value);
const d = computed(() => c.value * 2);
const e = computed(() => c.value + b.value);

// Updating a or b automatically updates c, d, and e`}</pre>
      </div>
    </div>
  )
}

// ============================================================================
// 10. Advanced Patterns
// ============================================================================
function AdvancedPatterns() {
  const [enabled, setEnabled] = state(true)

  return (
    <div class="demo-section">
      <h2>10. Advanced Patterns and Best Practices</h2>
      <p class="description">
        Real-world patterns and best practices for building reactive applications.
      </p>

      <div class="demo-card">
        <h3>Pattern: Conditional Effects</h3>
        <p>Effects that only run when certain conditions are met:</p>
        <pre>{`const enabled = signal(true);
const data = signal(null);

effect(() => {
  if (!enabled.value) return;

  // This code only runs when enabled is true
  console.log('Data:', data.value);
});`}</pre>
      </div>

      <div class="demo-card">
        <h3>Pattern: Debounced Updates</h3>
        <p>Combine signals with debouncing for expensive operations:</p>
        <pre>{`const search = signal('');
const debouncedSearch = signal('');

let timeout: number;
effect(() => {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    debouncedSearch.value = search.value;
  }, 300);
});`}</pre>
      </div>

      <div class="demo-card">
        <h3>Pattern: Derived State Chain</h3>
        <p>Build complex derived state from simpler pieces:</p>
        <pre>{`const items = signal([1, 2, 3, 4, 5]);
const filter = signal('all'); // 'all' | 'even' | 'odd'

const filteredItems = computed(() => {
  const f = filter.value;
  if (f === 'even') return items.value.filter(n => n % 2 === 0);
  if (f === 'odd') return items.value.filter(n => n % 2 === 1);
  return items.value;
});

const sum = computed(() =>
  filteredItems.value.reduce((a, b) => a + b, 0)
);

const average = computed(() =>
  sum.value / filteredItems.value.length
);`}</pre>
      </div>

      <div class="demo-card">
        <h3>Pattern: Effect Cleanup</h3>
        <p>Always clean up resources in effects:</p>
        <pre>{`effect(() => {
  const ws = new WebSocket('ws://...');

  ws.onmessage = (e) => {
    data.value = e.data;
  };

  // Return cleanup function
  return () => ws.close();
});`}</pre>
      </div>

      <div class="demo-card">
        <h3>Best Practices</h3>
        <div class="info-box">
          <strong>1. Use computed() for derived values</strong> - Don't use effects to update other signals
          <br/><br/>
          <strong>2. Batch related updates</strong> - Use batch() when updating multiple signals
          <br/><br/>
          <strong>3. Clean up effects</strong> - Return cleanup functions from effects
          <br/><br/>
          <strong>4. Use untrack() sparingly</strong> - Only when you truly don't want dependencies
          <br/><br/>
          <strong>5. Avoid signal chains</strong> - Use computed instead of effects that set signals
          <br/><br/>
          <strong>6. Use root() for lifecycles</strong> - Group related effects for easy cleanup
        </div>
      </div>

      <div class="demo-card">
        <h3>Anti-Patterns to Avoid</h3>
        <div class="warning-box">
          <strong>❌ Don't:</strong> Use effects to derive state
          <pre>{`// BAD
const a = signal(1);
const b = signal(0);
effect(() => { b.value = a.value * 2; }); // Anti-pattern!

// GOOD
const a = signal(1);
const b = computed(() => a.value * 2); // Use computed!`}</pre>

          <strong>❌ Don't:</strong> Read signals in event handlers without effects
          <pre>{`// BAD - reads directly in handler
<button onClick={() => console.log(count.value)}>

// GOOD - handler just updates, effect logs
effect(() => console.log(count.value));
<button onClick={() => count.value++}>`}</pre>

          <strong>❌ Don't:</strong> Create infinite loops
          <pre>{`// BAD - infinite loop!
effect(() => {
  count.value = count.value + 1;
});`}</pre>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Render the app
// ============================================================================
render(() => <App />, document.getElementById('app')!)
