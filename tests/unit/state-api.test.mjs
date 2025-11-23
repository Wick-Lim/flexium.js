// State API Tests
import { test } from 'node:test';
import assert from 'node:assert';
import { state, clearGlobalState, effect } from '../../packages/flexium/dist/index.mjs';

test('local state works like useState', () => {
  const [count, setCount] = state(0);
  
  assert.strictEqual(count(), 0);
  
  setCount(1);
  assert.strictEqual(count(), 1);
  
  setCount(prev => prev + 1);
  assert.strictEqual(count(), 2);
});

test('local state is reactive', () => {
  const [count, setCount] = state(0);
  let runCount = 0;
  let lastValue = 0;
  
  effect(() => {
    runCount++;
    lastValue = count();
  });
  
  assert.strictEqual(runCount, 1);
  assert.strictEqual(lastValue, 0);
  
  setCount(10);
  assert.strictEqual(runCount, 2);
  assert.strictEqual(lastValue, 10);
});

test('global state is shared by key', () => {
  clearGlobalState();
  
  // Component A creates global state
  const [themeA, setThemeA] = state('light', { key: 'theme' });
  
  // Component B accesses same global state
  const [themeB] = state(undefined, { key: 'theme' }); // Initial value ignored/optional if exists
  
  assert.strictEqual(themeA(), 'light');
  assert.strictEqual(themeB(), 'light');
  
  // Update from A
  setThemeA('dark');
  
  assert.strictEqual(themeA(), 'dark');
  assert.strictEqual(themeB(), 'dark'); // B should see update
});

test('global state reactivity works across consumers', () => {
  clearGlobalState();
  
  const [user, setUser] = state('Alice', { key: 'user' });
  let observedUser = '';
  
  // Effect in Component B
  effect(() => {
    // Access via new handle
    const [currentUser] = state(undefined, { key: 'user' });
    observedUser = currentUser();
  });
  
  assert.strictEqual(observedUser, 'Alice');
  
  // Update from Component A handle
  setUser('Bob');
  
  assert.strictEqual(observedUser, 'Bob');
});

test('global state independent keys', () => {
  clearGlobalState();
  
  const [a, setA] = state(1, { key: 'keyA' });
  const [b, setB] = state(2, { key: 'keyB' });
  
  assert.strictEqual(a(), 1);
  assert.strictEqual(b(), 2);
  
  setA(10);
  assert.strictEqual(a(), 10);
  assert.strictEqual(b(), 2); // B should not change
});

test('async state (resource) works', async () => {
  // Use a fetcher function
  const [data, actions] = state(async () => {
    return new Promise(resolve => setTimeout(() => resolve('loaded'), 10));
  });
  
  assert.strictEqual(data.loading, true);
  assert.strictEqual(data(), undefined); // Initially undefined
  
  // Wait for data
  await new Promise(resolve => setTimeout(resolve, 20));
  
  assert.strictEqual(data.loading, false);
  assert.strictEqual(data(), 'loaded');
  
  // Refetch
  actions.refetch();
  assert.strictEqual(data.state, 'refreshing'); // state property
});

test('global async state sharing', async () => {
  clearGlobalState();
  
  let fetchCount = 0;
  const fetcher = async () => {
    fetchCount++;
    return `data-${fetchCount}`;
  };
  
  // Component A initiates fetch
  const [dataA, actionsA] = state(fetcher, { key: 'async-data' });
  
  // Component B subscribes to same resource
  const [dataB, actionsB] = state(fetcher, { key: 'async-data' });
  
  assert.strictEqual(dataA.loading, true);
  assert.strictEqual(dataB.loading, true);
  
  await new Promise(resolve => setTimeout(resolve, 10));
  
  assert.strictEqual(dataA(), 'data-1');
  assert.strictEqual(dataB(), 'data-1');
  assert.strictEqual(fetchCount, 1); // Should only fetch once despite two calls (if they share the same resource instance)
  
  // Refetch from B
  actionsB.refetch();
  
  await new Promise(resolve => setTimeout(resolve, 10));
  
  assert.strictEqual(dataA(), 'data-2');
  assert.strictEqual(dataB(), 'data-2');
  assert.strictEqual(fetchCount, 2);
});

test('state works as computed (derived state)', async () => {
  const [count, setCount] = state(1);
  const [double] = state(() => count() * 2);
  
  // Initial value might be undefined due to microtask delay of Resource, 
  // or immediately available if createResource runs synchronously for sync sources?
  // Our createResource runs effect immediately, but load is async.
  // So double() will be undefined initially, then 2.
  
  assert.strictEqual(double(), undefined);
  
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.strictEqual(double(), 2);
  
  // Update dependency
  setCount(5);
  
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.strictEqual(double(), 10);
});
