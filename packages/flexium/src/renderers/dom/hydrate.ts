import { effect, isSignal } from '../../core/signal';

export function hydrate(vnode: any, container: Element) {
    // Simple hydration strategy: 
    // For this MVP, we will clear the container and re-render.
    // True hydration requires matching VDOM to existing DOM nodes, which is complex.
    // Re-rendering is a valid "hydration" strategy for simple frameworks to ensure interactivity,
    // although less performant than true hydration.

    // TODO: Implement true hydration that walks the DOM tree.
    // For now, we reuse the existing render logic but we need to be careful not to double-mount.

    // Actually, let's try a basic true hydration approach.
    hydrateNode(vnode, container.firstChild as Node);
}

function hydrateNode(vnode: any, domNode: Node | null): Node | null {
    if (!domNode || !vnode) return null;

    if (typeof vnode === 'string' || typeof vnode === 'number') {
        if (domNode.nodeType === Node.TEXT_NODE) {
            if (domNode.textContent !== String(vnode)) {
                domNode.textContent = String(vnode);
            }
            return domNode.nextSibling;
        }
    }

    if (isSignal(vnode)) {
        // For signals, we create an effect to update the text node
        if (domNode.nodeType === Node.TEXT_NODE) {
            effect(() => {
                domNode.textContent = String(vnode.value);
            });
            return domNode.nextSibling;
        }
    }

    if (typeof vnode.type === 'function') {
        const result = vnode.type(vnode.props || {});
        return hydrateNode(result, domNode);
    }

    if (typeof vnode.type === 'string') {
        if (domNode.nodeType === Node.ELEMENT_NODE && (domNode as Element).tagName.toLowerCase() === vnode.type.toLowerCase()) {
            const el = domNode as Element;

            // Attach events
            if (vnode.props) {
                for (const key in vnode.props) {
                    if (key.startsWith('on')) {
                        const eventName = key.slice(2).toLowerCase();
                        el.addEventListener(eventName, vnode.props[key]);
                    }
                }
            }

            // Hydrate children
            let childDom = el.firstChild;
            if (vnode.children) {
                const children = Array.isArray(vnode.children) ? vnode.children : [vnode.children];
                for (const child of children) {
                    childDom = hydrateNode(child, childDom) as ChildNode | null;
                }
            }

            return el.nextSibling;
        }
    }

    return domNode.nextSibling;
}
