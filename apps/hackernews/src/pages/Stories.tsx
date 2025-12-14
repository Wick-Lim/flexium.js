import { state } from 'flexium/core';
import { Link } from 'flexium/router';
import { loadItem, loadStories } from '../store';

function StoryItem(props: { id: number; index: number }) {
    // Subscribe to item state
    const [story] = state(() => loadItem(props.id));

    // Check if data is loaded
    if (!story?.title) {
        return <li class="news-item">Loading...</li>
    }

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
    console.log('[Stories] Rendering with type:', props.type)
    const [list, control] = state(() => loadStories(props.type), { key: [props.type] })
    console.log('[Stories] State:', { status: control.status, listLength: list?.length })

    if (control.status !== 'success') {
        console.log('[Stories] Showing loading state')
        return (
            <main class="view" id="main">
                <h1 class="visually-hidden">{props.type.charAt(0).toUpperCase() + props.type.slice(1)} Stories</h1>
                <div class="item-list-nav">
                    <span>Loading...</span>
                </div>
            </main>
        )
    }

    console.log('[Stories] Showing list with', list?.length, 'items')

    return (
        <main class="view" id="main">
            <h1 class="visually-hidden">{props.type.charAt(0).toUpperCase() + props.type.slice(1)} Stories</h1>
            <ul class="news-list">
                {list?.map((id: number, index: number) => <StoryItem id={id} index={index + 1} />)}
            </ul>
        </main>
    )
}