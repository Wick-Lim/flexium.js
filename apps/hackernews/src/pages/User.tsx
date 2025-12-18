import { use } from 'flexium/core'
import { useRouter } from 'flexium/router'
import { loadUser } from '../store'

export default function User(props: { params?: { id?: string } } = {}) {
    const r = useRouter()
    const [userId] = use(() => {
        return r.params.id || props.params?.id
    }, [r.params.id, props.params?.id])

    // Use async use() to fetch user data
    const [user, { loading, error }] = use(async () => {
        if (!userId) return undefined;
        return await loadUser(userId);
    }, [userId])

    if (loading || !user) return <main class="view user-view" id="main"><div>Loading...</div></main>
    if (error) return <main class="view user-view" id="main"><div>Error loading user</div></main>

    const userValue = user

    return (
        <main class="view user-view" id="main">
            <div>
                <h1>User : {userValue.id}</h1>
                <ul class="meta">
                    <li><span class="label">Created:</span> {new Date(userValue.created * 1000).toLocaleString()}</li>
                    <li><span class="label">Karma:</span> {userValue.karma}</li>
                    <li innerHTML={userValue.about} class="about" />
                </ul>
                <p class="links">
                    <a href={`https://news.ycombinator.com/submitted?id=${userValue.id}`}>submissions</a> |
                    <a href={`https://news.ycombinator.com/threads?id=${userValue.id}`}>comments</a>
                </p>
            </div>
        </main>
    )
}
