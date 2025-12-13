import { reactive } from '../core/reactive'
import { createContext, context } from '../core/context'
import type { Location, RouterContext } from './types'
import { parseQuery, isUnsafePath } from './utils'

// Contexts
export const RouterCtx = createContext<RouterContext>(null as any)
export const RouteDepthCtx = createContext<number>(0)

// Create location state and navigation
export function location(): [Location, (path: string) => void] {
    const getDefaultLoc = (): Location => ({
        pathname: '/',
        search: '',
        hash: '',
        query: {},
    })

    const getLoc = (): Location => {
        if (typeof window === 'undefined') {
            return getDefaultLoc()
        }
        return {
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            query: parseQuery(window.location.search),
        }
    }

    // Create a reactive location object
    const location = reactive<Location>(getLoc())

    const updateLocation = (newLoc: Location) => {
        location.pathname = newLoc.pathname
        location.search = newLoc.search
        location.hash = newLoc.hash
        location.query = newLoc.query
    }

    const navigate = (path: string) => {
        if (typeof window === 'undefined') return
        if (isUnsafePath(path)) {
            console.error('[Flexium Router] Blocked navigation to unsafe path:', path)
            return
        }
        window.history.pushState({}, '', path)
        const newLoc = getLoc()
        updateLocation(newLoc)
    }

    // Listen to popstate
    const handlePopState = () => {
        updateLocation(getLoc())
    }

    if (typeof window !== 'undefined') {
        window.addEventListener('popstate', handlePopState)
    }

    return [location, navigate]
}

// Router hook
export function router(): RouterContext {
    const ctx = context(RouterCtx)
    if (!ctx) {
        throw new Error('router() must be called within a <Routes> component')
    }
    return ctx
}
