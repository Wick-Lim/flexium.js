import { state, effect, For } from 'flexium/core'
import { useRouter, Link } from 'flexium/router'
import { loadItem, useItem } from '../store'

function Comment(props: { id: number }) {
    const [comment] = useItem(props.id);

    // Load comment data if missing (recursive loading)
    // We use an effect to trigger load
    effect(() => {
        loadItem(props.id);
    });

    return () => {
        const c = comment()
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
                        <For each={(() => c.kids || []) as any}>
                            {(kidId: number) => <Comment id={kidId} />}
                        </For>
                    </ul>
                )}
            </li>
        )
    }
}

export default function Item() {
    const router = useRouter()
    const id = () => parseInt(router.params.value.id)

    // Local state to track item
    const [item, setItem] = state<any>(undefined);

    effect(() => {
        const itemId = id();
        if (!itemId) return;
        
        loadItem(itemId);
        const [globalItem] = useItem(itemId);
        // Bind local signal to global item update
        // polling/subscription pattern
        setItem(globalItem());
    });

    return (
        <div class="view item-view">
            {() => {
                const data = item()
                if (!data) return <div>Loading...</div>

                return (
                    <div>
                        <div class="item-view-header">
                            <h1><a href={data.url} target="_blank">{data.title}</a></h1>
                            <p class="meta">
                                {data.points} points | by <Link to={`/user/${data.by}`}>{data.by}</Link>
                                {' '}| {new Date(data.time * 1000).toLocaleString()}
                            </p>
                        </div>
                        <div class="item-view-comments">
                            <p class="item-view-comments-header">
                                {data.descendants} comments
                            </p>
                            <ul class="comment-children">
                                {data.kids && (
                                    <For each={(() => data.kids || []) as any}>
                                        {(kidId: number) => <Comment id={kidId} />}
                                    </For>
                                )}
                            </ul>
                        </div>
                    </div>
                )
            }}
        </div>
    )
}