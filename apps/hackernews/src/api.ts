const API_ROOT = 'https://hacker-news.firebaseio.com/v0'

export async function fetchIds(type: string) {
    const res = await fetch(`${API_ROOT}/${type}stories.json`)
    return (await res.json()) as number[]
}

export async function fetchItem(id: number) {
    const res = await fetch(`${API_ROOT}/item/${id}.json`)
    return await res.json()
}

export async function fetchUser(id: string) {
    const res = await fetch(`${API_ROOT}/user/${id}.json`)
    return await res.json()
}
