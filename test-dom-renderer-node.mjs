/**
 * Simple Node.js test for DOM Renderer bug fixes
 * Uses jsdom to simulate browser environment
 */

import { JSDOM } from 'jsdom';

// Setup jsdom
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.HTMLElement = dom.window.HTMLElement;

// Import DOMRenderer after setting up globals
const { DOMRenderer } = await import('./src/renderers/dom/index.ts');

const renderer = new DOMRenderer();
let testCount = 0;
let passCount = 0;

function test(name, fn) {
  testCount++;
  try {
    fn();
    passCount++;
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}: ${error.message}`);
  }
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Values not equal'}: expected "${expected}", got "${actual}"`);
  }
}

console.log('\n🧪 DOM Renderer Bug Fix Tests\n');

// Test 1: className prop applied on creation
test('className prop applied on creation', () => {
  const element = renderer.createNode('Row', { className: 'test-class' });
  assertEquals(element.className, 'test-class', 'className should be set');
});

// Test 2: className prop updated
test('className prop updated', () => {
  const element = renderer.createNode('Row', { className: 'initial' });
  renderer.updateNode(element, { className: 'initial' }, { className: 'updated' });
  assertEquals(element.className, 'updated', 'className should be updated');
});

// Test 3: style object prop applied on creation
test('style object prop applied on creation', () => {
  const element = renderer.createNode('Row', {
    style: { fontSize: '20px', color: 'red' }
  });
  assertEquals(element.style.fontSize, '20px', 'fontSize from style object should be set');
  assertEquals(element.style.color, 'red', 'color from style object should be set');
});

// Test 4: style object prop updated
test('style object prop updated', () => {
  const element = renderer.createNode('Row', { style: { fontSize: '16px' } });
  renderer.updateNode(
    element,
    { style: { fontSize: '16px' } },
    { style: { fontSize: '24px', fontWeight: 'bold' } }
  );
  assertEquals(element.style.fontSize, '24px', 'fontSize should be updated');
  assertEquals(element.style.fontWeight, 'bold', 'fontWeight should be added');
});

// Test 5: gap prop converted to CSS
test('gap prop converted to CSS', () => {
  const element = renderer.createNode('Row', { gap: 16 });
  assertEquals(element.style.gap, '16px', 'gap should be converted to CSS');
});

// Test 6: gap prop updated
test('gap prop updated', () => {
  const element = renderer.createNode('Row', { gap: 8 });
  renderer.updateNode(element, { gap: 8 }, { gap: 24 });
  assertEquals(element.style.gap, '24px', 'gap should be updated');
});

// Test 7: align shorthand converted to alignItems
test('align shorthand converted to alignItems', () => {
  const element = renderer.createNode('Row', { align: 'center' });
  assertEquals(element.style.alignItems, 'center', 'align should be converted to alignItems');
});

// Test 8: justify shorthand converted to justifyContent
test('justify shorthand converted to justifyContent', () => {
  const element = renderer.createNode('Row', { justify: 'space-between' });
  assertEquals(element.style.justifyContent, 'space-between', 'justify should be converted to justifyContent');
});

// Test 9: padding prop converted to CSS
test('padding prop converted to CSS', () => {
  const element = renderer.createNode('Row', { padding: 20 });
  assertEquals(element.style.padding, '20px', 'padding should be converted to CSS');
});

// Test 10: padding prop updated
test('padding prop updated', () => {
  const element = renderer.createNode('Row', { padding: 10 });
  renderer.updateNode(element, { padding: 10 }, { padding: 30 });
  assertEquals(element.style.padding, '30px', 'padding should be updated');
});

// Test 11: margin prop converted to CSS
test('margin prop converted to CSS', () => {
  const element = renderer.createNode('Row', { margin: 15 });
  assertEquals(element.style.margin, '15px', 'margin should be converted to CSS');
});

// Test 12: margin prop updated
test('margin prop updated', () => {
  const element = renderer.createNode('Row', { margin: 10 });
  renderer.updateNode(element, { margin: 10 }, { margin: 20 });
  assertEquals(element.style.margin, '20px', 'margin should be updated');
});

// Test 13: Multiple props work together
test('Multiple props work together', () => {
  const element = renderer.createNode('Row', {
    className: 'multi-test',
    gap: 12,
    padding: 16,
    margin: 8,
    bg: 'blue',
    align: 'center',
    justify: 'space-around'
  });
  assertEquals(element.className, 'multi-test', 'className should be set');
  assertEquals(element.style.gap, '12px', 'gap should be set');
  assertEquals(element.style.padding, '16px', 'padding should be set');
  assertEquals(element.style.margin, '8px', 'margin should be set');
  assertEquals(element.style.backgroundColor, 'blue', 'backgroundColor should be set');
  assertEquals(element.style.alignItems, 'center', 'alignItems should be set');
  assertEquals(element.style.justifyContent, 'space-around', 'justifyContent should be set');
});

// Test 14: updateNode actually updates props
test('updateNode actually updates props', () => {
  const element = renderer.createNode('Row', {
    className: 'before',
    gap: 8,
    padding: 10,
    bg: 'red'
  });

  renderer.updateNode(
    element,
    { className: 'before', gap: 8, padding: 10, bg: 'red' },
    { className: 'after', gap: 16, padding: 20, bg: 'green' }
  );

  assertEquals(element.className, 'after', 'className should be updated');
  assertEquals(element.style.gap, '16px', 'gap should be updated');
  assertEquals(element.style.padding, '20px', 'padding should be updated');
  assertEquals(element.style.backgroundColor, 'green', 'backgroundColor should be updated');
});

// Test 15: Removing props clears styles
test('Removing props clears styles', () => {
  const element = renderer.createNode('Row', {
    className: 'test',
    gap: 10,
    padding: 15
  });

  renderer.updateNode(
    element,
    { className: 'test', gap: 10, padding: 15 },
    { }
  );

  assertEquals(element.className, '', 'className should be cleared');
  assertEquals(element.style.gap, '', 'gap should be cleared');
  assertEquals(element.style.padding, '', 'padding should be cleared');
});

// Test 16: Row has display:flex by default
test('Row has display:flex by default', () => {
  const element = renderer.createNode('Row', {});
  assertEquals(element.style.display, 'flex', 'Row should have display:flex');
  assertEquals(element.style.flexDirection, 'row', 'Row should have flexDirection:row');
});

// Test 17: Column has display:flex and flexDirection:column
test('Column has display:flex and flexDirection:column', () => {
  const element = renderer.createNode('Column', {});
  assertEquals(element.style.display, 'flex', 'Column should have display:flex');
  assertEquals(element.style.flexDirection, 'column', 'Column should have flexDirection:column');
});

// Test 18: Individual padding props work
test('Individual padding props work', () => {
  const element = renderer.createNode('Row', {
    paddingTop: 5,
    paddingRight: 10,
    paddingBottom: 15,
    paddingLeft: 20
  });
  assertEquals(element.style.paddingTop, '5px', 'paddingTop should be set');
  assertEquals(element.style.paddingRight, '10px', 'paddingRight should be set');
  assertEquals(element.style.paddingBottom, '15px', 'paddingBottom should be set');
  assertEquals(element.style.paddingLeft, '20px', 'paddingLeft should be set');
});

// Test 19: Individual margin props work
test('Individual margin props work', () => {
  const element = renderer.createNode('Row', {
    marginTop: 5,
    marginRight: 10,
    marginBottom: 15,
    marginLeft: 20
  });
  assertEquals(element.style.marginTop, '5px', 'marginTop should be set');
  assertEquals(element.style.marginRight, '10px', 'marginRight should be set');
  assertEquals(element.style.marginBottom, '15px', 'marginBottom should be set');
  assertEquals(element.style.marginLeft, '20px', 'marginLeft should be set');
});

// Test 20: bg prop converts to backgroundColor
test('bg prop converts to backgroundColor', () => {
  const element = renderer.createNode('Row', { bg: '#ff5733' });
  assertEquals(element.style.backgroundColor, 'rgb(255, 87, 51)', 'bg should be converted to backgroundColor');
});

console.log(`\n📊 Results: ${passCount}/${testCount} tests passed\n`);

if (passCount === testCount) {
  console.log('✅ All tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed!');
  process.exit(1);
}
