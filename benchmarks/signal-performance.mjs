/**
 * Flexium Signal Performance Benchmarks
 *
 * Tests:
 * 1. Signal creation time
 * 2. Signal update propagation speed
 * 3. Computed recalculation
 * 4. Effect execution
 * 5. Batch operations
 * 6. Large-scale signal graphs
 */

import { signal, computed, effect, batch, untrack } from '../dist/index.mjs';

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

// Utility functions
function formatTime(ms) {
  if (ms < 0.001) return `${(ms * 1000000).toFixed(2)}ns`;
  if (ms < 1) return `${(ms * 1000).toFixed(2)}µs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatOps(ops) {
  if (ops > 1000000) return `${(ops / 1000000).toFixed(2)}M ops/s`;
  if (ops > 1000) return `${(ops / 1000).toFixed(2)}K ops/s`;
  return `${ops.toFixed(2)} ops/s`;
}

function benchmark(name, fn, iterations = 1000) {
  // Warmup
  for (let i = 0; i < Math.min(100, iterations / 10); i++) {
    fn();
  }

  // Measure
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();

  const totalTime = end - start;
  const avgTime = totalTime / iterations;
  const opsPerSec = 1000 / avgTime;

  return {
    name,
    totalTime,
    avgTime,
    opsPerSec,
    iterations
  };
}

function printResult(result) {
  console.log(`  ${colors.cyan}${result.name}${colors.reset}`);
  console.log(`    Time: ${colors.green}${formatTime(result.avgTime)}${colors.reset} per operation`);
  console.log(`    Throughput: ${colors.yellow}${formatOps(result.opsPerSec)}${colors.reset}`);
  console.log(`    Total: ${formatTime(result.totalTime)} for ${result.iterations} iterations`);
  console.log();
}

function printHeader(title) {
  console.log();
  console.log(`${colors.bright}${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}  ${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.blue}${'='.repeat(70)}${colors.reset}`);
  console.log();
}

function drawBar(value, max, width = 40) {
  const filled = Math.round((value / max) * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return `${colors.green}${bar}${colors.reset}`;
}

// Benchmark Suite
const results = [];

// 1. Signal Creation
printHeader('1. Signal Creation Performance');

let testSignal;
const createResult = benchmark('Create signal', () => {
  testSignal = signal(0);
}, 10000);
results.push(createResult);
printResult(createResult);

// 2. Signal Updates
printHeader('2. Signal Update Performance');

const updateSignal = signal(0);
const updateResult = benchmark('Update signal', () => {
  updateSignal.value++;
}, 100000);
results.push(updateResult);
printResult(updateResult);

// 3. Signal Read
printHeader('3. Signal Read Performance');

const readSignal = signal(42);
let value;
const readResult = benchmark('Read signal', () => {
  value = readSignal.value;
}, 100000);
results.push(readResult);
printResult(readResult);

// 4. Computed Creation
printHeader('4. Computed Signal Performance');

const computedBase = signal(10);
const computedResult = benchmark('Create computed', () => {
  const c = computed(() => computedBase.value * 2);
  c.value; // Force evaluation
}, 10000);
results.push(computedResult);
printResult(computedResult);

// 5. Computed Recalculation
printHeader('5. Computed Recalculation Performance');

const computedSignal = signal(0);
const computedValue = computed(() => computedSignal.value * 2);
const recalcResult = benchmark('Recompute', () => {
  computedSignal.value++;
  const v = computedValue.value;
}, 10000);
results.push(recalcResult);
printResult(recalcResult);

// 6. Effect Creation and Execution
printHeader('6. Effect Performance');

let effectCount = 0;
const effectSignal = signal(0);
const effectResult = benchmark('Effect execution', () => {
  const dispose = effect(() => {
    effectCount = effectSignal.value;
  });
  effectSignal.value++;
  dispose();
}, 5000);
results.push(effectResult);
printResult(effectResult);

// 7. Batch Operations
printHeader('7. Batch Operations Performance');

const batchSignals = Array.from({ length: 10 }, () => signal(0));
let batchEffectRuns = 0;
const batchDispose = effect(() => {
  batchSignals.forEach(s => s.value);
  batchEffectRuns++;
});

const batchResult = benchmark('Batch 10 updates', () => {
  batch(() => {
    batchSignals.forEach(s => s.value++);
  });
}, 5000);
batchDispose();
results.push(batchResult);
printResult(batchResult);

// 8. Diamond Dependency Pattern
printHeader('8. Diamond Dependency Pattern');

const root = signal(0);
const left = computed(() => root.value * 2);
const right = computed(() => root.value * 3);
const diamond = computed(() => left.value + right.value);
let diamondEffectRuns = 0;
const diamondDispose = effect(() => {
  diamond.value;
  diamondEffectRuns++;
});

const diamondResult = benchmark('Diamond update', () => {
  root.value++;
}, 10000);
diamondDispose();
results.push(diamondResult);
printResult(diamondResult);

console.log(`${colors.dim}Diamond effect ran ${diamondEffectRuns} times (should be close to iterations + 1)${colors.reset}`);
console.log();

// 9. Chain of Computeds
printHeader('9. Chain of 10 Computed Signals');

const chainBase = signal(0);
let chainComputed = computed(() => chainBase.value);
for (let i = 0; i < 9; i++) {
  const prev = chainComputed;
  chainComputed = computed(() => prev.value + 1);
}

const chainResult = benchmark('Update chain', () => {
  chainBase.value++;
  chainComputed.value;
}, 5000);
results.push(chainResult);
printResult(chainResult);

// 10. Wide Dependencies (100 signals)
printHeader('10. Wide Dependencies (100 Signals)');

const wideSignals = Array.from({ length: 100 }, () => signal(0));
const wideComputed = computed(() => {
  return wideSignals.reduce((sum, s) => sum + s.value, 0);
});

const wideResult = benchmark('Update 1 of 100', () => {
  wideSignals[50].value++;
  wideComputed.value;
}, 5000);
results.push(wideResult);
printResult(wideResult);

// 11. Memory Pressure (1000 signals)
printHeader('11. Memory Test (1000 Signals)');

const memoryResult = benchmark('Create 1000 signals', () => {
  const signals = Array.from({ length: 1000 }, (_, i) => signal(i));
  const sum = computed(() => signals.reduce((acc, s) => acc + s.value, 0));
  sum.value; // Force evaluation
}, 100);
results.push(memoryResult);
printResult(memoryResult);

// 12. Stress Test (10000 updates)
printHeader('12. Stress Test (10000 Updates)');

const stressSignal = signal(0);
const stressComputed = computed(() => stressSignal.value * 2);
let stressEffectRuns = 0;
const stressDispose = effect(() => {
  stressComputed.value;
  stressEffectRuns++;
});

console.log(`  Starting stress test with 10000 updates...`);
const stressStart = performance.now();
for (let i = 0; i < 10000; i++) {
  stressSignal.value = i;
}
const stressEnd = performance.now();
stressDispose();

const stressTime = stressEnd - stressStart;
const stressResult = {
  name: '10000 updates',
  totalTime: stressTime,
  avgTime: stressTime / 10000,
  opsPerSec: 10000 / (stressTime / 1000),
  iterations: 10000
};
results.push(stressResult);
printResult(stressResult);

console.log(`${colors.dim}Stress effect ran ${stressEffectRuns} times${colors.reset}`);
console.log();

// 13. Untrack Performance
printHeader('13. Untrack Performance');

const untrackSignal = signal(0);
let untrackValue;
const untrackResult = benchmark('Untrack read', () => {
  untrack(() => {
    untrackValue = untrackSignal.value;
  });
}, 50000);
results.push(untrackResult);
printResult(untrackResult);

// Summary
printHeader('Performance Summary');

const sortedResults = [...results].sort((a, b) => b.opsPerSec - a.opsPerSec);
const maxOps = sortedResults[0].opsPerSec;

console.log(`${colors.bright}Top 5 Fastest Operations:${colors.reset}\n`);
sortedResults.slice(0, 5).forEach((result, i) => {
  console.log(`  ${i + 1}. ${colors.cyan}${result.name}${colors.reset}`);
  console.log(`     ${drawBar(result.opsPerSec, maxOps)} ${colors.yellow}${formatOps(result.opsPerSec)}${colors.reset}`);
  console.log();
});

console.log(`${colors.bright}Average Performance:${colors.reset}\n`);
const avgOps = results.reduce((sum, r) => sum + r.opsPerSec, 0) / results.length;
console.log(`  ${colors.yellow}${formatOps(avgOps)}${colors.reset}`);
console.log();

// Key Metrics
printHeader('Key Performance Indicators');

const keyMetrics = {
  'Signal Creation': createResult,
  'Signal Update': updateResult,
  'Computed Recalculation': recalcResult,
  'Effect Execution': effectResult,
  'Batch Operations': batchResult,
};

console.log(`${colors.bright}Critical Operations:${colors.reset}\n`);
Object.entries(keyMetrics).forEach(([name, result]) => {
  const status = result.avgTime < 0.01 ? '✓' : result.avgTime < 0.1 ? '⚠' : '✗';
  const color = result.avgTime < 0.01 ? colors.green : result.avgTime < 0.1 ? colors.yellow : colors.red;
  console.log(`  ${color}${status} ${name}: ${formatTime(result.avgTime)}${colors.reset}`);
});
console.log();

// Performance Grade
const avgTime = results.reduce((sum, r) => sum + r.avgTime, 0) / results.length;
let grade, gradeColor;
if (avgTime < 0.01) {
  grade = 'A+';
  gradeColor = colors.green;
} else if (avgTime < 0.05) {
  grade = 'A';
  gradeColor = colors.green;
} else if (avgTime < 0.1) {
  grade = 'B';
  gradeColor = colors.yellow;
} else if (avgTime < 0.5) {
  grade = 'C';
  gradeColor = colors.yellow;
} else {
  grade = 'D';
  gradeColor = colors.red;
}

console.log(`${colors.bright}Overall Performance Grade: ${gradeColor}${grade}${colors.reset}\n`);

console.log(`${colors.dim}Benchmark completed at ${new Date().toISOString()}${colors.reset}`);
console.log(`${colors.dim}Node.js ${process.version}${colors.reset}`);
console.log();
