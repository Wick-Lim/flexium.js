import { jsx as f } from '../../jsx-runtime'
import type { LinkProps } from '../types'
import { useNavigate } from '../router'

export function Link(props: LinkProps) {
    const navigate = useNavigate()
    return f('a', {
        href: props.to,
        class: props.class,
        style: 'cursor: pointer;',
        onclick: (event: Event) => {
            event.preventDefault()
            navigate(props.to)
        },
        children: props.children
    })
}
