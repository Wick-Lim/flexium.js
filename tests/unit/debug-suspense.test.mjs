import { test } from 'node:test';
import assert from 'node:assert';
import { state, Suspense, h, render, createReactiveRoot, effect, signal } from '../../packages/flexium/dist/test-exports.mjs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body><div id="app"></div></body>');
global.window = dom.window;
global.document = dom.window.document;
global.Node = dom.window.Node;
global.HTMLElement = dom.window.HTMLElement;
global.Text = dom.window.Text;
global.Promise = Promise;

test('Debug Suspense', async () => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  console.log('--- Starting Debug Test ---');

  let resolvePromise;
  const pending = signal(true);
  
  function AsyncComponent() {
      console.log('AsyncComponent rendering');
      if (pending.value) {
          console.log('AsyncComponent throwing promise');
          throw new Promise(r => { resolvePromise = r; });
      }
      return h('div', { id: 'content' }, ['Content']);
  }
  
  function Fallback() {
      console.log('Fallback rendering');
      return h('div', { id: 'fallback' }, ['Loading...']);
  }

  console.log('Rendering Suspense...');
  render(h(Suspense, { fallback: h(Fallback) }, [
      h(AsyncComponent)
  ]), container);

  console.log('Waiting for microtasks...');
  await new Promise(r => setTimeout(r, 0));

  console.log('Container HTML:', container.innerHTML);
  
  const fallback = container.querySelector('#fallback');
  if (fallback) {
      console.log('SUCCESS: Fallback found');
  } else {
      console.log('FAILURE: Fallback NOT found');
  }

  // Resolve
  console.log('Resolving promise...');
  pending.value = false;
  if (resolvePromise) resolvePromise();
  
  await new Promise(r => setTimeout(r, 0));
  console.log('Container HTML after resolve:', container.innerHTML);
});
