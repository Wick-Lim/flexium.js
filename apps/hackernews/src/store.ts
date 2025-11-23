import { state } from 'flexium'
import { fetchIds, fetchItem, fetchUser } from './api'

// Types
interface Story {
    id: number
    title: string
    points?: number
    user?: string
    by?: string
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

// Store Actions & Accessors using unified state() API

// 1. Lists (Top, New, etc.)
export function useList(type: string) {
    // Global state for each list type
    // We handle fetching manually or could use resource here
    return state<number[]>([], { key: `list/${type}` });
}

// 2. Items (Stories, Comments)
export function useItem(id: number) {
    return state<Story | undefined>(undefined, { key: `item/${id}` });
}

// 3. Users
export function useUser(id: string) {
    return state<any>(undefined, { key: `user/${id}` });
}

// Fetch Actions
export async function loadStories(type: string) {
    const [list, setList] = useList(type);
    
    // If already loaded, skip (basic cache)
    if (list().length > 0) return;

    const ids = await fetchIds(type);
    setList(ids.slice(0, 30));

    // Load items in parallel
    const items = await Promise.all(ids.slice(0, 30).map(fetchItem));
    items.forEach(item => {
        if (item) {
            const [, setItem] = useItem(item.id);
            setItem(item);
        }
    });
}

export async function loadItem(id: number) {
    const [item, setItem] = useItem(id);
    if (item()) return; // Already loaded

    const data = await fetchItem(id);
    if (data) {
        setItem(data);
    }
}

export async function loadUser(id: string) {
    const [user, setUser] = useUser(id);
    if (user()) return;

    const data = await fetchUser(id);
    if (data) {
        setUser(data);
    }
}