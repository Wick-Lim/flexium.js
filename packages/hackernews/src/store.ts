import { createStore } from 'flexium/store'
import { fetchIds, fetchItem, fetchUser } from './api'

interface Story {
    id: number
    title: string
    points?: number
    user?: string
    by?: string // API uses 'by'
    time: number
    time_ago: string
    comments_count: number
    type: string
    url?: string
    domain?: string
    text?: string
    kids?: number[]
    descendants?: number
}

interface State {
    items: Record<number, Story>
    users: Record<string, any>
    lists: {
        top: number[]
        new: number[]
        show: number[]
        ask: number[]
        job: number[]
    }
}

const [state, setState] = createStore<State>({
    items: {},
    users: {},
    lists: {
        top: [],
        new: [],
        show: [],
        ask: [],
        job: []
    }
})

export { state }

export async function loadStories(type: keyof State['lists']) {
    if (state.lists[type].length > 0) return

    const ids = await fetchIds(type)
    setState('lists', type, ids.slice(0, 30)) // Load top 30 for now

    // Load items
    const items = await Promise.all(ids.slice(0, 30).map(fetchItem))
    items.forEach(item => {
        if (item) setState('items', item.id, item)
    })
}

export async function loadItem(id: number) {
    if (state.items[id]) return
    const item = await fetchItem(id)
    if (item) setState('items', id, item)
}

export async function loadUser(id: string) {
    if (state.users[id]) return
    const user = await fetchUser(id)
    if (user) setState('users', id, user)
}
