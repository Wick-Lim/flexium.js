# Flexium Showcase

Experience the power of Flexium's fine-grained reactivity directly in your browser. This demo is running live, powered by the core `flexium` library.

<script setup>
import ShowcaseDemo from './components/ShowcaseDemo.vue'
</script>

<ShowcaseDemo />

## How it Works

The interactive component above is built using standard Flexium primitives: `signal`, `computed`, and the `h` function for DOM creation.

```javascript
import { signal, computed } from 'flexium'
import { h } from 'flexium/dom'

function Counter() {
  const count = signal(0)
  const doubled = computed(() => count.value * 2)

  return h('div', {}, [
    h('h1', {}, ['Count: ', count]),
    h('button', { onclick: () => count.value++ }, ['Increment'])
  ])
}
```

Unlike React or Vue, Flexium **does not use a Virtual DOM** for updates. When you click "Increment":
1. The `count` signal updates.
2. Only the text node containing the number (and the computed doubled value) is touched.
3. The component function `Counter` **does not re-run**.

## Features Demonstrated

- **Fine-Grained Reactivity**: Updates are precise.
- **No VDOM Overhead**: Direct DOM manipulation via signals.
- **Computed Values**: `doubled` updates automatically when `count` changes.
- **Framework Interop**: This Flexium app is actually running inside a Vue component (VitePress)!
