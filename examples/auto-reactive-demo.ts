/**
 * Automatic Reactive Bindings Demo
 *
 * This example demonstrates the automatic reactive bindings feature.
 * Signals passed as children or props automatically update the DOM
 * without requiring manual effect() calls.
 */

import { signal, computed } from '../src/core/signal';
import { h } from '../src/renderers/dom/h';
import { render, bind, ReactiveText } from '../src/renderers/dom/exports';

// ============================================================================
// EXAMPLE 1: Automatic reactive text (signals as children)
// ============================================================================

console.log('Example 1: Signals as children');

const count = signal(0);

// NEW WAY: Just pass the signal directly as a child
// It automatically updates when the signal changes!
const app1 = h('div', { id: 'app1' }, [
  h('h2', {}, ['Example 1: Automatic Reactive Text']),
  h('p', {}, ['Count: ', count]), // Signal automatically becomes reactive!
  h('button', { onClick: () => count.value++ }, ['Increment']),
]);

// ============================================================================
// EXAMPLE 2: Computed values as children
// ============================================================================

console.log('Example 2: Computed values');

const doubled = computed(() => count.value * 2);

const app2 = h('div', { id: 'app2' }, [
  h('h2', {}, ['Example 2: Computed Values']),
  h('p', {}, ['Count: ', count]),
  h('p', {}, ['Doubled: ', doubled]), // Computed signal also automatic!
  h('button', { onClick: () => count.value++ }, ['Increment']),
]);

// ============================================================================
// EXAMPLE 3: Signals in props
// ============================================================================

console.log('Example 3: Signals in props');

const isDisabled = signal(true);
const buttonColor = computed(() => (isDisabled.value ? '#cccccc' : '#4CAF50'));

const app3 = h('div', { id: 'app3' }, [
  h('h2', {}, ['Example 3: Reactive Props']),
  h(
    'button',
    {
      disabled: isDisabled, // Signal in prop automatically tracked!
      style: { backgroundColor: buttonColor }, // Computed in prop!
      onClick: () => console.log('Button clicked!'),
    },
    ['Click Me']
  ),
  h('button', { onClick: () => (isDisabled.value = !isDisabled.value) }, [
    'Toggle Disabled',
  ]),
]);

// ============================================================================
// EXAMPLE 4: Multiple signals in one element
// ============================================================================

console.log('Example 4: Multiple signals');

const firstName = signal('John');
const lastName = signal('Doe');
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

const app4 = h('div', { id: 'app4' }, [
  h('h2', {}, ['Example 4: Multiple Signals']),
  h('p', {}, ['Full Name: ', fullName]),
  h('input', {
    type: 'text',
    value: firstName.peek(),
    onInput: (e: any) => (firstName.value = e.target.value),
    placeholder: 'First name',
  }),
  h('input', {
    type: 'text',
    value: lastName.peek(),
    onInput: (e: any) => (lastName.value = e.target.value),
    placeholder: 'Last name',
  }),
]);

// ============================================================================
// EXAMPLE 5: ReactiveText component (alternative syntax)
// ============================================================================

console.log('Example 5: ReactiveText component');

const message = signal('Hello, World!');

const app5 = h('div', { id: 'app5' }, [
  h('h2', {}, ['Example 5: ReactiveText Component']),
  h(ReactiveText, { style: { fontSize: '24px', color: 'blue' } }, [message]),
  h('button', { onClick: () => (message.value = 'Updated!') }, [
    'Update Message',
  ]),
]);

// ============================================================================
// EXAMPLE 6: Complex reactive UI
// ============================================================================

console.log('Example 6: Complex reactive UI');

const items = signal(['Apple', 'Banana', 'Cherry']);
const itemCount = computed(() => items.value.length);

const app6 = h('div', { id: 'app6' }, [
  h('h2', {}, ['Example 6: Complex Reactive UI']),
  h('p', {}, ['Total items: ', itemCount]),
  h(
    'ul',
    {},
    items.peek().map((item) => h('li', {}, [item]))
  ),
  h(
    'button',
    {
      onClick: () => {
        const newItems = [...items.peek(), `Item ${items.peek().length + 1}`];
        items.value = newItems;
      },
    },
    ['Add Item']
  ),
]);

// ============================================================================
// Render all examples
// ============================================================================

const container = document.createElement('div');
container.style.padding = '20px';
container.style.fontFamily = 'Arial, sans-serif';

const allExamples = h('div', {}, [
  h('h1', {}, ['Automatic Reactive Bindings Demo']),
  h('p', {}, [
    'All examples use automatic reactive bindings. No manual effect() calls needed!',
  ]),
  h('hr', {}),
  app1,
  h('hr', {}),
  app2,
  h('hr', {}),
  app3,
  h('hr', {}),
  app4,
  h('hr', {}),
  app5,
  h('hr', {}),
  app6,
]);

render(allExamples, container);
document.body.appendChild(container);

console.log('Demo ready! Try interacting with the buttons and inputs.');
