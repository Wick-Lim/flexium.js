import { use } from 'flexium/core'
import { css } from 'flexium/css'

interface Todo { id: number; text: string; completed: boolean }

export default function TodosPage() {
  const initialTodos: Todo[] = [
    { id: 1, text: 'Learn Flexism', completed: true },
    { id: 2, text: 'Build something awesome', completed: false },
    { id: 3, text: 'Deploy to production', completed: false },
  ]

  return () => {
    const container = css({ maxWidth: '32rem', margin: '0 auto', padding: '4rem 1rem' })
    const title = css({ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' })
    const subtitle = css({ color: '#94a3b8', marginBottom: '2rem' })
    const card = css({ background: 'rgba(30, 41, 59, 0.5)', borderRadius: '1rem', border: '1px solid #334155', overflow: 'hidden' })
    const inputRow = css({ padding: '1rem', borderBottom: '1px solid #334155', display: 'flex', gap: '0.5rem' })
    const input = css({ flex: 1, padding: '0.75rem 1rem', background: '#0f172a', border: '1px solid #334155', borderRadius: '0.5rem', color: '#fff', outline: 'none', '&:focus': { borderColor: '#3b82f6' } })
    const addBtn = css({ padding: '0.75rem 1.5rem', background: '#2563eb', borderRadius: '0.5rem', fontWeight: 500, transition: 'background 0.2s', '&:hover': { background: '#1d4ed8' } })
    const todoList = css({})
    const todoItem = css({ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', borderBottom: '1px solid #334155', transition: 'background 0.2s', '&:hover': { background: 'rgba(30, 41, 59, 0.5)' } })
    const checkbox = css({ width: '1.25rem', height: '1.25rem', accentColor: '#3b82f6' })
    const todoText = css({ flex: 1 })
    const todoTextCompleted = css({ textDecoration: 'line-through', color: '#64748b' })
    const deleteBtn = css({ padding: '0.25rem 0.75rem', color: '#f87171', borderRadius: '0.25rem', transition: 'all 0.2s', '&:hover': { background: 'rgba(185, 28, 28, 0.2)' } })
    const empty = css({ padding: '2rem', textAlign: 'center', color: '#64748b' })
    const footer = css({ padding: '1rem', borderTop: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' })
    const footerCount = css({ color: '#94a3b8' })
    const filterBtns = css({ display: 'flex', gap: '0.25rem' })
    const filterBtn = css({ padding: '0.25rem 0.75rem', borderRadius: '0.25rem', transition: 'all 0.2s' })
    const filterActive = css({ background: '#2563eb', color: '#fff' })
    const filterInactive = css({ color: '#94a3b8', '&:hover': { color: '#fff', background: '#334155' } })
    const clearBtn = css({ color: '#94a3b8', transition: 'color 0.2s', '&:hover': { color: '#fff' } })

    const [todos, setTodos] = use<Todo[]>(initialTodos)
    const [newTodo, setNewTodo] = use('')
    const [filter, setFilter] = use<'all' | 'active' | 'completed'>('all')

    const addTodo = () => {
      if (!newTodo.trim()) return
      setTodos((t: Todo[]) => [...t, { id: Date.now(), text: newTodo, completed: false }])
      setNewTodo('')
    }
    const toggleTodo = (id: number) => setTodos((t: Todo[]) => t.map((todo) => todo.id === id ? { ...todo, completed: !todo.completed } : todo))
    const deleteTodo = (id: number) => setTodos((t: Todo[]) => t.filter((todo) => todo.id !== id))
    const clearCompleted = () => setTodos((t: Todo[]) => t.filter((todo) => !todo.completed))
    const filteredTodos = todos.filter((todo: Todo) => filter === 'active' ? !todo.completed : filter === 'completed' ? todo.completed : true)
    const activeCount = todos.filter((t: Todo) => !t.completed).length

    return (
      <div class={container}>
        <h1 class={title}>Todos</h1>
        <p class={subtitle}>A simple todo list with reactive state</p>
        <div class={card}>
          <div class={inputRow}>
            <input type="text" value={newTodo} oninput={(e: Event) => setNewTodo((e.target as HTMLInputElement).value)} onkeypress={(e: KeyboardEvent) => e.key === 'Enter' && addTodo()} placeholder="What needs to be done?" class={input} />
            <button onclick={addTodo} class={addBtn}>Add</button>
          </div>
          <div class={todoList}>
            {filteredTodos.length === 0 ? (
              <div class={empty}>No todos to show</div>
            ) : (
              filteredTodos.map((todo: Todo) => (
                <div key={todo.id} class={todoItem}>
                  <input type="checkbox" checked={todo.completed} onchange={() => toggleTodo(todo.id)} class={checkbox} />
                  <span class={`${todoText} ${todo.completed ? todoTextCompleted : ''}`}>{todo.text}</span>
                  <button onclick={() => deleteTodo(todo.id)} class={deleteBtn}>Delete</button>
                </div>
              ))
            )}
          </div>
          <div class={footer}>
            <span class={footerCount}>{activeCount} item{activeCount !== 1 ? 's' : ''} left</span>
            <div class={filterBtns}>
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button onclick={() => setFilter(f)} class={`${filterBtn} ${filter === f ? filterActive : filterInactive}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
              ))}
            </div>
            <button onclick={clearCompleted} class={clearBtn}>Clear completed</button>
          </div>
        </div>
      </div>
    )
  }
}
