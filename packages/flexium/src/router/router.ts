import { reactive } from '../core/reactive'
import { createContext, useContext } from '../core/context'
import type { Location, RouterContext } from './types'
import { parseQuery, isUnsafePath } from './utils'

// Contexts
export const RouterCtx = createContext<RouterContext>(null as any)
export const RouteDepthCtx = createContext<number>(0)

// Helper functions
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

// Global singleton location state
let globalLocation: Location | null = null
let globalNavigate: ((path: string) => void) | null = null
let popstateListenerAttached = false

// Create location state and navigation (singleton pattern)
export function useLocation(): [Location, (path: string) => void] {
    // Return existing singleton if already created
    if (globalLocation && globalNavigate) {
        return [globalLocation, globalNavigate]
    }

    // Create a reactive location object (only once)
    globalLocation = reactive<Location>(getCurrentLocation())

    const updateLocation = (newLocation: Location) => {
        if (!globalLocation) return
        globalLocation.pathname = newLocation.pathname
        globalLocation.search = newLocation.search
        globalLocation.hash = newLocation.hash
        globalLocation.query = newLocation.query
    }

    globalNavigate = (path: string) => {
        if (typeof window === 'undefined') return
        if (isUnsafePath(path)) {
            console.error('[Flexium Router] Blocked navigation to unsafe path:', path)
            return
        }
        window.history.pushState({}, '', path)
        const newLocation = getCurrentLocation()
        updateLocation(newLocation)
    }

    // Listen to popstate (only once)
    if (typeof window !== 'undefined' && !popstateListenerAttached) {
        window.addEventListener('popstate', () => {
            updateLocation(getCurrentLocation())
        })
        popstateListenerAttached = true
    }

    return [globalLocation, globalNavigate]
}

// Router hook - returns full router context
export function useRouter(): RouterContext {
    const routerContext = useContext(RouterCtx)
    if (!routerContext) {
        throw new Error('useRouter() must be called within a <Routes> component')
    }
    return routerContext
}

// Navigate hook - returns navigate function
export function useNavigate(): (path: string) => void {
    const [, navigate] = useLocation()
    return navigate
}

// Params hook - returns route params
export function useParams<T extends Record<string, string> = Record<string, string>>(): T {
    const router = useRouter()
    return router.params as T
}

// Query hook - returns query params
export function useQuery<T extends Record<string, string> = Record<string, string>>(): T {
    const [location] = useLocation()
    return location.query as T
}
