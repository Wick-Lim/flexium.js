import { state, effect, batch } from '../../packages/flexium/dist/index.mjs';
import { performance } from 'perf_hooks';

console.log('=== Flexium Reactivity Benchmark ===\n');

function bench(name, fn, count) {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    const opsPerSec = count / (duration / 1000);
    console.log(`${name}:`);
    console.log(`  Duration: ${duration.toFixed(2)}ms`);
    console.log(`  Ops/Sec:  ${Math.floor(opsPerSec).toLocaleString()}`);
    console.log(`  Per Op:   ${(duration / count).toFixed(4)}ms\n`);
}

// 1. Creation Cost
const COUNT = 50000;
const signals = [];

bench(`Create ${COUNT.toLocaleString()} state signals`, () => {
    for (let i = 0; i < COUNT; i++) {
        signals.push(state(i));
    }
}, COUNT);

// 2. Read Cost (Dependency Tracking)
// We simulate reading inside an effect
bench(`Read ${COUNT.toLocaleString()} signals (Dependency Tracking)`, () => {
    // Creating one effect that reads all signals is unrealistic and heavy on memory for dependency sets
    // Instead, we read in chunks or just verify access time
    
    // Flexium lazily creates dependency sets. 
    // Let's measure simple read access first (getter call)
    for (let i = 0; i < COUNT; i++) {
        const [getter] = signals[i];
        getter(); 
    }
}, COUNT);

// 3. Update Cost
bench(`Update ${COUNT.toLocaleString()} signals`, () => {
    for (let i = 0; i < COUNT; i++) {
        const [, setter] = signals[i];
        setter(i + 1);
    }
}, COUNT);

// 4. Computed/Effect Chain Performance
// Create a chain: A -> B -> C -> D
// Update A, check D
const CHAIN_DEPTH = 1000;
const [startState, setStart] = state(0);
let currentGetter = startState;

console.log(`Building reactive chain of depth ${CHAIN_DEPTH}...`);
// Build chain
for(let i = 0; i < CHAIN_DEPTH; i++) {
    const prev = currentGetter;
    const [next] = state(() => prev() + 1); // Derived state
    currentGetter = next;
}

bench(`Update Chain Start (Depth ${CHAIN_DEPTH})`, () => {
    setStart(v => v + 1);
    // Force read end to ensure propagation (pull-based)
    const val = currentGetter();
}, 1); // Single operation, but heavy

// 5. Memory Usage (Approximate)
const used = process.memoryUsage().heapUsed / 1024 / 1024;
console.log(`Approx Memory Usage: ${used.toFixed(2)} MB`);
