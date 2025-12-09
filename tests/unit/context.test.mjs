import { test } from 'node:test';
import assert from 'node:assert';
import { createContext, context, signal, effect, root } from '../../packages/flexium/dist/test-exports.mjs';
import { JSDOM } from 'jsdom';

// Setup JSDOM
const dom = new JSDOM('<!DOCTYPE html><body></body>');
global.document = dom.window.document;
global.Node = dom.window.Node;
global.HTMLElement = dom.window.HTMLElement;
global.Text = dom.window.Text;

test('Context API', async (t) => {
    await t.test('should return default value when no provider', () => {
        const ThemeContext = createContext('light');
        // context() returns the default value when no provider is active
        assert.strictEqual(context(ThemeContext), 'light');
    });

    await t.test('should create context with default value', () => {
        const CountContext = createContext(0);
        assert.strictEqual(context(CountContext), 0);

        const StringContext = createContext('default');
        assert.strictEqual(context(StringContext), 'default');

        const ObjectContext = createContext({ name: 'test' });
        assert.deepStrictEqual(context(ObjectContext), { name: 'test' });
    });

    await t.test('createContext returns object with Provider', () => {
        const TestContext = createContext('value');
        assert.ok(TestContext.Provider !== undefined);
        assert.ok(typeof TestContext.Provider === 'function' || typeof TestContext.Provider === 'object');
    });

    await t.test('context returns null for context without default', () => {
        const NoDefaultContext = createContext(null);
        assert.strictEqual(context(NoDefaultContext), null);
    });
});
