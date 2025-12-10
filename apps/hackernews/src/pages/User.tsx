import { state, effect } from 'flexium/core'
import { router } from 'flexium/router'
import { loadUser, useUser } from '../store'

export default function User(props: { params?: { id?: string } } = {}) {
    const r = router()
    const [currentUserId, setCurrentUserId] = state<string | null>(null)

    effect(() => {
        const params = r.params
        const idStr = params.id || props.params?.id;
        
        if (!idStr) {
            setCurrentUserId(null)
            return
        }
        
        setCurrentUserId(idStr)
        // Load user data (async)
        loadUser(idStr);
    });

    // Track the global user state reactively - reading currentUserId tracks it
    const userId = currentUserId.valueOf()
    if (!userId) return <div class="view user-view"><div>Loading...</div></div>
    
    const [user] = useUser(userId)
    // Reading user tracks the signal, so when loadUser completes, component will re-render
    const userValue = user.valueOf()
    
    if (!userValue) return <div class="view user-view"><div>Loading...</div></div>

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
