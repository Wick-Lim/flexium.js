import { state, effect } from 'flexium/core'
import { router } from 'flexium/router'
import { loadUser, useUser } from '../store'

export default function User() {
    const r = router()

    const [user, setUser] = state<any>(undefined);

    // Effect 1: Load user data when userId changes
    effect(() => {
        const userId = r.params.value.id;
        if (!userId) return;
        loadUser(userId);
    });

    // Effect 2: Sync global user state to local state reactively
    effect(() => {
        const userId = r.params.value.id;
        if (!userId) return;

        const [globalUser] = useUser(userId);
        setUser(globalUser());
    });

    // Use proxy directly
    if (!user) return <div class="view user-view"><div>Loading...</div></div>

    return (
        <div class="view user-view">
            <div>
                <h1>User : {user.id}</h1>
                <ul class="meta">
                    <li><span class="label">Created:</span> {new Date(+user.created * 1000).toLocaleString()}</li>
                    <li><span class="label">Karma:</span> {user.karma}</li>
                    <li innerHTML={user.about} class="about" />
                </ul>
                <p class="links">
                    <a href={`https://news.ycombinator.com/submitted?id=${user.id}`}>submissions</a> |
                    <a href={`https://news.ycombinator.com/threads?id=${user.id}`}>comments</a>
                </p>
            </div>
        </div>
    )
}
