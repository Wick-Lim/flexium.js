import { signal, effect } from './dist/index.mjs';

console.log('Testing effect infinite loop bug...\n');

const count = signal(5);
let executionCount = 0;

const dispose = effect(() => {
  executionCount++;
  console.log('Effect ran:', count.value, '(execution #' + executionCount + ')');

  // Safety: stop after 10 executions to prevent actual infinite loop
  if (executionCount > 10) {
    console.log('\n!!! INFINITE LOOP DETECTED - Stopping test !!!');
    dispose();
  }
});

console.log('\nSetting count to 10...');
count.value = 10;

console.log('\nExpected: 2 executions (initial + 1 change)');
console.log('Actual:', executionCount, 'executions');
