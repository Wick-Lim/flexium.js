import { use } from 'flexium/core';
import { Link } from 'flexium/router';
import { loadItem, loadStories, useItem } from '../store';

function StoryItem(props: { id: number; index: number; key?: number }) {
    // Load item data
    use(() => {
        loadItem(props.id);
    }, [props.id]);

    // Subscribe to item state
    const [story] = useItem(props.id);

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
    const [list, control] = use(() => loadStories(props.type), undefined, { key: [props.type] })

    if (control.status !== 'success') {
        return (
            <main class="view" id="main">
                <h1 class="visually-hidden">{props.type.charAt(0).toUpperCase() + props.type.slice(1)} Stories</h1>
                <div class="item-list-nav">
                    <span>Loading...</span>
                </div>
            </main>
        )
    }

    return (
        <main class="view" id="main">
            <h1 class="visually-hidden">{props.type.charAt(0).toUpperCase() + props.type.slice(1)} Stories</h1>
            <ul class="news-list">
                {list?.map((id: number, index: number) => <StoryItem key={id} id={id} index={index + 1} />)}
            </ul>
        </main>
    )
}