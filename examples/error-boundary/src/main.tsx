import { render } from 'flexium/dom'
import { signal } from 'flexium'
import { ErrorBoundary, useErrorBoundary } from '../../packages/flexium/src/core/error-boundary'

// ============================================================================
// Demo Components with Intentional Errors
// ============================================================================

/**
 * Component that throws an error during render
 */
function BuggyComponent() {
  const count = signal(0)

  return (
    <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
      <h3 style="margin-bottom: 12px; color: #333;">Buggy Counter</h3>
      <p style="margin-bottom: 12px; color: #666;">Click the button to increment. Will crash at count = 3</p>
      <div style="display: flex; align-items: center; gap: 12px;">
        <button
          onClick={() => count.value++}
          style="padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
        >
          Count: {() => count.value}
        </button>
        {() => {
          if (count.value >= 3) {
            throw new Error('Count reached 3! This is a simulated crash.')
          }
          return null
        }}
      </div>
    </div>
  )
}

/**
 * Component that uses useErrorBoundary to throw errors programmatically
 */
function AsyncErrorComponent() {
  const { setError } = useErrorBoundary()
  const loading = signal(false)

  const simulateAsyncError = async () => {
    loading.value = true
    try {
      await new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Simulated async operation failed')), 1000)
      )
    } catch (err) {
      loading.value = false
      setError(err)
    }
  }

  return (
    <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
      <h3 style="margin-bottom: 12px; color: #333;">Async Error Trigger</h3>
      <p style="margin-bottom: 12px; color: #666;">Simulates an async operation that fails</p>
      <button
        onClick={simulateAsyncError}
        disabled={() => loading.value}
        style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
      >
        {() => loading.value ? 'Loading...' : 'Trigger Async Error'}
      </button>
    </div>
  )
}

/**
 * Component that randomly throws errors
 */
function RandomErrorComponent() {
  const { setError } = useErrorBoundary()

  const tryLuck = () => {
    if (Math.random() < 0.5) {
      setError(new Error('Bad luck! Random error occurred (50% chance)'))
    } else {
      alert('Lucky! No error this time.')
    }
  }

  return (
    <div style="padding: 20px; background: #f8f9fa; border-radius: 8px;">
      <h3 style="margin-bottom: 12px; color: #333;">Random Error</h3>
      <p style="margin-bottom: 12px; color: #666;">50% chance of throwing an error</p>
      <button
        onClick={tryLuck}
        style="padding: 8px 16px; background: #f39c12; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
      >
        Try Your Luck
      </button>
    </div>
  )
}

/**
 * Safe component that never throws errors
 */
function SafeComponent() {
  const count = signal(0)

  return (
    <div style="padding: 20px; background: #d4edda; border: 2px solid #28a745; border-radius: 8px;">
      <h3 style="margin-bottom: 12px; color: #155724;">Safe Component</h3>
      <p style="margin-bottom: 12px; color: #155724;">This component is protected and will never crash</p>
      <button
        onClick={() => count.value++}
        style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;"
      >
        Safe Count: {() => count.value}
      </button>
    </div>
  )
}

// ============================================================================
// Custom Fallback Components
// ============================================================================

/**
 * Simple fallback UI
 */
function SimpleFallback({ error, reset }) {
  return (
    <div style="padding: 24px; background: #fee; border: 2px solid #c33; border-radius: 8px; color: #c33;">
      <h3 style="margin-bottom: 12px;">Something went wrong</h3>
      <p style="margin-bottom: 16px; color: #666;">{error.message}</p>
      <button
        onClick={reset}
        style="padding: 8px 16px; background: #c33; color: white; border: none; border-radius: 4px; cursor: pointer;"
      >
        Try Again
      </button>
    </div>
  )
}

/**
 * Detailed fallback UI with error info
 */
function DetailedFallback({ error, errorInfo, reset, retryCount }) {
  return (
    <div style="padding: 24px; background: #fff3cd; border: 2px solid #856404; border-radius: 8px;">
      <h3 style="margin-bottom: 16px; color: #856404;">Error Details</h3>

      <div style="background: white; padding: 16px; border-radius: 4px; margin-bottom: 16px; border-left: 4px solid #856404;">
        <strong style="color: #333;">Error Message:</strong>
        <p style="margin: 8px 0; color: #666; font-family: monospace; font-size: 14px;">{error.message}</p>

        <strong style="color: #333; display: block; margin-top: 12px;">Error Stack:</strong>
        <pre style="margin: 8px 0; color: #666; font-size: 12px; overflow-x: auto; white-space: pre-wrap; word-wrap: break-word;">
          {error.stack || 'No stack trace available'}
        </pre>
      </div>

      {errorInfo && (
        <div style="background: white; padding: 16px; border-radius: 4px; margin-bottom: 16px;">
          <strong style="color: #333;">Error Info:</strong>
          <p style="margin: 8px 0; color: #666; font-size: 14px;">
            Timestamp: {new Date(errorInfo.timestamp).toLocaleString()}
          </p>
          {errorInfo.componentStack && (
            <>
              <strong style="color: #333; display: block; margin-top: 8px;">Component Stack:</strong>
              <pre style="margin: 8px 0; color: #666; font-size: 12px; white-space: pre-wrap;">
                {errorInfo.componentStack}
              </pre>
            </>
          )}
        </div>
      )}

      <div style="background: white; padding: 16px; border-radius: 4px; margin-bottom: 16px;">
        <strong style="color: #333;">Retry Attempts:</strong>
        <p style="margin: 8px 0; color: #666;">{retryCount}</p>
      </div>

      <button
        onClick={reset}
        style="padding: 10px 20px; background: #856404; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; font-weight: 600;"
      >
        Reset and Try Again
      </button>
    </div>
  )
}

/**
 * Compact inline fallback
 */
function InlineFallback({ error, reset }) {
  return (
    <div style="padding: 16px; background: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
        <div>
          <strong style="color: #721c24; display: block; margin-bottom: 4px;">Error</strong>
          <span style="color: #721c24; font-size: 14px;">{error.message}</span>
        </div>
        <button
          onClick={reset}
          style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; white-space: nowrap;"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

// ============================================================================
// Demo Sections
// ============================================================================

/**
 * Basic ErrorBoundary usage
 */
function BasicDemo() {
  return (
    <section style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;">
      <h2 style="margin-bottom: 8px; color: #333; font-size: 1.5rem;">1. Basic ErrorBoundary</h2>
      <p style="margin-bottom: 24px; color: #666;">Simple error boundary with custom fallback component</p>

      <ErrorBoundary fallback={SimpleFallback}>
        <BuggyComponent />
      </ErrorBoundary>
    </section>
  )
}

/**
 * ErrorBoundary with detailed fallback
 */
function DetailedDemo() {
  const errorLog = signal<Array<{ error: Error; timestamp: number }>>([])

  const handleError = (error: Error, errorInfo) => {
    console.error('Caught error:', error, errorInfo)
    errorLog.value = [...errorLog.value, { error, timestamp: errorInfo.timestamp }]
  }

  const handleReset = () => {
    console.log('Error boundary reset')
  }

  return (
    <section style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;">
      <h2 style="margin-bottom: 8px; color: #333; font-size: 1.5rem;">2. Detailed Error Information</h2>
      <p style="margin-bottom: 24px; color: #666;">Error boundary with detailed fallback showing error info and retry count</p>

      <ErrorBoundary
        fallback={DetailedFallback}
        onError={handleError}
        onReset={handleReset}
      >
        <AsyncErrorComponent />
      </ErrorBoundary>

      {() => errorLog.value.length > 0 && (
        <div style="margin-top: 24px; padding: 16px; background: #f8f9fa; border-radius: 8px;">
          <h4 style="margin-bottom: 12px; color: #333;">Error Log ({errorLog.value.length})</h4>
          <div style="max-height: 200px; overflow-y: auto;">
            {errorLog.value.map((entry, i) => (
              <div key={i} style="padding: 8px; margin-bottom: 8px; background: white; border-radius: 4px; font-size: 14px;">
                <strong style="color: #c33;">{entry.error.message}</strong>
                <span style="color: #999; margin-left: 12px;">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

/**
 * Nested error boundaries
 */
function NestedDemo() {
  return (
    <section style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;">
      <h2 style="margin-bottom: 8px; color: #333; font-size: 1.5rem;">3. Nested Error Boundaries</h2>
      <p style="margin-bottom: 24px; color: #666;">Multiple error boundaries protecting different parts of the UI</p>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px;">
        <ErrorBoundary fallback={InlineFallback}>
          <RandomErrorComponent />
        </ErrorBoundary>

        <ErrorBoundary fallback={InlineFallback}>
          <SafeComponent />
        </ErrorBoundary>

        <ErrorBoundary fallback={InlineFallback}>
          <BuggyComponent />
        </ErrorBoundary>
      </div>

      <div style="margin-top: 16px; padding: 16px; background: #e7f3ff; border-left: 4px solid #1976d2; border-radius: 4px;">
        <p style="margin: 0; color: #0d47a1; font-size: 14px;">
          Notice: Each component has its own error boundary. If one fails, the others continue to work!
        </p>
      </div>
    </section>
  )
}

/**
 * Error recovery demonstration
 */
function RecoveryDemo() {
  const shouldError = signal(true)

  function RecoverableComponent() {
    if (shouldError.value) {
      throw new Error('This error can be recovered by toggling the switch below')
    }

    return (
      <div style="padding: 20px; background: #d4edda; border-radius: 8px; color: #155724;">
        <h3 style="margin-bottom: 12px;">Success!</h3>
        <p>The component recovered successfully. Error has been cleared.</p>
      </div>
    )
  }

  const customReset = () => {
    // This will be called when the error boundary resets
    console.log('Error boundary reset triggered')
  }

  return (
    <section style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;">
      <h2 style="margin-bottom: 8px; color: #333; font-size: 1.5rem;">4. Error Recovery</h2>
      <p style="margin-bottom: 24px; color: #666;">Toggle the switch to fix the error condition and recover</p>

      <div style="margin-bottom: 16px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; user-select: none;">
          <input
            type="checkbox"
            checked={() => shouldError.value}
            onChange={(e) => shouldError.value = e.target.checked}
            style="width: 20px; height: 20px; cursor: pointer;"
          />
          <span style="color: #333; font-weight: 500;">Simulate Error Condition</span>
        </label>
      </div>

      <ErrorBoundary
        fallback={DetailedFallback}
        onReset={customReset}
      >
        <RecoverableComponent />
      </ErrorBoundary>
    </section>
  )
}

/**
 * Multiple nested boundaries with different fallbacks
 */
function ComplexNestedDemo() {
  return (
    <section style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 24px;">
      <h2 style="margin-bottom: 8px; color: #333; font-size: 1.5rem;">5. Complex Nested Boundaries</h2>
      <p style="margin-bottom: 24px; color: #666;">Multiple levels of error boundaries with different fallback strategies</p>

      <ErrorBoundary fallback={SimpleFallback}>
        <div style="padding: 16px; background: #f8f9fa; border-radius: 8px; margin-bottom: 16px;">
          <h4 style="margin-bottom: 12px; color: #333;">Outer Boundary</h4>

          <div style="display: grid; gap: 16px;">
            <ErrorBoundary fallback={InlineFallback}>
              <div style="padding: 12px; background: white; border-radius: 4px;">
                <h5 style="margin-bottom: 8px; color: #555;">Inner Boundary 1</h5>
                <RandomErrorComponent />
              </div>
            </ErrorBoundary>

            <ErrorBoundary fallback={InlineFallback}>
              <div style="padding: 12px; background: white; border-radius: 4px;">
                <h5 style="margin-bottom: 8px; color: #555;">Inner Boundary 2</h5>
                <BuggyComponent />
              </div>
            </ErrorBoundary>

            <div style="padding: 12px; background: white; border-radius: 4px;">
              <h5 style="margin-bottom: 8px; color: #555;">No Boundary (Protected by Outer)</h5>
              <AsyncErrorComponent />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </section>
  )
}

// ============================================================================
// Main App
// ============================================================================

function App() {
  return (
    <div>
      <h1>ErrorBoundary Examples</h1>
      <p class="description">
        Comprehensive demonstration of Flexium's ErrorBoundary component
      </p>

      <BasicDemo />
      <DetailedDemo />
      <NestedDemo />
      <RecoveryDemo />
      <ComplexNestedDemo />

      <footer style="text-align: center; color: white; padding: 32px; opacity: 0.9;">
        <p>Built with Flexium - Fine-grained reactive framework</p>
      </footer>
    </div>
  )
}

// Render the app
const root = document.getElementById('app')
if (root) {
  render(App, root)
}
