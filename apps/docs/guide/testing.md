---
title: Testing - Unit & Integration Tests
description: Test Flexium components using Vitest and Testing Library. Write reliable unit and integration tests for reactive UIs.
head:
  - - meta
    - property: og:title
      content: Testing Guide - Flexium
  - - meta
    - property: og:description
      content: Learn how to test Flexium components with Vitest and Testing Library for reliable reactive applications.
---

# Testing

Testing is essential for building reliable applications. Flexium's fine-grained reactivity and component model integrate seamlessly with modern testing tools like Vitest, Testing Library, and Playwright. This guide covers unit testing, component testing, integration testing, and end-to-end testing.

## Testing Setup

### Installing Dependencies

First, install the necessary testing dependencies:

```bash
npm install -D vitest jsdom @testing-library/dom @testing-library/user-event
```

For end-to-end testing with Playwright:

```bash
npm install -D @playwright/test
npx playwright install
```

### Vitest Configuration

Create a `vitest.config.ts` file:

```ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    // Test file patterns
    include: ['src/**/__tests__/*.test.ts', 'src/**/*.test.ts'],

    // Exclude patterns
    exclude: ['**/node_modules/**', '**/dist/**'],

    // Use jsdom for DOM testing
    environment: 'jsdom',

    // Enable globals (describe, it, expect, etc.)
    globals: true,

    // Test timeout
    testTimeout: 10000,

    // Pool configuration
    pool: 'forks',
  },
});
```

### Test File Structure

Organize your tests alongside your components:

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.ts
│   ├── TodoList/
│   │   ├── TodoList.tsx
│   │   └── TodoList.test.ts
└── utils/
    ├── helpers.ts
    └── helpers.test.ts
```

Or use a dedicated `__tests__` directory:

```
src/
├── components/
│   └── Button.tsx
├── __tests__/
│   ├── Button.test.ts
│   └── TodoList.test.ts
```

## Unit Testing with Vitest

### Testing Pure Functions

Start with testing pure utility functions:

```ts
// src/utils/math.ts
export function add(a: number, b: number): number {
  return a + b;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

// src/utils/math.test.ts
import { describe, it, expect } from 'vitest';
import { add, multiply } from './math';

describe('Math utilities', () => {
  describe('add()', () => {
    it('should add two numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should handle negative numbers', () => {
      expect(add(-2, 3)).toBe(1);
      expect(add(-2, -3)).toBe(-5);
    });

    it('should handle zero', () => {
      expect(add(0, 5)).toBe(5);
      expect(add(5, 0)).toBe(5);
    });
  });

  describe('multiply()', () => {
    it('should multiply two numbers', () => {
      expect(multiply(2, 3)).toBe(6);
    });

    it('should handle zero', () => {
      expect(multiply(0, 5)).toBe(0);
      expect(multiply(5, 0)).toBe(0);
    });
  });
});
```

## Testing Signals and Reactive State

### Basic Signal Testing

Test signal creation, updates, and reactivity:

```ts
import { describe, it, expect, vi } from 'vitest';
import { useEffect, useState } from 'flexium/core';

describe('Signal System', () => {
  it('should create a signal with initial value', () => {
    const [count] = use(0);
    expect(count).toBe(0);
  });

  it('should update signal value', () => {
    const [count, setCount] = use(0);
    setCount(5);
    expect(count).toBe(5);

    setCount(10);
    expect(count).toBe(10);
  });

  it('should notify subscribers on change', () => {
    const [count, setCount] = use(0);
    const fn = vi.fn();

    use(() => {
      fn(count);
    });

    expect(fn).toHaveBeenCalledWith(0);
    expect(fn).toHaveBeenCalledTimes(1);

    setCount(5);
    expect(fn).toHaveBeenCalledWith(5);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not notify on same value', () => {
    const [count, setCount] = use(0);
    const fn = vi.fn();

    use(() => {
      fn(count);
    });

    expect(fn).toHaveBeenCalledTimes(1);

    setCount(0); // Same value
    expect(fn).toHaveBeenCalledTimes(1); // Should not trigger
  });
});
```

### Testing Computed Values

Test derived state and memoization:

```ts
import { describe, it, expect, vi } from 'vitest';
import { useState } from 'flexium/core';

describe('Computed values', () => {
  it('should compute derived value', () => {
    const [count, setCount] = use(2);
    const [doubled] = use(() => count * 2);

    expect(doubled).toBe(4);

    setCount(5);
    expect(doubled).toBe(10);
  });

  it('should memoize computed values', () => {
    const [count, setCount] = use(1);
    const fn = vi.fn((val) => val * 2);
    const [doubled] = use(() => fn(count));

    // First access
    expect(doubled).toBe(2);
    expect(fn).toHaveBeenCalledTimes(1);

    // Multiple reads without dependency changes
    expect(doubled).toBe(2);
    expect(doubled).toBe(2);
    expect(fn).toHaveBeenCalledTimes(1); // Still only called once

    // After dependency change
    setCount(5);
    expect(doubled).toBe(10);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should track nested dependencies', () => {
    const [a, setA] = use(1);
    const [b, setB] = use(2);
    const [sum] = use(() => a + b);
    const [doubled] = use(() => sum * 2);

    expect(doubled).toBe(6);

    setA(3);
    expect(doubled).toBe(10); // (3 + 2) * 2

    setB(5);
    expect(doubled).toBe(16); // (3 + 5) * 2
  });
});
```

### Testing Effects

Test side effects and cleanup:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useEffect, useState } from 'flexium/core';

describe('Effects', () => {
  it('should run effect immediately', () => {
    const fn = vi.fn();
    use(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should run effect when dependencies change', () => {
    const [count, setCount] = use(0);
    const fn = vi.fn();

    use(() => {
      fn(count);
    });

    expect(fn).toHaveBeenCalledWith(0);
    expect(fn).toHaveBeenCalledTimes(1);

    setCount(5);
    expect(fn).toHaveBeenCalledWith(5);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should run cleanup function', () => {
    const [count, setCount] = use(0);
    const cleanup = vi.fn();
    const setup = vi.fn(() => cleanup);

    use(setup);

    expect(setup).toHaveBeenCalledTimes(1);
    expect(cleanup).not.toHaveBeenCalled();

    setCount(1); // Trigger re-run
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(setup).toHaveBeenCalledTimes(2);
  });

  it('should handle conditional dependencies', () => {
    const [a, setA] = use(1);
    const [b, setB] = use(2);
    const fn = vi.fn();

    use(() => {
      if (a > 5) {
        fn(b);
      }
    });

    expect(fn).not.toHaveBeenCalled();

    setB(10); // Should not trigger (a <= 5)
    expect(fn).not.toHaveBeenCalled();

    setA(6); // Should trigger (a > 5)
    expect(fn).toHaveBeenCalledWith(10);
    expect(fn).toHaveBeenCalledTimes(1);

    setB(20); // Should trigger now (b is dependency)
    expect(fn).toHaveBeenCalledWith(20);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
```

### Testing State API

Test the high-level `use()` API:

```ts
import { describe, it, expect } from 'vitest';
import { useState } from 'flexium/core';

describe('use() API', () => {
  it('should create local state', () => {
    const [count, setCount] = use(0);
    expect(count).toBe(0);

    setCount(5);
    expect(count).toBe(5);

    setCount(c => c + 1);
    expect(count).toBe(6);
  });

  it('should create global state with key', () => {
    const [count1, setCount1] = use(0, { key: 'global-count' });
    const [count2, setCount2] = use(0, { key: 'global-count' });

    // Both reference same state
    expect(count1).toBe(0);
    expect(count2).toBe(0);

    setCount1(10);
    expect(count1).toBe(10);
    expect(count2).toBe(10); // Updated too!

    setCount2(20);
    expect(count1).toBe(20);
    expect(count2).toBe(20);
  });

  it('should create computed state', () => {
    const [count, setCount] = use(5);
    const [doubled] = use(() => count * 2);

    expect(doubled).toBe(10);

    setCount(10);
    expect(doubled).toBe(20);
  });

  it('should create async state', async () => {
    const [data, { loading }] = use(async () => {
      return new Promise(resolve => {
        setTimeout(() => resolve({ value: 42 }), 10);
      });
    });

    expect(loading).toBe(true);
    expect(data).toBeUndefined();

    // Wait for resolution
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(loading).toBe(false);
    expect(data).toEqual({ value: 42 });
  });
});
```

## Testing Components

### Setting Up DOM Tests

Use jsdom and render utilities:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from 'flexium/dom';
import { useState } from 'flexium/core';

describe('Counter Component', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function Counter() {
    const [count, setCount] = use(0);

    return (
      <div>
        <p data-testid="count">Count: {count}</p>
        <button data-testid="increment" onclick={() => setCount(c => c + 1)}>
          Increment
        </button>
        <button data-testid="decrement" onclick={() => setCount(c => c - 1)}>
          Decrement
        </button>
      </div>
    );
  }

  it('should render initial count', () => {
    render(<Counter />, container);

    const countEl = container.querySelector('[data-testid="count"]');
    expect(countEl?.textContent).toBe('Count: 0');
  });

  it('should increment count on button click', () => {
    render(<Counter />, container);

    const incrementBtn = container.querySelector('[data-testid="increment"]') as HTMLButtonElement;
    const countEl = container.querySelector('[data-testid="count"]');

    expect(countEl?.textContent).toBe('Count: 0');

    incrementBtn.click();
    expect(countEl?.textContent).toBe('Count: 1');

    incrementBtn.click();
    expect(countEl?.textContent).toBe('Count: 2');
  });

  it('should decrement count on button click', () => {
    render(<Counter />, container);

    const decrementBtn = container.querySelector('[data-testid="decrement"]') as HTMLButtonElement;
    const countEl = container.querySelector('[data-testid="count"]');

    decrementBtn.click();
    expect(countEl?.textContent).toBe('Count: -1');
  });
});
```

### Testing with Testing Library

Use Testing Library for better test ergonomics:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from 'flexium/dom';
import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { useState } from 'flexium/core';

describe('TodoList Component', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  function TodoList() {
    const [todos, setTodos] = useState<string[]>([]);
    const [input, setInput] = use('');

    const addTodo = () => {
      if (input.trim()) {
        setTodos([...todos, input]);
        setInput('');
      }
    };

    return (
      <div>
        <input
          data-testid="todo-input"
          value={input}
          oninput={(e) => setInput(e.target.value)}
          placeholder="Add todo..."
        />
        <button data-testid="add-button" onclick={addTodo}>
          Add
        </button>
        <ul data-testid="todo-list">
          {todos.map((todo, i) => <li key={i}>{todo}</li>)}
        </ul>
      </div>
    );
  }

  it('should add todo items', async () => {
    render(<TodoList />, container);
    const user = userEvent.setup();

    const input = screen.getByTestId('todo-input') as HTMLInputElement;
    const addButton = screen.getByTestId('add-button') as HTMLButtonElement;

    // Add first todo
    await user.type(input, 'Buy milk');
    await user.click(addButton);

    await waitFor(() => {
      const list = screen.getByTestId('todo-list');
      expect(list.children.length).toBe(1);
      expect(list.textContent).toContain('Buy milk');
    });

    // Add second todo
    await user.type(input, 'Walk the dog');
    await user.click(addButton);

    await waitFor(() => {
      const list = screen.getByTestId('todo-list');
      expect(list.children.length).toBe(2);
      expect(list.textContent).toContain('Walk the dog');
    });
  });

  it('should not add empty todos', async () => {
    render(<TodoList />, container);
    const user = userEvent.setup();

    const addButton = screen.getByTestId('add-button') as HTMLButtonElement;
    await user.click(addButton);

    const list = screen.getByTestId('todo-list');
    expect(list.children.length).toBe(0);
  });

  it('should clear input after adding todo', async () => {
    render(<TodoList />, container);
    const user = userEvent.setup();

    const input = screen.getByTestId('todo-input') as HTMLInputElement;
    const addButton = screen.getByTestId('add-button') as HTMLButtonElement;

    await user.type(input, 'Test todo');
    expect(input.value).toBe('Test todo');

    await user.click(addButton);

    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });
});
```

### Testing Component Props

Test components with different prop values:

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render } from 'flexium/dom';

describe('Button Component', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  function Button({ label, disabled = false, onclick }) {
    return (
      <button
        disabled={disabled}
        onclick={onclick}
        data-testid="button"
      >
        {label}
      </button>
    );
  }

  it('should render with label', () => {
    render(<Button label="Click me" onclick={() => {}} />, container);

    const button = container.querySelector('[data-testid="button"]');
    expect(button?.textContent).toBe('Click me');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button label="Click" disabled={true} onclick={() => {}} />, container);

    const button = container.querySelector('[data-testid="button"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should call onclick handler', () => {
    let clicked = false;
    const handleClick = () => { clicked = true; };

    render(<Button label="Click" onclick={handleClick} />, container);

    const button = container.querySelector('[data-testid="button"]') as HTMLButtonElement;
    button.click();

    expect(clicked).toBe(true);
  });
});
```

## Mocking Patterns

### Mocking Functions

Use Vitest's mocking capabilities:

```ts
import { describe, it, expect, vi } from 'vitest';

describe('API calls', () => {
  it('should fetch user data', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, name: 'John' })
    });

    global.fetch = mockFetch;

    const response = await fetch('/api/user/1');
    const data = await response.json();

    expect(mockFetch).toHaveBeenCalledWith('/api/user/1');
    expect(data).toEqual({ id: 1, name: 'John' });
  });
});
```

### Mocking Modules

Mock entire modules:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the analytics module
vi.mock('./analytics', () => ({
  track: vi.fn(),
  identify: vi.fn(),
}));

import { track, identify } from './analytics';
import { logUserAction } from './logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track user actions', () => {
    logUserAction('button_click', { buttonId: 'submit' });

    expect(track).toHaveBeenCalledWith('button_click', { buttonId: 'submit' });
  });
});
```

### Mocking Async Resources

Mock async state:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from 'flexium/dom';
import { useState } from 'flexium/core';
import { screen, waitFor } from '@testing-library/dom';

describe('UserProfile with mocked data', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
    vi.restoreAllMocks();
  });

  function UserProfile({ userId }) {
    const [user, { loading, error }] = use(async () => {
      const res = await fetch(`/api/users/${userId}`);
      return res.json();
    });

    return (
      <div>
        {loading && <div data-testid="loading">Loading...</div>}
        {error && <div data-testid="error">Error: {error.message}</div>}
        {user && (
          <div data-testid="user-data">
            <h1>{user.name}</h1>
            <p>{user.email}</p>
          </div>
        )}
      </div>
    );
  }

  it('should show loading state', () => {
    global.fetch = vi.fn().mockImplementation(() =>
      new Promise(() => {}) // Never resolves
    );

    render(<UserProfile userId={1} />, container);

    expect(screen.getByTestId('loading')).toBeDefined();
  });

  it('should show user data when loaded', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'John Doe', email: 'john@example.com' })
    });

    render(<UserProfile userId={1} />, container);

    await waitFor(() => {
      const userData = screen.getByTestId('user-data');
      expect(userData.textContent).toContain('John Doe');
      expect(userData.textContent).toContain('john@example.com');
    });
  });

  it('should show error state on failure', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<UserProfile userId={1} />, container);

    await waitFor(() => {
      const errorEl = screen.getByTestId('error');
      expect(errorEl.textContent).toContain('Network error');
    });
  });
});
```

## E2E Testing with Playwright

### Playwright Setup

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Writing E2E Tests

Test user flows end-to-end:

```ts
import { test, expect } from '@playwright/test';

test.describe('Todo Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should add and complete todos', async ({ page }) => {
    // Add first todo
    await page.fill('[data-testid="todo-input"]', 'Buy milk');
    await page.click('[data-testid="add-button"]');

    // Verify it appears
    await expect(page.locator('text=Buy milk')).toBeVisible();

    // Add second todo
    await page.fill('[data-testid="todo-input"]', 'Walk the dog');
    await page.click('[data-testid="add-button"]');

    await expect(page.locator('text=Walk the dog')).toBeVisible();

    // Complete first todo
    await page.click('[data-testid="todo-0-checkbox"]');

    // Verify it's marked complete
    const firstTodo = page.locator('[data-testid="todo-0"]');
    await expect(firstTodo).toHaveClass(/completed/);
  });

  test('should filter todos', async ({ page }) => {
    // Add completed and active todos
    await page.fill('[data-testid="todo-input"]', 'Completed task');
    await page.click('[data-testid="add-button"]');
    await page.click('[data-testid="todo-0-checkbox"]');

    await page.fill('[data-testid="todo-input"]', 'Active task');
    await page.click('[data-testid="add-button"]');

    // Filter to active only
    await page.click('[data-testid="filter-active"]');
    await expect(page.locator('text=Active task')).toBeVisible();
    await expect(page.locator('text=Completed task')).not.toBeVisible();

    // Filter to completed only
    await page.click('[data-testid="filter-completed"]');
    await expect(page.locator('text=Completed task')).toBeVisible();
    await expect(page.locator('text=Active task')).not.toBeVisible();

    // Show all
    await page.click('[data-testid="filter-all"]');
    await expect(page.locator('text=Active task')).toBeVisible();
    await expect(page.locator('text=Completed task')).toBeVisible();
  });

  test('should persist todos in localStorage', async ({ page }) => {
    // Add a todo
    await page.fill('[data-testid="todo-input"]', 'Persistent todo');
    await page.click('[data-testid="add-button"]');

    // Reload page
    await page.reload();

    // Todo should still be there
    await expect(page.locator('text=Persistent todo')).toBeVisible();
  });
});
```

## Test Utilities and Helpers

### Custom Render Helper

Create reusable test utilities:

```ts
// test-utils.ts
import { render as flexiumRender } from 'flexium/dom';
import { cleanup } from '@testing-library/dom';

export function render(component: any) {
  const container = document.createElement('div');
  document.body.appendChild(container);

  flexiumRender(component, container);

  return {
    container,
    cleanup: () => {
      container.remove();
    },
  };
}

export function renderWithCleanup(component: any) {
  const result = render(component);

  // Auto-cleanup after test
  afterEach(() => {
    result.cleanup();
  });

  return result;
}
```

### Wait Utilities

Create custom wait utilities:

```ts
// test-utils.ts
export async function waitForSignal(getter: () => any, expected: any, timeout = 1000) {
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (getter() === expected) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  throw new Error(`Timeout waiting for signal to be ${expected}`);
}

// Usage in tests
it('should update signal', async () => {
  const [count, setCount] = use(0);

  setTimeout(() => setCount(5), 100);

  await waitForSignal(() => count, 5);
  expect(count).toBe(5);
});
```

### Test Fixtures

Create reusable test data:

```ts
// fixtures.ts
export const createUser = (overrides = {}) => ({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  role: 'user',
  ...overrides,
});

export const createTodo = (overrides = {}) => ({
  id: 1,
  text: 'Test todo',
  completed: false,
  createdAt: new Date(),
  ...overrides,
});

// Usage
it('should render user', () => {
  const user = createUser({ name: 'Jane' });
  render(<UserCard user={user} />, container);
  // ...
});
```

## Best Practices

### 1. Use Test IDs

Add `data-testid` attributes for reliable querying:

```tsx
<button data-testid="submit-button">Submit</button>
```

### 2. Test User Behavior, Not Implementation

Focus on what users see and do:

```ts
// Good - tests behavior
it('should show error when email is invalid', async () => {
  await user.type(screen.getByLabelText('Email'), 'invalid');
  await user.click(screen.getByText('Submit'));
  expect(screen.getByText('Invalid email')).toBeVisible();
});

// Bad - tests implementation details
it('should set error state', () => {
  const [error, setError] = use(null);
  setError('Invalid email');
  expect(error).toBe('Invalid email');
});
```

### 3. Avoid Testing Framework Internals

Don't test that Flexium works - test that your app works:

```ts
// Bad - testing Flexium
it('should update signal', () => {
  const [count, setCount] = use(0);
  setCount(1);
  expect(count).toBe(1);
});

// Good - testing your component
it('should increment counter on click', () => {
  render(<Counter />, container);
  const button = screen.getByText('Increment');
  button.click();
  expect(screen.getByText('Count: 1')).toBeVisible();
});
```

### 4. Keep Tests Isolated

Each test should be independent:

```ts
describe('Counter', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  // Each test starts fresh
  it('test 1', () => { /* ... */ });
  it('test 2', () => { /* ... */ });
});
```

### 5. Use Async/Await for Async Operations

Wait for async operations to complete:

```ts
it('should load data', async () => {
  render(<DataComponent />, container);

  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  expect(screen.getByText('Data loaded')).toBeVisible();
});
```

### 6. Mock External Dependencies

Mock APIs, localStorage, etc.:

```ts
beforeEach(() => {
  global.fetch = vi.fn();
  global.localStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    clear: vi.fn(),
  } as any;
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

### 7. Test Error States

Always test error handling:

```ts
it('should show error on API failure', async () => {
  global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

  render(<DataComponent />, container);

  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeVisible();
  });
});
```

### 8. Use Descriptive Test Names

Write clear test descriptions:

```ts
// Good
it('should display error message when email is invalid', () => { /* ... */ });

// Bad
it('email test', () => { /* ... */ });
```

### 9. Test Accessibility

Include accessibility checks:

```ts
it('should be keyboard accessible', async () => {
  render(<Form />, container);

  const input = screen.getByLabelText('Email');
  input.focus();

  await user.keyboard('{Tab}');

  expect(screen.getByText('Submit')).toHaveFocus();
});
```

### 10. Organize Tests by Feature

Group related tests:

```ts
describe('TodoList', () => {
  describe('adding todos', () => {
    it('should add todo when form submitted', () => { /* ... */ });
    it('should clear input after adding', () => { /* ... */ });
    it('should not add empty todos', () => { /* ... */ });
  });

  describe('completing todos', () => {
    it('should mark todo as complete', () => { /* ... */ });
    it('should update count', () => { /* ... */ });
  });
});
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Specific Test File

```bash
npm test -- src/components/Button.test.ts
```

### Run with Coverage

```bash
npm test -- --coverage
```

### Run E2E Tests

```bash
npx playwright test
```

### Run E2E Tests in UI Mode

```bash
npx playwright test --ui
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm test -- --coverage

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Summary

- **Use Vitest** for fast unit and component tests
- **Test signals and effects** to ensure reactivity works correctly
- **Use Testing Library** for user-centric component tests
- **Mock external dependencies** to isolate tests
- **Use Playwright** for end-to-end testing
- **Follow best practices** for maintainable, reliable tests
- **Test user behavior** not implementation details
- **Keep tests isolated** and independent
- **Test error states** and edge cases
- **Automate testing** in CI/CD pipelines

With comprehensive testing, you can confidently build and maintain reliable Flexium applications.
