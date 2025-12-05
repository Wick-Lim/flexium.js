/**
 * SSR Module Tests
 *
 * Tests for server-side rendering functionality
 * @vitest-environment node
 */

import { describe, it, expect } from 'vitest';
import { renderToString } from '../index';
import { createFNode } from '../../core/vnode';
import { signal, computed } from '../../core/signal';

describe('renderToString', () => {
  describe('Basic Elements', () => {
    it('should render a simple div element', () => {
      const vnode = createFNode('div', {}, []);
      expect(renderToString(vnode)).toBe('<div></div>');
    });

    it('should render element with text content', () => {
      const vnode = createFNode('div', {}, ['Hello World']);
      expect(renderToString(vnode)).toBe('<div>Hello World</div>');
    });

    it('should render element with multiple text children', () => {
      const vnode = createFNode('div', {}, ['Hello', ' ', 'World']);
      expect(renderToString(vnode)).toBe('<div>Hello World</div>');
    });

    it('should render nested elements', () => {
      const child = createFNode('span', {}, ['inner']);
      const vnode = createFNode('div', {}, [child]);
      expect(renderToString(vnode)).toBe('<div><span>inner</span></div>');
    });

    it('should render deeply nested elements', () => {
      const innermost = createFNode('em', {}, ['text']);
      const middle = createFNode('strong', {}, [innermost]);
      const outer = createFNode('p', {}, [middle]);
      expect(renderToString(outer)).toBe('<p><strong><em>text</em></strong></p>');
    });
  });

  describe('Void Elements', () => {
    it('should render img as self-closing', () => {
      const vnode = createFNode('img', { src: 'test.jpg', alt: 'test' }, []);
      expect(renderToString(vnode)).toBe('<img src="test.jpg" alt="test"/>');
    });

    it('should render br as self-closing', () => {
      const vnode = createFNode('br', {}, []);
      expect(renderToString(vnode)).toBe('<br/>');
    });

    it('should render input as self-closing', () => {
      const vnode = createFNode('input', { type: 'text', value: 'test' }, []);
      expect(renderToString(vnode)).toBe('<input type="text" value="test"/>');
    });

    it('should render hr as self-closing', () => {
      const vnode = createFNode('hr', {}, []);
      expect(renderToString(vnode)).toBe('<hr/>');
    });

    it('should render meta as self-closing', () => {
      const vnode = createFNode('meta', { charset: 'utf-8' }, []);
      expect(renderToString(vnode)).toBe('<meta charset="utf-8"/>');
    });

    it('should render link as self-closing', () => {
      const vnode = createFNode('link', { rel: 'stylesheet', href: 'style.css' }, []);
      expect(renderToString(vnode)).toBe('<link rel="stylesheet" href="style.css"/>');
    });

    it('should ignore children for void elements', () => {
      const vnode = createFNode('img', { src: 'test.jpg' }, ['ignored']);
      expect(renderToString(vnode)).toBe('<img src="test.jpg"/>');
    });
  });

  describe('HTML Escaping for XSS Prevention', () => {
    it('should escape < and > in text content', () => {
      const vnode = createFNode('div', {}, ['<script>alert("xss")</script>']);
      expect(renderToString(vnode)).toBe('<div>&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;</div>');
    });

    it('should escape & in text content', () => {
      const vnode = createFNode('div', {}, ['Fish & Chips']);
      expect(renderToString(vnode)).toBe('<div>Fish &amp; Chips</div>');
    });

    it('should escape quotes in text content', () => {
      const vnode = createFNode('div', {}, ['He said "Hello"']);
      expect(renderToString(vnode)).toBe('<div>He said &quot;Hello&quot;</div>');
    });

    it('should escape single quotes in text content', () => {
      const vnode = createFNode('div', {}, ["It's a test"]);
      expect(renderToString(vnode)).toBe('<div>It&#039;s a test</div>');
    });

    it('should escape attribute values', () => {
      const vnode = createFNode('div', { title: '<script>' }, []);
      expect(renderToString(vnode)).toBe('<div title="&lt;script&gt;"></div>');
    });

    it('should escape complex XSS attempts', () => {
      const vnode = createFNode('div', { 'data-value': '"><script>alert("xss")</script>' }, []);
      expect(renderToString(vnode)).toBe('<div data-value="&quot;&gt;&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;"></div>');
    });

    it('should handle multiple escape characters', () => {
      const vnode = createFNode('div', {}, ['<>"&\'']);
      expect(renderToString(vnode)).toBe('<div>&lt;&gt;&quot;&amp;&#039;</div>');
    });
  });

  describe('Signal Value Extraction', () => {
    it('should extract signal value during SSR', () => {
      const count = signal(42);
      const vnode = createFNode('div', {}, [count]);
      expect(renderToString(vnode)).toBe('<div>42</div>');
    });

    it('should extract computed signal value', () => {
      const count = signal(5);
      const doubled = computed(() => count.value * 2);
      const vnode = createFNode('div', {}, [doubled]);
      expect(renderToString(vnode)).toBe('<div>10</div>');
    });

    it('should handle signal with string value', () => {
      const text = signal('Hello Signal');
      const vnode = createFNode('div', {}, [text]);
      expect(renderToString(vnode)).toBe('<div>Hello Signal</div>');
    });

    it('should handle multiple signals as children', () => {
      const first = signal('Hello');
      const second = signal('World');
      const vnode = createFNode('div', {}, [first, ' ', second]);
      expect(renderToString(vnode)).toBe('<div>Hello World</div>');
    });

    it('should handle nested signal values', () => {
      const innerSignal = signal('inner');
      const child = createFNode('span', {}, [innerSignal]);
      const vnode = createFNode('div', {}, [child]);
      expect(renderToString(vnode)).toBe('<div><span>inner</span></div>');
    });

    it('should extract signal with null value', () => {
      const empty = signal(null);
      const vnode = createFNode('div', {}, [empty]);
      expect(renderToString(vnode)).toBe('<div></div>');
    });

    it('should extract signal with undefined value', () => {
      const empty = signal(undefined);
      const vnode = createFNode('div', {}, [empty]);
      expect(renderToString(vnode)).toBe('<div></div>');
    });
  });

  describe('Style Object to CSS String Conversion', () => {
    it('should convert style object to CSS string', () => {
      const vnode = createFNode('div', { style: { color: 'red', fontSize: '16px' } }, []);
      expect(renderToString(vnode)).toBe('<div style="color:red;font-size:16px"></div>');
    });

    it('should convert camelCase to kebab-case', () => {
      const vnode = createFNode('div', { style: { backgroundColor: 'blue' } }, []);
      expect(renderToString(vnode)).toBe('<div style="background-color:blue"></div>');
    });

    it('should handle multiple style properties', () => {
      const vnode = createFNode('div', {
        style: {
          width: '100px',
          height: '50px',
          marginTop: '10px',
          paddingLeft: '5px'
        }
      }, []);
      const result = renderToString(vnode);
      expect(result).toContain('width:100px');
      expect(result).toContain('height:50px');
      expect(result).toContain('margin-top:10px');
      expect(result).toContain('padding-left:5px');
    });

    it('should handle numeric style values', () => {
      const vnode = createFNode('div', { style: { opacity: 0.5, zIndex: 10 } }, []);
      const result = renderToString(vnode);
      expect(result).toContain('opacity:0.5');
      expect(result).toContain('z-index:10');
    });

    it('should escape style values', () => {
      const vnode = createFNode('div', { style: { content: '"<script>"' } }, []);
      expect(renderToString(vnode)).toContain('&quot;&lt;script&gt;&quot;');
    });
  });

  describe('Nested Elements and Children', () => {
    it('should render multiple levels of nesting', () => {
      const level3 = createFNode('span', {}, ['deep']);
      const level2 = createFNode('p', {}, [level3]);
      const level1 = createFNode('div', {}, [level2]);
      expect(renderToString(level1)).toBe('<div><p><span>deep</span></p></div>');
    });

    it('should handle mixed text and element children', () => {
      const span = createFNode('span', {}, ['bold']);
      const vnode = createFNode('div', {}, ['Text before ', span, ' text after']);
      expect(renderToString(vnode)).toBe('<div>Text before <span>bold</span> text after</div>');
    });

    it('should render list structures', () => {
      const li1 = createFNode('li', {}, ['Item 1']);
      const li2 = createFNode('li', {}, ['Item 2']);
      const li3 = createFNode('li', {}, ['Item 3']);
      const ul = createFNode('ul', {}, [li1, li2, li3]);
      expect(renderToString(ul)).toBe('<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>');
    });

    it('should render complex nested structures', () => {
      const img = createFNode('img', { src: 'avatar.jpg', alt: 'Avatar' }, []);
      const h2 = createFNode('h2', {}, ['Title']);
      const p = createFNode('p', {}, ['Description']);
      const article = createFNode('article', {}, [img, h2, p]);
      expect(renderToString(article)).toBe('<article><img src="avatar.jpg" alt="Avatar"/><h2>Title</h2><p>Description</p></article>');
    });
  });

  describe('Function Components', () => {
    it('should render function component', () => {
      const Component = () => createFNode('div', {}, ['Hello']);
      const vnode = createFNode(Component, {}, []);
      expect(renderToString(vnode)).toBe('<div>Hello</div>');
    });

    it('should pass props to function component', () => {
      const Component = (props: { name: string }) => {
        return createFNode('div', {}, [`Hello ${props.name}`]);
      };
      const vnode = createFNode(Component, { name: 'World' }, []);
      expect(renderToString(vnode)).toBe('<div>Hello World</div>');
    });

    it('should handle nested function components', () => {
      const Inner = (props: { text: string }) => createFNode('span', {}, [props.text]);
      const Outer = () => createFNode('div', {}, [createFNode(Inner, { text: 'nested' }, [])]);
      const vnode = createFNode(Outer, {}, []);
      expect(renderToString(vnode)).toBe('<div><span>nested</span></div>');
    });

    it('should handle component returning text', () => {
      const Component = () => 'Plain text';
      const vnode = createFNode(Component, {}, []);
      expect(renderToString(vnode)).toBe('Plain text');
    });

    it('should handle component returning null', () => {
      const Component = () => null;
      const vnode = createFNode(Component, {}, []);
      expect(renderToString(vnode)).toBe('');
    });

    it('should handle component with complex logic', () => {
      const Component = (props: { items: string[] }) => {
        const listItems = props.items.map(item => createFNode('li', {}, [item]));
        return createFNode('ul', {}, listItems);
      };
      const vnode = createFNode(Component, { items: ['a', 'b', 'c'] }, []);
      expect(renderToString(vnode)).toBe('<ul><li>a</li><li>b</li><li>c</li></ul>');
    });
  });

  describe('Fragments', () => {
    it('should render fragment with multiple children', () => {
      const child1 = createFNode('p', {}, ['First']);
      const child2 = createFNode('p', {}, ['Second']);
      const fragment = createFNode('fragment', {}, [child1, child2]);
      expect(renderToString(fragment)).toBe('<fragment><p>First</p><p>Second</p></fragment>');
    });

    it('should render empty fragment', () => {
      const fragment = createFNode('fragment', {}, []);
      expect(renderToString(fragment)).toBe('<fragment></fragment>');
    });

    it('should render fragment with mixed content', () => {
      const span = createFNode('span', {}, ['text']);
      const fragment = createFNode('fragment', {}, ['before', span, 'after']);
      expect(renderToString(fragment)).toBe('<fragment>before<span>text</span>after</fragment>');
    });
  });

  describe('Null/Undefined/Boolean Handling', () => {
    it('should render null as empty string', () => {
      expect(renderToString(null)).toBe('');
    });

    it('should render undefined as empty string', () => {
      expect(renderToString(undefined)).toBe('');
    });

    it('should render false as empty string', () => {
      expect(renderToString(false)).toBe('');
    });

    it('should render true as empty string', () => {
      expect(renderToString(true)).toBe('');
    });

    it('should handle null in children array', () => {
      const vnode = createFNode('div', {}, ['before', null, 'after']);
      expect(renderToString(vnode)).toBe('<div>beforeafter</div>');
    });

    it('should handle undefined in children array', () => {
      const vnode = createFNode('div', {}, ['before', undefined, 'after']);
      expect(renderToString(vnode)).toBe('<div>beforeafter</div>');
    });

    it('should handle false in children array', () => {
      const vnode = createFNode('div', {}, ['before', false, 'after']);
      expect(renderToString(vnode)).toBe('<div>beforeafter</div>');
    });

    it('should handle mixed null/undefined/false children', () => {
      const vnode = createFNode('div', {}, [null, 'text', undefined, false, 'more']);
      expect(renderToString(vnode)).toBe('<div>textmore</div>');
    });
  });

  describe('Arrays as Children', () => {
    it('should render array of text nodes', () => {
      const vnode = createFNode('div', {}, [['a', 'b', 'c']]);
      expect(renderToString(vnode)).toBe('<div>abc</div>');
    });

    it('should render array of elements', () => {
      const children = [
        createFNode('p', {}, ['1']),
        createFNode('p', {}, ['2']),
        createFNode('p', {}, ['3'])
      ];
      const vnode = createFNode('div', {}, [children]);
      expect(renderToString(vnode)).toBe('<div><p>1</p><p>2</p><p>3</p></div>');
    });

    it('should handle nested arrays', () => {
      const vnode = createFNode('div', {}, [[['nested', 'array']]]);
      expect(renderToString(vnode)).toBe('<div>nestedarray</div>');
    });

    it('should handle empty arrays', () => {
      const vnode = createFNode('div', {}, [[]]);
      expect(renderToString(vnode)).toBe('<div></div>');
    });

    it('should flatten mixed arrays and elements', () => {
      const span = createFNode('span', {}, ['span']);
      const vnode = createFNode('div', {}, [['a', 'b'], span, ['c', 'd']]);
      expect(renderToString(vnode)).toBe('<div>ab<span>span</span>cd</div>');
    });
  });

  describe('Class and ClassName Handling', () => {
    it('should render className attribute as class', () => {
      const vnode = createFNode('div', { className: 'container' }, []);
      expect(renderToString(vnode)).toBe('<div class="container"></div>');
    });

    it('should render class attribute', () => {
      const vnode = createFNode('div', { class: 'wrapper' }, []);
      expect(renderToString(vnode)).toBe('<div class="wrapper"></div>');
    });

    it('should handle multiple classes', () => {
      const vnode = createFNode('div', { className: 'btn btn-primary btn-lg' }, []);
      expect(renderToString(vnode)).toBe('<div class="btn btn-primary btn-lg"></div>');
    });

    it('should escape class values', () => {
      const vnode = createFNode('div', { className: 'test"><script>' }, []);
      expect(renderToString(vnode)).toBe('<div class="test&quot;&gt;&lt;script&gt;"></div>');
    });
  });

  describe('Attribute Rendering', () => {
    it('should render string attributes', () => {
      const vnode = createFNode('div', { id: 'main', 'data-test': 'value' }, []);
      const result = renderToString(vnode);
      expect(result).toContain('id="main"');
      expect(result).toContain('data-test="value"');
    });

    it('should render numeric attributes', () => {
      const vnode = createFNode('input', { type: 'number', max: 100, min: 0 }, []);
      const result = renderToString(vnode);
      expect(result).toContain('max="100"');
      expect(result).toContain('min="0"');
    });

    it('should skip null attributes', () => {
      const vnode = createFNode('div', { id: 'test', title: null }, []);
      const result = renderToString(vnode);
      expect(result).toContain('id="test"');
      expect(result).not.toContain('title');
    });

    it('should skip undefined attributes', () => {
      const vnode = createFNode('div', { id: 'test', title: undefined }, []);
      const result = renderToString(vnode);
      expect(result).toContain('id="test"');
      expect(result).not.toContain('title');
    });

    it('should skip false attributes', () => {
      const vnode = createFNode('div', { id: 'test', hidden: false }, []);
      const result = renderToString(vnode);
      expect(result).toContain('id="test"');
      expect(result).not.toContain('hidden');
    });

    it('should skip event handlers', () => {
      const vnode = createFNode('button', { onClick: () => {}, onMouseOver: () => {} }, ['Click']);
      const result = renderToString(vnode);
      expect(result).not.toContain('onClick');
      expect(result).not.toContain('onMouseOver');
      expect(result).toBe('<button>Click</button>');
    });

    it('should skip children prop', () => {
      const vnode = createFNode('div', { id: 'test', children: 'should be ignored' }, ['actual child']);
      const result = renderToString(vnode);
      expect(result).toContain('id="test"');
      expect(result).not.toContain('children');
      expect(result).toBe('<div id="test">actual child</div>');
    });

    it('should handle boolean true attributes', () => {
      const vnode = createFNode('input', { type: 'checkbox', checked: true }, []);
      expect(renderToString(vnode)).toBe('<input type="checkbox" checked="true"/>');
    });

    it('should handle data- attributes', () => {
      const vnode = createFNode('div', { 'data-id': '123', 'data-name': 'test' }, []);
      const result = renderToString(vnode);
      expect(result).toContain('data-id="123"');
      expect(result).toContain('data-name="test"');
    });

    it('should handle aria- attributes', () => {
      const vnode = createFNode('button', { 'aria-label': 'Close', 'aria-hidden': 'false' }, []);
      const result = renderToString(vnode);
      expect(result).toContain('aria-label="Close"');
      expect(result).toContain('aria-hidden="false"');
    });
  });

  describe('Complex Real-World Scenarios', () => {
    it('should render a complete card component', () => {
      const Card = (props: { title: string; description: string; image: string }) => {
        const img = createFNode('img', { src: props.image, alt: props.title }, []);
        const h3 = createFNode('h3', { className: 'card-title' }, [props.title]);
        const p = createFNode('p', { className: 'card-desc' }, [props.description]);
        const body = createFNode('div', { className: 'card-body' }, [h3, p]);
        return createFNode('div', { className: 'card' }, [img, body]);
      };

      const vnode = createFNode(Card, {
        title: 'Test Card',
        description: 'This is a test',
        image: 'test.jpg'
      }, []);

      const result = renderToString(vnode);
      expect(result).toContain('<div class="card">');
      expect(result).toContain('<img src="test.jpg" alt="Test Card"/>');
      expect(result).toContain('<h3 class="card-title">Test Card</h3>');
      expect(result).toContain('<p class="card-desc">This is a test</p>');
    });

    it('should render a form with inputs', () => {
      const nameInput = createFNode('input', { type: 'text', name: 'name', placeholder: 'Name' }, []);
      const emailInput = createFNode('input', { type: 'email', name: 'email', placeholder: 'Email' }, []);
      const submitBtn = createFNode('button', { type: 'submit' }, ['Submit']);
      const form = createFNode('form', { method: 'POST', action: '/submit' }, [nameInput, emailInput, submitBtn]);

      const result = renderToString(form);
      expect(result).toBe('<form method="POST" action="/submit"><input type="text" name="name" placeholder="Name"/><input type="email" name="email" placeholder="Email"/><button type="submit">Submit</button></form>');
    });

    it('should render a navigation menu', () => {
      const links = ['Home', 'About', 'Contact'].map(text =>
        createFNode('li', {}, [createFNode('a', { href: `/${text.toLowerCase()}` }, [text])])
      );
      const nav = createFNode('nav', {}, [createFNode('ul', {}, links)]);

      const result = renderToString(nav);
      expect(result).toContain('<nav><ul>');
      expect(result).toContain('<li><a href="/home">Home</a></li>');
      expect(result).toContain('<li><a href="/about">About</a></li>');
      expect(result).toContain('<li><a href="/contact">Contact</a></li>');
    });

    it('should handle conditional rendering with signals', () => {
      const isVisible = signal(true);
      const content = signal('Visible content');

      const Component = () => {
        if (isVisible.value) {
          return createFNode('div', {}, [content]);
        }
        return null;
      };

      const vnode = createFNode(Component, {}, []);
      expect(renderToString(vnode)).toBe('<div>Visible content</div>');

      isVisible.value = false;
      const vnode2 = createFNode(Component, {}, []);
      expect(renderToString(vnode2)).toBe('');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty string children', () => {
      const vnode = createFNode('div', {}, ['']);
      expect(renderToString(vnode)).toBe('<div></div>');
    });

    it('should handle number zero as child', () => {
      const vnode = createFNode('div', {}, [0]);
      expect(renderToString(vnode)).toBe('<div>0</div>');
    });

    it('should handle negative numbers', () => {
      const vnode = createFNode('div', {}, [-42]);
      expect(renderToString(vnode)).toBe('<div>-42</div>');
    });

    it('should handle very long text content', () => {
      const longText = 'a'.repeat(10000);
      const vnode = createFNode('div', {}, [longText]);
      const result = renderToString(vnode);
      expect(result).toContain(longText);
      expect(result.length).toBe(longText.length + 11); // + <div></div>
    });

    it('should handle many nested levels', () => {
      let nested: any = 'deep';
      for (let i = 0; i < 50; i++) {
        nested = createFNode('div', {}, [nested]);
      }
      const result = renderToString(nested);
      expect(result).toContain('deep');
      expect((result.match(/<div>/g) || []).length).toBe(50);
    });

    it('should handle objects without type property', () => {
      const invalid = { props: {}, children: [] };
      expect(renderToString(invalid)).toBe('');
    });
  });
});
