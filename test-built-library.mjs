#!/usr/bin/env node
/**
 * Direct test of the built library (dist/index.mjs)
 * Tests that the signal fix works in the actual built output
 */

import { signal, computed, effect, batch } from './dist/index.mjs';

console.log('Testing built library: ./dist/index.mjs\n');

// Test 1: The critical bug - effect writing to signal
console.log('Test 1: Effect writing to signal (the bug that was fixed)');
const count = signal(0);
let runCount = 0;

effect(() => {
  runCount++;
  console.log(`  Effect run #${runCount}, count = ${count.value}`);

  if (runCount > 10) {
    console.error('  ❌ FAIL: Infinite loop detected!');
    process.exit(1);
  }

  if (count.value < 3) {
    count.value = count.value + 1;
  }
});

if (runCount === 4 && count.value === 3) {
  console.log(`  ✅ PASS: Stabilized after ${runCount} runs, count = ${count.value}\n`);
} else {
  console.error(`  ❌ FAIL: Expected 4 runs and count=3, got ${runCount} runs and count=${count.value}\n`);
  process.exit(1);
}

// Test 2: Basic reactivity
console.log('Test 2: Basic signal reactivity');
const name = signal('Flexium');
let effectValue = '';

effect(() => {
  effectValue = `Hello, ${name.value}!`;
});

if (effectValue === 'Hello, Flexium!') {
  console.log('  ✅ PASS: Initial effect value correct');
} else {
  console.error('  ❌ FAIL: Initial effect value incorrect');
  process.exit(1);
}

name.value = 'World';
if (effectValue === 'Hello, World!') {
  console.log('  ✅ PASS: Effect updated correctly\n');
} else {
  console.error('  ❌ FAIL: Effect did not update');
  process.exit(1);
}

// Test 3: Computed values
console.log('Test 3: Computed values');
const price = signal(10);
const quantity = signal(2);
const total = computed(() => price.value * quantity.value);

if (total.value === 20) {
  console.log('  ✅ PASS: Computed value correct');
} else {
  console.error('  ❌ FAIL: Computed value incorrect');
  process.exit(1);
}

price.value = 15;
if (total.value === 30) {
  console.log('  ✅ PASS: Computed updated correctly\n');
} else {
  console.error('  ❌ FAIL: Computed did not update');
  process.exit(1);
}

// Test 4: Memoization
console.log('Test 4: Computed memoization');
const source = signal(5);
let computeCount = 0;
const doubled = computed(() => {
  computeCount++;
  return source.value * 2;
});

const val1 = doubled.value;
const val2 = doubled.value;
const val3 = doubled.value;

if (computeCount === 1) {
  console.log('  ✅ PASS: Computed only ran once (memoized)\n');
} else {
  console.error(`  ❌ FAIL: Computed ran ${computeCount} times instead of 1`);
  process.exit(1);
}

// Test 5: Batch updates
console.log('Test 5: Batch updates');
const a = signal(1);
const b = signal(2);
let batchEffectRuns = 0;

effect(() => {
  batchEffectRuns++;
  const sum = a.value + b.value;
});

const runsBeforeBatch = batchEffectRuns;

batch(() => {
  a.value = 10;
  b.value = 20;
});

if (batchEffectRuns === runsBeforeBatch + 1) {
  console.log('  ✅ PASS: Batch prevented multiple runs\n');
} else {
  console.error(`  ❌ FAIL: Effect ran ${batchEffectRuns - runsBeforeBatch} times instead of 1`);
  process.exit(1);
}

// Test 6: Cleanup
console.log('Test 6: Effect cleanup');
const cleanupSignal = signal(0);
let cleanupRan = false;

const dispose = effect(() => {
  const val = cleanupSignal.value;
  return () => {
    cleanupRan = true;
  };
});

cleanupSignal.value = 1;
if (cleanupRan) {
  console.log('  ✅ PASS: Cleanup ran on re-run\n');
} else {
  console.error('  ❌ FAIL: Cleanup did not run');
  process.exit(1);
}

// Test 7: Disposal
console.log('Test 7: Effect disposal');
const disposeSignal = signal(0);
let disposeEffectRuns = 0;

const disposer = effect(() => {
  disposeEffectRuns++;
  const val = disposeSignal.value;
});

const runsBeforeDispose = disposeEffectRuns;
disposer();
disposeSignal.value = 100;

if (disposeEffectRuns === runsBeforeDispose) {
  console.log('  ✅ PASS: Effect did not run after disposal\n');
} else {
  console.error('  ❌ FAIL: Effect ran after disposal');
  process.exit(1);
}

// Final summary
console.log('='.repeat(60));
console.log('ALL TESTS PASSED! ✅');
console.log('='.repeat(60));
console.log('');
console.log('Summary:');
console.log('  ✅ Signal infinite loop bug is FIXED');
console.log('  ✅ Basic reactivity works');
console.log('  ✅ Computed values work');
console.log('  ✅ Memoization works');
console.log('  ✅ Batch updates work');
console.log('  ✅ Effect cleanup works');
console.log('  ✅ Effect disposal works');
console.log('');
console.log('The built library (dist/index.mjs) is working correctly!');
