// Signal System Tests
import { test } from 'node:test';
import assert from 'node:assert';
import { signal, computed, effect, batch, untrack, root } from '../../packages/flexium/dist/test-exports.mjs';

// ==========================================
// Signal Tests
// ==========================================

test('signal creates reactive value', () => {
  const count = signal(0);
  assert.strictEqual(count.value, 0);
  count.value = 5;
  assert.strictEqual(count.value, 5);
});

test('signal can be called as a function to get value', () => {
  const count = signal(42);
  assert.strictEqual(count(), 42);
});

test('signal.set() updates value', () => {
  const count = signal(10);
  count.set(20);
  assert.strictEqual(count.value, 20);
});

test('signal.peek() reads value without tracking', () => {
  const count = signal(5);
  const peeked = count.peek();
  assert.strictEqual(peeked, 5);
});

test('signal handles different types', () => {
  const str = signal('hello');
  const obj = signal({ name: 'test' });
  const arr = signal([1, 2, 3]);
  const bool = signal(true);

  assert.strictEqual(str.value, 'hello');
  assert.deepStrictEqual(obj.value, { name: 'test' });
  assert.deepStrictEqual(arr.value, [1, 2, 3]);
  assert.strictEqual(bool.value, true);
});

// ==========================================
// Computed Tests
// ==========================================

test('computed derives value from signal', () => {
  const count = signal(5);
  const doubled = computed(() => count.value * 2);
  assert.strictEqual(doubled.value, 10);
});

test('computed updates when dependency changes', () => {
  const count = signal(5);
  const doubled = computed(() => count.value * 2);

  assert.strictEqual(doubled.value, 10);

  count.value = 10;
  assert.strictEqual(doubled.value, 20);
});

test('computed memoizes result', () => {
  let computeCount = 0;
  const count = signal(5);
  const doubled = computed(() => {
    computeCount++;
    return count.value * 2;
  });

  // First access - should compute
  assert.strictEqual(doubled.value, 10);
  assert.strictEqual(computeCount, 1);

  // Second access - should use memoized value
  assert.strictEqual(doubled.value, 10);
  assert.strictEqual(computeCount, 1);

  // Update dependency - should recompute
  count.value = 10;
  assert.strictEqual(doubled.value, 20);
  assert.strictEqual(computeCount, 2);
});

test('computed can be called as a function', () => {
  const count = signal(3);
  const tripled = computed(() => count.value * 3);
  assert.strictEqual(tripled(), 9);
});

test('computed.peek() reads value without tracking', () => {
  const count = signal(7);
  const doubled = computed(() => count.value * 2);
  const peeked = doubled.peek();
  assert.strictEqual(peeked, 14);
});

test('computed chains multiple dependencies', () => {
  const a = signal(2);
  const b = signal(3);
  const sum = computed(() => a.value + b.value);
  const product = computed(() => sum.value * 10);

  assert.strictEqual(product.value, 50);

  a.value = 5;
  assert.strictEqual(product.value, 80);

  b.value = 5;
  assert.strictEqual(product.value, 100);
});

// ==========================================
// Effect Tests
// ==========================================

test('effect runs immediately', () => {
  let runCount = 0;
  effect(() => {
    runCount++;
  });
  assert.strictEqual(runCount, 1);
});

test('effect runs when signal changes', () => {
  const count = signal(0);
  let effectValue = 0;

  effect(() => {
    effectValue = count.value;
  });

  assert.strictEqual(effectValue, 0);

  count.value = 5;
  assert.strictEqual(effectValue, 5);

  count.value = 10;
  assert.strictEqual(effectValue, 10);
});

test('effect tracks multiple signals', () => {
  const a = signal(1);
  const b = signal(2);
  let sum = 0;

  effect(() => {
    sum = a.value + b.value;
  });

  assert.strictEqual(sum, 3);

  a.value = 10;
  assert.strictEqual(sum, 12);

  b.value = 20;
  assert.strictEqual(sum, 30);
});

test('effect runs cleanup function', () => {
  const count = signal(0);
  let cleanupRan = false;

  const dispose = effect(() => {
    const current = count.value;
    return () => {
      cleanupRan = true;
    };
  });

  count.value = 1; // Should run cleanup before next effect
  assert.strictEqual(cleanupRan, true);

  dispose(); // Cleanup should run on dispose
});

test('effect can be disposed', () => {
  const count = signal(0);
  let effectValue = 0;

  const dispose = effect(() => {
    effectValue = count.value;
  });

  assert.strictEqual(effectValue, 0);

  count.value = 5;
  assert.strictEqual(effectValue, 5);

  dispose();

  count.value = 10;
  assert.strictEqual(effectValue, 5); // Should not update after dispose
});

test('effect does not run infinitely', () => {
  const count = signal(0);
  let runCount = 0;

  effect(() => {
    runCount++;
    if (count.value < 3) {
      count.value = count.value + 1; // Write to signal in effect
    }
  });

  // Should stabilize and not run forever
  assert.strictEqual(count.value, 3);
  assert.strictEqual(runCount, 4); // Initial + 3 updates
});

test('effect handles errors with onError handler', () => {
  let errorCaught = null;

  effect(
    () => {
      throw new Error('Test error');
    },
    {
      onError: (error) => {
        errorCaught = error.message;
      },
    }
  );

  assert.strictEqual(errorCaught, 'Test error');
});

// ==========================================
// Batch Tests
// ==========================================

test('batch prevents multiple effect runs', () => {
  const a = signal(1);
  const b = signal(2);
  let runCount = 0;

  effect(() => {
    runCount++;
    const sum = a.value + b.value;
  });

  assert.strictEqual(runCount, 1);

  batch(() => {
    a.value = 10;
    b.value = 20;
  });

  // Effect should only run once after batch
  assert.strictEqual(runCount, 2);
});

test('batch with nested signal updates', () => {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);
  let effectRuns = 0;

  effect(() => {
    effectRuns++;
    const val = doubled.value;
  });

  assert.strictEqual(effectRuns, 1);

  batch(() => {
    count.value = 1;
    count.value = 2;
    count.value = 3;
  });

  // Effect should only run once despite multiple updates
  assert.strictEqual(effectRuns, 2);
  assert.strictEqual(doubled.value, 6);
});

// ==========================================
// Untrack Tests
// ==========================================

test('untrack reads signal without creating dependency', () => {
  const a = signal(1);
  const b = signal(2);
  let sum = 0;

  effect(() => {
    sum = a.value + untrack(() => b.value);
  });

  assert.strictEqual(sum, 3);

  // Changing 'a' should trigger effect
  a.value = 10;
  assert.strictEqual(sum, 12);

  // Changing 'b' should NOT trigger effect (untracked)
  b.value = 20;
  assert.strictEqual(sum, 12);
});

test('untrack returns function result', () => {
  const count = signal(5);
  const result = untrack(() => count.value * 2);
  assert.strictEqual(result, 10);
});

// ==========================================
// Root Tests
// ==========================================

test('root creates disposable scope', () => {
  const count = signal(0);
  let effectValue = 0;

  const cleanup = root((dispose) => {
    effect(() => {
      effectValue = count.value;
    });
    return dispose;
  });

  assert.strictEqual(effectValue, 0);

  count.value = 5;
  assert.strictEqual(effectValue, 5);

  cleanup();

  count.value = 10;
  assert.strictEqual(effectValue, 5); // Should not update after cleanup
});

test('root disposes multiple effects', () => {
  const a = signal(1);
  const b = signal(2);
  let sumValue = 0;
  let productValue = 0;

  const cleanup = root((dispose) => {
    effect(() => {
      sumValue = a.value + b.value;
    });
    effect(() => {
      productValue = a.value * b.value;
    });
    return dispose;
  });

  assert.strictEqual(sumValue, 3);
  assert.strictEqual(productValue, 2);

  a.value = 5;
  assert.strictEqual(sumValue, 7);
  assert.strictEqual(productValue, 10);

  cleanup();

  b.value = 10;
  assert.strictEqual(sumValue, 7); // Should not update
  assert.strictEqual(productValue, 10); // Should not update
});

// ==========================================
// Complex Integration Tests
// ==========================================

test('complex reactive graph', () => {
  const price = signal(10);
  const quantity = signal(2);
  const taxRate = signal(0.1);

  const subtotal = computed(() => price.value * quantity.value);
  const tax = computed(() => subtotal.value * taxRate.value);
  const total = computed(() => subtotal.value + tax.value);

  let lastTotal = 0;
  effect(() => {
    lastTotal = total.value;
  });

  assert.strictEqual(lastTotal, 22); // (10 * 2) + (20 * 0.1)

  price.value = 20;
  assert.strictEqual(lastTotal, 44); // (20 * 2) + (40 * 0.1)

  quantity.value = 3;
  assert.strictEqual(lastTotal, 66); // (20 * 3) + (60 * 0.1)

  taxRate.value = 0.2;
  assert.strictEqual(lastTotal, 72); // (20 * 3) + (60 * 0.2)
});

test('conditional dependencies', () => {
  const showDetails = signal(false);
  const name = signal('John');
  const age = signal(30);
  let result = '';

  effect(() => {
    if (showDetails.value) {
      result = `${name.value} is ${age.value}`;
    } else {
      result = name.value;
    }
  });

  assert.strictEqual(result, 'John');

  // Age change should not trigger effect (not in dependency tree)
  age.value = 35;
  assert.strictEqual(result, 'John');

  // Name change should trigger effect
  name.value = 'Jane';
  assert.strictEqual(result, 'Jane');

  // Enabling details should trigger effect and add age as dependency
  showDetails.value = true;
  assert.strictEqual(result, 'Jane is 35');

  // Now age changes should trigger effect
  age.value = 40;
  assert.strictEqual(result, 'Jane is 40');
});

console.log('\nAll signal tests passed!');
