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
    return state<number[]>([], { key: ['list', type] });
}

// 2. Items (Stories, Comments)
export function useItem(id: number) {
    return state<Story | undefined>(undefined, { key: ['item', id] });
}

// 3. Users
export function useUser(id: string) {
    return state<any>(undefined, { key: ['user', id] });
}

// Fetch Actions
export async function loadStories(type: string) {
    try {
        const ids = await fetchIds(type);
        return ids.slice(0, 30);
    } catch (error) {
        console.error(`Error loading ${type} stories:`, error);
        return [];
    }
}

export async function loadItem(id: number) {
    try {
        const [item, setItem] = useItem(id);
        if (item) return; // Already loaded

        const data = await fetchItem(id);
        if (data) {
            setItem(data);
        } else {
            console.warn(`No data returned for item ${id}`);
        }
    } catch (error) {
        console.error(`Error loading item ${id}:`, error);
    }
}

export async function loadUser(id: string) {
    try {
        const [user, setUser] = useUser(id);
        if (user) return; // Already loaded

        const data = await fetchUser(id);
        if (data) {
            setUser(data);
        } else {
            console.warn(`No data returned for user ${id}`);
        }
    } catch (error) {
        console.error(`Error loading user ${id}:`, error);
    }
}
