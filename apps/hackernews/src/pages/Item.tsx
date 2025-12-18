import { use } from 'flexium/core'
import { useRouter, Link } from 'flexium/router'
import { loadItem } from '../store'

function Comment(props: { id: number }) {
    // Use async use() to fetch comment data
    const [comment, { loading }] = use(async () => {
        return await loadItem(props.id);
    }, [props.id]);

    if (loading || !comment) return null;
    if (comment.type !== 'comment' || !comment.text) return null

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
    const r = useRouter()
    const [itemId] = use(() => {
        const idStr = r.params.id || props.params?.id;
        return idStr ? parseInt(idStr) : undefined
    }, [r.params.id, props.params?.id])

    // Use async use() to fetch item data
    const [item, { loading, error }] = use(async () => {
        if (!itemId) return undefined;
        return await loadItem(itemId);
    }, [itemId])

    if (loading || !item) return <main class="view item-view" id="main"><div>Loading...</div></main>
    if (error) return <main class="view item-view" id="main"><div>Error loading item</div></main>

    const itemValue = item

    return (
        <main class="view item-view" id="main">
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
        </main>
    )
}
