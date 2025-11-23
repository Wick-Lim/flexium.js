// JSX Runtime Tests
import { test } from 'node:test';
import assert from 'node:assert';

// Import jsx-runtime functions
import { jsx, jsxs, Fragment, jsxDEV } from '../../packages/flexium/dist/jsx-runtime.mjs';

// ==========================================
// jsx() Function Tests
// ==========================================

test('jsx() creates VNode with type and props', () => {
  const vnode = jsx('div', { id: 'test', className: 'container' });

  assert.strictEqual(vnode.type, 'div');
  assert.deepStrictEqual(vnode.props, { id: 'test', className: 'container' });
  assert.deepStrictEqual(vnode.children, []);
});

test('jsx() creates VNode with single child', () => {
  const vnode = jsx('div', { children: 'Hello' });

  assert.strictEqual(vnode.type, 'div');
  assert.deepStrictEqual(vnode.children, ['Hello']);
});

test('jsx() creates VNode with multiple children', () => {
  const vnode = jsx('div', { children: ['Hello', 'World'] });

  assert.strictEqual(vnode.type, 'div');
  assert.deepStrictEqual(vnode.children, ['Hello', 'World']);
});

test('jsx() handles key prop', () => {
  const vnode = jsx('div', { key: 'unique-key', id: 'test' });

  assert.strictEqual(vnode.key, 'unique-key');
  assert.strictEqual(vnode.props.id, 'test');
  assert.strictEqual(vnode.props.key, undefined);
});

test('jsx() filters out null, undefined, and false children', () => {
  const vnode = jsx('div', { children: ['Hello', null, undefined, false, 'World'] });

  assert.deepStrictEqual(vnode.children, ['Hello', 'World']);
});

test('jsx() handles nested children arrays', () => {
  const vnode = jsx('div', { children: [['a', 'b'], 'c'] });

  assert.deepStrictEqual(vnode.children, ['a', 'b', 'c']);
});

test('jsx() handles no children', () => {
  const vnode = jsx('div', {});

  assert.deepStrictEqual(vnode.children, []);
});

test('jsx() handles component functions', () => {
  const MyComponent = () => jsx('div', {});
  const vnode = jsx(MyComponent, { prop1: 'value1' });

  assert.strictEqual(vnode.type, MyComponent);
  assert.deepStrictEqual(vnode.props, { prop1: 'value1' });
});

// ==========================================
// jsxs() Function Tests
// ==========================================

test('jsxs() creates VNode with multiple children', () => {
  const vnode = jsxs('div', { children: ['Child 1', 'Child 2', 'Child 3'] });

  assert.strictEqual(vnode.type, 'div');
  assert.deepStrictEqual(vnode.children, ['Child 1', 'Child 2', 'Child 3']);
});

test('jsxs() is functionally equivalent to jsx()', () => {
  const jsxVnode = jsx('div', { id: 'test', children: ['a', 'b'] });
  const jsxsVnode = jsxs('div', { id: 'test', children: ['a', 'b'] });

  assert.deepStrictEqual(jsxVnode, jsxsVnode);
});

test('jsxs() handles nested VNodes', () => {
  const child1 = jsx('span', { children: 'Child 1' });
  const child2 = jsx('span', { children: 'Child 2' });
  const parent = jsxs('div', { children: [child1, child2] });

  assert.strictEqual(parent.type, 'div');
  assert.strictEqual(parent.children.length, 2);
  assert.strictEqual(parent.children[0].type, 'span');
  assert.strictEqual(parent.children[1].type, 'span');
});

// ==========================================
// Fragment Tests
// ==========================================

test('Fragment creates VNode with fragment type', () => {
  const vnode = Fragment({ children: ['Child 1', 'Child 2'] });

  assert.strictEqual(vnode.type, 'fragment');
  assert.deepStrictEqual(vnode.props, {});
  assert.deepStrictEqual(vnode.children, ['Child 1', 'Child 2']);
});

test('Fragment handles no children', () => {
  const vnode = Fragment({});

  assert.strictEqual(vnode.type, 'fragment');
  assert.deepStrictEqual(vnode.children, []);
});

test('Fragment can be used as jsx type', () => {
  const vnode = jsx(Fragment, { children: ['a', 'b'] });

  // When used as a component, it's treated as a function
  assert.strictEqual(vnode.type, Fragment);
  assert.deepStrictEqual(vnode.props, {});
  assert.deepStrictEqual(vnode.children, ['a', 'b']);
});

// ==========================================
// jsxDEV Tests
// ==========================================

test('jsxDEV is the same as jsx', () => {
  assert.strictEqual(jsxDEV, jsx);
});

test('jsxDEV creates VNode correctly', () => {
  const vnode = jsxDEV('div', { id: 'test', children: 'Hello' });

  assert.strictEqual(vnode.type, 'div');
  assert.strictEqual(vnode.props.id, 'test');
  assert.deepStrictEqual(vnode.children, ['Hello']);
});

// ==========================================
// Edge Cases and Complex Scenarios
// ==========================================

test('jsx() handles deeply nested children', () => {
  const vnode = jsx('div', {
    children: [
      ['a', ['b', ['c', 'd']]],
      'e',
    ],
  });

  assert.deepStrictEqual(vnode.children, ['a', 'b', 'c', 'd', 'e']);
});

test('jsx() handles empty arrays in children', () => {
  const vnode = jsx('div', { children: [[], 'a', [], 'b', []] });

  assert.deepStrictEqual(vnode.children, ['a', 'b']);
});

test('jsx() preserves props except children and key', () => {
  const vnode = jsx('div', {
    id: 'test',
    className: 'container',
    onClick: () => {},
    style: { color: 'red' },
    children: 'Hello',
    key: 'my-key',
  });

  assert.strictEqual(vnode.props.id, 'test');
  assert.strictEqual(vnode.props.className, 'container');
  assert.ok(typeof vnode.props.onClick === 'function');
  assert.deepStrictEqual(vnode.props.style, { color: 'red' });
  assert.strictEqual(vnode.props.children, undefined);
  assert.strictEqual(vnode.props.key, undefined);
  assert.strictEqual(vnode.key, 'my-key');
});

test('jsx() handles mixed content types in children', () => {
  const childVNode = jsx('span', { children: 'Child' });
  const vnode = jsx('div', {
    children: ['text', 123, childVNode, null],
  });

  assert.strictEqual(vnode.children.length, 3);
  assert.strictEqual(vnode.children[0], 'text');
  assert.strictEqual(vnode.children[1], 123);
  assert.strictEqual(vnode.children[2], childVNode);
});

test('jsx() handles numeric zero as valid child', () => {
  const vnode = jsx('div', { children: [0, false, null, undefined] });

  // Only 0 should be kept, false/null/undefined filtered out
  assert.deepStrictEqual(vnode.children, [0]);
});

test('jsx() handles string zero as valid child', () => {
  const vnode = jsx('div', { children: ['0', '', false] });

  // '0' and '' (empty string) are valid, false is filtered
  assert.deepStrictEqual(vnode.children, ['0', '']);
});

// ==========================================
// Component Usage Tests
// ==========================================

test('jsx() with functional component and props', () => {
  const Button = (props) => jsx('button', { children: props.label });
  const vnode = jsx(Button, { label: 'Click me', onClick: () => {} });

  assert.strictEqual(vnode.type, Button);
  assert.strictEqual(vnode.props.label, 'Click me');
  assert.ok(typeof vnode.props.onClick === 'function');
});

test('jsx() nested components', () => {
  const Text = (props) => jsx('span', { children: props.children });
  const Button = (props) => jsx('button', { children: jsx(Text, { children: props.label }) });
  const vnode = jsx(Button, { label: 'Submit' });

  assert.strictEqual(vnode.type, Button);
  assert.strictEqual(vnode.props.label, 'Submit');
});

// ==========================================
// Real-world JSX Patterns
// ==========================================

test('jsx() simulates compiled JSX without children', () => {
  // <div id="test" />
  const vnode = jsx('div', { id: 'test' });

  assert.strictEqual(vnode.type, 'div');
  assert.strictEqual(vnode.props.id, 'test');
  assert.deepStrictEqual(vnode.children, []);
});

test('jsx() simulates compiled JSX with single child', () => {
  // <div>Hello</div>
  const vnode = jsx('div', { children: 'Hello' });

  assert.strictEqual(vnode.type, 'div');
  assert.deepStrictEqual(vnode.children, ['Hello']);
});

test('jsxs() simulates compiled JSX with multiple children', () => {
  // <div><span>A</span><span>B</span></div>
  const span1 = jsx('span', { children: 'A' });
  const span2 = jsx('span', { children: 'B' });
  const vnode = jsxs('div', { children: [span1, span2] });

  assert.strictEqual(vnode.type, 'div');
  assert.strictEqual(vnode.children.length, 2);
  assert.strictEqual(vnode.children[0].type, 'span');
  assert.strictEqual(vnode.children[1].type, 'span');
});

test('jsx() simulates conditional rendering', () => {
  // <div>{condition && <span>Show</span>}</div>
  const condition = true;
  const span = condition && jsx('span', { children: 'Show' });
  const vnode = jsx('div', { children: span });

  assert.strictEqual(vnode.children.length, 1);
  assert.strictEqual(vnode.children[0].type, 'span');

  // When condition is false
  const condition2 = false;
  const span2 = condition2 && jsx('span', { children: 'Show' });
  const vnode2 = jsx('div', { children: span2 });

  assert.deepStrictEqual(vnode2.children, []);
});

test('jsx() simulates list rendering', () => {
  // items.map(item => <li key={item.id}>{item.text}</li>)
  const items = [
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
  ];

  const listItems = items.map((item) =>
    jsx('li', { key: item.id, children: item.text })
  );

  assert.strictEqual(listItems.length, 3);
  assert.strictEqual(listItems[0].key, 1);
  assert.strictEqual(listItems[1].key, 2);
  assert.strictEqual(listItems[2].key, 3);
  assert.deepStrictEqual(listItems[0].children, ['Item 1']);
});
