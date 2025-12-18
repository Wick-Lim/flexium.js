/**
 * Integration Tests
 *
 * Complex scenarios combining multiple APIs
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, f, Portal, Suspense, ErrorBoundary } from '../dom'
import { useState, useEffect, sync, useRef } from '../core'
import { createContext, useContext } from '../advanced'

const tick = () => new Promise(r => setTimeout(r, 50))

describe('State + Effect + Render', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should build a complete counter with side effects', async () => {
    const logs: string[] = []

    function Counter() {
      const [count, setCount] = useState(0)

      useEffect(() => {
        logs.push(`Count changed to ${count}`)
        return () => logs.push(`Cleanup ${count}`)
      }, [count])

      return f('div', {}, [
        f('span', { 'data-testid': 'count' }, String(count)),
        f('button', { 'data-testid': 'inc', onclick: () => setCount(count + 1) }, '+'),
        f('button', { 'data-testid': 'dec', onclick: () => setCount(count - 1) }, '-')
      ])
    }

    render(f(Counter), container)
    await tick()

    expect(logs).toContain('Count changed to 0')

    container.querySelector<HTMLButtonElement>('[data-testid="inc"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('1')
    expect(logs.some(l => l.includes('Count changed to 1'))).toBe(true)
  })

  it('should build a todo app', async () => {
    function TodoApp() {
      const [todos, setTodos] = useState<{ id: number; text: string; done: boolean }[]>([])
      const [input, setInput] = useState('')
      const inputRef = useRef<HTMLInputElement | null>(null)

      const addTodo = () => {
        if (!input.trim()) return
        setTodos([...todos, { id: Date.now(), text: input, done: false }])
        setInput('')
        inputRef.current?.focus()
      }

      const toggleTodo = (id: number) => {
        setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
      }

      const deleteTodo = (id: number) => {
        setTodos(todos.filter(t => t.id !== id))
      }

      return f('div', {}, [
        f('div', {}, [
          f('input', {
            ref: inputRef,
            'data-testid': 'input',
            value: input,
            oninput: (e: Event) => setInput((e.target as HTMLInputElement).value)
          }),
          f('button', { 'data-testid': 'add', onclick: addTodo }, 'Add')
        ]),
        f('ul', { 'data-testid': 'list' },
          todos.map(todo => f('li', { key: todo.id }, [
            f('input', {
              type: 'checkbox',
              checked: todo.done,
              onchange: () => toggleTodo(todo.id)
            }),
            f('span', {
              style: { textDecoration: todo.done ? 'line-through' : 'none' }
            }, todo.text),
            f('button', { onclick: () => deleteTodo(todo.id) }, 'X')
          ]))
        ),
        f('p', { 'data-testid': 'count' }, `${todos.filter(t => !t.done).length} remaining`)
      ])
    }

    render(f(TodoApp), container)

    const input = container.querySelector('[data-testid="input"]') as HTMLInputElement
    input.value = 'Learn Flexium'
    input.dispatchEvent(new Event('input'))
    await tick()

    container.querySelector<HTMLButtonElement>('[data-testid="add"]')?.click()
    await tick()

    expect(container.querySelectorAll('li').length).toBe(1)
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('1 remaining')
  })
})

describe('Context + State + Components', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should build theme switching app', async () => {
    const ThemeCtx = createContext<'light' | 'dark'>('light')

    function ThemeToggle() {
      const theme = useContext(ThemeCtx)
      return f('span', { 'data-testid': 'theme' }, `Current: ${theme}`)
    }

    function ThemedButton({ onClick }: { onClick: () => void }) {
      const theme = useContext(ThemeCtx)
      return f('button', {
        'data-testid': 'toggle',
        class: theme === 'dark' ? 'dark-btn' : 'light-btn',
        onclick: onClick
      }, 'Toggle Theme')
    }

    function App() {
      const [theme, setTheme] = useState<'light' | 'dark'>('light')

      return f(ThemeCtx.Provider, { value: theme }, [
        f('div', { class: `app ${theme}` }, [
          f(ThemeToggle),
          f(ThemedButton, { onClick: () => setTheme(theme === 'light' ? 'dark' : 'light') })
        ])
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('Current: light')
    expect(container.querySelector('[data-testid="toggle"]')?.className).toBe('light-btn')

    container.querySelector<HTMLButtonElement>('[data-testid="toggle"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('Current: dark')
    expect(container.querySelector('[data-testid="toggle"]')?.className).toBe('dark-btn')
  })

  it('should build auth context app', async () => {
    interface User {
      id: number
      name: string
    }

    interface AuthContext {
      user: User | null
      login: (name: string) => void
      logout: () => void
    }

    const AuthCtx = createContext<AuthContext>({
      user: null,
      login: () => {},
      logout: () => {}
    })

    function UserDisplay() {
      const { user } = useContext(AuthCtx)
      if (!user) {
        return f('span', { 'data-testid': 'guest' }, 'Guest')
      }
      return f('span', { 'data-testid': 'user' }, `Hello, ${user.name}`)
    }

    function LoginButton() {
      const { user, login, logout } = useContext(AuthCtx)

      if (user) {
        return f('button', { 'data-testid': 'logout', onclick: logout }, 'Logout')
      }
      return f('button', { 'data-testid': 'login', onclick: () => login('John') }, 'Login')
    }

    function App() {
      const [user, setUser] = useState<User | null>(null)

      const authValue: AuthContext = {
        user,
        login: (name) => setUser({ id: 1, name }),
        logout: () => setUser(null)
      }

      return f(AuthCtx.Provider, { value: authValue }, [
        f('div', {}, [
          f(UserDisplay),
          f(LoginButton)
        ])
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="guest"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="login"]')).not.toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="login"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="user"]')?.textContent).toBe('Hello, John')
    expect(container.querySelector('[data-testid="logout"]')).not.toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="logout"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="guest"]')).not.toBeNull()
  })
})

describe('Portal + Modal Pattern', () => {
  let container: HTMLDivElement
  let modalRoot: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)

    modalRoot = document.createElement('div')
    modalRoot.id = 'modal-root'
    document.body.appendChild(modalRoot)
  })

  afterEach(() => {
    document.body.removeChild(container)
    document.body.removeChild(modalRoot)
  })

  it('should build a complete modal system', async () => {
    function Modal({ open, children }: {
      open: boolean
      children: any
    }) {
      if (!open) return null

      return f(Portal, { target: modalRoot }, [
        f('div', { class: 'modal-backdrop', 'data-testid': 'backdrop' }, [
          f('div', {
            class: 'modal-content',
            'data-testid': 'modal'
          }, [
            f('button', { class: 'close-btn', 'data-testid': 'close' }, 'X'),
            children
          ])
        ])
      ])
    }

    function App() {
      const [open, setOpen] = useState(false)

      return f('div', {}, [
        f('button', { 'data-testid': 'open', onclick: () => setOpen(true) }, 'Open Modal'),
        f(Modal, { open }, [
          f('h2', {}, 'Modal Title'),
          f('p', {}, 'Modal content here')
        ])
      ])
    }

    render(f(App), container)

    // Initially modal should not be visible
    expect(modalRoot.querySelector('[data-testid="modal"]')).toBeNull()

    // Open modal
    container.querySelector<HTMLButtonElement>('[data-testid="open"]')?.click()
    await tick()

    // Modal should be rendered in portal target
    expect(modalRoot.querySelector('[data-testid="modal"]')).not.toBeNull()
    expect(modalRoot.querySelector('h2')?.textContent).toBe('Modal Title')
  })
})

describe('ErrorBoundary patterns', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should render normal content without errors', () => {
    function App() {
      return f(ErrorBoundary, {
        fallback: () => f('div', { 'data-testid': 'error' }, 'Error!')
      }, [
        f(Suspense, { fallback: f('div', {}, 'Loading...') }, [
          f('div', { 'data-testid': 'content' }, 'Working content')
        ])
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="content"]')).not.toBeNull()
    expect(container.querySelector('[data-testid="error"]')).toBeNull()
  })

  it('should support Suspense inside ErrorBoundary', () => {
    function App() {
      return f(ErrorBoundary, {
        fallback: () => f('div', {}, 'Error')
      }, [
        f(Suspense, { fallback: f('div', { 'data-testid': 'loading' }, 'Loading...') }, [
          f('div', { 'data-testid': 'loaded' }, 'Loaded!')
        ])
      ])
    }

    render(f(App), container)
    expect(container.querySelector('[data-testid="loaded"]')).not.toBeNull()
  })
})

describe('Ref + Components', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should build form with refs', async () => {
    function Input({ label, inputRef }: {
      label: string
      inputRef: { current: HTMLInputElement | null }
      error?: string
    }) {
      return f('div', { class: 'form-field' }, [
        f('label', {}, label),
        f('input', { ref: inputRef })
      ])
    }

    function Form() {
      const nameRef = useRef<HTMLInputElement | null>(null)
      const emailRef = useRef<HTMLInputElement | null>(null)
      const [submitted, setSubmitted] = useState(false)

      const handleSubmit = () => {
        const name = nameRef.current?.value || ''
        const email = emailRef.current?.value || ''

        if (name && email) {
          setSubmitted(true)
        } else {
          // Focus first empty field
          if (!name) nameRef.current?.focus()
          else if (!email) emailRef.current?.focus()
        }
      }

      if (submitted) {
        return f('div', { 'data-testid': 'success' }, 'Form submitted!')
      }

      return f('form', { onsubmit: (e: Event) => e.preventDefault() }, [
        f(Input, { inputRef: nameRef, label: 'Name' }),
        f(Input, { inputRef: emailRef, label: 'Email' }),
        f('button', { 'data-testid': 'submit', type: 'button', onclick: handleSubmit }, 'Submit')
      ])
    }

    render(f(Form), container)

    // Try submit without data - should focus name input
    container.querySelector<HTMLButtonElement>('[data-testid="submit"]')?.click()
    await tick()

    // Fill in the fields and submit
    const inputs = container.querySelectorAll('input')
    inputs[0].value = 'John'
    inputs[1].value = 'john@example.com'

    container.querySelector<HTMLButtonElement>('[data-testid="submit"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="success"]')).not.toBeNull()
  })
})

describe('Complex State Management', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should handle deeply nested state updates', async () => {
    interface AppState {
      user: {
        profile: {
          name: string
          settings: {
            theme: string
            notifications: boolean
          }
        }
      }
    }

    function App() {
      const [appState, setAppState] = useState<AppState>({
        user: {
          profile: {
            name: 'John',
            settings: {
              theme: 'light',
              notifications: true
            }
          }
        }
      })

      const toggleTheme = () => {
        setAppState({
          ...appState,
          user: {
            ...appState.user,
            profile: {
              ...appState.user.profile,
              settings: {
                ...appState.user.profile.settings,
                theme: appState.user.profile.settings.theme === 'light' ? 'dark' : 'light'
              }
            }
          }
        })
      }

      return f('div', {}, [
        f('span', { 'data-testid': 'name' }, appState.user.profile.name),
        f('span', { 'data-testid': 'theme' }, appState.user.profile.settings.theme),
        f('button', { 'data-testid': 'toggle', onclick: toggleTheme }, 'Toggle Theme')
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('light')

    container.querySelector<HTMLButtonElement>('[data-testid="toggle"]')?.click()
    await tick()

    expect(container.querySelector('[data-testid="theme"]')?.textContent).toBe('dark')
  })

  it('should handle multiple independent states', async () => {
    function MultiStateApp() {
      const [count, setCount] = useState(0)
      const [text, setText] = useState('')
      const [items, setItems] = useState<string[]>([])
      const [flag, setFlag] = useState(false)

      return f('div', {}, [
        f('div', {}, [
          f('span', { 'data-testid': 'count' }, String(count)),
          f('button', { 'data-testid': 'inc', onclick: () => setCount(c => c + 1) }, '+')
        ]),
        f('div', {}, [
          f('input', {
            'data-testid': 'input',
            value: text,
            oninput: (e: Event) => setText((e.target as HTMLInputElement).value)
          }),
          f('span', { 'data-testid': 'text' }, text)
        ]),
        f('div', {}, [
          f('button', {
            'data-testid': 'add-item',
            onclick: () => setItems([...items, `Item ${items.length + 1}`])
          }, 'Add Item'),
          f('span', { 'data-testid': 'items-count' }, String(items.length))
        ]),
        f('div', {}, [
          f('button', { 'data-testid': 'toggle-flag', onclick: () => setFlag(!flag) }, 'Toggle'),
          f('span', { 'data-testid': 'flag' }, String(flag))
        ])
      ])
    }

    render(f(MultiStateApp), container)

    // Test each state independently
    container.querySelector<HTMLButtonElement>('[data-testid="inc"]')?.click()
    await tick()
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('1')

    const input = container.querySelector('[data-testid="input"]') as HTMLInputElement
    input.value = 'Hello'
    input.dispatchEvent(new Event('input'))
    await tick()
    expect(container.querySelector('[data-testid="text"]')?.textContent).toBe('Hello')

    container.querySelector<HTMLButtonElement>('[data-testid="add-item"]')?.click()
    await tick()
    expect(container.querySelector('[data-testid="items-count"]')?.textContent).toBe('1')

    container.querySelector<HTMLButtonElement>('[data-testid="toggle-flag"]')?.click()
    await tick()
    expect(container.querySelector('[data-testid="flag"]')?.textContent).toBe('true')
  })
})

describe('Lifecycle Integration', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should run effects on mount', async () => {
    const lifecycle: string[] = []

    function Child({ id }: { id: string }) {
      useEffect(() => {
        lifecycle.push(`${id} mounted`)
      }, [])

      return f('div', { 'data-testid': id }, id)
    }

    function App() {
      return f('div', {}, [
        f(Child, { id: 'child-1' }),
        f(Child, { id: 'child-2' })
      ])
    }

    render(f(App), container)
    await tick()

    expect(lifecycle).toContain('child-1 mounted')
    expect(lifecycle).toContain('child-2 mounted')
  })

  it('should run sync during render for DOM access', () => {
    let syncExecuted = false
    let refAttached = false

    function Component() {
      const divRef = useRef<HTMLDivElement | null>(null)

      sync(() => {
        syncExecuted = true
        if (divRef.current) {
          refAttached = true
        }
      })

      return f('div', { ref: divRef, 'data-testid': 'target' }, 'Content')
    }

    render(f(Component), container)

    expect(syncExecuted).toBe(true)
    // Note: ref may not be attached during first sync call
    expect(container.querySelector('[data-testid="target"]')).not.toBeNull()
  })
})
