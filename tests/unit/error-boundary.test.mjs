import { test } from 'node:test';
import assert from 'node:assert';
import { signal, ErrorBoundary, h, render, root, effect, createReactiveRoot } from 'flexium/test-exports';
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

test('ErrorBoundary catches errors and renders fallback', async () => {
  const container = createContainer();
  const testError = new Error('Something went wrong');
  
  function Bomb() {
      throw testError;
  }
  
  function Fallback(props) {
      return h('div', { id: 'error-fallback' }, [
          'Error: ', props.error?.message || 'Unknown error'
      ]);
  }

  render(h(ErrorBoundary, { fallback: Fallback }, [
      h(Bomb)
  ]), container);

  await new Promise(r => setTimeout(r, 0)); // Wait for async error handling and fallback render

  // Should show fallback
  assert.ok(container.querySelector('#error-fallback'));
  assert.strictEqual(container.querySelector('#error-fallback').innerHTML, 'Error: Something went wrong');
  assert.strictEqual(container.querySelector('#content'), null);
  
  document.body.removeChild(container);
});

test('ErrorBoundary does not catch errors outside its boundary', async () => {
  const container = createContainer();
  const testError = new Error('Unhandled error');

  function OuterBomb() {
      throw testError;
  }
  
  let caughtGlobalError = null;
  const rootInstance = root(dispose => {
    const rootRenderer = createReactiveRoot(container);
    rootRenderer.render(h('div', { id: 'root' }, [h(OuterBomb)]));

    effect(() => {}, { onError: (error) => {
        caughtGlobalError = error;
    }}); // Create an effect to catch errors from the rootRenderer

    return { dispose, rootRenderer }; // Return dispose and rootRenderer
  });

  // Need to await for microtasks, as the error handling might be queued
  await new Promise(r => setTimeout(r, 0)); 

  assert.ok(caughtGlobalError);
  assert.strictEqual(caughtGlobalError.message, 'Unhandled error');
  assert.strictEqual(container.querySelector('#root'), null); // Nothing should be rendered as root effect logs error and stops
  
  // Manual cleanup since createReactiveRoot is not automatically cleaned by test runner
  rootInstance.rootRenderer.unmount();
  document.body.removeChild(container);
});

test('ErrorBoundary passes updated error to fallback', async () => {
  const container = createContainer();
  const errorSignal = signal(null);

  function DynamicBomb() {
      if (errorSignal.value) {
          throw errorSignal.value;
      }
      return h('div', { id: 'dynamic-content' }, ['Content']);
  }

  function Fallback(props) {
      return h('div', { id: 'dynamic-fallback' }, [
          'Dynamic Error: ', props.error?.message || 'No error'
      ]);
  }

  render(h(ErrorBoundary, { fallback: Fallback }, [
      h(DynamicBomb)
  ]), container);

  await new Promise(r => setTimeout(r, 0)); // Wait for initial render and possible fallback

  // Initial render: no error, should show content
  assert.ok(container.querySelector('#dynamic-content'));
  assert.strictEqual(container.querySelector('#dynamic-content').innerHTML, 'Content');
  assert.strictEqual(container.querySelector('#dynamic-fallback'), null);

  // Trigger error
  errorSignal.value = new Error('First dynamic error');
  await new Promise(r => setTimeout(r, 0)); // Wait for reactivity

  // Should show fallback with first error
  assert.strictEqual(container.querySelector('#dynamic-content'), null);
  const fallback = container.querySelector('#dynamic-fallback');
  assert.ok(fallback);
  assert.strictEqual(fallback.innerHTML, 'Dynamic Error: First dynamic error');

  // Update error
  errorSignal.value = new Error('Second dynamic error');
  await new Promise(r => setTimeout(r, 0)); // Wait for reactivity

  // Should update fallback with second error
  const updatedFallback = container.querySelector('#dynamic-fallback');
  assert.ok(updatedFallback);
  assert.strictEqual(updatedFallback.innerHTML, 'Dynamic Error: Second dynamic error');

  // Clear error (show content again)
  errorSignal.value = null;
  await new Promise(r => setTimeout(r, 0)); // Wait for reactivity

  assert.ok(container.querySelector('#dynamic-content'));
  assert.strictEqual(container.querySelector('#dynamic-content').innerHTML, 'Content');
  assert.strictEqual(container.querySelector('#dynamic-fallback'), null);

  document.body.removeChild(container);
});

