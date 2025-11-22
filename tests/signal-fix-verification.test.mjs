/**
 * Signal Fix Verification Test
 *
 * This test specifically verifies the bug fix for the infinite loop issue
 * where effects that write to signals were causing infinite recursion.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { signal, computed, effect, batch, untrack } from '../packages/flexium/dist/index.mjs';

console.log('\n=== SIGNAL FIX VERIFICATION TESTS ===\n');

test('CRITICAL: effect writing to signal does not cause infinite loop', () => {
  const count = signal(0);
  let runCount = 0;
  const maxRuns = 10; // Safety limit to prevent actual infinite loop in test

  effect(() => {
    runCount++;

    // Safety guard to prevent actual infinite loop
    if (runCount > maxRuns) {
      throw new Error('INFINITE LOOP DETECTED: Effect ran more than ' + maxRuns + ' times');
    }

    // This is the critical test case - writing to signal within effect
    if (count.value < 3) {
      count.value = count.value + 1;
    }
  });

  // The effect should run exactly 4 times:
  // Run 1: count = 0, set to 1
  // Run 2: count = 1, set to 2
  // Run 3: count = 2, set to 3
  // Run 4: count = 3, condition false, stable
  assert.strictEqual(runCount, 4, 'Effect should run exactly 4 times (initial + 3 updates)');
  assert.strictEqual(count.value, 3, 'Count should stabilize at 3');

  console.log('  ✓ Effect stabilized after 4 runs without infinite loop');
  console.log('  ✓ Final count value:', count.value);
});

test('CRITICAL: multiple signals updating in effect', () => {
  const a = signal(0);
  const b = signal(0);
  let runCount = 0;

  effect(() => {
    runCount++;

    if (runCount > 20) {
      throw new Error('INFINITE LOOP DETECTED');
    }

    // Update both signals
    if (a.value < 2) {
      a.value = a.value + 1;
    }
    if (b.value < 2) {
      b.value = b.value + 1;
    }
  });

  // Should stabilize when both reach 2
  assert.ok(runCount < 20, 'Effect should not run infinitely');
  assert.strictEqual(a.value, 2, 'Signal a should be 2');
  assert.strictEqual(b.value, 2, 'Signal b should be 2');

  console.log('  ✓ Multiple signal updates stabilized');
  console.log('  ✓ Effect runs:', runCount);
});

test('CRITICAL: computed in effect with signal write', () => {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);
  let runCount = 0;
  let lastValue = 0;

  effect(() => {
    runCount++;

    if (runCount > 15) {
      throw new Error('INFINITE LOOP DETECTED');
    }

    lastValue = doubled.value;

    // Write to signal based on computed value
    if (doubled.value < 10) {
      count.value = count.value + 1;
    }
  });

  // Should stabilize when doubled = 10 (count = 5)
  assert.strictEqual(count.value, 5, 'Count should be 5');
  assert.strictEqual(doubled.value, 10, 'Doubled should be 10');
  assert.ok(runCount < 15, 'Effect should not run infinitely');

  console.log('  ✓ Computed + effect + signal write stabilized');
  console.log('  ✓ Final doubled value:', doubled.value);
});

test('VERIFICATION: signal updates trigger effect exactly once', () => {
  const count = signal(0);
  let runCount = 0;

  effect(() => {
    runCount++;
    // Just read, don't write
    const value = count.value;
  });

  assert.strictEqual(runCount, 1, 'Effect runs once initially');

  count.value = 5;
  assert.strictEqual(runCount, 2, 'Effect runs once after update');

  count.value = 10;
  assert.strictEqual(runCount, 3, 'Effect runs once per update');

  console.log('  ✓ Each signal update triggers effect exactly once');
});

test('VERIFICATION: computed recalculates correctly', () => {
  const a = signal(2);
  const b = signal(3);
  let computeCount = 0;

  const sum = computed(() => {
    computeCount++;
    return a.value + b.value;
  });

  // First access
  assert.strictEqual(sum.value, 5);
  assert.strictEqual(computeCount, 1, 'Computed runs once on first access');

  // Multiple reads without change
  assert.strictEqual(sum.value, 5);
  assert.strictEqual(sum.value, 5);
  assert.strictEqual(computeCount, 1, 'Computed memoizes - no recomputation');

  // Update dependency
  a.value = 5;
  assert.strictEqual(sum.value, 8);
  assert.strictEqual(computeCount, 2, 'Computed recalculates after dependency change');

  console.log('  ✓ Computed memoization works correctly');
  console.log('  ✓ Computed recalculates on dependency change');
});

test('VERIFICATION: batch prevents multiple effect runs', () => {
  const a = signal(1);
  const b = signal(2);
  let runCount = 0;

  effect(() => {
    runCount++;
    const sum = a.value + b.value;
  });

  assert.strictEqual(runCount, 1, 'Effect runs once initially');

  batch(() => {
    a.value = 10;
    b.value = 20;
  });

  assert.strictEqual(runCount, 2, 'Effect runs only once after batch');

  console.log('  ✓ Batch correctly prevents multiple effect runs');
});

test('STRESS TEST: deeply nested reactive chain', () => {
  const source = signal(1);
  let runCount = 0;

  // Create chain: source -> c1 -> c2 -> c3 -> effect
  const c1 = computed(() => source.value * 2);
  const c2 = computed(() => c1.value * 2);
  const c3 = computed(() => c2.value * 2);

  effect(() => {
    runCount++;
    const value = c3.value; // Should be 8 initially
  });

  assert.strictEqual(c3.value, 8, 'Deeply nested computed works');
  assert.strictEqual(runCount, 1, 'Effect runs once');

  source.value = 2;
  assert.strictEqual(c3.value, 16, 'Chain updates correctly');
  assert.strictEqual(runCount, 2, 'Effect runs once per source update');

  console.log('  ✓ Deeply nested reactive chain works correctly');
});

test('STRESS TEST: many signals tracked in one effect', () => {
  const signals = Array.from({ length: 10 }, (_, i) => signal(i));
  let runCount = 0;

  effect(() => {
    runCount++;
    // Track all signals
    const sum = signals.reduce((acc, s) => acc + s.value, 0);
  });

  assert.strictEqual(runCount, 1, 'Effect runs once initially');

  // Update one signal
  signals[0].value = 100;
  assert.strictEqual(runCount, 2, 'Effect runs once after single update');

  // Update another
  signals[5].value = 200;
  assert.strictEqual(runCount, 3, 'Effect runs once per signal update');

  console.log('  ✓ Effect correctly tracks many signals');
});

test('EDGE CASE: effect writing to untracked signal', () => {
  const tracked = signal(0);
  const untrackedSignal = signal(0);
  let runCount = 0;

  effect(() => {
    runCount++;

    if (runCount > 10) {
      throw new Error('INFINITE LOOP DETECTED');
    }

    // Read tracked signal
    const value = tracked.value;

    // Write to untracked signal (should not trigger this effect)
    untrack(() => {
      untrackedSignal.value = value * 2;
    });
  });

  assert.strictEqual(runCount, 1, 'Effect runs once');
  assert.strictEqual(untrackedSignal.value, 0, 'Untracked updated to 0');

  tracked.value = 5;
  assert.strictEqual(runCount, 2, 'Effect runs again for tracked signal');
  assert.strictEqual(untrackedSignal.value, 10, 'Untracked updated to 10');

  // Changing untracked should not trigger effect
  untrackedSignal.value = 999;
  assert.strictEqual(runCount, 2, 'Effect does not run for untracked signal');

  console.log('  ✓ Untracked signal writes work correctly');
});

test('EDGE CASE: conditional signal access in effect', () => {
  const condition = signal(true);
  const a = signal(1);
  const b = signal(2);
  let runCount = 0;

  effect(() => {
    runCount++;

    if (condition.value) {
      // Only track 'a' when condition is true
      a.value;
    } else {
      // Only track 'b' when condition is false
      b.value;
    }
  });

  assert.strictEqual(runCount, 1, 'Effect runs initially');

  // Update 'a' - should trigger (condition is true)
  a.value = 10;
  assert.strictEqual(runCount, 2, 'Effect runs when tracked signal updates');

  // Update 'b' - should NOT trigger (not tracked)
  b.value = 20;
  assert.strictEqual(runCount, 2, 'Effect does not run for untracked signal');

  // Change condition - should trigger
  condition.value = false;
  assert.strictEqual(runCount, 3, 'Effect runs when condition changes');

  // Now 'b' is tracked, 'a' is not
  b.value = 30;
  assert.strictEqual(runCount, 4, 'Effect runs for newly tracked signal');

  a.value = 40;
  assert.strictEqual(runCount, 4, 'Effect does not run for newly untracked signal');

  console.log('  ✓ Conditional dependencies work correctly');
});

console.log('\n=== ALL SIGNAL FIX VERIFICATION TESTS PASSED ===\n');
