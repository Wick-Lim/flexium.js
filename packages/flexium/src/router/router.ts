import { reactive } from '../core/reactive'
import { createContext, context } from '../core/context'
import type { Location, RouterContext } from './types'
import { parseQuery, isUnsafePath } from './utils'

// Contexts
export const RouterCtx = createContext<RouterContext>(null as any)
export const RouteDepthCtx = createContext<number>(0)

// Create location state and navigation
export function location(): [Location, (path: string) => void] {
    const getDefaultLocation = (): Location => ({
        pathname: '/',
        search: '',
        hash: '',
        query: {},
    })

    const getCurrentLocation = (): Location => {
        if (typeof window === 'undefined') {
            return getDefaultLocation()
        }
        return {
            pathname: window.location.pathname,
            search: window.location.search,
            hash: window.location.hash,
            query: parseQuery(window.location.search),
        }
    }

    // Create a reactive location object
    const location = reactive<Location>(getCurrentLocation())

    const updateLocation = (newLocation: Location) => {
        location.pathname = newLocation.pathname
        location.search = newLocation.search
        location.hash = newLocation.hash
        location.query = newLocation.query
    }

    const navigate = (path: string) => {
        if (typeof window === 'undefined') return
        if (isUnsafePath(path)) {
            console.error('[Flexium Router] Blocked navigation to unsafe path:', path)
            return
        }
        window.history.pushState({}, '', path)
        const newLocation = getCurrentLocation()
        updateLocation(newLocation)
    }

    // Listen to popstate
    const handlePopState = () => {
        updateLocation(getCurrentLocation())
    }

    if (typeof window !== 'undefined') {
        window.addEventListener('popstate', handlePopState)
    }

    return [location, navigate]
}

// Router hook
export function router(): RouterContext {
    const routerContext = context(RouterCtx)
    if (!routerContext) {
        throw new Error('router() must be called within a <Routes> component')
    }
    return routerContext
}
