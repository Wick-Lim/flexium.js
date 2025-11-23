// Test Keyed Reconciliation
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

import { signal } from '../../packages/flexium/dist/test-exports.mjs'; 
import { h, render } from '../../packages/flexium/dist/dom.mjs';

// Since reconcileArrays is internal and not exported in the main bundle,
// we test the behavior through public API (signals + list rendering)

test('reconciliation: swaps elements with keys', (t) => {
  const container = document.createElement('div');
  const list = signal([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
    { id: 3, text: 'Item 3' },
  ]);

  const App = () => {
    return h('div', {}, [
      list // Reactive list
    ].map(signal => { // This is tricky, our current reactive children handling expects the signal itself to return the array
        // Or the array itself to be the child
    }));
    
    // Correct usage for Flexium:
    // h('div', {}, [ computed(() => list.value.map(...)) ])
  };
  
  // Let's write a proper test case that matches Flexium usage pattern
});

test('reconciliation: handles list reordering', () => {
  const container = document.createElement('div');
  const items = signal([1, 2, 3]);

  const ListComponent = () => {
    // Map signal value to VNodes
    // In Flexium, we typically pass a computed or a function that returns the array
    return h('ul', {}, 
      // We need to pass a function or signal that returns the array of VNodes
      () => items.value.map(id => h('li', { key: id, id: `item-${id}` }, id))
    );
  };

  render(h(ListComponent, {}), container);
  // mountReactive inserts a text node anchor for components, so firstChild might be a text node
  const ul = container.querySelector('ul');
  
  // Initial state
  assert.strictEqual(ul.children.length, 3);
  assert.strictEqual(ul.children[0].id, 'item-1');
  assert.strictEqual(ul.children[1].id, 'item-2');
  assert.strictEqual(ul.children[2].id, 'item-3');
  
  const node1 = ul.children[0];
  const node2 = ul.children[1];
  const node3 = ul.children[2];

  // Swap 1 and 3: [3, 2, 1]
  items.value = [3, 2, 1];

  // Verify reorder
  assert.strictEqual(ul.children[0].id, 'item-3');
  assert.strictEqual(ul.children[1].id, 'item-2');
  assert.strictEqual(ul.children[2].id, 'item-1');

  // Verify DOM node reuse (Reconciliation check)
  assert.strictEqual(ul.children[0], node3, 'Node 3 should be moved, not recreated');
  assert.strictEqual(ul.children[1], node2, 'Node 2 should stay');
  assert.strictEqual(ul.children[2], node1, 'Node 1 should be moved');
});

test('reconciliation: handles insertion and deletion', () => {
  const container = document.createElement('div');
  const items = signal([1, 2]);

  render(h('ul', {}, () => items.value.map(id => h('li', { key: id, id: `item-${id}` }, id))), container);
  const ul = container.querySelector('ul');
  
  const node1 = ul.children[0];
  const node2 = ul.children[1];

  // Insert 3 in middle: [1, 3, 2]
  items.value = [1, 3, 2];

  assert.strictEqual(ul.children.length, 3);
  assert.strictEqual(ul.children[1].id, 'item-3');
  assert.strictEqual(ul.children[0], node1, 'Node 1 preserved');
  assert.strictEqual(ul.children[2], node2, 'Node 2 preserved');

  // Delete 1: [3, 2]
  items.value = [3, 2];
  
  assert.strictEqual(ul.children.length, 2);
  assert.strictEqual(ul.children[0].id, 'item-3');
  assert.strictEqual(ul.children[1], node2);
});
