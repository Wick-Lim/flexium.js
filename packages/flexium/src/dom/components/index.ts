// Types
export type {
  SuspenseProps,
  LazyComponent,
  SuspenseContextValue,
  ErrorInfo,
  ErrorBoundaryProps
} from './types'

// Components
export { Suspense } from './Suspense'
export { ErrorBoundary } from './ErrorBoundary'

// Functions
export { lazy } from './lazy'
export { suspenseContext } from './suspenseContext'

// Error boundary utilities (for render.ts integration)
export {
  pushComponentName,
  popComponentName,
  getComponentStack,
  pushErrorBoundary,
  popErrorBoundary,
  getNearestErrorBoundary
} from './ErrorBoundary'
