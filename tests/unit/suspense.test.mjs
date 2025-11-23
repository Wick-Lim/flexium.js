import { test } from 'node:test';
import assert from 'node:assert';
import { state, Suspense, h, render } from '../../packages/flexium/dist/test-exports.mjs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body><div id="app"></div></body>');
global.window = dom.window;
global.document = dom.window.document;
global.Node = dom.window.Node;
global.HTMLElement = dom.window.HTMLElement;
global.Text = dom.window.Text;
global.Promise = Promise;

function createContainer() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  return div;
}

test('Suspense shows fallback while loading', async () => {
  const container = createContainer();
  
  let resolvePromise;
  const [data] = state(() => new Promise(resolve => {
      resolvePromise = resolve;
  }));
  
  function AsyncComponent() {
      const value = data.read(); // Should throw Promise
      return h('div', { id: 'content' }, [value]);
  }
  
  function Fallback() {
      return h('div', { id: 'fallback' }, ['Loading...']);
  }

  render(h(Suspense, { fallback: h(Fallback) }, [
      h(AsyncComponent)
  ]), container);

  // Wait for Suspense fallback render (triggered via microtask queue)
  await new Promise(r => setTimeout(r, 0));

  // Initial render: should show fallback
  assert.ok(container.querySelector('#fallback'));
  assert.strictEqual(container.querySelector('#fallback').innerHTML, 'Loading...');
  assert.strictEqual(container.querySelector('#content'), null);

  // Resolve promise
  resolvePromise('Hello');
  
  // Wait for microtasks (promise resolution) and effect updates
  await new Promise(r => setTimeout(r, 10));

  // Should show content
  assert.strictEqual(container.querySelector('#fallback'), null);
  const content = container.querySelector('#content');
  assert.ok(content);
  assert.strictEqual(content.innerHTML, 'Hello');
  
  document.body.removeChild(container);
});
