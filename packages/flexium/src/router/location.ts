import { reactive } from '../core/reactive'
import type { Location } from './types'
import { parseQuery, isUnsafePath } from './utils'

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
