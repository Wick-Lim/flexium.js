import { createContext, context } from '../../core/context'
import type { SuspenseContextValue } from './types'

const defaultValue: SuspenseContextValue = {
  register: () => {},
  hasBoundary: false
}

export const SuspenseCtx = createContext<SuspenseContextValue>(defaultValue)

export function suspenseContext(): SuspenseContextValue {
  return context(SuspenseCtx)
}
