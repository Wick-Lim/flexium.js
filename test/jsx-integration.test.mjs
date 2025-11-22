// JSX Runtime Integration Tests
// These tests simulate how TypeScript/Babel would compile JSX automatically
import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.HTMLElement = dom.window.HTMLElement;

// Import jsx-runtime and DOM renderer
import { jsx, jsxs, Fragment } from '../dist/jsx-runtime.mjs';
import { render } from '../dist/dom.mjs';
import { signal, computed } from '../dist/index.mjs';

// ==========================================
// Automatic JSX Transform Integration Tests
// ==========================================

test('Simple JSX element (no h import needed)', () => {
  // Simulates: <div id="test">Hello</div>
  const vnode = jsx('div', { id: 'test', children: 'Hello' });

  assert.strictEqual(vnode.type, 'div');
  assert.strictEqual(vnode.props.id, 'test');
  assert.deepStrictEqual(vnode.children, ['Hello']);
});

test('JSX element with multiple children', () => {
  // Simulates: <div><span>A</span><span>B</span></div>
  const span1 = jsx('span', { children: 'A' });
  const span2 = jsx('span', { children: 'B' });
  const vnode = jsxs('div', { children: [span1, span2] });

  assert.strictEqual(vnode.type, 'div');
  assert.strictEqual(vnode.children.length, 2);
});

test('JSX Fragment syntax', () => {
  // Simulates: <><span>A</span><span>B</span></>
  const span1 = jsx('span', { children: 'A' });
  const span2 = jsx('span', { children: 'B' });
  const vnode = jsx(Fragment, { children: [span1, span2] });

  assert.strictEqual(vnode.type, Fragment);
  assert.strictEqual(vnode.children.length, 2);
});

test('Component with props (no h import)', () => {
  // Simulates:
  // function Button({ label }) { return <button>{label}</button> }
  // <Button label="Click me" />
  const Button = (props) => jsx('button', { children: props.label });
  const vnode = jsx(Button, { label: 'Click me' });

  assert.strictEqual(vnode.type, Button);
  assert.strictEqual(vnode.props.label, 'Click me');
});

test('JSX with conditional rendering', () => {
  // Simulates: {show && <div>Content</div>}
  const show = true;
  const content = show && jsx('div', { children: 'Content' });
  const vnode = jsx('div', { children: content });

  assert.strictEqual(vnode.children.length, 1);
  assert.strictEqual(vnode.children[0].type, 'div');

  // When condition is false
  const show2 = false;
  const content2 = show2 && jsx('div', { children: 'Content' });
  const vnode2 = jsx('div', { children: content2 });

  assert.deepStrictEqual(vnode2.children, []);
});

test('JSX with list rendering and keys', () => {
  // Simulates: items.map(item => <li key={item.id}>{item.text}</li>)
  const items = [
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
  ];

  const listItems = items.map((item) =>
    jsx('li', { key: item.id, children: item.text })
  );

  const ul = jsx('ul', { children: listItems });

  assert.strictEqual(ul.children.length, 3);
  assert.strictEqual(ul.children[0].key, 1);
  assert.strictEqual(ul.children[1].key, 2);
  assert.strictEqual(ul.children[2].key, 3);
});

test('JSX with signal reactivity', () => {
  // Simulates:
  // const count = signal(0);
  // <div>Count: {count.value}</div>
  const count = signal(5);
  const vnode = jsx('div', { children: `Count: ${count.value}` });

  assert.deepStrictEqual(vnode.children, ['Count: 5']);

  // Update signal
  count.value = 10;
  const vnode2 = jsx('div', { children: `Count: ${count.value}` });

  assert.deepStrictEqual(vnode2.children, ['Count: 10']);
});

test('JSX with computed values', () => {
  // Simulates:
  // const count = signal(5);
  // const doubled = computed(() => count.value * 2);
  // <div>Doubled: {doubled.value}</div>
  const count = signal(5);
  const doubled = computed(() => count.value * 2);
  const vnode = jsx('div', { children: `Doubled: ${doubled.value}` });

  assert.deepStrictEqual(vnode.children, ['Doubled: 10']);
});

test('Nested components without h import', () => {
  // Simulates:
  // const Button = ({ label }) => <button>{label}</button>;
  // const App = () => <div><Button label="Click" /></div>;
  const Button = (props) => jsx('button', { children: props.label });
  const App = () => jsx('div', { children: jsx(Button, { label: 'Click' }) });

  const vnode = App();

  assert.strictEqual(vnode.type, 'div');
  assert.strictEqual(vnode.children.length, 1);
  assert.strictEqual(vnode.children[0].type, Button);
});

test('JSX with event handlers', () => {
  // Simulates: <button onClick={() => alert('clicked')}>Click</button>
  const handleClick = () => console.log('clicked');
  const vnode = jsx('button', { onClick: handleClick, children: 'Click' });

  assert.strictEqual(vnode.props.onClick, handleClick);
  assert.deepStrictEqual(vnode.children, ['Click']);
});

test('JSX with style objects', () => {
  // Simulates: <div style={{ color: 'red', fontSize: '16px' }}>Styled</div>
  const vnode = jsx('div', {
    style: { color: 'red', fontSize: '16px' },
    children: 'Styled',
  });

  assert.deepStrictEqual(vnode.props.style, { color: 'red', fontSize: '16px' });
});

test('Complex nested JSX structure', () => {
  // Simulates a complex component tree
  const Header = () => jsx('h1', { children: 'Title' });
  const ListItem = ({ text }) => jsx('li', { children: text });
  const List = ({ items }) =>
    jsx('ul', {
      children: items.map((item) => jsx(ListItem, { key: item, text: item })),
    });

  const App = () =>
    jsxs('div', {
      children: [jsx(Header, {}), jsx(List, { items: ['A', 'B', 'C'] })],
    });

  const vnode = App();

  assert.strictEqual(vnode.type, 'div');
  assert.strictEqual(vnode.children.length, 2);
  assert.strictEqual(vnode.children[0].type, Header);
  assert.strictEqual(vnode.children[1].type, List);
});

// ==========================================
// DOM Rendering with Automatic JSX
// ==========================================

test('Render simple JSX to DOM', () => {
  const container = document.createElement('div');
  const vnode = jsx('div', { id: 'test', children: 'Hello World' });

  render(vnode, container);

  assert.strictEqual(container.children.length, 1);
  assert.strictEqual(container.children[0].tagName, 'DIV');
  assert.strictEqual(container.children[0].id, 'test');
  assert.strictEqual(container.children[0].textContent, 'Hello World');
});

test('Render component with JSX to DOM', () => {
  const container = document.createElement('div');

  const Button = ({ label }) => jsx('button', { children: label });
  const vnode = jsx(Button, { label: 'Click me' });

  render(vnode, container);

  assert.strictEqual(container.children.length, 1);
  assert.strictEqual(container.children[0].tagName, 'BUTTON');
  assert.strictEqual(container.children[0].textContent, 'Click me');
});

test('Render Fragment to DOM', () => {
  const container = document.createElement('div');

  const span1 = jsx('span', { children: 'A' });
  const span2 = jsx('span', { children: 'B' });
  const vnode = jsx(Fragment, { children: [span1, span2] });

  render(vnode, container);

  // Fragment should render children without wrapper
  assert.strictEqual(container.children.length, 2);
  assert.strictEqual(container.children[0].tagName, 'SPAN');
  assert.strictEqual(container.children[1].tagName, 'SPAN');
  assert.strictEqual(container.children[0].textContent, 'A');
  assert.strictEqual(container.children[1].textContent, 'B');
});

test('Render reactive JSX to DOM', () => {
  const container = document.createElement('div');
  const count = signal(0);

  const Counter = () =>
    jsxs('div', {
      children: [
        jsx('p', { children: `Count: ${count.value}` }),
        jsx('button', {
          onClick: () => count.value++,
          children: 'Increment',
        }),
      ],
    });

  const vnode = Counter();
  render(vnode, container);

  assert.strictEqual(container.querySelector('p')?.textContent, 'Count: 0');

  // Note: In a real scenario, the reactivity system would handle updates
  // This is just testing the initial render
});

// ==========================================
// Edge Cases
// ==========================================

test('JSX with empty Fragment', () => {
  const vnode = jsx(Fragment, { children: [] });

  assert.strictEqual(vnode.type, Fragment);
  assert.deepStrictEqual(vnode.children, []);
});

test('JSX with null and undefined children filtered', () => {
  const vnode = jsxs('div', {
    children: ['A', null, 'B', undefined, 'C', false],
  });

  assert.deepStrictEqual(vnode.children, ['A', 'B', 'C']);
});

test('JSX with deeply nested Fragments', () => {
  const inner = jsx(Fragment, { children: ['A', 'B'] });
  const outer = jsx(Fragment, { children: [inner, 'C'] });

  assert.strictEqual(outer.type, Fragment);
  assert.strictEqual(outer.children.length, 2);
  assert.strictEqual(outer.children[0].type, Fragment);
});

test('JSX attribute name preservation', () => {
  // className should be preserved as-is (DOM renderer handles conversion)
  const vnode = jsx('div', { className: 'test-class', id: 'test-id' });

  assert.strictEqual(vnode.props.className, 'test-class');
  assert.strictEqual(vnode.props.id, 'test-id');
});

test('JSX with numeric children', () => {
  const vnode = jsx('div', { children: [0, 1, 2, 3] });

  assert.deepStrictEqual(vnode.children, [0, 1, 2, 3]);
});

test('JSX with mixed element types', () => {
  const CustomComponent = () => jsx('div', { children: 'Custom' });
  const vnode = jsxs('div', {
    children: [
      'text',
      jsx('span', { children: 'span' }),
      jsx(CustomComponent, {}),
      123,
    ],
  });

  assert.strictEqual(vnode.children.length, 4);
  assert.strictEqual(vnode.children[0], 'text');
  assert.strictEqual(vnode.children[1].type, 'span');
  assert.strictEqual(vnode.children[2].type, CustomComponent);
  assert.strictEqual(vnode.children[3], 123);
});
