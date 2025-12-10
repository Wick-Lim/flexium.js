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
                <span class="time"> {new Date(comment.time * 1000).toLocaleString()}</span>
            </div>
            <div class="comment-text" innerHTML={comment.text} />
            {comment.kids && comment.kids.length > 0 && (
                <ul class="comment-children" style={{ paddingLeft: '20px' }}>
                    {comment.kids.map((kidId: number) => <Comment id={kidId} />)}
                </ul>
            )}
        </li>
    )
}

export default function Item(props: { params?: { id?: string } } = {}) {
    const r = router()
    const [item, setItem] = state<any>(undefined)

    effect(() => {
        const params = r.params
        const pathname = r.location.pathname
        const idStr = params.id || props.params?.id;
        
        if (!idStr) {
            setItem(undefined)
            return
        }
        
        const parsedId = parseInt(idStr);
        if (!parsedId) {
            setItem(undefined)
            return
        }

        // Load item data (async) - no await needed, reactive system will handle updates
        loadItem(parsedId);
        
        // Track the global item state reactively - this will update when loadItem completes
        const [globalItem] = useItem(parsedId);
        // Reading globalItem.value here tracks the signal, so when loadItem sets it, this effect will re-run
        const currentItem = globalItem.valueOf();
        setItem(currentItem);
    });
    
    // Use proxy directly
    if (!item) return <div class="view item-view"><div>Loading...</div></div>
    
    const itemValue = item.valueOf()

    return (
        <div class="view item-view">
            <div>
                <div class="item-view-header">
                    <h1><a href={itemValue.url} target="_blank">{itemValue.title}</a></h1>
                    <p class="meta">
                        {itemValue.points} points | by <Link to={`/user/${itemValue.by}`}>{itemValue.by}</Link>
                        {' '}| {new Date(itemValue.time * 1000).toLocaleString()}
                    </p>
                </div>
                <div class="item-view-comments">
                    <p class="item-view-comments-header">
                        {itemValue.descendants} comments
                    </p>
                    <ul class="comment-children">
                        {itemValue.kids && itemValue.kids.map((kidId: number) => <Comment id={kidId} />)}
                    </ul>
                </div>
            </div>
        </div>
    )
}
