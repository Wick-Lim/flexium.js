/**
 * Before/After Comparison: Manual vs Automatic Reactivity
 *
 * This file demonstrates the difference between manual effect() calls
 * and automatic reactive bindings.
 */

import { signal, computed, effect } from '../src/core/signal';
import { h } from '../src/renderers/dom/h';
import { render } from '../src/renderers/dom/exports';

// ============================================================================
// BEFORE: Manual effect() calls (OLD WAY)
// ============================================================================

console.log('='.repeat(60));
console.log('BEFORE: Manual Reactivity (OLD WAY)');
console.log('='.repeat(60));

function OldWayExample() {
  const count = signal(0);

  // Problem: Have to manually wire up the DOM updates
  const counterDisplay = h('span', { id: 'old-counter' }, ['0']);

  // Manual effect needed!
  effect(() => {
    const element = document.getElementById('old-counter');
    if (element) {
      element.textContent = String(count.value);
    }
  });

  return h('div', { style: { padding: '20px', border: '2px solid red' } }, [
    h('h2', {}, ['OLD WAY: Manual Effects']),
    h('p', {}, [
      'You had to manually create effects to update the DOM.',
    ]),
    h('p', {}, ['Count: ', counterDisplay]),
    h('button', {
      onClick: () => count.value++,
      style: { marginRight: '10px' }
    }, ['Increment']),
    h('button', {
      onClick: () => count.value--
    }, ['Decrement']),
    h('pre', { style: { backgroundColor: '#f5f5f5', padding: '10px', marginTop: '10px' } }, [`
Code:
const counterDisplay = h('span', { id: 'old-counter' }, ['0']);

// Manual effect required!
effect(() => {
  const element = document.getElementById('old-counter');
  if (element) {
    element.textContent = String(count.value);
  }
});
    `])
  ]);
}

// ============================================================================
// AFTER: Automatic reactive bindings (NEW WAY)
// ============================================================================

console.log('');
console.log('='.repeat(60));
console.log('AFTER: Automatic Reactivity (NEW WAY)');
console.log('='.repeat(60));

function NewWayExample() {
  const count = signal(0);

  // That's it! Just pass the signal directly
  // No manual effect() needed - it works automatically!
  return h('div', { style: { padding: '20px', border: '2px solid green' } }, [
    h('h2', {}, ['NEW WAY: Automatic Reactivity']),
    h('p', {}, [
      'Signals automatically update the DOM. No manual effects needed!',
    ]),
    h('p', {}, ['Count: ', count]), // <-- Signal passed directly!
    h('button', {
      onClick: () => count.value++,
      style: { marginRight: '10px' }
    }, ['Increment']),
    h('button', {
      onClick: () => count.value--
    }, ['Decrement']),
    h('pre', { style: { backgroundColor: '#f5f5f5', padding: '10px', marginTop: '10px' } }, [`
Code:
const count = signal(0);

// Just pass the signal directly - automatic!
h('p', {}, ['Count: ', count])
    `])
  ]);
}

// ============================================================================
// MORE COMPLEX EXAMPLE: Computed Values
// ============================================================================

function OldWayComputed() {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);
  const tripled = computed(() => count.value * 3);

  // Old way: Multiple manual effects!
  const doubledDisplay = h('span', { id: 'old-doubled' }, ['0']);
  const tripledDisplay = h('span', { id: 'old-tripled' }, ['0']);

  effect(() => {
    const element = document.getElementById('old-doubled');
    if (element) {
      element.textContent = String(doubled.value);
    }
  });

  effect(() => {
    const element = document.getElementById('old-tripled');
    if (element) {
      element.textContent = String(tripled.value);
    }
  });

  return h('div', { style: { padding: '20px', border: '2px solid orange' } }, [
    h('h3', {}, ['OLD WAY: Multiple Computed Values']),
    h('p', {}, ['Count: ', h('span', { id: 'old-count-2' }, ['0'])]),
    h('p', {}, ['Doubled: ', doubledDisplay]),
    h('p', {}, ['Tripled: ', tripledDisplay]),
    h('button', { onClick: () => count.value++ }, ['Increment']),
    h('p', { style: { fontSize: '12px', color: '#666' } }, [
      'Required 3 manual effect() calls!'
    ])
  ]);
}

function NewWayComputed() {
  const count = signal(0);
  const doubled = computed(() => count.value * 2);
  const tripled = computed(() => count.value * 3);

  // New way: Just pass them directly!
  return h('div', { style: { padding: '20px', border: '2px solid blue' } }, [
    h('h3', {}, ['NEW WAY: Multiple Computed Values']),
    h('p', {}, ['Count: ', count]),
    h('p', {}, ['Doubled: ', doubled]),
    h('p', {}, ['Tripled: ', tripled]),
    h('button', { onClick: () => count.value++ }, ['Increment']),
    h('p', { style: { fontSize: '12px', color: '#666' } }, [
      'Zero manual effect() calls needed!'
    ])
  ]);
}

// ============================================================================
// EVEN MORE COMPLEX: Dynamic Props
// ============================================================================

function OldWayProps() {
  const isDisabled = signal(true);
  const buttonText = computed(() => isDisabled.value ? 'Disabled' : 'Enabled');

  // Old way: Manual effect for prop updates
  effect(() => {
    const button = document.getElementById('old-dynamic-button');
    if (button) {
      (button as HTMLButtonElement).disabled = isDisabled.value;
    }
  });

  effect(() => {
    const button = document.getElementById('old-dynamic-button');
    if (button) {
      button.textContent = buttonText.value;
    }
  });

  return h('div', { style: { padding: '20px', border: '2px solid purple' } }, [
    h('h3', {}, ['OLD WAY: Reactive Props']),
    h('button', {
      id: 'old-dynamic-button',
      onClick: () => console.log('Clicked!'),
      style: { marginRight: '10px' }
    }, ['Initial']),
    h('button', {
      onClick: () => isDisabled.value = !isDisabled.value
    }, ['Toggle']),
    h('p', { style: { fontSize: '12px', color: '#666' } }, [
      'Required 2 manual effect() calls for button updates!'
    ])
  ]);
}

function NewWayProps() {
  const isDisabled = signal(true);
  const buttonText = computed(() => isDisabled.value ? 'Disabled' : 'Enabled');

  // New way: Signals in props work automatically!
  return h('div', { style: { padding: '20px', border: '2px solid teal' } }, [
    h('h3', {}, ['NEW WAY: Reactive Props']),
    h('button', {
      disabled: isDisabled,  // Signal as prop - automatic!
      onClick: () => console.log('Clicked!'),
      style: { marginRight: '10px' }
    }, [buttonText]), // Signal as child - automatic!
    h('button', {
      onClick: () => isDisabled.value = !isDisabled.value
    }, ['Toggle']),
    h('p', { style: { fontSize: '12px', color: '#666' } }, [
      'Zero manual effect() calls - all automatic!'
    ])
  ]);
}

// ============================================================================
// RENDER ALL EXAMPLES
// ============================================================================

const app = h('div', { style: { fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '20px' } }, [
  h('h1', { style: { textAlign: 'center' } }, ['Before/After: Automatic Reactivity']),
  h('p', { style: { textAlign: 'center', fontSize: '18px' } }, [
    'Compare the old manual approach with the new automatic reactive bindings'
  ]),
  h('hr', { style: { margin: '30px 0' } }),

  // Simple counter comparison
  h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' } }, [
    h(OldWayExample),
    h(NewWayExample)
  ]),

  h('hr', { style: { margin: '30px 0' } }),

  // Computed values comparison
  h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' } }, [
    h(OldWayComputed),
    h(NewWayComputed)
  ]),

  h('hr', { style: { margin: '30px 0' } }),

  // Props comparison
  h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' } }, [
    h(OldWayProps),
    h(NewWayProps)
  ]),

  h('hr', { style: { margin: '30px 0' } }),

  h('div', { style: { backgroundColor: '#f0f0f0', padding: '20px', borderRadius: '8px' } }, [
    h('h2', {}, ['Summary']),
    h('ul', {}, [
      h('li', {}, ['✅ No more manual effect() calls']),
      h('li', {}, ['✅ Signals work directly in children']),
      h('li', {}, ['✅ Signals work directly in props']),
      h('li', {}, ['✅ Computed values update automatically']),
      h('li', {}, ['✅ Less boilerplate, more productivity']),
      h('li', {}, ['✅ Automatic cleanup - no memory leaks'])
    ])
  ])
]);

render(app, document.body);

console.log('');
console.log('='.repeat(60));
console.log('All examples rendered! Try interacting with the buttons.');
console.log('='.repeat(60));
