import { signal, effect } from './dist/index.mjs';

console.log('Testing the exact user example:\n');

const count = signal(5);
let executions = 0;

effect(() => {
  executions++;
  console.log('Effect ran:', count.value);
});

count.value = 10;

console.log('\nResult: Effect ran', executions, 'times');
console.log('Expected: 2 times (initial + change)');
console.log(executions === 2 ? 'SUCCESS - Bug is FIXED!' : 'FAIL - Bug still exists');
