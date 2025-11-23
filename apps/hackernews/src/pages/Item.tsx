import { createResource } from 'flexium'
import { useRouter, Link } from 'flexium/router'
import { loadItem, state } from '../store'

function Comment(props: { id: number }) {
    const comment = () => state.items[props.id]

    // Load comment data if missing (recursive loading)
    createResource(() => props.id, loadItem)

    return () => {
        const c = comment()
        if (!c || c.type !== 'comment' || !c.text) return null

        return (
            <li class="comment">
                <div class="by">
                    <Link to={`/user/${c.by}`}>{c.by}</Link>
                    <span class="time"> {new Date(c.time * 1000).toLocaleString()}</span>
                </div>
                <div class="text" innerHTML={c.text} />
                {c.kids && c.kids.length > 0 && (
                    <ul class="comment-children">
                        {c.kids.map((kidId: number) => <Comment id={kidId} />)}
                    </ul>
                )}
            </li>
        )
    }
}

export default function Item() {
    const router = useRouter()
    const id = () => parseInt(router.params.value.id)

    const [data] = createResource(id, async (id) => {
        await loadItem(id)
        return state.items[id]
    })

    return (
        <div class="view item-view">
            {() => {
                const item = data()
                if (!item) return <div>Loading...</div>

                return (
                    <div>
                        <div class="item-view-header">
                            <h1><a href={item.url} target="_blank">{item.title}</a></h1>
                            <p class="meta">
                                {item.points} points | by <Link to={`/user/${item.by}`}>{item.by}</Link>
                                {' '}| {new Date(item.time * 1000).toLocaleString()}
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
                )
            }}
        </div>
    )
}
