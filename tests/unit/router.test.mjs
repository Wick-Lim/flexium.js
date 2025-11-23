import { test } from 'node:test';
import assert from 'node:assert';
import { createLocation, matchPath } from '../../packages/flexium/dist/test-exports.mjs';

// Mock window location and history
global.window = {
    location: {
        pathname: '/',
        search: '',
        hash: ''
    },
    history: {
        pushState: (state, title, url) => {
            global.window.location.pathname = url;
        }
    },
    addEventListener: () => { }
};

test('matchPath matches simple paths', () => {
    const { matches, params } = matchPath('/users', '/users');
    assert.strictEqual(matches, true);
    assert.deepStrictEqual(params, {});
});

test('matchPath matches parameters', () => {
    const { matches, params } = matchPath('/users/123', '/users/:id');
    assert.strictEqual(matches, true);
    assert.deepStrictEqual(params, { id: '123' });
});

test('matchPath fails on mismatch', () => {
    const { matches } = matchPath('/users', '/posts');
    assert.strictEqual(matches, false);
});

test('createLocation updates on navigation', () => {
    const [location, navigate] = createLocation();

    assert.strictEqual(location.value.pathname, '/');

    navigate('/about');
    assert.strictEqual(location.value.pathname, '/about');
    assert.strictEqual(global.window.location.pathname, '/about');
});
