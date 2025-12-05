const API_ROOT = 'https://hacker-news.firebaseio.com/v0'

export async function fetchIds(type: string): Promise<number[]> {
    try {
        const res = await fetch(`${API_ROOT}/${type}stories.json`)
        if (!res.ok) {
            console.error(`Failed to fetch ${type} story IDs: ${res.status} ${res.statusText}`)
            return []
        }
        const data = await res.json()
        return Array.isArray(data) ? data : []
    } catch (error) {
        console.error(`Error fetching ${type} story IDs:`, error)
        return []
    }
}

export async function fetchItem(id: number): Promise<any | null> {
    try {
        const res = await fetch(`${API_ROOT}/item/${id}.json`)
        if (!res.ok) {
            console.error(`Failed to fetch item ${id}: ${res.status} ${res.statusText}`)
            return null
        }
        return await res.json()
    } catch (error) {
        console.error(`Error fetching item ${id}:`, error)
        return null
    }
}

export async function fetchUser(id: string): Promise<any | null> {
    try {
        const res = await fetch(`${API_ROOT}/user/${id}.json`)
        if (!res.ok) {
            console.error(`Failed to fetch user ${id}: ${res.status} ${res.statusText}`)
            return null
        }
        return await res.json()
    } catch (error) {
        console.error(`Error fetching user ${id}:`, error)
        return null
    }
}
