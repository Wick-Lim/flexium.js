import { test } from 'node:test';
import assert from 'node:assert';
import { signal, effect, onCleanup, root } from '../../packages/flexium/dist/index.mjs';

test('onCleanup runs when effect re-runs', () => {
    const count = signal(0);
    let cleanupCount = 0;

    effect(() => {
        // Access signal to track dependency
        const val = count.value;
        onCleanup(() => {
            cleanupCount++;
        });
    });

    assert.strictEqual(cleanupCount, 0);

    count.value = 1;
    assert.strictEqual(cleanupCount, 1);

    count.value = 2;
    assert.strictEqual(cleanupCount, 2);
});

test('onCleanup runs when effect is disposed', () => {
    const count = signal(0);
    let cleanupCount = 0;

    const dispose = effect(() => {
        const val = count.value;
        onCleanup(() => {
            cleanupCount++;
        });
    });

    assert.strictEqual(cleanupCount, 0);

    dispose();
    assert.strictEqual(cleanupCount, 1);
});

test('multiple onCleanup callbacks', () => {
    const count = signal(0);
    let cleanup1 = 0;
    let cleanup2 = 0;

    effect(() => {
        const val = count.value;
        onCleanup(() => cleanup1++);
        onCleanup(() => cleanup2++);
    });

    count.value = 1;
    assert.strictEqual(cleanup1, 1);
    assert.strictEqual(cleanup2, 1);
});

test('onCleanup works with returned cleanup function', () => {
    const count = signal(0);
    let cleanup1 = 0;
    let cleanup2 = 0;

    effect(() => {
        const val = count.value;
        onCleanup(() => cleanup1++);
        return () => cleanup2++;
    });

    count.value = 1;
    assert.strictEqual(cleanup1, 1);
    assert.strictEqual(cleanup2, 1);
});
