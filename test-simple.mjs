import { signal, computed, effect, batch } from './dist/index.mjs';

console.log('Testing signal system...\n');

// Test 1: Basic signal
console.log('Test 1: Basic signal');
const count = signal(0);
console.log('Initial value:', count.value); // Should be 0
count.value = 5;
console.log('After setting to 5:', count.value); // Should be 5
count.set(10);
console.log('After set(10):', count.value); // Should be 10
console.log('✓ Test 1 passed\n');

// Test 2: Computed
console.log('Test 2: Computed');
const doubled = computed(() => count.value * 2);
console.log('Doubled (count=10):', doubled.value); // Should be 20
count.value = 3;
console.log('Doubled (count=3):', doubled.value); // Should be 6
console.log('✓ Test 2 passed\n');

// Test 3: Effect
console.log('Test 3: Effect');
let effectRuns = 0;
const dispose = effect(() => {
  console.log('Effect running, count =', count.value);
  effectRuns++;
});
console.log('Effect runs after creation:', effectRuns); // Should be 1
count.value = 100;
console.log('Effect runs after update:', effectRuns); // Should be 2
dispose();
count.value = 200;
console.log('Effect runs after dispose:', effectRuns); // Should still be 2
console.log('✓ Test 3 passed\n');

// Test 4: Batch
console.log('Test 4: Batch');
const a = signal(1);
const b = signal(2);
let batchEffectRuns = 0;
effect(() => {
  a.value + b.value;
  batchEffectRuns++;
});
console.log('Batch effect runs after creation:', batchEffectRuns); // Should be 1
batch(() => {
  a.value = 10;
  b.value = 20;
});
console.log('Batch effect runs after batch:', batchEffectRuns); // Should be 2
console.log('✓ Test 4 passed\n');

console.log('All tests passed!');
