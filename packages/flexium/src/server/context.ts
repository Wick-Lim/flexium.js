/**
 * SSR Context Management
 */
export interface SSRContext {
  isSSR: boolean
  data: Map<string, any>
  errors: Error[]
  head: string[]
}

let currentSSRContext: SSRContext | null = null

export function createSSRContext(): SSRContext {
  return {
    isSSR: true,
    data: new Map(),
    errors: [],
    head: []
  }
}

export function runWithSSRContext<T>(ctx: SSRContext, fn: () => T): T {
  const prev = currentSSRContext
  currentSSRContext = ctx
  try {
    return fn()
  } finally {
    currentSSRContext = prev
  }
}

export function getSSRContext(): SSRContext | null {
  return currentSSRContext
}

export function isSSR(): boolean {
  return currentSSRContext?.isSSR ?? false
}
