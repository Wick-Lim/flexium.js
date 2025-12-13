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
    const c = comment();
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
    const r = router()
    const [item, setItem] = state<any>(undefined)

    effect(() => {
        const params = r.params()
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
        const currentItem = globalItem();
        setItem(currentItem);
    });

    // Use proxy directly
    const i = item();
    if (!i) return <div class="view item-view"><div>Loading...</div></div>

    const itemValue = i

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
