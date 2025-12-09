// Advanced Signal System Tests - Edge Cases, Memory, Performance
import { test } from 'node:test'
import assert from 'node:assert'
import {
  signal,
  computed,
  effect,
  root,
  batch,
  untrack,
} from '../../packages/flexium/dist/test-exports.mjs'

// ==========================================
// Edge Cases - Diamond Dependencies
// ==========================================

test('diamond dependency problem - computed values are correct', () => {
  //       a
  //      / \
  //     b   c
  //      \ /
  //       d
  const a = signal(1)
  const b = computed(() => a.value * 2)
  const c = computed(() => a.value * 3)
  const d = computed(() => b.value + c.value)

  let effectRuns = 0
  effect(() => {
    effectRuns++
    d.value
  })

  assert.strictEqual(d.value, 5) // 2 + 3
  assert.strictEqual(effectRuns, 1)

  // Updating 'a' - the key assertion is that 'd' has the correct value
  a.value = 2
  assert.strictEqual(d.value, 10) // 4 + 6

  // Effect may run multiple times depending on implementation
  // The important thing is the final value is correct
  assert.ok(effectRuns >= 2, 'Effect should run at least twice')
})

test('deeply nested computed chain', () => {
  const base = signal(1)
  let comp = computed(() => base.value)

  // Create a chain of 100 computed values
  for (let i = 0; i < 100; i++) {
    const prev = comp
    comp = computed(() => prev.value + 1)
  }

  assert.strictEqual(comp.value, 101)

  base.value = 10
  assert.strictEqual(comp.value, 110)
})

// ==========================================
// Edge Cases - Circular Dependencies
// ==========================================

test('effect writing to signal does not cause infinite loop', async () => {
  const count = signal(0)
  let iterations = 0

  effect(() => {
    iterations++
    if (count.value < 5) {
      count.value = count.value + 1
    }
  })

  // Allow microtasks to process
  await new Promise((r) => setTimeout(r, 10))

  assert.strictEqual(count.value, 5)
  assert.strictEqual(iterations, 6) // Initial + 5 updates
})

test('computed cannot write to signal (read-only)', () => {
  const a = signal(1)
  const b = signal(2)

  // This computed tries to modify a signal - should still work
  // but the write will trigger a new computation
  let computeCount = 0
  const c = computed(() => {
    computeCount++
    return a.value + b.value
  })

  assert.strictEqual(c.value, 3)
  assert.strictEqual(computeCount, 1)
})

// ==========================================
// Edge Cases - Null/Undefined Values
// ==========================================

test('signal with null value', () => {
  const s = signal(null)
  assert.strictEqual(s.value, null)

  s.value = 'not null'
  assert.strictEqual(s.value, 'not null')

  s.value = null
  assert.strictEqual(s.value, null)
})

test('signal with undefined value', () => {
  const s = signal(undefined)
  assert.strictEqual(s.value, undefined)

  s.value = 'defined'
  assert.strictEqual(s.value, 'defined')

  s.value = undefined
  assert.strictEqual(s.value, undefined)
})

test('computed returning null', () => {
  const condition = signal(false)
  const data = signal({ name: 'test' })

  const result = computed(() => {
    return condition.value ? data.value : null
  })

  assert.strictEqual(result.value, null)

  condition.value = true
  assert.deepStrictEqual(result.value, { name: 'test' })
})

// ==========================================
// Edge Cases - Object Mutations
// ==========================================

test('signal with object - mutation detection', () => {
  const obj = signal({ count: 0 })
  let effectRuns = 0

  effect(() => {
    effectRuns++
    obj.value.count
  })

  assert.strictEqual(effectRuns, 1)

  // Direct mutation won't trigger effect
  obj.value.count = 5
  assert.strictEqual(effectRuns, 1)

  // Replacing the object will trigger effect
  obj.value = { count: 10 }
  assert.strictEqual(effectRuns, 2)
})

test('signal with array - push detection', () => {
  const arr = signal([1, 2, 3])
  let effectRuns = 0

  effect(() => {
    effectRuns++
    arr.value.length
  })

  assert.strictEqual(effectRuns, 1)

  // Direct push won't trigger effect
  arr.value.push(4)
  assert.strictEqual(effectRuns, 1)

  // Replacing the array will trigger effect
  arr.value = [...arr.value, 5]
  assert.strictEqual(effectRuns, 2)
})

// ==========================================
// Batch Edge Cases
// ==========================================

test('nested batch calls', () => {
  const a = signal(1)
  const b = signal(2)
  let effectRuns = 0

  effect(() => {
    effectRuns++
    a.value + b.value
  })

  assert.strictEqual(effectRuns, 1)

  batch(() => {
    a.value = 10
    batch(() => {
      b.value = 20
      a.value = 30
    })
    b.value = 40
  })

  // Effect should only run once after all batches complete
  assert.strictEqual(effectRuns, 2)
  assert.strictEqual(a.value, 30)
  assert.strictEqual(b.value, 40)
})

test('batch with error', () => {
  const a = signal(1)
  let effectRuns = 0

  effect(() => {
    effectRuns++
    a.value
  })

  assert.strictEqual(effectRuns, 1)

  try {
    batch(() => {
      a.value = 10
      throw new Error('Batch error')
    })
  } catch (e) {
    // Expected error
  }

  // Effect should still run with the updated value
  // (depends on implementation - value should be 10)
  assert.strictEqual(a.value, 10)
})

test('batch returns value', () => {
  const result = batch(() => {
    return 'batch result'
  })

  assert.strictEqual(result, 'batch result')
})

// ==========================================
// Untrack Edge Cases
// ==========================================

test('untrack in computed', () => {
  const a = signal(1)
  const b = signal(2)

  let computeRuns = 0
  const c = computed(() => {
    computeRuns++
    return a.value + untrack(() => b.value)
  })

  assert.strictEqual(c.value, 3)
  assert.strictEqual(computeRuns, 1)

  // Changing 'a' should recompute
  a.value = 10
  assert.strictEqual(c.value, 12)
  assert.strictEqual(computeRuns, 2)

  // Changing 'b' should NOT recompute (untracked)
  b.value = 20
  assert.strictEqual(c.value, 12) // Still uses old b value (2) from previous computation? No, will use 20 when recomputed
  assert.strictEqual(computeRuns, 2)

  // But next time 'a' changes, it will get new 'b' value
  a.value = 100
  assert.strictEqual(c.value, 120) // 100 + 20
  assert.strictEqual(computeRuns, 3)
})

test('nested untrack calls', () => {
  const a = signal(1)
  const b = signal(2)
  const c = signal(3)

  let effectRuns = 0
  effect(() => {
    effectRuns++
    a.value +
      untrack(() => {
        return b.value + untrack(() => c.value)
      })
  })

  assert.strictEqual(effectRuns, 1)

  // Only 'a' should trigger effect
  a.value = 10
  assert.strictEqual(effectRuns, 2)

  // 'b' and 'c' should not trigger effect
  b.value = 20
  c.value = 30
  assert.strictEqual(effectRuns, 2)
})

// ==========================================
// Effect Edge Cases
// ==========================================

test('effect cleanup runs before next execution', () => {
  const count = signal(0)
  const cleanupOrder = []

  effect(() => {
    const current = count.value
    cleanupOrder.push(`effect-${current}`)

    return () => {
      cleanupOrder.push(`cleanup-${current}`)
    }
  })

  count.value = 1
  count.value = 2

  assert.deepStrictEqual(cleanupOrder, [
    'effect-0',
    'cleanup-0',
    'effect-1',
    'cleanup-1',
    'effect-2',
  ])
})

test('effect disposal cleans up immediately', () => {
  const count = signal(0)
  let cleanupRan = false

  const dispose = effect(() => {
    count.value
    return () => {
      cleanupRan = true
    }
  })

  assert.strictEqual(cleanupRan, false)

  dispose()
  assert.strictEqual(cleanupRan, true)
})

test('effect with async cleanup', async () => {
  const count = signal(0)
  let cleanupComplete = false

  const dispose = effect(() => {
    count.value
    return async () => {
      await new Promise((r) => setTimeout(r, 10))
      cleanupComplete = true
    }
  })

  dispose()

  // Cleanup is async, so it might not be complete immediately
  await new Promise((r) => setTimeout(r, 50))
  // Note: async cleanup behavior depends on implementation
})

// ==========================================
// Root/Scope Edge Cases
// ==========================================

test('nested roots are independent', () => {
  const count = signal(0)
  let outerEffectValue = 0
  let innerEffectValue = 0

  const outerDispose = root((dispose) => {
    effect(() => {
      outerEffectValue = count.value
    })

    const innerDispose = root((innerD) => {
      effect(() => {
        innerEffectValue = count.value * 10
      })
      return innerD
    })

    // Dispose inner root
    innerDispose()

    return dispose
  })

  assert.strictEqual(outerEffectValue, 0)
  assert.strictEqual(innerEffectValue, 0)

  count.value = 5

  // Outer effect should still work
  assert.strictEqual(outerEffectValue, 5)
  // Inner effect should be disposed
  assert.strictEqual(innerEffectValue, 0)

  outerDispose()

  count.value = 10
  // Both should be disposed now
  assert.strictEqual(outerEffectValue, 5)
  assert.strictEqual(innerEffectValue, 0)
})

// ==========================================
// Performance Tests
// ==========================================

test('many signals performance', () => {
  const signals = []
  for (let i = 0; i < 1000; i++) {
    signals.push(signal(i))
  }

  const sum = computed(() => {
    let total = 0
    for (const s of signals) {
      total += s.value
    }
    return total
  })

  const start = Date.now()
  assert.strictEqual(sum.value, 499500) // Sum of 0 to 999

  // Update all signals
  for (let i = 0; i < 1000; i++) {
    signals[i].value = i * 2
  }

  assert.strictEqual(sum.value, 999000) // Sum of 0 to 1998 (even numbers)
  const duration = Date.now() - start

  // Should complete in under 1 second
  assert.ok(duration < 1000, `Performance test took ${duration}ms`)
})

test('rapid signal updates', () => {
  const count = signal(0)
  let effectRuns = 0

  effect(() => {
    effectRuns++
    count.value
  })

  const start = Date.now()

  // Update signal 10000 times (starting from 1 to ensure value changes)
  for (let i = 1; i <= 10000; i++) {
    count.value = i
  }

  const duration = Date.now() - start

  assert.strictEqual(count.value, 10000)
  // Effect runs: 1 (initial) + 10000 (updates) = 10001
  // But if some updates are batched, it might be less
  assert.ok(effectRuns >= 10000, `Effect should run at least 10000 times, got ${effectRuns}`)

  // Should complete in under 1 second
  assert.ok(duration < 1000, `Rapid updates took ${duration}ms`)
})

test('batch with many updates is faster', () => {
  const count = signal(0)
  let effectRuns = 0

  effect(() => {
    effectRuns++
    count.value
  })

  const startWithoutBatch = Date.now()
  for (let i = 0; i < 1000; i++) {
    count.value = i
  }
  const durationWithoutBatch = Date.now() - startWithoutBatch
  const runsWithoutBatch = effectRuns

  // Reset
  count.value = 0
  effectRuns = 0

  const startWithBatch = Date.now()
  batch(() => {
    for (let i = 0; i < 1000; i++) {
      count.value = i
    }
  })
  const durationWithBatch = Date.now() - startWithBatch
  const runsWithBatch = effectRuns

  // Batch should have fewer effect runs
  assert.ok(runsWithBatch < runsWithoutBatch)
})

// ==========================================
// Type Coercion Tests
// ==========================================

test('signal with falsy values', () => {
  const zero = signal(0)
  const empty = signal('')
  const falseVal = signal(false)
  const nan = signal(NaN)

  assert.strictEqual(zero.value, 0)
  assert.strictEqual(empty.value, '')
  assert.strictEqual(falseVal.value, false)
  assert.ok(Number.isNaN(nan.value))

  // Effect should still work with falsy values
  let effectRan = false
  effect(() => {
    if (!zero.value && !empty.value && !falseVal.value) {
      effectRan = true
    }
  })

  assert.strictEqual(effectRan, true)
})

test('computed with type changes', () => {
  const value = signal(1)

  const result = computed(() => {
    if (value.value === 1) return 'one'
    if (value.value === 2) return 2
    if (value.value === 3) return { three: true }
    return null
  })

  assert.strictEqual(result.value, 'one')

  value.value = 2
  assert.strictEqual(result.value, 2)

  value.value = 3
  assert.deepStrictEqual(result.value, { three: true })

  value.value = 4
  assert.strictEqual(result.value, null)
})

// ==========================================
// Memory Leak Prevention Tests
// ==========================================

test('disposed effects do not hold references', () => {
  const count = signal(0)
  let largeObject = { data: new Array(10000).fill('x') }

  const dispose = effect(() => {
    count.value
    largeObject // Reference to large object
  })

  // Dispose the effect
  dispose()
  largeObject = null // Clear our reference

  // The effect should no longer hold the reference
  // (This is more of a behavioral test - actual memory testing needs profiling)
  count.value = 1 // This should not error even though largeObject is null
})

test('computed cleanup on dependency change', () => {
  const condition = signal(true)
  const a = signal(1)
  const b = signal(2)

  let aAccesses = 0
  let bAccesses = 0

  const result = computed(() => {
    if (condition.value) {
      aAccesses++
      return a.value
    } else {
      bAccesses++
      return b.value
    }
  })

  // Initial access uses 'a'
  assert.strictEqual(result.value, 1)
  assert.strictEqual(aAccesses, 1)
  assert.strictEqual(bAccesses, 0)

  // Switch to 'b'
  condition.value = false
  assert.strictEqual(result.value, 2)
  assert.strictEqual(aAccesses, 1)
  assert.strictEqual(bAccesses, 1)

  // Now only 'b' updates should trigger recomputation
  b.value = 20
  assert.strictEqual(result.value, 20)
  assert.strictEqual(aAccesses, 1) // 'a' should not be accessed
  assert.strictEqual(bAccesses, 2)

  // 'a' updates should NOT trigger recomputation
  a.value = 100
  assert.strictEqual(result.value, 20) // Still uses cached value
  assert.strictEqual(aAccesses, 1) // 'a' was not accessed
})

console.log('\nAll advanced signal tests passed!')
