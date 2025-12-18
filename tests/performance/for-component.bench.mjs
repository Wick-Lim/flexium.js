import { JSDOM } from 'jsdom';
import { state, For } from '../../packages/flexium/dist/index.mjs';
import { h, render } from '../../packages/flexium/dist/dom.mjs';
import { performance } from 'perf_hooks';

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><body><div id="app"></div></body>');
global.window = dom.window;
global.document = dom.window.document;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.HTMLElement = dom.window.HTMLElement;
global.requestAnimationFrame = (fn) => setTimeout(fn, 0);

console.log('=== Flexium <For> Component Benchmark ===\n');

function bench(name, fn) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
}

const ROW_COUNT = 5000;

function Row(props) {
    return h('div', { className: 'row' }, [
        h('span', { className: 'col-id' }, [props.id]),
        h('span', { className: 'col-label' }, [props.label])
    ]);
}

function App() {
    const [data, setData] = use([]);
    global.setRows = setData;

    return () => {
        return h('div', { id: 'container' }, [
            // DX Improvement: Use data.map directly!
            // This internally returns <For each={data}>...</For>
            data.map((item) => h(Row, { id: item.id, label: item.label }))
        ]);
    };
}

const container = document.getElementById('app');

// 1. Mount
const initialData = Array.from({ length: ROW_COUNT }, (_, i) => ({ id: i, label: `Row ${i}` }));

bench(`Mount ${ROW_COUNT} Rows (For)`, () => {
    render(h(App, {}), container);
    global.setRows(initialData);
});

// 2. Update (Partial)
// Create new array (immutable update), but reuse mostly same objects
bench(`Update 10% of ${ROW_COUNT} Rows (For)`, () => {
    global.setRows(rows => rows.map((r, i) => 
        i % 10 === 0 ? { ...r, label: `Updated ${r.id}` } : r // Same reference for 90%
    ));
});

// 3. Swap Rows
bench(`Swap Rows (For)`, () => {
    global.setRows(rows => {
        const newRows = [...rows];
        const idxA = 1;
        const idxB = newRows.length - 2;
        const temp = newRows[idxA];
        newRows[idxA] = newRows[idxB];
        newRows[idxB] = temp;
        return newRows;
    });
});

// 4. Append
bench(`Append 1000 Rows (For)`, () => {
    global.setRows(rows => [
        ...rows, 
        ...Array.from({ length: 1000 }, (_, i) => ({ id: ROW_COUNT + i, label: `New ${i}` }))
    ]);
});
