import { createContext } from '../core/context'
import { RouterContext } from './types'

// Global Router Context
export const RouterCtx = createContext<RouterContext | null>(null)

// Current Route Depth Context (for Outlet)
// Stores the index of the current match in the `matches` array
export const RouteDepthCtx = createContext<number>(0)
