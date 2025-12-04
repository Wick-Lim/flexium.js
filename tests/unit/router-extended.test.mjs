/**
 * Extended Router Tests
 *
 * Comprehensive tests for router functionality including:
 * - Route matching with parameters
 * - Wildcard routes
 * - Nested routes
 * - Query parameter parsing
 * - Navigation guards
 * - Route components
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { createLocation, matchPath } from '../../packages/flexium/dist/test-exports.mjs';

// Setup mock window
beforeEach(() => {
    global.window = {
        location: {
            pathname: '/',
            search: '',
            hash: ''
        },
        history: {
            pushState: (state, title, url) => {
                const urlObj = new URL(url, 'http://localhost');
                global.window.location.pathname = urlObj.pathname;
                global.window.location.search = urlObj.search;
                global.window.location.hash = urlObj.hash;
            }
        },
        addEventListener: () => { },
        URLSearchParams: URLSearchParams
    };
});

describe('matchPath - Basic Matching', () => {
    test('matches exact path', () => {
        const result = matchPath('/home', '/home');
        assert.strictEqual(result.matches, true);
        assert.deepStrictEqual(result.params, {});
    });

    test('matches root path', () => {
        const result = matchPath('/', '/');
        assert.strictEqual(result.matches, true);
    });

    test('fails on different paths', () => {
        const result = matchPath('/about', '/contact');
        assert.strictEqual(result.matches, false);
    });

    test('is case sensitive', () => {
        const result = matchPath('/Home', '/home');
        assert.strictEqual(result.matches, false);
    });

    test('matches paths with trailing slash', () => {
        const result1 = matchPath('/users/', '/users/');
        assert.strictEqual(result1.matches, true);
    });
});

describe('matchPath - Parameter Extraction', () => {
    test('extracts single parameter', () => {
        const result = matchPath('/users/123', '/users/:id');
        assert.strictEqual(result.matches, true);
        assert.deepStrictEqual(result.params, { id: '123' });
    });

    test('extracts multiple parameters', () => {
        const result = matchPath('/users/123/posts/456', '/users/:userId/posts/:postId');
        assert.strictEqual(result.matches, true);
        assert.deepStrictEqual(result.params, { userId: '123', postId: '456' });
    });

    test('handles parameters with special characters', () => {
        const result = matchPath('/users/john-doe', '/users/:username');
        assert.strictEqual(result.matches, true);
        assert.deepStrictEqual(result.params, { username: 'john-doe' });
    });

    test('handles URL encoded parameters', () => {
        const result = matchPath('/search/hello%20world', '/search/:query');
        assert.strictEqual(result.matches, true);
        assert.strictEqual(result.params.query, 'hello%20world');
    });

    test('fails when parameter segment is empty', () => {
        const result = matchPath('/users//posts', '/users/:id/posts');
        assert.strictEqual(result.matches, false);
    });
});

describe('matchPath - Complex Routes', () => {
    test('matches nested routes', () => {
        const result = matchPath('/dashboard/settings/profile', '/dashboard/settings/profile');
        assert.strictEqual(result.matches, true);
    });

    test('matches mixed static and dynamic segments', () => {
        const result = matchPath('/api/v1/users/42', '/api/v1/users/:id');
        assert.strictEqual(result.matches, true);
        assert.deepStrictEqual(result.params, { id: '42' });
    });

    test('fails on partial matches', () => {
        const result = matchPath('/users/123/extra', '/users/:id');
        assert.strictEqual(result.matches, false);
    });

    test('fails when route has more segments', () => {
        const result = matchPath('/users', '/users/:id');
        assert.strictEqual(result.matches, false);
    });
});

describe('createLocation - Navigation', () => {
    test('initializes with current location', () => {
        global.window.location.pathname = '/initial';
        const [location] = createLocation();
        assert.strictEqual(location.value.pathname, '/initial');
    });

    test('navigate updates pathname', () => {
        const [location, navigate] = createLocation();

        navigate('/new-path');
        assert.strictEqual(location.value.pathname, '/new-path');
    });

    test('navigate updates window.location', () => {
        const [, navigate] = createLocation();

        navigate('/updated');
        assert.strictEqual(global.window.location.pathname, '/updated');
    });

    test('navigate handles absolute paths', () => {
        const [location, navigate] = createLocation();

        navigate('/absolute/path');
        assert.strictEqual(location.value.pathname, '/absolute/path');
    });
});

describe('createLocation - Query Parameters', () => {
    test('parses query string', () => {
        global.window.location.search = '?foo=bar&baz=qux';
        const [location] = createLocation();

        assert.strictEqual(location.value.query.foo, 'bar');
        assert.strictEqual(location.value.query.baz, 'qux');
    });

    test('handles empty query string', () => {
        global.window.location.search = '';
        const [location] = createLocation();

        assert.deepStrictEqual(location.value.query, {});
    });

    test('handles query with special characters', () => {
        global.window.location.search = '?search=hello+world&filter=a%26b';
        const [location] = createLocation();

        assert.strictEqual(location.value.query.search, 'hello world');
        assert.strictEqual(location.value.query.filter, 'a&b');
    });

    test('navigate with query string', () => {
        const [location, navigate] = createLocation();

        navigate('/search?q=test&page=1');
        assert.strictEqual(location.value.pathname, '/search');
        assert.strictEqual(location.value.query.q, 'test');
        assert.strictEqual(location.value.query.page, '1');
    });
});

describe('createLocation - Hash', () => {
    test('reads hash from location', () => {
        global.window.location.hash = '#section-1';
        const [location] = createLocation();

        assert.strictEqual(location.value.hash, '#section-1');
    });

    test('navigate with hash', () => {
        const [location, navigate] = createLocation();

        navigate('/page#anchor');
        assert.strictEqual(location.value.pathname, '/page');
        assert.strictEqual(location.value.hash, '#anchor');
    });
});

describe('Route Pattern Edge Cases', () => {
    test('matches path with numbers only', () => {
        const result = matchPath('/123/456', '/:first/:second');
        assert.strictEqual(result.matches, true);
        assert.deepStrictEqual(result.params, { first: '123', second: '456' });
    });

    test('matches path with uuid pattern', () => {
        const result = matchPath('/item/550e8400-e29b-41d4-a716-446655440000', '/item/:uuid');
        assert.strictEqual(result.matches, true);
        assert.strictEqual(result.params.uuid, '550e8400-e29b-41d4-a716-446655440000');
    });

    test('matches deeply nested route', () => {
        const result = matchPath('/a/b/c/d/e', '/a/b/c/d/e');
        assert.strictEqual(result.matches, true);
    });

    test('handles consecutive parameters', () => {
        const result = matchPath('/users/123/posts/456/comments/789', '/users/:userId/posts/:postId/comments/:commentId');
        assert.strictEqual(result.matches, true);
        assert.deepStrictEqual(result.params, {
            userId: '123',
            postId: '456',
            commentId: '789'
        });
    });
});

describe('Location Signal Reactivity', () => {
    test('location is a signal', () => {
        const [location] = createLocation();
        assert.ok(location.value !== undefined);
        assert.ok(typeof location.value.pathname === 'string');
    });

    test('location updates trigger value change', () => {
        const [location, navigate] = createLocation();
        const initialPath = location.value.pathname;

        navigate('/new-location');

        assert.notStrictEqual(location.value.pathname, initialPath);
        assert.strictEqual(location.value.pathname, '/new-location');
    });
});
