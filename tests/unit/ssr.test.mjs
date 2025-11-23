import { test } from 'node:test';
import assert from 'node:assert';
import { renderToString } from '../../packages/flexium/dist/server.mjs';
import { signal } from '../../packages/flexium/dist/index.mjs';

test('renderToString renders text', () => {
    const html = renderToString('Hello');
    assert.strictEqual(html, 'Hello');
});

test('renderToString renders elements', () => {
    const vnode = { type: 'div', props: { id: 'app' }, children: 'Content' };
    const html = renderToString(vnode);
    assert.strictEqual(html, '<div id="app">Content</div>');
});

test('renderToString renders signals', () => {
    const count = signal(10);
    const html = renderToString(count);
    assert.strictEqual(html, '10');
});

test('renderToString renders components', () => {
    const Component = (props) => ({ type: 'span', children: props.text });
    const vnode = { type: Component, props: { text: 'Hello' } };
    const html = renderToString(vnode);
    assert.strictEqual(html, '<span>Hello</span>');
});

test('renderToString handles void elements', () => {
    const vnode = { type: 'img', props: { src: 'test.jpg' } };
    const html = renderToString(vnode);
    assert.strictEqual(html, '<img src="test.jpg"/>');
});

test('renderToString escapes HTML', () => {
    const html = renderToString('<script>');
    assert.strictEqual(html, '&lt;script&gt;');
});
