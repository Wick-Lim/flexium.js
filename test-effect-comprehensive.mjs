import { signal, effect, computed, batch } from './dist/index.mjs';

console.log('=== Comprehensive Effect Testing ===\n');

// Test 1: Basic effect reactivity
console.log('Test 1: Basic effect reactivity');
{
  const count = signal(0);
  let execCount = 0;

  effect(() => {
    execCount++;
    console.log('  Count:', count.value);
  });

  count.value = 1;
  count.value = 2;

  console.log(`  Executions: ${execCount} (expected: 3)`);
  console.log(`  ${execCount === 3 ? 'PASS' : 'FAIL'}\n`);
}

// Test 2: Effect with multiple dependencies
console.log('Test 2: Effect with multiple dependencies');
{
  const firstName = signal('John');
  const lastName = signal('Doe');
  let execCount = 0;

  effect(() => {
    execCount++;
    console.log('  Name:', firstName.value, lastName.value);
  });

  firstName.value = 'Jane';
  lastName.value = 'Smith';

  console.log(`  Executions: ${execCount} (expected: 3)`);
  console.log(`  ${execCount === 3 ? 'PASS' : 'FAIL'}\n`);
}

// Test 3: Effect with computed dependency
console.log('Test 3: Effect with computed dependency');
{
  const count = signal(5);
  const doubled = computed(() => count.value * 2);
  let execCount = 0;

  effect(() => {
    execCount++;
    console.log('  Doubled:', doubled.value);
  });

  count.value = 10;
  count.value = 15;

  console.log(`  Executions: ${execCount} (expected: 3)`);
  console.log(`  ${execCount === 3 ? 'PASS' : 'FAIL'}\n`);
}

// Test 4: Effect with batching
console.log('Test 4: Effect with batching');
{
  const count = signal(0);
  let execCount = 0;

  effect(() => {
    execCount++;
    console.log('  Count:', count.value);
  });

  batch(() => {
    count.value = 1;
    count.value = 2;
    count.value = 3;
  });

  console.log(`  Executions: ${execCount} (expected: 2 - initial + batched)`);
  console.log(`  ${execCount === 2 ? 'PASS' : 'FAIL'}\n`);
}

// Test 5: Effect cleanup
console.log('Test 5: Effect cleanup');
{
  const count = signal(0);
  let execCount = 0;
  let cleanupCount = 0;

  const dispose = effect(() => {
    execCount++;
    console.log('  Effect running, count:', count.value);
    return () => {
      cleanupCount++;
      console.log('  Cleanup called');
    };
  });

  count.value = 1;
  dispose();
  count.value = 2; // Should not trigger effect

  console.log(`  Executions: ${execCount} (expected: 2)`);
  console.log(`  Cleanups: ${cleanupCount} (expected: 2)`);
  console.log(`  ${execCount === 2 && cleanupCount === 2 ? 'PASS' : 'FAIL'}\n`);
}

// Test 6: Nested effects (should not cause infinite loops)
console.log('Test 6: Nested signal reads');
{
  const a = signal(1);
  const b = signal(2);
  let execCount = 0;

  effect(() => {
    execCount++;
    const sum = a.value + b.value;
    console.log('  Sum:', sum);
  });

  a.value = 10;
  b.value = 20;

  console.log(`  Executions: ${execCount} (expected: 3)`);
  console.log(`  ${execCount === 3 ? 'PASS' : 'FAIL'}\n`);
}

// Test 7: Same value assignment (should not trigger)
console.log('Test 7: Same value assignment (should not trigger)');
{
  const count = signal(5);
  let execCount = 0;

  effect(() => {
    execCount++;
    console.log('  Count:', count.value);
  });

  count.value = 5; // Same value
  count.value = 5; // Same value
  count.value = 10; // Different value

  console.log(`  Executions: ${execCount} (expected: 2 - initial + 10)`);
  console.log(`  ${execCount === 2 ? 'PASS' : 'FAIL'}\n`);
}

console.log('=== All Tests Complete ===');
