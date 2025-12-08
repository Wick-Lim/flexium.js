import { state, effect } from 'flexium/core'
import { Link } from 'flexium/router'
import { loadStories, useList, useItem } from '../store'

function StoryItem(props: { id: number; index: number }) {
    // Subscribe to item state
    const [story] = useItem(props.id);

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
                        by <Link to={`/user/${s.by}`}>{s.by}</Link>
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
    // Local state for loading status
    const [loading, setLoading] = state(true);

    // We need to react to prop changes (type change)
    effect(() => {
        setLoading(true);
        loadStories(props.type).then(() => setLoading(false));
    });

    // Subscribe to the list corresponding to the current type
    // Note: We can't use dynamic hook in conditional/loop, but here type is prop
    // However, we need a way to get the list reactively based on prop.
    // Ideally: const list = computed(() => useList(props.type)[0]())
    // But useList creates signals.

    // Let's use a local signal that updates when type changes
    const [ids, setIds] = state<number[]>([]);

    effect(() => {
        const [list] = useList(props.type);
        // We need to track the list value.
        // If useList returns a stable signal for a key, we can read it.
        // But here we want to bind local ids to the global list.

        // Simple polling/subscription pattern inside effect:
        setIds(list());
    });

    return (
        <div class="view">
            <div class="news-list-nav">
                {() => {
                    if (loading()) return <span>Loading...</span>
                    return null
                }}
            </div>

            <ul class="news-list">
                {ids().map((id: number, index: number) => <StoryItem id={id} index={index + 1} />)}
            </ul>
        </div>
    )
}