import { state, effect } from 'flexium/core'
import { router } from 'flexium/router'
import { loadUser, useUser } from '../store'

export default function User(props: { params?: { id?: string } } = {}) {
    const r = router()
    const [user, setUser] = state<any>(undefined)

    effect(() => {
        const params = r.params()
        const idStr = params.id || props.params?.id;

        if (!idStr) {
            setUser(undefined)
            return
        }

        // Load user data (async) - no await needed, reactive system will handle updates
        loadUser(idStr);

        // Track the global user state reactively - this will update when loadUser completes
        const [globalUser] = useUser(idStr);
        // Reading globalUser.value here tracks the signal, so when loadUser sets it, this effect will re-run
        const currentUser = globalUser.valueOf();
        setUser(currentUser);
    });

    // Use proxy directly
    if (!user) return <div class="view user-view"><div>Loading...</div></div>

    const userValue = user.valueOf()

    return (
        <div class="view user-view">
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
        </div>
    )
}
