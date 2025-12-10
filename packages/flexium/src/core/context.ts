import type { FNodeChild } from './renderer'
import { getOwner, setOwner } from './owner'

export interface Context<T> {
  id: symbol
  Provider: (props: { value: T; children: FNodeChild }) => FNodeChild
  defaultValue: T
}

export function createContext<T>(defaultValue: T): Context<T> {
  const id = Symbol('context')

  const Provider = (props: { value: T; children: FNodeChild }): FNodeChild => {
    return props.children
  }
    ; (Provider as unknown as { _contextId: symbol })._contextId = id

  return {
    id,
    Provider,
    defaultValue,
  }
}

/**
 * Get the current value from a context.
 *
 * @example
 * ```tsx
 * const theme = context(ThemeContext)
 * ```
 */
export function context<T>(ctx: Context<T>): T {
  const owner = getOwner()
  if (owner && owner.context) {
    const value = owner.context[ctx.id]
    if (value !== undefined) {
      return value as T
    }
  }
  return ctx.defaultValue
}

/**
 * Push a value onto the context stack for a given context ID.
 * @internal Used by the renderer during component mounting.
 * @param id - The context symbol identifier
 * @param value - The value to push onto the context stack
 */
export function pushProvider(id: symbol, value: unknown): void {
  const owner = getOwner()
  if (owner) {
    if (!owner.context) {
      owner.context = {}
    }
    owner.context[id] = value
  }
}

/**
 * Pop a value from the context stack for a given context ID.
 * @internal No-op in Owner-based context system (handled by scope)
 */
export function popProvider(_id: symbol): void {
  // No-op: Context scoping is handled by the Owner prototype chain
}

/**
 * Capture the current context state
 * Returns an opaque handle to the current owner scope.
 */
export function captureContext(): unknown {
  return getOwner()
}

/**
 * Run a function with the captured context restored
 */
export function runWithContext<T>(
  snapshot: unknown,
  fn: () => T
): T {
  const prev = getOwner()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setOwner(snapshot as any)
  try {
    return fn()
  } finally {
    setOwner(prev)
  }
}
