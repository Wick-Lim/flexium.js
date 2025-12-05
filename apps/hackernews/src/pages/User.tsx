import { state, effect } from 'flexium/core'
import { useRouter } from 'flexium/router'
import { loadUser, useUser } from '../store'

export default function User() {
    const router = useRouter()
    const id = () => router.params.value.id

    const [user, setUser] = state<any>(undefined);

    effect(() => {
        const userId = id();
        if (!userId) return;

        loadUser(userId);
        const [globalUser] = useUser(userId);
        setUser(globalUser());
    });

    return (
        <div class="view user-view">
            {() => {
                const data = user()
                if (!data) return <div>Loading...</div>

                return (
                    <div>
                        <h1>User : {data.id}</h1>
                        <ul class="meta">
                            <li><span class="label">Created:</span> {new Date(data.created * 1000).toLocaleString()}</li>
                            <li><span class="label">Karma:</span> {data.karma}</li>
                            <li innerHTML={data.about} class="about" />
                        </ul>
                        <p class="links">
                            <a href={`https://news.ycombinator.com/submitted?id=${data.id}`}>submissions</a> |
                            <a href={`https://news.ycombinator.com/threads?id=${data.id}`}>comments</a>
                        </p>
                    </div>
                )
            }}
        </div>
    )
}