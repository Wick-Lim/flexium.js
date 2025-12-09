import { JSDOM } from 'jsdom';
import { state, effect } from '../../packages/flexium/dist/index.mjs';
import { h, render } from '../../packages/flexium/dist/dom.mjs';
import { performance } from 'perf_hooks';

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><body><div id="app"></div></body>');
global.window = dom.window;
global.document = dom.window.document;
global.Node = dom.window.Node;
global.Text = dom.window.Text;
global.HTMLElement = dom.window.HTMLElement;
global.requestAnimationFrame = (fn) => setTimeout(fn, 0); // Mock RAF

console.log('=== Flexium Renderer Benchmark ===\n');

function bench(name, fn) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
}

const ROW_COUNT = 5000;

function Row(props) {
    return h('div', { key: props.id, className: 'row' }, [
        h('span', { className: 'col-id' }, [props.id]),
        h('span', { className: 'col-label' }, [props.label])
    ]);
}

function App() {
    const [data, setData] = state([]);
    
    // Expose setter to global for benchmark
    global.setRows = setData;

    return () => {
        return h('div', { id: 'container' }, [
            data.map(item => h(Row, { id: item.id, label: item.label }))
        ]);
    };
}

const container = document.getElementById('app');

// 1. Initial Render (Mount)
const initialData = Array.from({ length: ROW_COUNT }, (_, i) => ({ id: i, label: `Row ${i}` }));

bench(`Mount ${ROW_COUNT} Rows`, () => {
    render(h(App, {}), container);
    global.setRows(initialData);
});

// 2. Update (Partial)
// Change every 10th row's label
bench(`Update 10% of ${ROW_COUNT} Rows`, () => {
    global.setRows(rows => rows.map((r, i) => 
        i % 10 === 0 ? { ...r, label: `Updated ${r.id}` } : r
    ));
});

// 3. Swap Rows (Keyed Reconciliation Test)
// Swap 2nd and 2nd-to-last
bench(`Swap Rows (Reconciliation)`, () => {
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

// 4. Append Rows
bench(`Append 1000 Rows`, () => {
    global.setRows(rows => [
        ...rows, 
        ...Array.from({ length: 1000 }, (_, i) => ({ id: ROW_COUNT + i, label: `New ${i}` }))
    ]);
});

// 5. Clear All
bench(`Clear All Rows`, () => {
    global.setRows([]);
});
