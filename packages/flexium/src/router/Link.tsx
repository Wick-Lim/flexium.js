import { jsx as f } from '../jsx-runtime'
import type { LinkProps } from './types'
import { router } from './router'

export function Link(props: LinkProps) {
    const ctx = router()
    return f('a', {
        href: props.to,
        class: props.class,
        onclick: (e: Event) => {
            e.preventDefault()
            ctx.navigate(props.to)
        },
        children: props.children
    })
}
