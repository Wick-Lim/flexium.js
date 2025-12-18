import { use } from 'flexium/core'
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

// Store Actions & Accessors using unified use() API

// 1. Lists (Top, New, etc.)
export function useList(type: string) {
    return use<number[]>([], { key: ['list', type] });
}

// 2. Items (Stories, Comments)
export function useItem(id: number) {
    return use<Story | undefined>(undefined, { key: ['item', id] });
}

// 3. Users
export function useUser(id: string) {
    return use<any>(undefined, { key: ['user', id] });
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

export async function loadItem(id: number): Promise<any> {
    try {
        const data = await fetchItem(id);
        return data;
    } catch (error) {
        console.error(`Error loading item ${id}:`, error);
        throw error;
    }
}

export async function loadUser(id: string): Promise<any> {
    try {
        const data = await fetchUser(id);
        return data;
    } catch (error) {
        console.error(`Error loading user ${id}:`, error);
        throw error;
    }
}
