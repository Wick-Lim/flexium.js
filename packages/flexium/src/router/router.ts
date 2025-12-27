import { reactive } from '../core/reactive'
import { Context } from '../core/context'
import { use } from '../core/use'
import type { Location, RouterContext } from './types'
import { parseQuery, isUnsafePath } from './utils'

// Contexts
export const RouterCtx = new Context<RouterContext>(null as any)
export const RouteDepthCtx = new Context<number>(0)

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

    // Handle srcdoc iframe - pathname may be empty or 'srcdoc'
    let pathname = window.location.pathname
    if (!pathname || pathname === 'srcdoc' || pathname === '/srcdoc') {
        pathname = '/'
    }

    return {
        pathname,
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
        console.log('[Flexium Router] Navigate called with:', path)
        if (typeof window === 'undefined') return
        if (isUnsafePath(path)) {
            console.error('[Flexium Router] Blocked navigation to unsafe path:', path)
            return
        }

        // Try to update browser history, but continue even if it fails (e.g., in srcdoc iframe)
        try {
            window.history.pushState({}, '', path)
        } catch {
            // SecurityError in srcdoc iframe - ignore but continue with internal state update
        }

        // Always update internal location state for SPA navigation
        const newLocation = {
            pathname: path.split('?')[0].split('#')[0],
            search: path.includes('?') ? '?' + path.split('?')[1].split('#')[0] : '',
            hash: path.includes('#') ? '#' + path.split('#')[1] : '',
            query: parseQuery(path.includes('?') ? '?' + path.split('?')[1].split('#')[0] : '')
        }
        console.log('[Flexium Router] Updating location to:', newLocation)
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
    const [routerContext] = use(RouterCtx)
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
