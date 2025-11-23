import { test } from 'node:test';
import assert from 'node:assert';
import { createStore, effect } from '../../packages/flexium/dist/test-exports.mjs';

test('createStore initializes with state', () => {
    const [state] = createStore({ count: 0 });
    assert.strictEqual(state.count, 0);
});

test('createStore updates primitive values', () => {
    const [state, setState] = createStore({ count: 0 });

    let currentCount;
    effect(() => {
        currentCount = state.count;
    });

    assert.strictEqual(currentCount, 0);

    setState('count', 1);
    assert.strictEqual(currentCount, 1);
    assert.strictEqual(state.count, 1);
});

test('createStore updates nested values', () => {
    const [state, setState] = createStore({ user: { name: 'John' } });

    let currentName;
    effect(() => {
        currentName = state.user.name;
    });

    assert.strictEqual(currentName, 'John');

    setState('user', 'name', 'Jane');
    assert.strictEqual(currentName, 'Jane');
    assert.strictEqual(state.user.name, 'Jane');
});

test('createStore handles independent updates', () => {
    const [state, setState] = createStore({ a: 1, b: 2 });

    let countA = 0;
    let countB = 0;

    effect(() => {
        state.a;
        countA++;
    });

    effect(() => {
        state.b;
        countB++;
    });

    assert.strictEqual(countA, 1);
    assert.strictEqual(countB, 1);

    setState('a', 2);
    assert.strictEqual(countA, 2);
    assert.strictEqual(countB, 1);
});
