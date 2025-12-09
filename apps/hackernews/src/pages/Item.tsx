import { state, effect } from 'flexium/core'
import { router, Link } from 'flexium/router'
import { loadItem, useItem } from '../store'

function Comment(props: { id: number }) {
    const [comment] = useItem(props.id);

    // Load comment data if missing
    effect(() => {
        loadItem(props.id);
    });

    // Use proxy directly - no function wrapper needed
    if (!comment || comment.type !== 'comment' || !comment.text) return null

    return (
        <li class="comment">
            <div class="comment-header">
                <span class="by">
                    <Link to={`/user/${comment.by}`}>{comment.by}</Link>
                </span>
                <span class="time"> {new Date(+comment.time * 1000).toLocaleString()}</span>
            </div>
            <div class="comment-text" innerHTML={comment.text} />
            {comment.kids && +comment.kids.length > 0 && (
                <ul class="comment-children" style={{ paddingLeft: '20px' }}>
                    {comment.kids.map((kidId: number) => <Comment id={kidId} />)}
                </ul>
            )}
        </li>
    )
}

export default function Item() {
    const r = router()

    // Local state to track item
    const [item, setItem] = state<any>(undefined);

    effect(() => {
        const itemId = parseInt(r.params.value.id);
        if (!itemId) return;

        loadItem(itemId);
        const [globalItem] = useItem(itemId);
        setItem(globalItem());
    });

    // Use proxy directly
    if (!item) return <div class="view item-view"><div>Loading...</div></div>

    return (
        <div class="view item-view">
            <div>
                <div class="item-view-header">
                    <h1><a href={item.url} target="_blank">{item.title}</a></h1>
                    <p class="meta">
                        {item.points} points | by <Link to={`/user/${item.by}`}>{item.by}</Link>
                        {' '}| {new Date(+item.time * 1000).toLocaleString()}
                    </p>
                </div>
                <div class="item-view-comments">
                    <p class="item-view-comments-header">
                        {item.descendants} comments
                    </p>
                    <ul class="comment-children">
                        {item.kids && item.kids.map((kidId: number) => <Comment id={kidId} />)}
                    </ul>
                </div>
            </div>
        </div>
    )
}
