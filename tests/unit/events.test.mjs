// Test Event Delegation
import { test } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';

// Setup DOM environment
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.Node = dom.window.Node;
global.Event = dom.window.Event; // Required for Event constructor
global.Text = dom.window.Text;
global.HTMLElement = dom.window.HTMLElement;

import { domRenderer } from '../../packages/flexium/dist/dom.mjs';

test('event delegation: attaches handler virtually', () => {
  const button = domRenderer.createNode('button', {});
  let clicked = false;
  
  domRenderer.addEventListener(button, 'click', () => {
    clicked = true;
  });
  
  // Simulate click via dispatchEvent on document (delegation root)
  // In JSDOM, we need to dispatch on the target, and it bubbles to document
  // where our global listener should catch it.
  
  // We need to ensure the button is in the document for bubbling to work
  document.body.appendChild(button);
  
  const event = new dom.window.Event('click', { bubbles: true });
  button.dispatchEvent(event);
  
  assert.strictEqual(clicked, true);
  
  document.body.removeChild(button);
});

test('event delegation: removes handler', () => {
  const button = domRenderer.createNode('button', {});
  let count = 0;
  const handler = () => count++;
  
  document.body.appendChild(button);
  
  domRenderer.addEventListener(button, 'click', handler);
  
  button.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  assert.strictEqual(count, 1);
  
  domRenderer.removeEventListener(button, 'click', handler);
  
  button.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  assert.strictEqual(count, 1, 'Should not increment after removal');
  
  document.body.removeChild(button);
});

test('event delegation: bubbles correctly', () => {
  const parent = domRenderer.createNode('div', {});
  const child = domRenderer.createNode('button', {});
  
  document.body.appendChild(parent);
  parent.appendChild(child);
  
  let parentClicked = false;
  let childClicked = false;
  
  domRenderer.addEventListener(parent, 'click', () => parentClicked = true);
  domRenderer.addEventListener(child, 'click', () => childClicked = true);
  
  // Click on child
  child.dispatchEvent(new dom.window.Event('click', { bubbles: true }));
  
  assert.strictEqual(childClicked, true, 'Child handler should run');
  assert.strictEqual(parentClicked, true, 'Parent handler should run (bubbling)');
  
  document.body.removeChild(parent);
});
