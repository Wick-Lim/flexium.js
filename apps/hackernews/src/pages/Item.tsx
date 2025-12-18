import { useState, useEffect } from 'flexium/core'
import { useRouter, Link } from 'flexium/router'
import { loadItem, useItem } from '../store'

function Comment(props: { id: number }) {
    const [comment] = useItem(props.id);

    // Load comment data if missing
    // Load comment data if missing
    if (!comment) {
        // Use effect to load data
        useEffect(() => {
            loadItem(props.id);
        }, [props.id]);
    }

    // Use proxy directly - no function wrapper needed
    const c = comment;
    if (!c || c.type !== 'comment' || !c.text) return null

    return (
        <li class="comment">
            <div class="comment-header">
                <span class="by">
                    <Link to={`/user/${c.by}`}>{c.by}</Link>
                </span>
                <span class="time"> {new Date(c.time * 1000).toLocaleString()}</span>
            </div>
            <div class="comment-text" innerHTML={c.text} />
            {c.kids && c.kids.length > 0 && (
                <ul class="comment-children" style={{ paddingLeft: '20px' }}>
                    {c.kids.map((kidId: number) => <Comment id={kidId} />)}
                </ul>
            )}
        </li>
    )
}

export default function Item(props: { params?: { id?: string } } = {}) {
    const r = useRouter()
    const [itemId] = useState(() => {
        const idStr = r.params.id || props.params?.id;
        return idStr ? parseInt(idStr) : undefined
    })

    // Load item data when itemId changes
    useEffect(() => {
        if (itemId) {
            loadItem(itemId)
        }
    }, [itemId])

    // Use item from global state - this will be reactive
    const [item] = itemId ? useItem(itemId) : [undefined]

    // Use proxy directly
    const i = item;
    if (!i) return <main class="view item-view" id="main"><div>Loading...</div></main>

    const itemValue = i

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
