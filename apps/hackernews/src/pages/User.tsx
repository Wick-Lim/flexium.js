import { createResource } from 'flexium'
import { useRouter } from 'flexium/router'
import { loadUser, state } from '../store'

export default function User() {
    const router = useRouter()
    const id = () => router.params.value.id

    const [data] = createResource(id, async (id) => {
        await loadUser(id)
        return state.users[id]
    })

    return (
        <div class="view user-view">
            {() => {
                const user = data()
                if (!user) return <div>Loading...</div>

                return (
                    <div>
                        <h1>User : {user.id}</h1>
                        <ul class="meta">
                            <li><span class="label">Created:</span> {new Date(user.created * 1000).toLocaleString()}</li>
                            <li><span class="label">Karma:</span> {user.karma}</li>
                            <li innerHTML={user.about} class="about" />
                        </ul>
                        <p class="links">
                            <a href={`https://news.ycombinator.com/submitted?id=${user.id}`}>submissions</a> |
                            <a href={`https://news.ycombinator.com/threads?id=${user.id}`}>comments</a>
                        </p>
                    </div>
                )
            }}
        </div>
    )
}
