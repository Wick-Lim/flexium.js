import { state, effect } from './src/core';
import { render } from './src/dom';

// Minimal usage
const [count, setCount] = state(0);
effect(() => {
    console.log(count);
});

const app = document.createElement('div');
render(() => `Count: ${count}`, app);
