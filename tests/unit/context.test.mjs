import { test } from 'node:test';
import assert from 'node:assert';
import { createContext, useContext, signal, effect, root } from '../../packages/flexium/dist/test-exports.mjs';
import { mountReactive } from '../../packages/flexium/dist/dom.mjs';
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
        assert.strictEqual(useContext(ThemeContext), 'light');
    });

    await t.test('should provide value to children', () => {
        const ThemeContext = createContext('light');
        let value;

        const Child = () => {
            value = useContext(ThemeContext);
            return null;
        };

        const App = () => ({
            type: ThemeContext.Provider,
            props: { value: 'dark' },
            children: [{ type: Child, props: {}, children: [] }]
        });

        root((dispose) => {
            mountReactive({ type: App, props: {}, children: [] });
            assert.strictEqual(value, 'dark');
            dispose();
        });
    });

    await t.test('should handle nested providers', () => {
        const ThemeContext = createContext('light');
        const values = [];

        const Child = () => {
            values.push(useContext(ThemeContext));
            return null;
        };

        const Inner = () => ({
            type: ThemeContext.Provider,
            props: { value: 'blue' },
            children: [{ type: Child, props: {}, children: [] }]
        });

        const Outer = () => ({
            type: ThemeContext.Provider,
            props: { value: 'dark' },
            children: [
                { type: Child, props: {}, children: [] }, // Should be dark
                { type: Inner, props: {}, children: [] }  // Should be blue
            ]
        });

        root((dispose) => {
            mountReactive({ type: Outer, props: {}, children: [] });
            assert.deepStrictEqual(values, ['dark', 'blue']);
            dispose();
        });
    });

    await t.test('should react to updates', () => {
        const ThemeContext = createContext('light');
        const theme = signal('light');
        let value;

        const Child = () => {
            value = useContext(ThemeContext);
            return null;
        };

        const App = () => ({
            type: ThemeContext.Provider,
            props: { value: theme }, // Pass signal directly? No, usually value={theme.value}
            // But mountReactive sets up effect. If we pass signal as value, we need to access .value in Provider?
            // No, Provider props are reactive if we pass a getter or signal?
            // In Flexium, props are just values unless we pass a signal.
            // If we pass `value: theme`, it's the signal object.
            // If we pass `value: theme.value`, it's the value at that moment.
            // BUT `mountReactive` wraps the component in an effect.
            // So if we use `theme.value` in the props expression, it tracks!

            // Wait, `App` is a function. It runs once?
            // If `App` is a component, `mountReactive` runs it in an effect.
            // So if `App` reads `theme.value`, it re-runs when `theme` changes.
            children: [{ type: Child, props: {}, children: [] }]
        });

        // We need App to re-run to update the Provider's value.
        const ReactiveApp = () => ({
            type: ThemeContext.Provider,
            props: { value: theme.value },
            children: [{ type: Child, props: {}, children: [] }]
        });

        root((dispose) => {
            mountReactive({ type: ReactiveApp, props: {}, children: [] });
            assert.strictEqual(value, 'light');

            theme.value = 'dark';
            // Updates are synchronous in signals unless batched?
            // Effects run immediately.
            assert.strictEqual(value, 'dark');

            dispose();
        });
    });
});
