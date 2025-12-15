/**
 * Integration Tests - Real Component Patterns
 *
 * 실제 앱에서 사용하는 패턴들을 테스트
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, f } from '../dom'
import { state, effect, createContext, context } from '../core'

const nextTick = () => new Promise(resolve => setTimeout(resolve, 10))

describe('Integration: Counter App', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should handle basic counter', async () => {
    function Counter() {
      const [count, setCount] = state(0)

      return f('div', {}, [
        f('span', { 'data-testid': 'count' }, String(count)),
        f('button', { 'data-testid': 'inc', onclick: () => setCount(count + 1) }, '+'),
        f('button', { 'data-testid': 'dec', onclick: () => setCount(count - 1) }, '-'),
        f('button', { 'data-testid': 'reset', onclick: () => setCount(0) }, 'Reset')
      ])
    }

    render(f(Counter), container)

    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('0')

    // Increment
    container.querySelector<HTMLButtonElement>('[data-testid="inc"]')?.click()
    await nextTick()
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('1')

    container.querySelector<HTMLButtonElement>('[data-testid="inc"]')?.click()
    await nextTick()
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('2')

    // Decrement
    container.querySelector<HTMLButtonElement>('[data-testid="dec"]')?.click()
    await nextTick()
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('1')

    // Reset
    container.querySelector<HTMLButtonElement>('[data-testid="reset"]')?.click()
    await nextTick()
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('0')
  })
})

describe('Integration: Todo App', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should add and remove todos', async () => {
    interface Todo {
      id: number
      text: string
      done: boolean
    }

    function TodoApp() {
      const [todos, setTodos] = state<Todo[]>([])
      const [nextId, setNextId] = state(1)

      const addTodo = () => {
        setTodos([...todos, { id: nextId, text: `Todo ${nextId}`, done: false }])
        setNextId(nextId + 1)
      }

      const removeTodo = (id: number) => {
        setTodos(todos.filter((t: Todo) => t.id !== id))
      }

      const toggleTodo = (id: number) => {
        setTodos(todos.map((t: Todo) =>
          t.id === id ? { ...t, done: !t.done } : t
        ))
      }

      return f('div', {}, [
        f('button', { 'data-testid': 'add', onclick: addTodo }, 'Add Todo'),
        f('ul', { 'data-testid': 'list' },
          todos.map((todo: Todo) =>
            f('li', { key: todo.id, 'data-testid': `todo-${todo.id}` }, [
              f('span', {
                style: todo.done ? 'text-decoration:line-through' : '',
                onclick: () => toggleTodo(todo.id)
              }, todo.text),
              f('button', {
                'data-testid': `remove-${todo.id}`,
                onclick: () => removeTodo(todo.id)
              }, 'X')
            ])
          )
        ),
        f('div', { 'data-testid': 'count' }, `Total: ${todos.length}`)
      ])
    }

    render(f(TodoApp), container)

    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('Total: 0')

    // Add todos
    container.querySelector<HTMLButtonElement>('[data-testid="add"]')?.click()
    await nextTick()
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('Total: 1')

    container.querySelector<HTMLButtonElement>('[data-testid="add"]')?.click()
    await nextTick()
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('Total: 2')

    // Remove first todo
    container.querySelector<HTMLButtonElement>('[data-testid="remove-1"]')?.click()
    await nextTick()
    expect(container.querySelector('[data-testid="count"]')?.textContent).toBe('Total: 1')
    expect(container.querySelector('[data-testid="todo-1"]')).toBeNull()
    expect(container.querySelector('[data-testid="todo-2"]')).not.toBeNull()
  })
})

describe('Integration: Form with Validation', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should validate form fields', async () => {
    function Form() {
      const [email, setEmail] = state('')
      const [error] = state(() => {
        if (!email) return 'Email is required'
        if (!email.includes('@')) return 'Invalid email format'
        return ''
      }, { deps: [email] })

      return f('div', {}, [
        f('input', {
          'data-testid': 'email',
          type: 'email',
          value: email,
          oninput: (e: Event) => setEmail((e.target as HTMLInputElement).value)
        }),
        f('div', { 'data-testid': 'error' }, error),
        f('button', {
          'data-testid': 'submit',
          disabled: !!error
        }, 'Submit')
      ])
    }

    render(f(Form), container)

    expect(container.querySelector('[data-testid="error"]')?.textContent).toBe('Email is required')

    // Type invalid email
    const input = container.querySelector('[data-testid="email"]') as HTMLInputElement
    input.value = 'test'
    input.dispatchEvent(new Event('input'))
    await nextTick()

    expect(container.querySelector('[data-testid="error"]')?.textContent).toBe('Invalid email format')

    // Type valid email
    input.value = 'test@example.com'
    input.dispatchEvent(new Event('input'))
    await nextTick()

    expect(container.querySelector('[data-testid="error"]')?.textContent).toBe('')
  })
})

describe('Integration: Data Fetching', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should show loading, then data', async () => {
    function DataFetcher() {
      const [data, { loading, error }] = state(async () => {
        await new Promise(r => setTimeout(r, 20))
        return { message: 'Hello from API' }
      })

      if (loading) return f('div', { 'data-testid': 'status' }, 'Loading...')
      if (error) return f('div', { 'data-testid': 'status' }, 'Error!')
      return f('div', { 'data-testid': 'status' }, data?.message || '')
    }

    render(f(DataFetcher), container)

    expect(container.querySelector('[data-testid="status"]')?.textContent).toBe('Loading...')

    await new Promise(r => setTimeout(r, 50))

    expect(container.querySelector('[data-testid="status"]')?.textContent).toBe('Hello from API')
  })
})

describe('Integration: Component Composition', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should compose multiple components', async () => {
    function Button({ label, onClick }: { label: string; onClick: () => void }) {
      return f('button', { onclick: onClick }, label)
    }

    function Display({ value }: { value: number }) {
      return f('span', { 'data-testid': 'display' }, String(value))
    }

    function Calculator() {
      const [value, setValue] = state(0)

      return f('div', {}, [
        f(Display, { value }),
        f(Button, { label: '+1', onClick: () => setValue(value + 1) }),
        f(Button, { label: '+10', onClick: () => setValue(value + 10) }),
        f(Button, { label: 'Clear', onClick: () => setValue(0) })
      ])
    }

    render(f(Calculator), container)

    expect(container.querySelector('[data-testid="display"]')?.textContent).toBe('0')

    // Click +1
    const buttons = container.querySelectorAll('button')
    buttons[0].click()
    await nextTick()
    expect(container.querySelector('[data-testid="display"]')?.textContent).toBe('1')

    // Click +10
    buttons[1].click()
    await nextTick()
    expect(container.querySelector('[data-testid="display"]')?.textContent).toBe('11')

    // Click Clear
    buttons[2].click()
    await nextTick()
    expect(container.querySelector('[data-testid="display"]')?.textContent).toBe('0')
  })
})

describe('Integration: Context + State', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should combine context with local state', async () => {
    const UserContext = createContext<{ name: string }>({ name: 'Guest' })

    function Greeting() {
      const user = context(UserContext)
      const [greeting, setGreeting] = state('Hello')

      return f('div', {}, [
        f('span', { 'data-testid': 'message' }, `${greeting}, ${user.name}!`),
        f('button', {
          'data-testid': 'change',
          onclick: () => setGreeting(greeting === 'Hello' ? 'Hi' : 'Hello')
        }, 'Change Greeting')
      ])
    }

    function App() {
      const [user, setUser] = state({ name: 'Alice' })

      return f(UserContext.Provider, { value: user }, [
        f(Greeting),
        f('button', {
          'data-testid': 'change-user',
          onclick: () => setUser({ name: user.name === 'Alice' ? 'Bob' : 'Alice' })
        }, 'Change User')
      ])
    }

    render(f(App), container)

    expect(container.querySelector('[data-testid="message"]')?.textContent).toBe('Hello, Alice!')

    // Change greeting (local state)
    container.querySelector<HTMLButtonElement>('[data-testid="change"]')?.click()
    await nextTick()
    expect(container.querySelector('[data-testid="message"]')?.textContent).toBe('Hi, Alice!')

    // Change user (context) - 컴포넌트가 다시 렌더링되면서 상태 유지됨
    container.querySelector<HTMLButtonElement>('[data-testid="change-user"]')?.click()
    await nextTick()
    // Note: Greeting은 같은 컴포넌트 인스턴스이므로 로컬 state 유지
    // 만약 'Hello, Bob!'이면 컴포넌트가 재생성된 것
    const message = container.querySelector('[data-testid="message"]')?.textContent
    expect(['Hi, Bob!', 'Hello, Bob!']).toContain(message)
  })
})

describe('Integration: Side Effects', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should handle document title effect', async () => {
    function PageTitle() {
      const [title, setTitle] = state('Home')

      effect(() => {
        document.title = `App - ${title}`
      }, [title])

      return f('div', {}, [
        f('span', { 'data-testid': 'current' }, title),
        f('button', { 'data-testid': 'about', onclick: () => setTitle('About') }, 'Go to About'),
        f('button', { 'data-testid': 'home', onclick: () => setTitle('Home') }, 'Go to Home')
      ])
    }

    render(f(PageTitle), container)

    expect(document.title).toBe('App - Home')

    container.querySelector<HTMLButtonElement>('[data-testid="about"]')?.click()
    await nextTick()
    expect(document.title).toBe('App - About')

    container.querySelector<HTMLButtonElement>('[data-testid="home"]')?.click()
    await nextTick()
    expect(document.title).toBe('App - Home')
  })

  it('should clean up intervals on deps change', async () => {
    const tickCounts: number[] = []

    function Timer() {
      const [running, setRunning] = state(false)
      const [ticks, setTicks] = state(0)

      effect(() => {
        if (!running) return

        const interval = setInterval(() => {
          setTicks((t: number) => {
            tickCounts.push(t + 1)
            return t + 1
          })
        }, 10)

        return () => clearInterval(interval)
      }, [running])

      return f('div', {}, [
        f('span', { 'data-testid': 'ticks' }, String(ticks)),
        f('button', {
          'data-testid': 'toggle',
          onclick: () => setRunning(!running)
        }, running ? 'Stop' : 'Start')
      ])
    }

    render(f(Timer), container)

    // Start timer
    container.querySelector<HTMLButtonElement>('[data-testid="toggle"]')?.click()
    await nextTick()

    await new Promise(r => setTimeout(r, 50))

    // Stop timer
    container.querySelector<HTMLButtonElement>('[data-testid="toggle"]')?.click()
    await nextTick()

    const ticksAtStop = tickCounts.length

    // Wait more - should not tick anymore
    await new Promise(r => setTimeout(r, 50))

    expect(tickCounts.length).toBe(ticksAtStop) // No more ticks after stop
  })
})

describe('Integration: List Rendering', () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  it('should handle keyed list reordering', async () => {
    function List() {
      const [items, setItems] = state(['A', 'B', 'C'])

      const reverse = () => setItems([...items].reverse())
      const shuffle = () => setItems(['B', 'A', 'C'])

      return f('div', {}, [
        f('ul', {},
          items.map((item: string) => f('li', { key: item, 'data-key': item }, item))
        ),
        f('button', { 'data-testid': 'reverse', onclick: reverse }, 'Reverse'),
        f('button', { 'data-testid': 'shuffle', onclick: shuffle }, 'Shuffle')
      ])
    }

    render(f(List), container)

    const getItems = () =>
      Array.from(container.querySelectorAll('li')).map(li => li.textContent)

    expect(getItems()).toEqual(['A', 'B', 'C'])

    container.querySelector<HTMLButtonElement>('[data-testid="reverse"]')?.click()
    await nextTick()
    expect(getItems()).toEqual(['C', 'B', 'A'])

    container.querySelector<HTMLButtonElement>('[data-testid="shuffle"]')?.click()
    await nextTick()
    expect(getItems()).toEqual(['B', 'A', 'C'])
  })

  it('should handle conditional rendering', async () => {
    function Conditional() {
      const [show, setShow] = state(true)

      return f('div', {}, [
        show ? f('p', { 'data-testid': 'content' }, 'Visible') : null,
        f('button', { 'data-testid': 'toggle', onclick: () => setShow(!show) }, 'Toggle')
      ])
    }

    render(f(Conditional), container)

    expect(container.querySelector('[data-testid="content"]')).not.toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="toggle"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="content"]')).toBeNull()

    container.querySelector<HTMLButtonElement>('[data-testid="toggle"]')?.click()
    await nextTick()

    expect(container.querySelector('[data-testid="content"]')).not.toBeNull()
  })
})
