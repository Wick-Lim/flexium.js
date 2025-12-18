import { useState, useEffect } from './src/core';
import { render } from './src/dom';

// Minimal usage
const [count, setCount] = use(0);
use(() => {
    console.log(count);
}, []);

const app = document.createElement('div');
render(() => `Count: ${count}`, app);
