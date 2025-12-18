import { Context } from '../../core/context'
import { use } from '../../core/use'
import type { SuspenseContextValue } from './types'

const defaultValue: SuspenseContextValue = {
  register: () => {},
  hasBoundary: false
}

export const SuspenseCtx = new Context<SuspenseContextValue>(defaultValue)

export function suspenseContext(): SuspenseContextValue {
  const [value] = use(SuspenseCtx)
  return value
}
