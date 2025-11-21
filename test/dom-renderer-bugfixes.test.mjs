// DOM Renderer Bug Fix Verification Tests
// Tests for critical bug fixes:
// 1. className prop applied to DOM elements
// 2. style prop applied to DOM elements
// 3. Flexbox shorthand props (gap, align, justify) converted to CSS
// 4. updateNode() actually updates DOM node properties

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

import { DOMRenderer } from '../dist/dom.mjs';

const renderer = new DOMRenderer();

// ==========================================
// Bug Fix #1: className prop
// ==========================================

test('BUG FIX: className prop is applied on createNode', () => {
  const node = renderer.createNode('Row', { className: 'test-class' });
  assert.strictEqual(node.className, 'test-class');
});

test('BUG FIX: className prop is updated via updateNode', () => {
  const node = renderer.createNode('Row', { className: 'initial-class' });
  assert.strictEqual(node.className, 'initial-class');

  renderer.updateNode(node, { className: 'initial-class' }, { className: 'updated-class' });
  assert.strictEqual(node.className, 'updated-class');
});

test('BUG FIX: className can be removed via updateNode', () => {
  const node = renderer.createNode('Row', { className: 'test-class' });
  assert.strictEqual(node.className, 'test-class');

  renderer.updateNode(node, { className: 'test-class' }, {});
  assert.strictEqual(node.className, '');
});

// ==========================================
// Bug Fix #2: style object prop
// ==========================================

test('BUG FIX: style object prop is applied on createNode', () => {
  const node = renderer.createNode('Row', {
    style: { fontSize: '20px', color: 'red', fontWeight: 'bold' }
  });

  assert.strictEqual(node.style.fontSize, '20px');
  assert.strictEqual(node.style.color, 'red');
  assert.strictEqual(node.style.fontWeight, 'bold');
});

test('BUG FIX: style object prop is updated via updateNode', () => {
  const node = renderer.createNode('Row', {
    style: { fontSize: '16px', color: 'blue' }
  });

  assert.strictEqual(node.style.fontSize, '16px');
  assert.strictEqual(node.style.color, 'blue');

  renderer.updateNode(
    node,
    { style: { fontSize: '16px', color: 'blue' } },
    { style: { fontSize: '24px', color: 'green', fontWeight: 'bold' } }
  );

  assert.strictEqual(node.style.fontSize, '24px');
  assert.strictEqual(node.style.color, 'green');
  assert.strictEqual(node.style.fontWeight, 'bold');
});

test('BUG FIX: style object can be removed via updateNode', () => {
  const node = renderer.createNode('Row', {
    style: { fontSize: '20px', color: 'red' }
  });

  assert.strictEqual(node.style.fontSize, '20px');
  assert.strictEqual(node.style.color, 'red');

  renderer.updateNode(
    node,
    { style: { fontSize: '20px', color: 'red' } },
    {}
  );

  assert.strictEqual(node.style.fontSize, '');
  assert.strictEqual(node.style.color, '');
});

// ==========================================
// Bug Fix #3: Flexbox shorthand props
// ==========================================

test('BUG FIX: gap prop is converted to CSS on createNode', () => {
  const node = renderer.createNode('Row', { gap: 16 });
  assert.strictEqual(node.style.gap, '16px');
});

test('BUG FIX: gap prop is updated via updateNode', () => {
  const node = renderer.createNode('Row', { gap: 8 });
  assert.strictEqual(node.style.gap, '8px');

  renderer.updateNode(node, { gap: 8 }, { gap: 24 });
  assert.strictEqual(node.style.gap, '24px');
});

test('BUG FIX: align shorthand prop converts to alignItems on createNode', () => {
  const node = renderer.createNode('Row', { align: 'center' });
  assert.strictEqual(node.style.alignItems, 'center');
});

test('BUG FIX: align shorthand prop is updated via updateNode', () => {
  const node = renderer.createNode('Row', { align: 'flex-start' });
  assert.strictEqual(node.style.alignItems, 'flex-start');

  renderer.updateNode(node, { align: 'flex-start' }, { align: 'flex-end' });
  assert.strictEqual(node.style.alignItems, 'flex-end');
});

test('BUG FIX: justify shorthand prop converts to justifyContent on createNode', () => {
  const node = renderer.createNode('Row', { justify: 'space-between' });
  assert.strictEqual(node.style.justifyContent, 'space-between');
});

test('BUG FIX: justify shorthand prop is updated via updateNode', () => {
  const node = renderer.createNode('Row', { justify: 'flex-start' });
  assert.strictEqual(node.style.justifyContent, 'flex-start');

  renderer.updateNode(node, { justify: 'flex-start' }, { justify: 'center' });
  assert.strictEqual(node.style.justifyContent, 'center');
});

// ==========================================
// Bug Fix #4: updateNode actually updates
// ==========================================

test('BUG FIX: updateNode updates padding prop', () => {
  const node = renderer.createNode('Row', { padding: 10 });
  assert.strictEqual(node.style.padding, '10px');

  renderer.updateNode(node, { padding: 10 }, { padding: 30 });
  assert.strictEqual(node.style.padding, '30px');
});

test('BUG FIX: updateNode updates margin prop', () => {
  const node = renderer.createNode('Row', { margin: 5 });
  assert.strictEqual(node.style.margin, '5px');

  renderer.updateNode(node, { margin: 5 }, { margin: 20 });
  assert.strictEqual(node.style.margin, '20px');
});

test('BUG FIX: updateNode updates bg prop', () => {
  const node = renderer.createNode('Row', { bg: 'red' });
  assert.strictEqual(node.style.backgroundColor, 'red');

  renderer.updateNode(node, { bg: 'red' }, { bg: 'blue' });
  assert.strictEqual(node.style.backgroundColor, 'blue');
});

test('BUG FIX: updateNode removes props when they are no longer present', () => {
  const node = renderer.createNode('Row', {
    gap: 10,
    padding: 15,
    margin: 20,
    bg: 'green'
  });

  assert.strictEqual(node.style.gap, '10px');
  assert.strictEqual(node.style.padding, '15px');
  assert.strictEqual(node.style.margin, '20px');
  assert.strictEqual(node.style.backgroundColor, 'green');

  renderer.updateNode(
    node,
    { gap: 10, padding: 15, margin: 20, bg: 'green' },
    {}
  );

  assert.strictEqual(node.style.gap, '');
  assert.strictEqual(node.style.padding, '');
  assert.strictEqual(node.style.margin, '');
  assert.strictEqual(node.style.backgroundColor, '');
});

// ==========================================
// Combined: All critical props together
// ==========================================

test('BUG FIX: All critical props work together on createNode', () => {
  const node = renderer.createNode('Row', {
    className: 'test-container',
    style: { fontSize: '14px' },
    gap: 12,
    padding: 16,
    margin: 8,
    align: 'center',
    justify: 'space-around',
    bg: 'lightblue'
  });

  assert.strictEqual(node.className, 'test-container');
  assert.strictEqual(node.style.fontSize, '14px');
  assert.strictEqual(node.style.gap, '12px');
  assert.strictEqual(node.style.padding, '16px');
  assert.strictEqual(node.style.margin, '8px');
  assert.strictEqual(node.style.alignItems, 'center');
  assert.strictEqual(node.style.justifyContent, 'space-around');
  assert.strictEqual(node.style.backgroundColor, 'lightblue');
});

test('BUG FIX: All critical props are updated via updateNode', () => {
  const node = renderer.createNode('Row', {
    className: 'before',
    style: { fontSize: '12px' },
    gap: 8,
    padding: 10,
    margin: 5,
    align: 'flex-start',
    justify: 'flex-start',
    bg: 'red'
  });

  renderer.updateNode(
    node,
    {
      className: 'before',
      style: { fontSize: '12px' },
      gap: 8,
      padding: 10,
      margin: 5,
      align: 'flex-start',
      justify: 'flex-start',
      bg: 'red'
    },
    {
      className: 'after',
      style: { fontSize: '18px', fontWeight: 'bold' },
      gap: 16,
      padding: 20,
      margin: 10,
      align: 'center',
      justify: 'space-between',
      bg: 'green'
    }
  );

  assert.strictEqual(node.className, 'after');
  assert.strictEqual(node.style.fontSize, '18px');
  assert.strictEqual(node.style.fontWeight, 'bold');
  assert.strictEqual(node.style.gap, '16px');
  assert.strictEqual(node.style.padding, '20px');
  assert.strictEqual(node.style.margin, '10px');
  assert.strictEqual(node.style.alignItems, 'center');
  assert.strictEqual(node.style.justifyContent, 'space-between');
  assert.strictEqual(node.style.backgroundColor, 'green');
});

// ==========================================
// Row/Column default flexbox behavior
// ==========================================

test('BUG FIX: Row has display:flex and flexDirection:row by default', () => {
  const node = renderer.createNode('Row', {});
  assert.strictEqual(node.style.display, 'flex');
  assert.strictEqual(node.style.flexDirection, 'row');
});

test('BUG FIX: Column has display:flex and flexDirection:column by default', () => {
  const node = renderer.createNode('Column', {});
  assert.strictEqual(node.style.display, 'flex');
  assert.strictEqual(node.style.flexDirection, 'column');
});

test('BUG FIX: Stack has display:flex by default', () => {
  const node = renderer.createNode('Stack', {});
  assert.strictEqual(node.style.display, 'flex');
});

console.log('\n✅ All DOM renderer bug fix tests passed!');
