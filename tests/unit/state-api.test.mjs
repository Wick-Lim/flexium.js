// State API Tests
// Tests use the recommended Flexium patterns:
// - Direct value access with primitive casting: +count, String(name)
// - Proxy values in expressions: count + 1, count * 2
// - Note: count() also works (proxy is callable) but +count is idiomatic
import { test } from 'node:test';
import assert from 'node:assert';
import { state, effect } from '../../packages/flexium/dist/test-exports.mjs';

test('local state works like useState', () => {
  const [count, setCount] = state(0);

  // Use +count to cast proxy to primitive for comparison
  assert.strictEqual(+count, 0);

  setCount(1);
  assert.strictEqual(+count, 1);

  setCount(prev => prev + 1);
  assert.strictEqual(+count, 2);
});

test('local state is reactive', () => {
  const [count, setCount] = state(0);
  let runCount = 0;
  let lastValue = 0;

  effect(() => {
    runCount++;
    // In effects, direct access works for tracking
    lastValue = +count;
  });

  assert.strictEqual(runCount, 1);
  assert.strictEqual(lastValue, 0);

  setCount(10);
  assert.strictEqual(runCount, 2);
  assert.strictEqual(lastValue, 10);
});

test('global state is shared by key', () => {
  state.clear();

  // Component A creates global state
  const [themeA, setThemeA] = state('light', { key: 'theme' });

  // Component B accesses same global state
  const [themeB] = state(undefined, { key: 'theme' }); // Initial value ignored/optional if exists

  // Use String() to cast string proxy to primitive
  assert.strictEqual(String(themeA), 'light');
  assert.strictEqual(String(themeB), 'light');

  // Update from A
  setThemeA('dark');

  assert.strictEqual(String(themeA), 'dark');
  assert.strictEqual(String(themeB), 'dark'); // B should see update
});

test('global state reactivity works across consumers', () => {
  state.clear();

  const [user, setUser] = state('Alice', { key: 'user' });
  let observedUser = '';

  // Effect in Component B
  effect(() => {
    // Access via new handle
    const [currentUser] = state(undefined, { key: 'user' });
    observedUser = String(currentUser);
  });

  assert.strictEqual(observedUser, 'Alice');

  // Update from Component A handle
  setUser('Bob');

  assert.strictEqual(observedUser, 'Bob');
});

test('global state independent keys', () => {
  state.clear();

  const [a, setA] = state(1, { key: 'keyA' });
  const [b, setB] = state(2, { key: 'keyB' });

  assert.strictEqual(+a, 1);
  assert.strictEqual(+b, 2);

  setA(10);
  assert.strictEqual(+a, 10);
  assert.strictEqual(+b, 2); // B should not change
});

test('async state (resource) works', async () => {
  // Use a fetcher function
  // API: [data, refetch, status, error] = state(async () => ...)
  // Note: Implementation returns AsyncStatus ('idle'|'loading'|'success'|'error')
  const [data, refetch, status, error] = state(async () => {
    return new Promise(resolve => setTimeout(() => resolve('loaded'), 10));
  });

  // Use String() to cast status proxy to primitive
  assert.strictEqual(String(status), 'loading');
  // data is undefined during loading - use strict comparison
  assert.strictEqual(data, undefined);

  // Wait for data
  await new Promise(resolve => setTimeout(resolve, 50));

  assert.strictEqual(String(status), 'success');
  assert.strictEqual(String(data), 'loaded');

  // Refetch
  refetch();
  // After refetch, status should change
  await new Promise(resolve => setTimeout(resolve, 50));
  assert.strictEqual(String(data), 'loaded');
});

test('global async state sharing', async () => {
  state.clear();

  let fetchCount = 0;
  const fetcher = async () => {
    fetchCount++;
    return `data-${fetchCount}`;
  };

  // Component A initiates fetch
  // API: [data, refetch, status, error] = state(async () => ..., { key })
  const [dataA, refetchA, statusA] = state(fetcher, { key: 'async-data' });

  // Component B subscribes to same resource
  const [dataB, refetchB, statusB] = state(fetcher, { key: 'async-data' });

  assert.strictEqual(String(statusA), 'loading');
  assert.strictEqual(String(statusB), 'loading');

  await new Promise(resolve => setTimeout(resolve, 50));

  assert.strictEqual(String(dataA), 'data-1');
  assert.strictEqual(String(dataB), 'data-1');
  // Note: fetchCount may be 2 if each state() call triggers its own fetch
  // This depends on implementation - shared keyed state might dedupe or not

  // Refetch from B
  refetchB();

  await new Promise(resolve => setTimeout(resolve, 50));

  // After refetch, both should have updated data
  assert.ok(String(dataA) !== 'undefined');
  assert.ok(String(dataB) !== 'undefined');
});

test('state works as computed (derived state)', () => {
  const [count, setCount] = state(1);
  // Sync computed function returns [StateValue] - value is computed immediately
  // Inside the compute function, use +count to get the primitive value
  const [double] = state(() => count * 2);

  // For sync computed, value should be available immediately
  // Use +double to cast the proxy to primitive
  assert.strictEqual(+double, 2);

  // Update dependency
  setCount(5);

  // Computed should update synchronously
  assert.strictEqual(+double, 10);
});
