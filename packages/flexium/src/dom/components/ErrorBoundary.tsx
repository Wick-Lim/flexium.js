import { state } from '../../core/state'
import { hook } from '../../core/hook'
import type { FNodeChild } from '../types'
import type { ErrorInfo, ErrorBoundaryProps } from './types'

// Component name stack for error messages
let componentNameStack: string[] = []

export function pushComponentName(name: string): void {
  componentNameStack.push(name)
}

export function popComponentName(): void {
  componentNameStack.pop()
}

export function getComponentStack(): string {
  return componentNameStack
    .map(name => `    at ${name}`)
    .reverse()
    .join('\n')
}

// Stack of error boundaries for nested error propagation
interface ErrorBoundaryInstance {
  handleError: (error: Error, phase: 'render' | 'effect' | 'event') => void
}

let errorBoundaryStack: ErrorBoundaryInstance[] = []

export function pushErrorBoundary(instance: ErrorBoundaryInstance): void {
  errorBoundaryStack.push(instance)
}

export function popErrorBoundary(): void {
  errorBoundaryStack.pop()
}

export function getNearestErrorBoundary(): ErrorBoundaryInstance | null {
  return errorBoundaryStack[errorBoundaryStack.length - 1] || null
}

/**
 * ErrorBoundary component that catches errors in its children and displays fallback UI
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={(error, info) => <div>Error: {error.message}</div>}
 *   onError={(error, info) => console.error(error)}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export function ErrorBoundary(props: ErrorBoundaryProps): FNodeChild {
  const { fallback, onError, children, resetKey } = props

  // Error state
  const [errorState, setErrorState] = state<{
    error: Error | null
    info: ErrorInfo | null
  }>({ error: null, info: null })

  // Track reset key changes to clear error
  const prevResetKeyRef = hook(() => ({ current: resetKey }))

  if (resetKey !== prevResetKeyRef.current) {
    prevResetKeyRef.current = resetKey
    if (errorState.error !== null) {
      setErrorState({ error: null, info: null })
    }
  }

  // Error boundary instance
  const boundaryInstance: ErrorBoundaryInstance = {
    handleError: (error: Error, phase: 'render' | 'effect' | 'event') => {
      const info: ErrorInfo = {
        componentStack: getComponentStack(),
        phase
      }

      // Call error callback
      onError?.(error, info)

      // Update error state (triggers re-render with fallback)
      setErrorState({ error, info })
    }
  }

  // If we have an error, render fallback
  if (errorState.error) {
    if (typeof fallback === 'function') {
      return fallback(errorState.error, errorState.info!)
    }
    return fallback
  }

  // Push boundary onto stack for children to use
  pushErrorBoundary(boundaryInstance)

  try {
    // Return children - they will be rendered with this boundary active
    return children
  } finally {
    popErrorBoundary()
  }
}
