import { test } from 'node:test';
import assert from 'node:assert';
import { signal, createResource, effect } from '../../packages/flexium/dist/test-exports.mjs';

test('createResource fetches data', async () => {
    const fetcher = async () => {
        return 'data';
    };

    const [data] = createResource('source', fetcher);

    assert.strictEqual(data.loading, true);
    assert.strictEqual(data.state, 'pending');
    assert.strictEqual(data(), undefined);

    // Wait for promise resolution
    await new Promise(resolve => setTimeout(resolve, 10));

    assert.strictEqual(data.loading, false);
    assert.strictEqual(data.state, 'ready');
    assert.strictEqual(data(), 'data');
});

test('createResource handles errors', async () => {
    const fetcher = async () => {
        throw new Error('fail');
    };

    const [data] = createResource('source', fetcher);

    await new Promise(resolve => setTimeout(resolve, 10));

    assert.strictEqual(data.loading, false);
    assert.strictEqual(data.state, 'errored');
    assert.strictEqual(data.error.message, 'fail');
});

test('createResource reacts to source changes', async () => {
    const id = signal(1);
    const fetcher = async (id) => {
        return `data-${id}`;
    };

    const [data] = createResource(id, fetcher);

    await new Promise(resolve => setTimeout(resolve, 10));
    assert.strictEqual(data(), 'data-1');

    id.value = 2;
    assert.strictEqual(data.loading, true);

    await new Promise(resolve => setTimeout(resolve, 10));
    assert.strictEqual(data(), 'data-2');
});

test('createResource refetch', async () => {
    let count = 0;
    const fetcher = async () => {
        return ++count;
    };

    const [data, { refetch }] = createResource('source', fetcher);

    await new Promise(resolve => setTimeout(resolve, 10));
    assert.strictEqual(data(), 1);

    refetch();
    assert.strictEqual(data.state, 'refreshing');
    assert.strictEqual(data.loading, true);
    // Should keep old value while refreshing
    assert.strictEqual(data(), 1);

    await new Promise(resolve => setTimeout(resolve, 10));
    assert.strictEqual(data(), 2);
    assert.strictEqual(data.loading, false);
});
