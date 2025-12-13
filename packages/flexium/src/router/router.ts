import { context } from '../core/context'
import { RouterCtx } from './context'
import type { RouterContext } from './types'

export function router(): RouterContext {
    const ctx = context(RouterCtx)
    if (!ctx) {
        throw new Error('router() must be called within a <Routes> component')
    }
    return ctx
}
