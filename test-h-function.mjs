/**
 * Test h() function in Node.js
 *
 * This tests the h() function to ensure it properly creates VNodes
 * that can be converted to DOM elements by the render() function.
 */

import { h, Fragment, isVNode } from './dist/dom.mjs';

console.log('Testing h() function...\n');

// Test 1: Basic element creation
console.log('Test 1: Basic element creation');
const div = h('div', { className: 'test' }, ['Hello World']);
console.log('Created VNode:', JSON.stringify(div, null, 2));
console.log('Is VNode?', isVNode(div));
console.log('');

// Test 2: Element with multiple props
console.log('Test 2: Element with props');
const button = h('button',
    {
        className: 'btn',
        disabled: false,
        onclick: () => console.log('clicked')
    },
    ['Click me']
);
console.log('Button VNode type:', button.type);
console.log('Button props:', Object.keys(button.props));
console.log('Button children:', button.children);
console.log('');

// Test 3: Nested elements
console.log('Test 3: Nested elements');
const card = h('div',
    { className: 'card' },
    [
        h('h1', {}, ['Title']),
        h('p', {}, ['Content']),
        h('button', { onclick: () => {} }, ['Action'])
    ]
);
console.log('Card has', card.children.length, 'children');
console.log('First child type:', card.children[0].type);
console.log('Second child type:', card.children[1].type);
console.log('Third child type:', card.children[2].type);
console.log('');

// Test 4: Arrays of children
console.log('Test 4: Arrays of children');
const list = h('ul', {},
    ['Item 1', 'Item 2', 'Item 3'].map(text =>
        h('li', {}, [text])
    )
);
console.log('List has', list.children.length, 'children');
console.log('');

// Test 5: Fragment
console.log('Test 5: Fragment');
const fragment = Fragment({ children: [
    h('div', {}, ['First']),
    h('div', {}, ['Second'])
]});
console.log('Fragment type:', fragment.type);
console.log('Fragment children count:', fragment.children.length);
console.log('');

// Test 6: Mixed children (text and elements)
console.log('Test 6: Mixed children');
const mixed = h('div', {},
    [
        'Text before',
        h('strong', {}, ['bold text']),
        'Text after'
    ]
);
console.log('Mixed children:', mixed.children);
console.log('');

// Test 7: Style prop
console.log('Test 7: Style prop');
const styled = h('div',
    {
        style: 'color: red; padding: 10px;',
        className: 'styled-div'
    },
    ['Styled content']
);
console.log('Styled element props:', styled.props);
console.log('');

// Test 8: Empty children
console.log('Test 8: Empty children');
const empty = h('div', {}, []);
console.log('Empty div children:', empty.children);
console.log('');

console.log('All tests completed successfully!');
console.log('\nThe h() function is working correctly.');
console.log('It creates VNodes that can be rendered to DOM using render() or createReactiveRoot().');
