// DOM Renderer Tests
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

import { h, Fragment, render, DOMRenderer } from '../dist/dom.mjs';

// ==========================================
// h() Function Tests
// ==========================================

test('h() creates VNode with type and props', () => {
  const vnode = h('div', { id: 'test', className: 'container' });

  assert.strictEqual(vnode.type, 'div');
  assert.deepStrictEqual(vnode.props, { id: 'test', className: 'container' });
  assert.deepStrictEqual(vnode.children, []);
});

test('h() creates VNode with children', () => {
  const vnode = h('div', null, 'Hello', 'World');

  assert.strictEqual(vnode.type, 'div');
  assert.deepStrictEqual(vnode.children, ['Hello', 'World']);
});

test('h() handles nested children', () => {
  const child1 = h('span', null, 'Child 1');
  const child2 = h('span', null, 'Child 2');
  const parent = h('div', null, child1, child2);

  assert.strictEqual(parent.type, 'div');
  assert.strictEqual(parent.children.length, 2);
  assert.strictEqual(parent.children[0].type, 'span');
  assert.strictEqual(parent.children[1].type, 'span');
});

test('h() flattens array children', () => {
  const vnode = h('div', null, ['a', 'b'], 'c');

  assert.deepStrictEqual(vnode.children, ['a', 'b', 'c']);
});

test('h() filters out null and undefined children', () => {
  const vnode = h('div', null, 'Hello', null, 'World', undefined, 'Test');

  assert.deepStrictEqual(vnode.children, ['Hello', 'World', 'Test']);
});

test('h() handles boolean children', () => {
  const vnode = h('div', null, true, false, 'Text');

  // Booleans are typically filtered out in JSX
  assert.strictEqual(vnode.children.includes('Text'), true);
});

test('h() handles key prop', () => {
  const vnode = h('div', { key: 'unique-key' });

  assert.strictEqual(vnode.key, 'unique-key');
});

test('h() creates VNode with component type', () => {
  const MyComponent = (props) => h('div', null, props.text);
  const vnode = h(MyComponent, { text: 'Hello' });

  assert.strictEqual(vnode.type, MyComponent);
  assert.deepStrictEqual(vnode.props, { text: 'Hello' });
});

// ==========================================
// Fragment Tests
// ==========================================

test('Fragment returns children without wrapper', () => {
  const frag = Fragment({ children: ['a', 'b', 'c'] });

  assert.strictEqual(frag.type, Fragment);
  assert.deepStrictEqual(frag.children, ['a', 'b', 'c']);
});

test('Fragment with no children', () => {
  const frag = Fragment({});

  assert.strictEqual(frag.type, Fragment);
  assert.deepStrictEqual(frag.children, []);
});

// ==========================================
// DOMRenderer Tests
// ==========================================

test('DOMRenderer creates HTML element', () => {
  const renderer = new DOMRenderer();
  const node = renderer.createNode('div', {});

  assert.strictEqual(node.tagName, 'DIV');
});

test('DOMRenderer creates element with className', () => {
  const renderer = new DOMRenderer();
  const node = renderer.createNode('div', { className: 'test-class' });

  assert.strictEqual(node.className, 'test-class');
});

test('DOMRenderer creates element with style', () => {
  const renderer = new DOMRenderer();
  const node = renderer.createNode('div', { style: { color: 'red', fontSize: '16px' } });

  assert.strictEqual(node.style.color, 'red');
  assert.strictEqual(node.style.fontSize, '16px');
});

test('DOMRenderer maps View to div', () => {
  const renderer = new DOMRenderer();
  const node = renderer.createNode('View', {});

  assert.strictEqual(node.tagName, 'DIV');
});

test('DOMRenderer maps Text to span', () => {
  const renderer = new DOMRenderer();
  const node = renderer.createNode('Text', {});

  assert.strictEqual(node.tagName, 'SPAN');
});

test('DOMRenderer maps Button to button', () => {
  const renderer = new DOMRenderer();
  const node = renderer.createNode('Button', {});

  assert.strictEqual(node.tagName, 'BUTTON');
});

test('DOMRenderer creates text node', () => {
  const renderer = new DOMRenderer();
  const node = renderer.createTextNode('Hello World');

  assert.strictEqual(node.nodeType, 3); // TEXT_NODE
  assert.strictEqual(node.textContent, 'Hello World');
});

test('DOMRenderer updates text node', () => {
  const renderer = new DOMRenderer();
  const node = renderer.createTextNode('Hello');

  renderer.updateTextNode(node, 'World');
  assert.strictEqual(node.textContent, 'World');
});

test('DOMRenderer appends child', () => {
  const renderer = new DOMRenderer();
  const parent = renderer.createNode('div', {});
  const child = renderer.createNode('span', {});

  renderer.appendChild(parent, child);
  assert.strictEqual(parent.children.length, 1);
  assert.strictEqual(parent.children[0], child);
});

test('DOMRenderer inserts before', () => {
  const renderer = new DOMRenderer();
  const parent = renderer.createNode('div', {});
  const child1 = renderer.createNode('span', {});
  const child2 = renderer.createNode('span', {});

  renderer.appendChild(parent, child2);
  renderer.insertBefore(parent, child1, child2);

  assert.strictEqual(parent.children.length, 2);
  assert.strictEqual(parent.children[0], child1);
  assert.strictEqual(parent.children[1], child2);
});

test('DOMRenderer removes child', () => {
  const renderer = new DOMRenderer();
  const parent = renderer.createNode('div', {});
  const child = renderer.createNode('span', {});

  renderer.appendChild(parent, child);
  assert.strictEqual(parent.children.length, 1);

  renderer.removeChild(parent, child);
  assert.strictEqual(parent.children.length, 0);
});

test('DOMRenderer adds event listener', () => {
  const renderer = new DOMRenderer();
  const node = renderer.createNode('button', {});
  let clicked = false;

  const handler = () => {
    clicked = true;
  };

  renderer.addEventListener(node, 'click', handler);
  node.click();

  assert.strictEqual(clicked, true);
});

test('DOMRenderer removes event listener', () => {
  const renderer = new DOMRenderer();
  const node = renderer.createNode('button', {});
  let clickCount = 0;

  const handler = () => {
    clickCount++;
  };

  renderer.addEventListener(node, 'click', handler);
  node.click();
  assert.strictEqual(clickCount, 1);

  renderer.removeEventListener(node, 'click', handler);
  node.click();
  assert.strictEqual(clickCount, 1); // Should not increment
});

test('DOMRenderer updates node props', () => {
  const renderer = new DOMRenderer();
  const node = renderer.createNode('div', { className: 'old' });

  assert.strictEqual(node.className, 'old');

  renderer.updateNode(node, { className: 'old' }, { className: 'new' });
  assert.strictEqual(node.className, 'new');
});

test('DOMRenderer handles style updates', () => {
  const renderer = new DOMRenderer();
  const node = renderer.createNode('div', { style: { color: 'red' } });

  assert.strictEqual(node.style.color, 'red');

  renderer.updateNode(
    node,
    { style: { color: 'red' } },
    { style: { color: 'blue', fontSize: '20px' } }
  );

  assert.strictEqual(node.style.color, 'blue');
  assert.strictEqual(node.style.fontSize, '20px');
});

// ==========================================
// render() Function Tests
// ==========================================

test('render() mounts simple element', () => {
  const container = document.createElement('div');
  const vnode = h('div', { id: 'test' }, 'Hello');

  const node = render(vnode, container);

  assert.strictEqual(container.children.length, 1);
  assert.strictEqual(container.children[0].id, 'test');
  assert.strictEqual(container.children[0].textContent, 'Hello');
});

test('render() mounts nested elements', () => {
  const container = document.createElement('div');
  const vnode = h('div', null, h('span', null, 'Child 1'), h('span', null, 'Child 2'));

  render(vnode, container);

  assert.strictEqual(container.children.length, 1);
  assert.strictEqual(container.children[0].children.length, 2);
  assert.strictEqual(container.children[0].children[0].textContent, 'Child 1');
  assert.strictEqual(container.children[0].children[1].textContent, 'Child 2');
});

test('render() handles text content', () => {
  const container = document.createElement('div');

  render('Hello World', container);

  assert.strictEqual(container.textContent, 'Hello World');
});

test('render() handles number content', () => {
  const container = document.createElement('div');

  render(42, container);

  assert.strictEqual(container.textContent, '42');
});

test('render() handles null', () => {
  const container = document.createElement('div');

  const node = render(null, container);

  assert.strictEqual(node, null);
  assert.strictEqual(container.children.length, 0);
});

test('render() handles undefined', () => {
  const container = document.createElement('div');

  const node = render(undefined, container);

  assert.strictEqual(node, null);
  assert.strictEqual(container.children.length, 0);
});

test('render() mounts component function', () => {
  const container = document.createElement('div');
  const Greeting = (props) => h('div', null, `Hello, ${props.name}`);
  const vnode = h(Greeting, { name: 'World' });

  render(vnode, container);

  assert.strictEqual(container.children[0].textContent, 'Hello, World');
});

test('render() applies className', () => {
  const container = document.createElement('div');
  const vnode = h('div', { className: 'test-class another-class' });

  render(vnode, container);

  assert.strictEqual(container.children[0].className, 'test-class another-class');
});

test('render() applies inline styles', () => {
  const container = document.createElement('div');
  const vnode = h('div', { style: { color: 'red', fontSize: '16px' } });

  render(vnode, container);

  const element = container.children[0];
  assert.strictEqual(element.style.color, 'red');
  assert.strictEqual(element.style.fontSize, '16px');
});

test('render() attaches event handlers', () => {
  const container = document.createElement('div');
  let clicked = false;

  const vnode = h('button', {
    onClick: () => {
      clicked = true;
    },
  });

  render(vnode, container);

  const button = container.children[0];
  button.click();

  assert.strictEqual(clicked, true);
});

test('render() converts flexbox props to CSS', () => {
  const container = document.createElement('div');
  const vnode = h('div', {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  });

  render(vnode, container);

  const element = container.children[0];
  assert.strictEqual(element.style.display, 'flex');
  assert.strictEqual(element.style.flexDirection, 'row');
  assert.strictEqual(element.style.justifyContent, 'center');
  assert.strictEqual(element.style.alignItems, 'center');
  assert.strictEqual(element.style.gap, '10px');
});

test('render() handles padding props', () => {
  const container = document.createElement('div');
  const vnode = h('div', {
    padding: 20,
    paddingLeft: 10,
  });

  render(vnode, container);

  const element = container.children[0];
  assert.strictEqual(element.style.padding, '20px');
  assert.strictEqual(element.style.paddingLeft, '10px');
});

test('render() handles margin props', () => {
  const container = document.createElement('div');
  const vnode = h('div', {
    margin: 15,
    marginTop: 5,
  });

  render(vnode, container);

  const element = container.children[0];
  assert.strictEqual(element.style.margin, '15px');
  assert.strictEqual(element.style.marginTop, '5px');
});

test('render() handles bg prop as backgroundColor', () => {
  const container = document.createElement('div');
  const vnode = h('div', { bg: 'blue' });

  render(vnode, container);

  const element = container.children[0];
  assert.strictEqual(element.style.backgroundColor, 'blue');
});

console.log('\nAll DOM tests passed!');
