/**
 * Primitives Component Tests
 *
 * Tests for UI primitives: Text, Image, Pressable, ScrollView, Button
 * and layout components: Row, Column, Stack, Grid, Spacer
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';

// Import primitives from dist
import {
    Text,
    Image,
    Pressable,
    ScrollView,
    Row,
    Column,
    Stack,
    Grid,
    Spacer,
    Button
} from '../../packages/flexium/dist/primitives.mjs';

describe('Text component', () => {
    test('creates span element with children', () => {
        const vnode = Text({ children: 'Hello World' });

        assert.strictEqual(vnode.type, 'span');
        assert.deepStrictEqual(vnode.children, ['Hello World']);
    });

    test('applies style prop', () => {
        const vnode = Text({
            children: 'Styled',
            style: { color: 'blue', fontSize: 16 }
        });

        assert.strictEqual(vnode.props.style.color, 'blue');
        assert.strictEqual(vnode.props.style.fontSize, 16);
    });

    test('handles onClick and onPress', () => {
        const handler = () => { };
        const vnode1 = Text({ children: 'Click', onClick: handler });
        const vnode2 = Text({ children: 'Press', onPress: handler });

        assert.strictEqual(vnode1.props.onclick, handler);
        assert.strictEqual(vnode2.props.onclick, handler);
    });

    test('handles className and class prop', () => {
        const vnode1 = Text({ children: 'Test', className: 'text-class' });
        const vnode2 = Text({ children: 'Test', class: 'text-class-2' });

        assert.strictEqual(vnode1.props.class, 'text-class');
        assert.strictEqual(vnode2.props.class, 'text-class-2');
    });

    test('handles array children', () => {
        const vnode = Text({ children: ['Hello', ' ', 'World'] });
        assert.deepStrictEqual(vnode.children, ['Hello', ' ', 'World']);
    });

    test('handles empty children', () => {
        const vnode = Text({});
        assert.deepStrictEqual(vnode.children, []);
    });
});

describe('Image component', () => {
    test('creates img element with src and alt', () => {
        const vnode = Image({ src: '/logo.png', alt: 'Logo' });

        assert.strictEqual(vnode.type, 'img');
        assert.strictEqual(vnode.props.src, '/logo.png');
        assert.strictEqual(vnode.props.alt, 'Logo');
        assert.deepStrictEqual(vnode.children, []);
    });

    test('provides default empty alt', () => {
        const vnode = Image({ src: '/image.png' });
        assert.strictEqual(vnode.props.alt, '');
    });

    test('applies width and height', () => {
        const vnode = Image({
            src: '/img.png',
            width: 100,
            height: 50
        });

        assert.strictEqual(vnode.props.style.width, 100);
        assert.strictEqual(vnode.props.style.height, 50);
    });

    test('handles onLoad and onError', () => {
        const onLoad = () => { };
        const onError = () => { };
        const vnode = Image({
            src: '/img.png',
            onLoad,
            onError
        });

        assert.strictEqual(vnode.props.onload, onLoad);
        assert.strictEqual(vnode.props.onerror, onError);
    });

    test('merges style with dimensions', () => {
        const vnode = Image({
            src: '/img.png',
            width: 200,
            style: { borderRadius: 10 }
        });

        assert.strictEqual(vnode.props.style.width, 200);
        assert.strictEqual(vnode.props.style.borderRadius, 10);
    });
});

describe('Pressable component', () => {
    test('creates div element', () => {
        const vnode = Pressable({ children: 'Press me' });
        assert.strictEqual(vnode.type, 'div');
    });

    test('handles onPress callback', () => {
        const handler = () => { };
        const vnode = Pressable({ children: 'Press', onPress: handler });
        assert.strictEqual(vnode.props.onclick, handler);
    });

    test('applies cursor pointer style', () => {
        const vnode = Pressable({ children: 'Press' });
        assert.strictEqual(vnode.props.style.cursor, 'pointer');
    });

    test('handles disabled state', () => {
        const vnode = Pressable({ children: 'Disabled', disabled: true });
        assert.strictEqual(vnode.props.style.cursor, 'not-allowed');
        assert.strictEqual(vnode.props.style.opacity, 0.5);
    });
});

describe('ScrollView component', () => {
    test('creates div with overflow auto', () => {
        const vnode = ScrollView({ children: 'Content' });
        assert.strictEqual(vnode.type, 'div');
        assert.strictEqual(vnode.props.style.overflow, 'auto');
    });

    test('handles horizontal scroll', () => {
        const vnode = ScrollView({ children: 'Content', horizontal: true });
        assert.strictEqual(vnode.props.style.overflowX, 'auto');
        assert.strictEqual(vnode.props.style.overflowY, 'hidden');
    });

    test('handles showsScrollIndicator false', () => {
        const vnode = ScrollView({
            children: 'Content',
            showsScrollIndicator: false
        });
        // Should hide scrollbar (implementation dependent)
        assert.ok(vnode.props.style);
    });
});

describe('Row component', () => {
    test('creates flex row container', () => {
        const vnode = Row({ children: 'Items' });
        assert.strictEqual(vnode.type, 'div');
        assert.strictEqual(vnode.props.style.display, 'flex');
        assert.strictEqual(vnode.props.style.flexDirection, 'row');
    });

    test('applies gap', () => {
        const vnode = Row({ children: 'Items', gap: 10 });
        assert.strictEqual(vnode.props.style.gap, 10);
    });

    test('applies align and justify', () => {
        const vnode = Row({
            children: 'Items',
            align: 'center',
            justify: 'space-between'
        });
        assert.strictEqual(vnode.props.style.alignItems, 'center');
        assert.strictEqual(vnode.props.style.justifyContent, 'space-between');
    });

    test('handles wrap prop', () => {
        const vnode = Row({ children: 'Items', wrap: true });
        assert.strictEqual(vnode.props.style.flexWrap, 'wrap');
    });
});

describe('Column component', () => {
    test('creates flex column container', () => {
        const vnode = Column({ children: 'Items' });
        assert.strictEqual(vnode.type, 'div');
        assert.strictEqual(vnode.props.style.display, 'flex');
        assert.strictEqual(vnode.props.style.flexDirection, 'column');
    });

    test('applies gap', () => {
        const vnode = Column({ children: 'Items', gap: 20 });
        assert.strictEqual(vnode.props.style.gap, 20);
    });
});

describe('Stack component', () => {
    test('creates positioned container', () => {
        const vnode = Stack({ children: 'Layers' });
        assert.strictEqual(vnode.type, 'div');
        assert.strictEqual(vnode.props.style.position, 'relative');
    });
});

describe('Grid component', () => {
    test('creates grid container', () => {
        const vnode = Grid({ children: 'Items', columns: 3 });
        assert.strictEqual(vnode.type, 'div');
        assert.strictEqual(vnode.props.style.display, 'grid');
    });

    test('applies columns', () => {
        const vnode = Grid({ children: 'Items', columns: 4 });
        assert.strictEqual(vnode.props.style.gridTemplateColumns, 'repeat(4, 1fr)');
    });

    test('applies gap', () => {
        const vnode = Grid({ children: 'Items', columns: 2, gap: 16 });
        assert.strictEqual(vnode.props.style.gap, 16);
    });
});

describe('Spacer component', () => {
    test('creates flex spacer', () => {
        const vnode = Spacer({});
        assert.strictEqual(vnode.type, 'div');
        assert.strictEqual(vnode.props.style.flex, 1);
    });

    test('applies custom size', () => {
        const vnode = Spacer({ size: 20 });
        assert.strictEqual(vnode.props.style.width, 20);
        assert.strictEqual(vnode.props.style.height, 20);
    });
});

describe('Button component', () => {
    test('creates button element', () => {
        const vnode = Button({ children: 'Click me' });
        assert.strictEqual(vnode.type, 'button');
    });

    test('handles onClick', () => {
        const handler = () => { };
        const vnode = Button({ children: 'Click', onClick: handler });
        assert.strictEqual(vnode.props.onclick, handler);
    });

    test('handles disabled state', () => {
        const vnode = Button({ children: 'Disabled', disabled: true });
        assert.strictEqual(vnode.props.disabled, true);
    });

    test('applies variant styles', () => {
        const primary = Button({ children: 'Primary', variant: 'primary' });
        const secondary = Button({ children: 'Secondary', variant: 'secondary' });

        // Variants should have different styles
        assert.ok(primary.props.style);
        assert.ok(secondary.props.style);
    });

    test('handles loading state', () => {
        const vnode = Button({ children: 'Submit', loading: true });
        assert.strictEqual(vnode.props.disabled, true);
    });
});
