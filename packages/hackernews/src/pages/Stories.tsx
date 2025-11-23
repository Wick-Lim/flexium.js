import { createResource } from 'flexium'
import { Link } from 'flexium/router'
import { loadStories, state } from '../store'

function StoryItem(props: { id: number; index: number }) {
    const story = () => state.items[props.id]

    return () => {
        const s = story()
        if (!s) return <li class="news-item">Loading...</li>

        return (
            <li class="news-item">
                <span class="score">{s.points}</span>
                <span class="title">
                    <a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>
                    <span class="host"> ({s.domain || '...'})</span>
                </span>
                <br />
                <span class="meta">
                    <span class="by">
                        by <Link to={`/user/${s.user}`}>{s.user}</Link>
                    </span>
                    <span class="time"> {new Date(s.time * 1000).toLocaleString()}</span>
                    <span class="comments-link">
                        {' | '}
                        <Link to={`/item/${s.id}`}>{s.comments_count} comments</Link>
                    </span>
                </span>
            </li>
        )
    }
}

export default function Stories(props: { type: string }) {
    // Use createResource to trigger data loading
    const [data] = createResource(
        () => props.type,
        async (type) => {
            await loadStories(type as any)
            return state.lists[type as keyof typeof state.lists]
        }
    )

    return (
        <div class="view">
            <div class="news-list-nav">
                {() => {
                    if (data.loading) return <span>Loading...</span>
                    return null
                }}
            </div>

            <ul class="news-list">
                {() => {
                    const ids = data() || []
                    return ids.map((id: number, i: number) => <StoryItem id={id} index={i + 1} />)
                }}
            </ul>
        </div>
    )
}
