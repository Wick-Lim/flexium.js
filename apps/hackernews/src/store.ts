import { state } from 'flexium/core'
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
    try {
        const [list, setList] = useList(type);

        // If already loaded, skip (basic cache)
        if (list.length > 0) return;

        const ids = await fetchIds(type);

        // Handle case where no IDs were returned
        if (!ids || ids.length === 0) {
            console.warn(`No story IDs returned for type: ${type}`);
            return;
        }

        setList(ids.slice(0, 30));

        // Load items in parallel with error handling
        const items = await Promise.allSettled(ids.slice(0, 30).map(fetchItem));
        items.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                const item = result.value;
                const [, setItem] = useItem(item.id);
                setItem(item);
            } else if (result.status === 'rejected') {
                console.error(`Failed to load item ${ids[index]}:`, result.reason);
            }
        });
    } catch (error) {
        console.error(`Error loading ${type} stories:`, error);
    }
}

export async function loadItem(id: number) {
    try {
        console.log('[Store] loadItem called with id:', id, typeof id);
        console.log('[Store] loadItem - about to call useItem');
        const [item, setItem] = useItem(id);
        console.log('[Store] loadItem - useItem returned, item:', item, 'setItem:', typeof setItem);
        const existingItem = item.valueOf();
        console.log('[Store] loadItem - existingItem:', existingItem ? `exists (id=${(existingItem as any).id})` : 'none');
        if (existingItem) {
            console.log('[Store] loadItem - item already loaded, returning');
            return; // Already loaded
        }

        console.log('[Store] loadItem - fetching item', id);
        const data = await fetchItem(id);
        console.log('[Store] loadItem - fetched data:', data ? `id=${data.id}, title=${data.title}` : 'null');
        if (data) {
            console.log('[Store] loadItem - calling setItem with data');
            setItem(data);
            console.log('[Store] loadItem - setItem called');
            const verify = useItem(id)[0].valueOf();
            console.log('[Store] loadItem - verify after setItem:', verify ? `id=${(verify as any).id}` : 'null');
        } else {
            console.warn(`[Store] No data returned for item ${id}`);
        }
    } catch (error) {
        console.error(`[Store] Error loading item ${id}:`, error);
        console.error('[Store] Error stack:', error instanceof Error ? error.stack : 'no stack');
    }
}

export async function loadUser(id: string) {
    try {
        console.log('[Store] loadUser called with id:', id);
        const [user, setUser] = useUser(id);
        const existingUser = user.valueOf();
        console.log('[Store] loadUser - existingUser:', existingUser ? 'exists' : 'none');
        if (existingUser) {
            console.log('[Store] loadUser - user already loaded, returning');
            return; // Already loaded
        }

        console.log('[Store] loadUser - fetching user', id);
        const data = await fetchUser(id);
        console.log('[Store] loadUser - fetched data:', data ? `id=${data.id}` : 'null');
        if (data) {
            setUser(data);
            console.log('[Store] loadUser - setUser called with data');
            const verify = useUser(id)[0].valueOf();
            console.log('[Store] loadUser - verify after setUser:', verify ? `id=${verify.id}` : 'null');
        } else {
            console.warn(`No data returned for user ${id}`);
        }
    } catch (error) {
        console.error(`Error loading user ${id}:`, error);
    }
}
