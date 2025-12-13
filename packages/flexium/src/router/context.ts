import { createContext } from '../core/context'
import type { RouterContext } from './types'

export const RouterCtx = createContext<RouterContext>(null as any)
export const RouteDepthCtx = createContext<number>(0)
