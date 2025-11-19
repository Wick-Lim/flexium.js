import { signal, computed, effect } from './dist/index.mjs'

console.log('🧪 Testing Flexium...\n')

const count = signal(0)
console.log('✓ Signal created:', count.value)

count.value = 5
console.log('✓ Signal updated:', count.value)

const doubled = computed(() => count.value * 2)
console.log('✓ Computed value:', doubled.value)

let runs = 0
effect(() => { runs++; console.log('✓ Effect ran:', count.value) })

count.value = 10
console.log('\n🎉 All tests passed! Flexium works correctly.')
