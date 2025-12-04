/**
 * Flexium Performance Benchmarks
 *
 * Run with: node tests/performance/benchmark.mjs
 *
 * Benchmarks:
 * 1. Signal creation
 * 2. Signal read/write
 * 3. Computed value creation and access
 * 4. Effect execution
 * 5. Batch updates
 * 6. Large list rendering simulation
 */

import { performance } from 'perf_hooks';

// Import from dist
import { signal, computed, effect, batch, root } from '../../packages/flexium/dist/index.mjs';

const ITERATIONS = 10000;
const WARMUP = 1000;

/**
 * Run a benchmark and return results
 */
function benchmark(name, fn, iterations = ITERATIONS) {
    // Warmup
    for (let i = 0; i < WARMUP; i++) {
        fn();
    }

    // Actual benchmark
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    const end = performance.now();

    const totalMs = end - start;
    const avgMs = totalMs / iterations;
    const opsPerSec = Math.round(1000 / avgMs);

    return {
        name,
        iterations,
        totalMs: totalMs.toFixed(2),
        avgMs: avgMs.toFixed(4),
        opsPerSec
    };
}

/**
 * Format results as table
 */
function printResults(results) {
    console.log('\n📊 Benchmark Results\n');
    console.log('| Benchmark | Iterations | Total (ms) | Avg (ms) | Ops/sec |');
    console.log('|-----------|------------|------------|----------|---------|');

    for (const r of results) {
        console.log(`| ${r.name.padEnd(35)} | ${String(r.iterations).padStart(10)} | ${r.totalMs.padStart(10)} | ${r.avgMs.padStart(8)} | ${String(r.opsPerSec).padStart(7)} |`);
    }
    console.log('');
}

// Run benchmarks
const results = [];

console.log('🚀 Running Flexium Performance Benchmarks...\n');

// 1. Signal Creation
results.push(benchmark('Signal creation', () => {
    signal(0);
}));

// 2. Signal read
const readSignal = signal(42);
results.push(benchmark('Signal read (value property)', () => {
    const _ = readSignal.value;
}));

results.push(benchmark('Signal read (function call)', () => {
    const _ = readSignal();
}));

// 3. Signal write
const writeSignal = signal(0);
let writeCounter = 0;
results.push(benchmark('Signal write', () => {
    writeSignal.value = writeCounter++;
}));

// 4. Signal peek (no tracking)
const peekSignal = signal(100);
results.push(benchmark('Signal peek', () => {
    const _ = peekSignal.peek();
}));

// 5. Computed creation
results.push(benchmark('Computed creation', () => {
    const base = signal(1);
    computed(() => base.value * 2);
}));

// 6. Computed read (cached)
const computedBase = signal(5);
const computedValue = computed(() => computedBase.value * 2);
results.push(benchmark('Computed read (cached)', () => {
    const _ = computedValue.value;
}));

// 7. Computed with dependency change
const changingBase = signal(0);
const changingComputed = computed(() => changingBase.value + 1);
let changeCounter = 0;
results.push(benchmark('Computed with dep change', () => {
    changingBase.value = changeCounter++;
    const _ = changingComputed.value;
}, 5000));

// 8. Effect creation (in root scope)
results.push(benchmark('Effect creation', () => {
    root((dispose) => {
        const s = signal(0);
        effect(() => { const _ = s.value; });
        dispose();
    });
}, 1000));

// 9. Effect trigger
let effectTriggerSignal;
let effectRunCount = 0;
root(() => {
    effectTriggerSignal = signal(0);
    effect(() => {
        const _ = effectTriggerSignal.value;
        effectRunCount++;
    });
});
results.push(benchmark('Effect trigger', () => {
    effectTriggerSignal.value++;
}, 5000));

// 10. Batch updates
const batchSignals = Array.from({ length: 10 }, () => signal(0));
let batchCounter = 0;
results.push(benchmark('Batch update (10 signals)', () => {
    batch(() => {
        for (const s of batchSignals) {
            s.value = batchCounter;
        }
        batchCounter++;
    });
}, 1000));

// 11. Deep computed chain
const chainBase = signal(1);
let chainEnd = chainBase;
for (let i = 0; i < 10; i++) {
    const prev = chainEnd;
    chainEnd = computed(() => prev.value + 1);
}
results.push(benchmark('Deep computed chain (10 levels) read', () => {
    const _ = chainEnd.value;
}));

// 12. Many signals update
const manySignals = Array.from({ length: 100 }, () => signal(0));
let manyCounter = 0;
results.push(benchmark('Update 100 signals', () => {
    for (const s of manySignals) {
        s.value = manyCounter;
    }
    manyCounter++;
}, 1000));

// 13. Diamond dependency pattern
const diamondRoot = signal(1);
const diamondLeft = computed(() => diamondRoot.value * 2);
const diamondRight = computed(() => diamondRoot.value * 3);
const diamondBottom = computed(() => diamondLeft.value + diamondRight.value);
let diamondCounter = 0;
results.push(benchmark('Diamond dependency update', () => {
    diamondRoot.value = diamondCounter++;
    const _ = diamondBottom.value;
}, 5000));

// Print results
printResults(results);

// Summary
console.log('📈 Performance Summary:');
console.log(`   - Signal creation: ${results[0].opsPerSec.toLocaleString()} ops/sec`);
console.log(`   - Signal read: ${results[1].opsPerSec.toLocaleString()} ops/sec`);
console.log(`   - Signal write: ${results[3].opsPerSec.toLocaleString()} ops/sec`);
console.log(`   - Computed read: ${results[6].opsPerSec.toLocaleString()} ops/sec`);
console.log('');
