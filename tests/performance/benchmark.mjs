/**
 * Flexium Performance Benchmarks
 *
 * Run with: node tests/performance/benchmark.mjs
 *
 * Benchmarks:
 * 1. State creation
 * 2. State read/write
 * 3. Computed state creation and access
 * 4. Effect execution
 * 5. Batch updates
 * 6. Large list rendering simulation
 */

import { performance } from 'perf_hooks';

// Import from dist/core.mjs which exports state, effect, batch, root
import { state, effect, batch, root } from '../../packages/flexium/dist/core.mjs';

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

// 1. State Creation
results.push(benchmark('State creation', () => {
    state(0);
}));

// 2. State read
const [readState] = state(42);
results.push(benchmark('State read (function call)', () => {
    const _ = readState();
}));

// 3. State write
const [writeState, setWriteState] = state(0);
let writeCounter = 0;
results.push(benchmark('State write', () => {
    setWriteState(writeCounter++);
}));

// 4. Computed creation
results.push(benchmark('Computed creation', () => {
    const [base] = state(1);
    state(() => base() * 2);
}));

// 5. Computed read (cached)
const [computedBase, setComputedBase] = state(5);
const [computedValue] = state(() => computedBase() * 2);
results.push(benchmark('Computed read (cached)', () => {
    const _ = computedValue();
}));

// 6. Computed with dependency change
const [changingBase, setChangingBase] = state(0);
const [changingComputed] = state(() => changingBase() + 1);
let changeCounter = 0;
results.push(benchmark('Computed with dep change', () => {
    setChangingBase(changeCounter++);
    const _ = changingComputed();
}, 5000));

// 7. Effect creation (in root scope)
results.push(benchmark('Effect creation', () => {
    root((dispose) => {
        const [s] = state(0);
        effect(() => { const _ = s(); });
        dispose();
    });
}, 1000));

// 8. Effect trigger
let setEffectTrigger;
let effectRunCount = 0;
root(() => {
    const [trigger, setTrigger] = state(0);
    setEffectTrigger = setTrigger;
    effect(() => {
        const _ = trigger();
        effectRunCount++;
    });
});
results.push(benchmark('Effect trigger', () => {
    setEffectTrigger(c => c + 1);
}, 5000));

// 9. Batch updates
const batchStates = Array.from({ length: 10 }, () => state(0));
let batchCounter = 0;
results.push(benchmark('Batch update (10 states)', () => {
    batch(() => {
        for (const [_, set] of batchStates) {
            set(batchCounter);
        }
        batchCounter++;
    });
}, 1000));

// 10. Deep computed chain
const [chainBase] = state(1);
let [chainEnd] = [chainBase];
for (let i = 0; i < 10; i++) {
    const prev = chainEnd;
    [chainEnd] = state(() => prev() + 1);
}
results.push(benchmark('Deep computed chain (10 levels) read', () => {
    const _ = chainEnd();
}));

// 11. Many states update
const manyStates = Array.from({ length: 100 }, () => state(0));
let manyCounter = 0;
results.push(benchmark('Update 100 states', () => {
    for (const [_, set] of manyStates) {
        set(manyCounter);
    }
    manyCounter++;
}, 1000));

// Print results
printResults(results);

// Summary
console.log('📈 Performance Summary:');
console.log(`   - State creation: ${results[0].opsPerSec.toLocaleString()} ops/sec`);
console.log(`   - State read: ${results[1].opsPerSec.toLocaleString()} ops/sec`);
console.log(`   - State write: ${results[2].opsPerSec.toLocaleString()} ops/sec`);
console.log(`   - Computed read: ${results[4].opsPerSec.toLocaleString()} ops/sec`);
console.log('');
