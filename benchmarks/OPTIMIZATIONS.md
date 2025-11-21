# Performance Optimizations for Flexium

This document contains concrete optimization recommendations based on benchmark results.

---

## Current Performance (v0.1.0)

- **Signal Read:** 14.92ns (67M ops/s) - Excellent ✅
- **Signal Update:** 97.42ns (10.26M ops/s) - Excellent ✅
- **Overall Grade:** B (Excellent)
- **Status:** Production-ready, no critical issues

---

## Optimization 1: Microtask Effect Batching (HIGH PRIORITY)

### Problem
Diamond dependency pattern causes effect to run 2x:
```
     A (signal)
    / \
   B   C (computeds)
    \ /
     D (computed)
      |
    Effect

When A updates, Effect runs twice (once for B, once for C)
```

**Impact:** 2x unnecessary executions in complex graphs
**Frequency:** Only affects apps with diamond dependencies
**Benchmark:** Diamond test ran 20,201 times instead of 10,001

### Solution
Implement automatic microtask batching:

```typescript
// In src/core/signal.ts

// Add at top of file
let scheduledEffects = new Set<ISubscriber>();
let isScheduled = false;

function scheduleEffect(effect: ISubscriber) {
  scheduledEffects.add(effect);
  if (!isScheduled) {
    isScheduled = true;
    queueMicrotask(() => {
      const effects = scheduledEffects;
      scheduledEffects = new Set();
      isScheduled = false;
      for (const effect of effects) {
        effect.execute();
      }
    });
  }
}

// Modify SignalNode.notify():
notify(): void {
  if (batchDepth > 0) {
    // Collect effects to run after batch completes
    for (const subscriber of this.subscribers) {
      batchedEffects.add(subscriber);
    }
  } else {
    // Schedule effects for next microtask
    for (const subscriber of this.subscribers) {
      scheduleEffect(subscriber);
    }
  }
}

// Same for ComputedNode.notify()
```

### Expected Improvement
- **Diamond pattern:** 2x faster (one execution instead of two)
- **Complex graphs:** 10-50% faster depending on structure
- **Simple cases:** No performance change
- **Bundle size:** +200 bytes

### Testing
```typescript
const root = signal(0);
const left = computed(() => root.value * 2);
const right = computed(() => root.value * 3);
const diamond = computed(() => left.value + right.value);

let runs = 0;
effect(() => {
  diamond.value;
  runs++;
});

root.value++; // Should increment runs by 1, not 2
```

### Status
- **Priority:** HIGH
- **Target Version:** 0.2.0
- **Complexity:** Medium
- **Breaking Change:** No

---

## Optimization 2: Computed Version Tracking (MEDIUM PRIORITY)

### Problem
Computed signals check `_dirty` flag on every access:
```typescript
get(): T {
  if (this._dirty) {
    // Recompute
  }
  return this._value;
}
```

This is fast but can be optimized further.

### Solution
Add version tracking to skip unnecessary checks:

```typescript
class ComputedNode<T> implements ISubscriber, IObservable {
  private _value!: T;
  private _version = 0;
  private _lastReadVersion = -1;
  private _dirty = true;

  get(): T {
    // Track dependency
    if (activeEffect && activeEffect !== this) {
      this.subscribers.add(activeEffect);
      activeEffect.dependencies.add(this);
    }

    // Check if we need to recompute
    if (this._lastReadVersion !== this._version) {
      if (this._dirty) {
        this.recompute();
      }
      this._lastReadVersion = this._version;
    }

    return this._value;
  }

  execute(): void {
    // When a dependency changes, increment version
    this._version++;
    this._dirty = true;
    this.notify();
  }

  private recompute(): void {
    this._dirty = false;

    // Clear previous dependencies
    for (const dep of this.dependencies) {
      dep.subscribers.delete(this);
    }
    this.dependencies.clear();

    const prevEffect = activeEffect;
    activeEffect = this;

    try {
      this._value = this.computeFn();
    } finally {
      activeEffect = prevEffect;
    }
  }
}
```

### Expected Improvement
- **Computed reads:** 10-20% faster
- **Repeated reads:** Near-zero cost
- **Memory:** +8 bytes per computed (two integers)
- **Bundle size:** +100 bytes

### Testing
```typescript
const base = signal(0);
const computed1 = computed(() => base.value * 2);

// First read: computes
computed1.value; // ~570ns

// Second read: cached
computed1.value; // Should be < 50ns

// Update base
base.value++;

// Third read: recomputes
computed1.value; // ~570ns
```

### Status
- **Priority:** MEDIUM
- **Target Version:** 0.2.0
- **Complexity:** Low
- **Breaking Change:** No

---

## Optimization 3: Array-Based Subscribers (LOW PRIORITY)

### Problem
Using `Set<ISubscriber>` for all subscriber lists has overhead:
- Set allocation
- Hash computation
- Memory overhead

Most signals have 0-2 subscribers. Set is overkill for small lists.

### Solution
Use Array for small subscriber lists:

```typescript
type SubscriberList = ISubscriber[] | Set<ISubscriber>;

class SignalNode<T> implements IObservable {
  subscribers: SubscriberList = [];

  addSubscriber(subscriber: ISubscriber): void {
    if (Array.isArray(this.subscribers)) {
      // Check if already exists (linear search is fast for small arrays)
      if (this.subscribers.indexOf(subscriber) === -1) {
        this.subscribers.push(subscriber);
      }
      // Convert to Set if too large
      if (this.subscribers.length > 3) {
        this.subscribers = new Set(this.subscribers);
      }
    } else {
      this.subscribers.add(subscriber);
    }
  }

  removeSubscriber(subscriber: ISubscriber): void {
    if (Array.isArray(this.subscribers)) {
      const index = this.subscribers.indexOf(subscriber);
      if (index !== -1) {
        this.subscribers.splice(index, 1);
      }
    } else {
      this.subscribers.delete(subscriber);
    }
  }

  notify(): void {
    const subs = Array.isArray(this.subscribers)
      ? this.subscribers
      : Array.from(this.subscribers);

    for (const subscriber of subs) {
      subscriber.execute();
    }
  }
}
```

### Expected Improvement
- **Small subscriber lists (0-3):** 5-10% faster
- **Large subscriber lists (4+):** Same performance
- **Memory:** 20% less for typical apps
- **Bundle size:** +300 bytes

### Testing
```typescript
const sig = signal(0);

// 1 subscriber: uses array
const dispose1 = effect(() => sig.value);

// 2 subscribers: still array
const dispose2 = effect(() => sig.value);

// 3 subscribers: still array
const dispose3 = effect(() => sig.value);

// 4 subscribers: converts to Set
const dispose4 = effect(() => sig.value);
```

### Status
- **Priority:** LOW
- **Target Version:** 0.3.0
- **Complexity:** Medium
- **Breaking Change:** No (internal only)

---

## Optimization 4: Lazy Effect Disposal (LOW PRIORITY)

### Problem
Effect disposal iterates all dependencies:
```typescript
dispose(): void {
  this.cleanup?.();
  for (const dep of this.dependencies) {
    dep.subscribers.delete(this);
  }
  this.dependencies.clear();
}
```

This is fine but can be optimized for effects with no cleanup.

### Solution
Track whether cleanup is needed:

```typescript
class EffectNode implements ISubscriber {
  dependencies = new Set<IObservable>();
  cleanup?: () => void;
  hasCleanup = false; // New flag

  execute(): void {
    if (this.hasCleanup) {
      this.cleanup?.();
      this.cleanup = undefined;
      this.hasCleanup = false;
    }

    // ... rest of execute

    const result = this.fn();
    if (typeof result === 'function') {
      this.cleanup = result;
      this.hasCleanup = true; // Set flag
    }
  }

  dispose(): void {
    if (this.hasCleanup) {
      this.cleanup?.();
    }
    // Rest of dispose
  }
}
```

### Expected Improvement
- **Effects without cleanup:** 5-10% faster disposal
- **Effects with cleanup:** No change
- **Memory:** +1 byte per effect (boolean flag)
- **Bundle size:** +50 bytes

### Status
- **Priority:** LOW
- **Target Version:** 0.3.0
- **Complexity:** Very Low
- **Breaking Change:** No

---

## Optimization 5: Object Pooling (VERY LOW PRIORITY)

### Problem
Creating and destroying many signals causes GC pressure:
```typescript
// In a loop
for (let i = 0; i < 1000; i++) {
  const temp = signal(i);
  // Use temp
  // Temp gets garbage collected
}
```

### Solution
Implement object pooling for frequently created/destroyed signals:

```typescript
class SignalPool {
  private pool: SignalNode<any>[] = [];
  private maxSize = 100;

  acquire<T>(initialValue: T): SignalNode<T> {
    const node = this.pool.pop() as SignalNode<T> | undefined;
    if (node) {
      node._value = initialValue;
      return node;
    }
    return new SignalNode(initialValue);
  }

  release(node: SignalNode<any>): void {
    if (this.pool.length < this.maxSize) {
      // Clean up node
      node.subscribers.clear();
      this.pool.push(node);
    }
  }
}

const signalPool = new SignalPool();

// Usage in high-frequency code
const node = signalPool.acquire(0);
// ... use node
signalPool.release(node);
```

### Expected Improvement
- **High-frequency creation:** 5-10% faster
- **Normal usage:** No change
- **GC pressure:** 20-30% reduction
- **Memory:** +100 bytes for pool
- **Bundle size:** +500 bytes

### Status
- **Priority:** VERY LOW (premature optimization)
- **Target Version:** 0.4.0+
- **Complexity:** High
- **Breaking Change:** No (opt-in)

---

## Optimization 6: WeakRef Cleanup (FUTURE)

### Problem
Long-lived signals retain references to disposed effects:
```typescript
const longLivedSignal = signal(0);

// In a component that unmounts
effect(() => {
  longLivedSignal.value; // Creates strong reference
});
// Component unmounts but reference remains
```

### Solution
Use WeakRef for subscriber tracking:

```typescript
class SignalNode<T> implements IObservable {
  subscribers = new Set<WeakRef<ISubscriber>>();

  notify(): void {
    for (const weakRef of this.subscribers) {
      const subscriber = weakRef.deref();
      if (subscriber) {
        subscriber.execute();
      } else {
        // Subscriber was GC'd, remove WeakRef
        this.subscribers.delete(weakRef);
      }
    }
  }
}
```

### Expected Improvement
- **Memory leaks:** Prevents in edge cases
- **Memory usage:** 10-20% lower for long-lived apps
- **Performance:** 5-10% slower notifications
- **Bundle size:** +300 bytes

### Status
- **Priority:** VERY LOW (edge case)
- **Target Version:** 0.4.0+
- **Complexity:** High
- **Breaking Change:** No
- **Trade-off:** Lower memory but slower notifications

---

## Optimization Summary

| # | Optimization | Priority | Version | Speedup | Bundle | Status |
|---|--------------|----------|---------|---------|--------|--------|
| 1 | Microtask Batching | HIGH | 0.2.0 | 2x (diamond) | +200B | Recommended |
| 2 | Version Tracking | MEDIUM | 0.2.0 | 10-20% (computed) | +100B | Recommended |
| 3 | Array Subscribers | LOW | 0.3.0 | 5-10% (small lists) | +300B | Optional |
| 4 | Lazy Disposal | LOW | 0.3.0 | 5-10% (dispose) | +50B | Optional |
| 5 | Object Pooling | VERY LOW | 0.4.0+ | 5-10% (GC) | +500B | Future |
| 6 | WeakRef Cleanup | VERY LOW | 0.4.0+ | -5-10% (slower!) | +300B | Future |

**Recommended for v0.2.0:** Optimizations 1 and 2

---

## Implementation Roadmap

### v0.2.0 (Next Release)
- [x] Benchmark current performance
- [ ] Implement microtask batching
- [ ] Implement version tracking
- [ ] Add performance profiling hooks
- [ ] Validate with benchmarks

### v0.3.0
- [ ] Implement array-based subscribers
- [ ] Implement lazy disposal
- [ ] Add bundle size analysis
- [ ] Create performance monitoring utils

### v0.4.0+
- [ ] Evaluate object pooling
- [ ] Evaluate WeakRef cleanup
- [ ] Consider WASM acceleration
- [ ] Worker thread support

---

## Non-Optimization: Things NOT to Change

### 1. Set Creation in notify() (Keep as-is)
```typescript
const subscribersToNotify = new Set(this.subscribers);
```

**Reason:** Prevents bugs when subscribers modify during iteration
**Cost:** 50-100ns (acceptable)
**Alternative:** None that's safe

### 2. Dirty Flag Checks (Keep as-is)
```typescript
if (this._dirty) {
  this.recompute();
}
```

**Reason:** Already fast enough (569ns)
**Cost:** Minimal
**Alternative:** Version tracking (Optimization 2) is additive

### 3. Dependency Tracking (Keep as-is)
```typescript
if (activeEffect) {
  this.subscribers.add(activeEffect);
  activeEffect.dependencies.add(this);
}
```

**Reason:** Correct and optimal
**Cost:** Minimal
**Alternative:** None better

---

## Benchmarking New Optimizations

### Template
```typescript
// Before optimization
console.time('before');
for (let i = 0; i < 10000; i++) {
  // Original code
}
console.timeEnd('before');

// After optimization
console.time('after');
for (let i = 0; i < 10000; i++) {
  // Optimized code
}
console.timeEnd('after');

// Calculate speedup
const speedup = beforeTime / afterTime;
console.log(`Speedup: ${speedup.toFixed(2)}x`);
```

### Regression Tests
After each optimization:
1. Run `node benchmarks/signal-performance.mjs`
2. Verify all tests still pass
3. Ensure no performance regressions
4. Check bundle size change

---

## Conclusion

Current performance is **excellent** (Grade B). These optimizations would push it to **A+**:

- **High Priority:** Microtask batching (fixes diamond issue)
- **Medium Priority:** Version tracking (faster computed reads)
- **Low Priority:** Array subscribers, lazy disposal (minor gains)
- **Future:** Pooling, WeakRef (marginal, specialized)

**Recommendation:** Implement optimizations 1 and 2 in v0.2.0, evaluate others based on real-world usage feedback.

---

*"Premature optimization is the root of all evil. But measured optimization is the path to greatness."*
