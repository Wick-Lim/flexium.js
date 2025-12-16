import { jsx as f } from '../jsx-runtime'
import type { FNode, FNodeChild } from './index'
import { state } from '../core/state'

export interface ErrorBoundaryProps {
  children: FNodeChild
  fallback: FNodeChild | ((error: Error, reset: () => void) => FNodeChild)
  onError?: (error: Error, errorInfo: { componentStack: string }) => void
}

interface ErrorState {
  hasError: boolean
  error: Error | null
}

// Symbol to mark error boundary wrapper
export const ERROR_BOUNDARY_MARKER = Symbol('flexium.errorBoundary')

/**
 * ErrorBoundary Component
 * Catches errors in child components and renders a fallback UI
 */
export function ErrorBoundary(props: ErrorBoundaryProps): FNode {
  const [errorState, setErrorState] = state<ErrorState>({
    hasError: false,
    error: null
  })

  const reset = () => {
    setErrorState({ hasError: false, error: null })
  }

  // If there's an error, render the fallback
  if (errorState.hasError && errorState.error) {
    if (typeof props.fallback === 'function') {
      return props.fallback(errorState.error, reset) as FNode
    }
    return props.fallback as FNode
  }

  // Create a wrapper that will catch errors
  return f(ErrorCatcher, {
    children: props.children,
    onCatch: (error: Error) => {
      setErrorState({ hasError: true, error })

      if (props.onError) {
        props.onError(error, { componentStack: getComponentStack() })
      }
    }
  })
}

/**
 * Internal component that catches errors during rendering
 */
function ErrorCatcher(props: {
  children: FNodeChild
  onCatch: (error: Error) => void
}): FNodeChild {
  return props.children
}

// Mark the ErrorCatcher for detection in renderComponent
(ErrorCatcher as any)[ERROR_BOUNDARY_MARKER] = true

/**
 * Get component stack trace (simplified version)
 */
function getComponentStack(): string {
  try {
    throw new Error('Component stack trace')
  } catch (e) {
    return (e as Error).stack || ''
  }
}

/**
 * Check if a component is an ErrorCatcher
 */
export function isErrorCatcher(component: any): boolean {
  return component && component[ERROR_BOUNDARY_MARKER] === true
}

/**
 * Get the error handler from ErrorCatcher props
 */
export function getErrorHandler(props: any): ((error: Error) => void) | null {
  if (props && typeof props.onCatch === 'function') {
    return props.onCatch
  }
  return null
}
