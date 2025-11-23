import { isSignal } from '../core/signal';

const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

export function renderToString(vnode: any): string {
    if (vnode === null || vnode === undefined || vnode === false) {
        return '';
    }

    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return escapeHtml(String(vnode));
    }

    if (Array.isArray(vnode)) {
        return vnode.map(renderToString).join('');
    }

    if (isSignal(vnode)) {
        return renderToString(vnode.value);
    }

    if (typeof vnode.type === 'function') {
        const result = vnode.type(vnode.props || {});
        return renderToString(result);
    }

    if (typeof vnode.type === 'string') {
        const { type, props, children } = vnode;
        let html = `<${type}`;

        if (props) {
            for (const key in props) {
                const value = props[key];
                if (key === 'children' || key.startsWith('on') || value === null || value === undefined || value === false) {
                    continue;
                }

                if (key === 'className' || key === 'class') {
                    html += ` class="${escapeHtml(value)}"`;
                } else if (key === 'style' && typeof value === 'object') {
                    const styleStr = Object.entries(value)
                        .map(([k, v]) => `${k.replace(/([A-Z])/g, '-$1').toLowerCase()}:${v}`)
                        .join(';');
                    html += ` style="${escapeHtml(styleStr)}"`;
                } else {
                    html += ` ${key}="${escapeHtml(String(value))}"`;
                }
            }
        }

        if (VOID_ELEMENTS.has(type)) {
            html += '/>';
        } else {
            html += '>';
            if (children) {
                html += Array.isArray(children)
                    ? children.map(renderToString).join('')
                    : renderToString(children);
            }
            html += `</${type}>`;
        }

        return html;
    }

    return '';
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
