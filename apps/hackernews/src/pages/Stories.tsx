import { state, effect } from 'flexium/core'
import { Link } from 'flexium/router'
import { loadStories, useList, useItem } from '../store'

function StoryItem(props: { id: number; index: number }) {
    // Subscribe to item state
    const [story] = useItem(props.id);

    // Use proxy directly - no function wrapper needed
    if (!story) return <li class="news-item">Loading...</li>

    return (
        <li class="news-item">
            <span class="score">{story.points}</span>
            <span class="title">
                <a href={story.url} target="_blank" rel="noreferrer">{story.title}</a>
                <span class="host"> ({story.domain || '...'})</span>
            </span>
            <br />
            <span class="meta">
                <span class="by">
                    by <Link to={`/user/${story.by}`}>{story.by}</Link>
                </span>
                <span class="time"> {new Date(story.time * 1000).toLocaleString()}</span>
                <span class="comments-link">
                    {' | '}
                    <Link to={`/item/${story.id}`}>{story.comments_count} comments</Link>
                </span>
            </span>
        </li>
    )
}

export default function Stories(props: { type: string }) {
    const [list, setList] = state<number[]>([]);
    const [loading, setLoading] = state(false);

    // Load data for the current type (from props, not router)
    // Router handles component replacement when route changes
    effect(() => {
        const type = props.type;

        // Get global list for this type
        const [globalList] = useList(type);

        // If already have data, use it
        if (globalList.length > 0) {
            setList([...globalList]);
            setLoading(false);
            return;
        }

        // Otherwise load data
        setLoading(true);
        loadStories(type).then(() => {
            const [updatedList] = useList(type);
            setList([...updatedList]);
            setLoading(false);
        });
    });

    return (
        <div class="view">
            <h1 class="visually-hidden">{props.type.charAt(0).toUpperCase() + props.type.slice(1)} Stories</h1>
            <div class="item-list-nav">
                {+loading && <span>Loading...</span>}
            </div>

            <ul class="news-list">
                {list.map((id: number, index: number) => <StoryItem id={id} index={index + 1} />)}
            </ul>
        </div>
    )
}