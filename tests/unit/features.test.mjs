import { test } from 'node:test';
import assert from 'node:assert';
import { state, Switch, Match, Portal, onMount, h, render, domRenderer } from '../../packages/flexium/dist/test-exports.mjs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body><div id="app"></div><div id="modal"></div></body>');
global.window = dom.window;
global.document = dom.window.document;
global.Node = dom.window.Node;
global.HTMLElement = dom.window.HTMLElement;
global.Text = dom.window.Text;
global.Comment = dom.window.Comment;

function createContainer() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  return div;
}

test('Switch/Match renders correct branch', () => {
  const container = createContainer();
  const [count, setCount] = state(0);

  render(h(Switch, { fallback: h('div', {}, ['Fallback']) }, [
    h(Match, { when: () => count() === 1 }, [h('div', {}, ['One'])]),
    h(Match, { when: () => count() === 2 }, [h('div', {}, ['Two'])])
  ]), container);

  assert.strictEqual(container.innerHTML, '<div>Fallback</div>');

  setCount(1);
  assert.strictEqual(container.innerHTML, '<div>One</div>');

  setCount(2);
  assert.strictEqual(container.innerHTML, '<div>Two</div>');
  
  document.body.removeChild(container);
});

test('Portal renders content in target container', () => {
  const app = document.getElementById('app');
  const modal = document.getElementById('modal');
  
  // Clear modal
  modal.innerHTML = '';

  render(h(Portal, { mount: modal }, [
    h('div', {}, ['Modal Content'])
  ]), app);

  // App should contain placeholder comment (not easily testable via innerHTML usually, but JSDOM renders comments)
  // Or at least empty content if comment.
  // Modal should contain content.
  
  assert.strictEqual(modal.innerHTML, '<div>Modal Content</div>');
  
  // Cleanup
  app.innerHTML = '';
  modal.innerHTML = '';
});

test('className supports object/array', () => {
  const renderer = new domRenderer.constructor(); // Use exported class instance or create new
  const node = renderer.createNode('div', {
    className: ['foo', { bar: true, baz: false }, 'qux']
  });
  
  assert.strictEqual(node.className, 'foo bar qux');
});

test('onMount runs once', () => {
  let count = 0;
  
  function Component() {
    onMount(() => {
      count++;
    });
    return h('div', {});
  }
  
  const container = createContainer();
  render(h(Component, {}), container);
  
  assert.strictEqual(count, 1);
  
  document.body.removeChild(container);
});
