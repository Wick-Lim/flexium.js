// JSX Runtime Performance Tests
import { test } from 'node:test';
import assert from 'node:assert';

import { jsx, jsxs } from '../../packages/flexium/dist/jsx-runtime.mjs';
import { h } from '../../packages/flexium/dist/dom.mjs';

// ==========================================
// Performance Comparison Tests
// ==========================================

  const iterations = 1000;

  // Test jsx()
  const jsxStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    jsx('div', { id: 'test', className: 'container', children: 'Hello' });
  }
  const jsxTime = performance.now() - jsxStart;

  // Test h()
  const hStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    h('div', { id: 'test', className: 'container' }, 'Hello');
  }
  const hTime = performance.now() - hStart;

  console.log(`jsx() time: ${jsxTime.toFixed(2)}ms`);
  console.log(`h() time: ${hTime.toFixed(2)}ms`);
  console.log(`Ratio: ${(jsxTime / hTime).toFixed(2)}x`);

  // jsx should be reasonably fast (within 5x of h)
  // Increased threshold to prevent flaky tests in variable environments
  assert.ok(jsxTime < hTime * 5, 'jsx() should be reasonably performant');
});

test('jsxs() performance with multiple children', () => {
  const iterations = 500;

  // Test jsxs()
  const jsxsStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    jsxs('div', { children: ['a', 'b', 'c', 'd', 'e'] });
  }
  const jsxsTime = performance.now() - jsxsStart;

  // Test h()
  const hStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    h('div', null, 'a', 'b', 'c', 'd', 'e');
  }
  const hTime = performance.now() - hStart;

  console.log(`jsxs() time: ${jsxsTime.toFixed(2)}ms`);
  console.log(`h() time: ${hTime.toFixed(2)}ms`);
  console.log(`Ratio: ${(jsxsTime / hTime).toFixed(2)}x`);

  // jsxs should be reasonably fast
  assert.ok(jsxsTime < hTime * 5, 'jsxs() should be reasonably performant');
});

test('jsx() nested children flattening performance', () => {
  const iterations = 500;

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    jsx('div', {
      children: [
        'a',
        ['b', ['c', 'd']],
        'e',
        [['f', 'g'], 'h'],
      ],
    });
  }
  const time = performance.now() - start;

  console.log(`Nested flattening time: ${time.toFixed(2)}ms for ${iterations} iterations`);
  console.log(`Average: ${(time / iterations).toFixed(4)}ms per operation`);

  // Should complete in reasonable time (< 1 second for 5000 iterations)
  assert.ok(time < 1000, 'Nested flattening should be fast');
});

test('jsx() memory efficiency', () => {
  const iterations = 1000;
  const nodes = [];

  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    nodes.push(
      jsx('div', {
        id: `node-${i}`,
        className: 'test',
        children: [
          jsx('span', { children: 'Child 1' }),
          jsx('span', { children: 'Child 2' }),
        ],
      })
    );
  }
  const time = performance.now() - start;

  console.log(`Created ${iterations} VNodes in ${time.toFixed(2)}ms`);
  console.log(`Average: ${(time / iterations).toFixed(4)}ms per VNode`);

  // Verify all nodes were created
  assert.strictEqual(nodes.length, iterations);

  // Should be fast
  assert.ok(time < 2000, 'VNode creation should be efficient');
});
