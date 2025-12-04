/**
 * Extended SSR (Server-Side Rendering) Tests
 *
 * Comprehensive tests for server-side rendering functionality including:
 * - renderToString with various VNode types
 * - Attribute handling and escaping
 * - Component rendering
 * - Signal value serialization
 * - Edge cases and error handling
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { renderToString } from '../../packages/flexium/dist/server.mjs';
import { signal } from '../../packages/flexium/dist/index.mjs';
import { h } from '../../packages/flexium/dist/dom.mjs';

describe('renderToString - Basic Elements', () => {
    test('renders simple div', () => {
        const vnode = h('div', {}, ['Hello']);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<div>Hello</div>');
    });

    test('renders nested elements', () => {
        const vnode = h('div', {}, [
            h('span', {}, ['Nested'])
        ]);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<div><span>Nested</span></div>');
    });

    test('renders multiple children', () => {
        const vnode = h('ul', {}, [
            h('li', {}, ['Item 1']),
            h('li', {}, ['Item 2']),
            h('li', {}, ['Item 3'])
        ]);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>');
    });

    test('renders void elements correctly', () => {
        const vnode = h('input', { type: 'text', placeholder: 'Enter name' }, []);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<input type="text" placeholder="Enter name"/>');
    });

    test('renders br, hr, img as void elements', () => {
        assert.strictEqual(renderToString(h('br', {}, [])), '<br/>');
        assert.strictEqual(renderToString(h('hr', {}, [])), '<hr/>');
        assert.strictEqual(renderToString(h('img', { src: '/img.png', alt: 'test' }, [])), '<img src="/img.png" alt="test"/>');
    });
});

describe('renderToString - Attributes', () => {
    test('renders string attributes', () => {
        const vnode = h('div', { id: 'main', 'data-test': 'value' }, []);
        const html = renderToString(vnode);
        assert.ok(html.includes('id="main"'));
        assert.ok(html.includes('data-test="value"'));
    });

    test('handles className as class', () => {
        const vnode = h('div', { className: 'container' }, []);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<div class="container"></div>');
    });

    test('handles class prop directly', () => {
        const vnode = h('div', { class: 'wrapper' }, []);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<div class="wrapper"></div>');
    });

    test('handles boolean attributes', () => {
        const vnodeTrue = h('input', { disabled: true, type: 'text' }, []);
        const vnodeFalse = h('input', { disabled: false, type: 'text' }, []);

        const htmlTrue = renderToString(vnodeTrue);
        const htmlFalse = renderToString(vnodeFalse);

        assert.ok(htmlTrue.includes('disabled="true"'));
        assert.ok(!htmlFalse.includes('disabled'));
    });

    test('skips null and undefined attributes', () => {
        const vnode = h('div', { id: 'test', empty: null, undef: undefined }, []);
        const html = renderToString(vnode);
        assert.ok(html.includes('id="test"'));
        assert.ok(!html.includes('empty'));
        assert.ok(!html.includes('undef'));
    });

    test('skips event handlers (on* props)', () => {
        const vnode = h('button', { onClick: () => { }, onMouseOver: () => { } }, ['Click']);
        const html = renderToString(vnode);
        assert.ok(!html.includes('onClick'));
        assert.ok(!html.includes('onMouseOver'));
        assert.strictEqual(html, '<button>Click</button>');
    });

    test('skips children prop', () => {
        const vnode = h('div', { children: 'should not appear' }, ['Actual children']);
        const html = renderToString(vnode);
        assert.ok(!html.includes('should not appear'));
        assert.ok(html.includes('Actual children'));
    });
});

describe('renderToString - Style Attribute', () => {
    test('handles object style', () => {
        const vnode = h('div', {
            style: { color: 'red', fontSize: '16px' }
        }, []);
        const html = renderToString(vnode);
        assert.ok(html.includes('style="'));
        assert.ok(html.includes('color:red'));
        assert.ok(html.includes('font-size:16px'));
    });

    test('converts camelCase to kebab-case', () => {
        const vnode = h('div', {
            style: {
                backgroundColor: 'blue',
                marginTop: '10px',
                paddingLeft: '20px'
            }
        }, []);
        const html = renderToString(vnode);
        assert.ok(html.includes('background-color:blue'));
        assert.ok(html.includes('margin-top:10px'));
        assert.ok(html.includes('padding-left:20px'));
    });
});

describe('renderToString - HTML Escaping', () => {
    test('escapes HTML in text content', () => {
        const vnode = h('div', {}, ['<script>alert("xss")</script>']);
        const html = renderToString(vnode);
        assert.ok(!html.includes('<script>'));
        assert.ok(html.includes('&lt;script&gt;'));
    });

    test('escapes HTML in attributes', () => {
        const vnode = h('div', { 'data-value': '"quoted" & <special>' }, []);
        const html = renderToString(vnode);
        assert.ok(html.includes('&quot;'));
        assert.ok(html.includes('&amp;'));
        assert.ok(html.includes('&lt;'));
        assert.ok(html.includes('&gt;'));
    });

    test('escapes ampersands', () => {
        const vnode = h('div', {}, ['Tom & Jerry']);
        const html = renderToString(vnode);
        assert.ok(html.includes('Tom &amp; Jerry'));
    });

    test('escapes quotes in attributes', () => {
        const vnode = h('div', { title: 'Say "Hello"' }, []);
        const html = renderToString(vnode);
        assert.ok(html.includes('&quot;Hello&quot;'));
    });
});

describe('renderToString - Components', () => {
    test('renders function components', () => {
        function Greeting({ name }) {
            return h('span', {}, [`Hello, ${name}!`]);
        }

        const vnode = h(Greeting, { name: 'World' }, []);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<span>Hello, World!</span>');
    });

    test('renders nested function components', () => {
        function Inner({ text }) {
            return h('span', {}, [text]);
        }

        function Outer({ children }) {
            return h('div', { class: 'outer' }, [
                h(Inner, { text: 'Nested component' }, [])
            ]);
        }

        const vnode = h(Outer, {}, []);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<div class="outer"><span>Nested component</span></div>');
    });

    test('handles component returning null', () => {
        function Empty() {
            return null;
        }

        const vnode = h(Empty, {}, []);
        const html = renderToString(vnode);
        assert.strictEqual(html, '');
    });
});

describe('renderToString - Signals', () => {
    test('renders signal values', () => {
        const count = signal(42);
        const vnode = h('span', {}, [count]);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<span>42</span>');
    });

    test('renders nested signals', () => {
        const name = signal('Flexium');
        const vnode = h('h1', {}, ['Welcome to ', name, '!']);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<h1>Welcome to Flexium!</h1>');
    });

    test('renders signal in component props', () => {
        const title = signal('Dynamic Title');

        function Header({ title }) {
            return h('h1', {}, [title]);
        }

        const vnode = h(Header, { title }, []);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<h1>Dynamic Title</h1>');
    });
});

describe('renderToString - Edge Cases', () => {
    test('handles null children', () => {
        const html = renderToString(null);
        assert.strictEqual(html, '');
    });

    test('handles undefined children', () => {
        const html = renderToString(undefined);
        assert.strictEqual(html, '');
    });

    test('handles false children', () => {
        const html = renderToString(false);
        assert.strictEqual(html, '');
    });

    test('handles number children', () => {
        const vnode = h('span', {}, [123]);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<span>123</span>');
    });

    test('handles zero as valid content', () => {
        const vnode = h('span', {}, [0]);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<span>0</span>');
    });

    test('handles array of vnodes', () => {
        const vnodes = [
            h('li', {}, ['One']),
            h('li', {}, ['Two'])
        ];
        const html = renderToString(vnodes);
        assert.strictEqual(html, '<li>One</li><li>Two</li>');
    });

    test('handles deeply nested structure', () => {
        const vnode = h('div', {}, [
            h('section', {}, [
                h('article', {}, [
                    h('header', {}, [
                        h('h1', {}, ['Deep'])
                    ])
                ])
            ])
        ]);
        const html = renderToString(vnode);
        assert.strictEqual(html, '<div><section><article><header><h1>Deep</h1></header></article></section></div>');
    });

    test('handles mixed children types', () => {
        const count = signal(5);
        const vnode = h('div', {}, [
            'Text ',
            h('span', {}, ['Element']),
            ' ',
            count,
            null,
            ' end'
        ]);
        const html = renderToString(vnode);
        assert.ok(html.includes('Text'));
        assert.ok(html.includes('<span>Element</span>'));
        assert.ok(html.includes('5'));
        assert.ok(html.includes('end'));
    });
});

describe('renderToString - Real-World Scenarios', () => {
    test('renders a complete page structure', () => {
        const vnode = h('html', {}, [
            h('head', {}, [
                h('title', {}, ['My App']),
                h('meta', { charset: 'utf-8' }, [])
            ]),
            h('body', {}, [
                h('div', { id: 'root' }, [
                    h('h1', {}, ['Welcome']),
                    h('p', {}, ['Hello World'])
                ])
            ])
        ]);
        const html = renderToString(vnode);
        assert.ok(html.includes('<html>'));
        assert.ok(html.includes('<head>'));
        assert.ok(html.includes('<title>My App</title>'));
        assert.ok(html.includes('<meta charset="utf-8"/>'));
        assert.ok(html.includes('<body>'));
        assert.ok(html.includes('id="root"'));
    });

    test('renders a form', () => {
        const vnode = h('form', { action: '/submit', method: 'POST' }, [
            h('label', { for: 'email' }, ['Email:']),
            h('input', { type: 'email', id: 'email', name: 'email', required: true }, []),
            h('button', { type: 'submit' }, ['Submit'])
        ]);
        const html = renderToString(vnode);
        assert.ok(html.includes('action="/submit"'));
        assert.ok(html.includes('method="POST"'));
        assert.ok(html.includes('type="email"'));
        assert.ok(html.includes('required="true"'));
    });

    test('renders a navigation menu', () => {
        const links = [
            { href: '/', text: 'Home' },
            { href: '/about', text: 'About' },
            { href: '/contact', text: 'Contact' }
        ];

        const vnode = h('nav', {}, [
            h('ul', {}, links.map(link =>
                h('li', {}, [
                    h('a', { href: link.href }, [link.text])
                ])
            ))
        ]);

        const html = renderToString(vnode);
        assert.ok(html.includes('<nav>'));
        assert.ok(html.includes('href="/"'));
        assert.ok(html.includes('Home'));
        assert.ok(html.includes('href="/about"'));
        assert.ok(html.includes('About'));
    });
});
