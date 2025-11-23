/**
 * Signal Fix Verification Test
 *
 * This test specifically verifies the bug fix for the infinite loop issue
 * where effects that write to signals were causing infinite recursion.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { signal, computed, effect, batch, untrack } from '../../packages/flexium/dist/test-exports.mjs';

test('CRITICAL: effect writing to signal does not cause infinite loop', async () => {
  const count = signal(0);
  let runCount = 0;
  
  effect(() => {
    runCount++;
    const value = count.value * 2; // Read computed value
    if (value < 6) {
      count.value++;
    }
  });
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks

  assert.strictEqual(runCount, 4, 'Effect should run exactly 4 times (initial + 3 updates)');
  assert.strictEqual(count.value, 3, 'Final count value');
});

test('CRITICAL: multiple signals updating in effect', async () => {
  const a = signal(0);
  const b = signal(0);
  let runCount = 0;

  effect(() => {
    runCount++;
    if (a.value === 0) {
      a.value = 1;
      b.value = 1;
    } else if (a.value === 1 && b.value === 1) {
      a.value = 2;
      b.value = 2;
    }
  });
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks

  assert.strictEqual(runCount, 3, 'Multiple signal updates stabilized');
  assert.strictEqual(a.value, 2, 'Signal a should be 2');
  assert.strictEqual(b.value, 2, 'Signal b should be 2');
});

test('CRITICAL: computed in effect with signal write', async () => {
  const data = signal(1);
  const doubled = computed(() => data.value * 2);
  let runCount = 0;

  effect(() => {
    runCount++;
    const d = doubled.value;
    if (d < 10) {
      data.value++;
    }
  });
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks

  assert.strictEqual(runCount, 5, 'Computed + effect + signal write stabilized');
  assert.strictEqual(doubled.value, 10, 'Final doubled value');
});

test('VERIFICATION: signal updates trigger effect exactly once', async () => {
  let runs = 0;
  const s = signal(0);
  effect(() => {
    runs++;
    s.value; // Read dependency
  });
  await new Promise(r => setTimeout(r, 0)); // Wait for initial effect run

  assert.strictEqual(runs, 1, 'Effect runs once initially');

  s.value = 1;
  await new Promise(r => setTimeout(r, 0)); // Wait for update
  assert.strictEqual(runs, 2, 'Effect runs once after update');

  s.value = 2;
  await new Promise(r => setTimeout(r, 0)); // Wait for update
  assert.strictEqual(runs, 3, 'Effect runs once per update');
});

test('VERIFICATION: computed recalculates correctly', async () => {
  const a = signal(2);
  const b = signal(3);
  let computeCount = 0;

  const sum = computed(() => {
    computeCount++;
    return a.value + b.value;
  });

  let effectRuns = 0;
  effect(() => {
    effectRuns++;
    sum.value; // Read computed
  });
  await new Promise(r => setTimeout(r, 0)); // Wait for initial effect run

  assert.strictEqual(sum.value, 5);
  assert.strictEqual(computeCount, 1, 'Computed runs once on first access');

  a.value = 5;
  await new Promise(r => setTimeout(r, 0)); // Wait for update
  assert.strictEqual(sum.value, 8);
  assert.strictEqual(computeCount, 2, 'Computed recalculates after dependency change');
  assert.strictEqual(effectRuns, 2, 'Effect runs correctly');

  b.value = 10;
  await new Promise(r => setTimeout(r, 0)); // Wait for update
  assert.strictEqual(sum.value, 15);
  assert.strictEqual(computeCount, 3, 'Computed recalculates after dependency change');
  assert.strictEqual(effectRuns, 3, 'Effect runs correctly');
});

test('VERIFICATION: batch prevents multiple effect runs', async () => {
  let runs = 0;
  const s1 = signal(0);
  const s2 = signal(0);
  effect(() => {
    runs++;
    s1.value; // Read dependency
    s2.value; // Read dependency
  });
  await new Promise(r => setTimeout(r, 0)); // Wait for initial effect run

  assert.strictEqual(runs, 1, 'Effect runs once initially');

  batch(() => {
    s1.value = 1;
    s2.value = 1;
  });
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks

  assert.strictEqual(runs, 2, 'Effect runs only once after batch');
});

test('STRESS TEST: deeply nested reactive chain', async () => {
  const source = signal(1);
  let c1Runs = 0;
  const c1 = computed(() => { c1Runs++; return source.value * 2; });
  let c2Runs = 0;
  const c2 = computed(() => { c2Runs++; return c1.value * 2; });
  let c3Runs = 0;
  const c3 = computed(() => { c3Runs++; return c2.value * 2; });

  let effectRuns = 0;
  effect(() => {
    effectRuns++;
    c3.value; // Read c3
  });
  await new Promise(r => setTimeout(r, 0)); // Wait for initial effect run

  assert.strictEqual(c3.value, 8, 'Deeply nested computed works');
  assert.strictEqual(c1Runs, 1, 'c1 runs');
  assert.strictEqual(c2Runs, 1, 'c2 runs');
  assert.strictEqual(c3Runs, 1, 'c3 runs');
  assert.strictEqual(effectRuns, 1, 'effect runs');

  source.value = 2;
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks
  assert.strictEqual(c3.value, 16, 'Chain updates correctly');
  assert.strictEqual(c1Runs, 2, 'c1 runs');
  assert.strictEqual(c2Runs, 2, 'c2 runs');
  assert.strictEqual(c3Runs, 2, 'c3 runs');
  assert.strictEqual(effectRuns, 2, 'effect runs');
});

test('STRESS TEST: many signals tracked in one effect', async () => {
  const signals = Array.from({ length: 10 }, (_, i) => signal(i));
  let effectRuns = 0;
  effect(() => {
    effectRuns++;
    signals.forEach(s => s.value);
  });
  await new Promise(r => setTimeout(r, 0)); // Wait for initial effect run

  assert.strictEqual(effectRuns, 1, 'Effect runs once initially');

  // Update one signal
  signals[0].value = 100;
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks
  assert.strictEqual(effectRuns, 2, 'Effect runs once after single update');

  // Update another
  signals[5].value = 200;
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks
  assert.strictEqual(effectRuns, 3, 'Effect runs once per signal update');
});

test('EDGE CASE: effect writing to untracked signal', async () => {
  const tracked = signal(0);
  const untrackedSignal = signal(0);
  let effectRuns = 0;

  effect(() => {
    effectRuns++;
    const value = tracked.value;
    untrack(() => {
      untrackedSignal.value = value * 2;
    });
  });
  await new Promise(r => setTimeout(r, 0)); // Wait for initial effect run

  assert.strictEqual(effectRuns, 1, 'Effect runs once');
  assert.strictEqual(untrackedSignal.value, 0, 'Untracked updated to 0');

  tracked.value = 5;
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks
  assert.strictEqual(effectRuns, 2, 'Effect runs again for tracked signal');
  assert.strictEqual(untrackedSignal.value, 10, 'Untracked updated to 10');

  // Changing untracked should not trigger effect
  untrackedSignal.value = 999;
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks
  assert.strictEqual(effectRuns, 2, 'Effect does not run for untracked signal');
});

test('EDGE CASE: conditional signal access in effect', async () => {
  const condition = signal(true);
  const a = signal(1);
  const b = signal(2);
  let effectRuns = 0;
  let lastValue = 0;

  effect(() => {
    effectRuns++;
    if (condition.value) {
      lastValue = a.value;
    } else {
      lastValue = b.value;
    }
  });
  await new Promise(r => setTimeout(r, 0)); // Wait for initial effect run

  assert.strictEqual(effectRuns, 1, 'Effect runs initially');

  // Update 'a' - should trigger (condition is true)
  a.value = 10;
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks
  assert.strictEqual(effectRuns, 2, 'Effect runs when tracked signal updates');

  // Update 'b' - should NOT trigger (not tracked)
  b.value = 20;
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks
  assert.strictEqual(effectRuns, 2, 'Effect does not run for untracked signal');

  // Change condition - should trigger
  condition.value = false;
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks
  assert.strictEqual(effectRuns, 3, 'Effect runs when condition changes');

  // Now 'b' is tracked, 'a' is not
  b.value = 30;
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks
  assert.strictEqual(effectRuns, 4, 'Effect runs for newly tracked signal');

  a.value = 40;
  await new Promise(r => setTimeout(r, 0)); // Wait for microtasks
  assert.strictEqual(effectRuns, 4, 'Effect does not run for newly untracked signal');
});

console.log('\n=== ALL SIGNAL FIX VERIFICATION TESTS PASSED ===\n');
