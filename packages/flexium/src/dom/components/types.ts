import type { FNodeChild } from '../types'

// Portal types
export interface PortalProps {
  /** Target element or CSS selector to render children into */
  target: HTMLElement | string
  /** Children to render in the portal */
  children: FNodeChild
  /** Optional key for reconciliation */
  key?: any
}

// Suspense types
export interface SuspenseProps {
  /** Fallback UI to display while loading */
  fallback: FNodeChild
  /** Children to render when loaded */
  children: FNodeChild
}

export interface LazyComponent<P = any> {
  (props: P): FNodeChild
  _lazy: true
  _loader: () => Promise<{ default: (props: P) => FNodeChild }>
  _resolved?: (props: P) => FNodeChild
  _promise?: Promise<any>
  _error?: Error
}

export interface SuspenseContextValue {
  /** Register a pending promise with the suspense boundary */
  register: (promise: Promise<any>) => void
  /** Whether there's an active suspense boundary */
  hasBoundary: boolean
}

// ErrorBoundary types
export interface ErrorInfo {
  /** Component stack trace */
  componentStack: string
  /** Error occurred during which phase */
  phase: 'render' | 'effect' | 'event'
}

export interface ErrorBoundaryProps {
  /** Fallback UI to display when error occurs */
  fallback: FNodeChild | ((error: Error, info: ErrorInfo) => FNodeChild)
  /** Callback when error is caught */
  onError?: (error: Error, info: ErrorInfo) => void
  /** Children to render */
  children: FNodeChild
  /** Key to reset boundary (changing key resets error state) */
  resetKey?: unknown
}
