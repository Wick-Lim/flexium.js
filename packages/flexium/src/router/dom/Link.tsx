import { jsx as f } from '../../jsx-runtime'
import type { LinkProps } from '../types'
import { useRouter } from '../router'

export function Link(props: LinkProps) {
    const routerContext = useRouter()
    return f('a', {
        href: props.to,
        class: props.class,
        onclick: (event: Event) => {
            event.preventDefault()
            routerContext.navigate(props.to)
        },
        children: props.children
    })
}
