import { test } from 'node:test';
import assert from 'node:assert';
import { state, For, Show, h, render } from '../../packages/flexium/dist/test-exports.mjs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body><div id="app"></div></body>');
global.window = dom.window;
global.document = dom.window.document;
global.Node = dom.window.Node;
global.HTMLElement = dom.window.HTMLElement;
global.Text = dom.window.Text;

function createContainer() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  return div;
}

test('For component renders list', () => {
  const container = createContainer();
  const [list] = state(['A', 'B', 'C']);

  render(h(For, { each: list }, [
    (item) => h('span', {}, [item])
  ]), container);

  assert.strictEqual(container.innerHTML, '<span>A</span><span>B</span><span>C</span>');
  document.body.removeChild(container);
});

test('For component updates index reactively', async () => {
  const container = createContainer();
  const [list, setList] = state(['A', 'B', 'C']);

  // Render item with index
  render(h(For, { each: list }, [
    (item, index) => h('div', {}, [item, ':', index])
  ]), container);

  assert.strictEqual(container.innerHTML, '<div>A:0</div><div>B:1</div><div>C:2</div>');

  // Swap A and C -> C, B, A
  setList(['C', 'B', 'A']);
  
  await new Promise(r => setTimeout(r, 0)); // Wait for microtask (if any async)

  // Indexes should update!
  // C was at 2, now at 0.
  // B was at 1, now at 1.
  // A was at 0, now at 2.
  assert.strictEqual(container.innerHTML, '<div>C:0</div><div>B:1</div><div>A:2</div>');
  
  document.body.removeChild(container);
});

test('Show component renders content when true', () => {
  const container = createContainer();
  const [show, setShow] = state(true);

  render(h(Show, { when: show, fallback: h('span', {}, ['Hidden']) }, [
    h('div', {}, ['Visible'])
  ]), container);

  assert.strictEqual(container.innerHTML, '<div>Visible</div>');

  setShow(false);
  assert.strictEqual(container.innerHTML, '<span>Hidden</span>');
  
  document.body.removeChild(container);
});

test('Show component passes data to children function', () => {
  const container = createContainer();
  const [user, setUser] = state(null);

  render(h(Show, { when: user, fallback: h('span', {}, ['Guest']) }, [
    (u) => h('div', {}, ['Hello ', u.name])
  ]), container);

  assert.strictEqual(container.innerHTML, '<span>Guest</span>');

  setUser({ name: 'Flexium' });
  assert.strictEqual(container.innerHTML, '<div>Hello Flexium</div>');
  
  document.body.removeChild(container);
});
