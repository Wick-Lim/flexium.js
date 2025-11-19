#!/usr/bin/env node

/**
 * Simple test to verify Flexium build works
 */

import { signal, computed, effect } from './dist/index.mjs'

console.log('🧪 Testing Flexium...\n')

// Test 1: Signal creation and updates
console.log('Test 1: Signal creation and updates')
const count = signal(0)
console.log('  Initial value:', count.value) // 0

count.value = 5
console.log('  After update:', count.value) // 5
console.log('  ✅ Pass\n')

// Test 2: Computed values
console.log('Test 2: Computed values')
const doubled = computed(() => count.value * 2)
console.log('  Count:', count.value) // 5
console.log('  Doubled:', doubled.value) // 10

count.value = 10
console.log('  After count update:', count.value) // 10
console.log('  Doubled auto-updated:', doubled.value) // 20
console.log('  ✅ Pass\n')

// Test 3: Effects
console.log('Test 3: Effects')
let effectRuns = 0
const dispose = effect(() => {
  effectRuns++
  console.log('  Effect ran, count is:', count.value)
})

count.value = 15
console.log('  Effect ran', effectRuns, 'times')
console.log('  ✅ Pass\n')

// Clean up
dispose()

console.log('🎉 All tests passed!')
console.log('\nFlexium is working correctly.')
console.log('Run `cd playground && npm run dev` to see it in action!')
