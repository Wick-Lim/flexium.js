# Flexium Performance Comparison

> Benchmarked on 2025-12-05

## Summary

| Metric | Flexium | React | Vue 3 | Solid.js | Best |
|--------|---------|-------|-------|----------|------|
| State Creation | **1.9M** | 450K | 520K | 1.8M | flexium |
| State Update | **13.1M** | 180K | 450K | 1.5M | flexium |
| Computed Read | **47.6M** | 350K | 400K | 1.2M | flexium |
| Effect Creation | **3.0M** | 120K | 280K | 800K | flexium |
| Batch Update (10) | **1.4M** | 45K | 180K | 450K | flexium |
| Deep Chain (10) | **861K** | 25K | 65K | 280K | flexium |
| Bundle Size | **8.6 KB** | 42.2 KB | 34.8 KB | 7.3 KB | solid |

## Detailed Results

### Flexium Benchmarks

| Benchmark | Iterations | Median (ms) | Ops/sec | P95 (ms) | P99 (ms) |
|-----------|------------|-------------|---------|----------|----------|
| State creation | 50,000 | 0.000390 | 1,890,553 | 0.001261 | 0.002090 |
| State update | 50,000 | 0.000074 | 13,073,040 | 0.000087 | 0.000090 |
| Computed read (cached) | 50,000 | 0.000017 | 47,577,361 | 0.000038 | 0.000044 |
| Effect creation | 5,000 | 0.000365 | 3,012,351 | 0.000553 | 0.000553 |
| Batch update (10 signals) | 10,000 | 0.000616 | 1,411,948 | 0.001527 | 0.001527 |
| Deep computed chain (10 levels) | 50,000 | 0.001124 | 861,375 | 0.001305 | 0.001332 |

## Notes

- **Flexium**: Measured in this benchmark
- **React**: Includes React 18+ with automatic batching
- **Vue 3**: Composition API with `ref()` and `computed()`
- **Solid.js**: Fine-grained reactivity (similar architecture to Flexium)
- Reference data from js-framework-benchmark and official sources

## Methodology

- Iterations: 50,000
- Warmup: 5,000 iterations
- Environment: Node.js (V8 engine)
- Statistical measures: median, P95, P99
