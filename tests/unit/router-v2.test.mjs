import { test } from 'node:test';
import assert from 'node:assert';
import { state, Router, Route, Outlet, Link, h, render } from '../../packages/flexium/dist/test-exports.mjs';
import { createLocation } from '../../packages/flexium/dist/test-exports.mjs'; // Mock needed?
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><body><div id="app"></div></body>', {
    url: 'http://localhost/'
});
global.window = dom.window;
global.document = dom.window.document;
global.Node = dom.window.Node;
global.HTMLElement = dom.window.HTMLElement;
global.Text = dom.window.Text;
global.history = dom.window.history;

function createContainer() {
  const div = document.createElement('div');
  document.body.appendChild(div);
  return div;
}

test('Router renders nested routes', async () => {
  const container = createContainer();
  
  // Layout Component
  function Layout() {
      return h('div', { id: 'layout' }, [
          h('h1', {}, ['Layout']),
          h(Outlet, {})
      ]);
  }
  
  // Page Component
  function Home() {
      return h('div', { id: 'home' }, ['Home Page']);
  }
  
  // User Component
  function User(props) {
      return h('div', { id: 'user' }, ['User ', props.params?.id]);
  }

  render(h(Router, {}, [
      h(Route, { path: '/', component: Layout }, [
          h(Route, { index: true, component: Home }),
          h(Route, { path: 'user/:id', component: User })
      ])
  ]), container);

  // Initial render: / -> Layout -> Home
  const layout = container.firstElementChild;
  assert.ok(layout);
  assert.strictEqual(layout.id, 'layout');
  
  const home = layout.lastElementChild;
  assert.ok(home);
  assert.strictEqual(home.id, 'home');
  assert.strictEqual(home.innerHTML, 'Home Page');

  // Navigate to /user/123
  window.history.pushState({}, '', '/user/123');
  window.dispatchEvent(new window.Event('popstate'));
  
  await new Promise(r => setTimeout(r, 0)); // Wait for reactivity

  // Re-check layout
  const newLayout = container.firstElementChild;
  assert.ok(newLayout);
  assert.strictEqual(newLayout.id, 'layout');
  
  // Check user
  const user = newLayout.lastElementChild;
  assert.ok(user);
  assert.strictEqual(user.id, 'user');
  assert.strictEqual(user.innerHTML, 'User 123');
  
  document.body.removeChild(container);
});
