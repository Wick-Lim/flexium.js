import { jsx as f } from '../jsx-runtime'
import type { FNode, FNodeChild } from './index'
import { state } from '../core/state'
import { createContext, context } from '../core/context'

export interface SuspenseProps {
  children: FNodeChild
  fallback: FNodeChild
}

// Suspense context for tracking loading state
interface SuspenseContextValue {
  registerPromise: (promise: Promise<any>) => void
  isLoading: boolean
}

export const SuspenseContext = createContext<SuspenseContextValue | null>(null)

/**
 * Suspense - Displays fallback while children are loading
 */
export function Suspense(props: SuspenseProps): FNode {
  const [pendingCount, setPendingCount] = state(0)

  const suspenseValue: SuspenseContextValue = {
    registerPromise: (promise: Promise<any>) => {
      setPendingCount(c => c + 1)
      promise.finally(() => {
        setPendingCount(c => Math.max(0, c - 1))
      })
    },
    get isLoading() {
      return pendingCount > 0
    }
  }

  // Show fallback if any promises are pending
  if (pendingCount > 0) {
    return props.fallback as FNode
  }

  return f(SuspenseContext.Provider, {
    value: suspenseValue,
    children: props.children
  })
}

/**
 * useSuspense - Hook to access suspense context
 */
export function useSuspense(): SuspenseContextValue | null {
  return context(SuspenseContext)
}
