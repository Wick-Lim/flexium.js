import { state } from 'flexium/core'
import AddTaskForm from './components/AddTaskForm'
import KanbanBoard from './components/KanbanBoard'
import Filters from './components/Filters'
import { type Priority } from './store'

export default function App() {
  const [filter, setFilter] = state<Priority | 'all'>('all')

  return (
    <div>
      <header class="header">
        <div class="header-content">
          <h1 class="header-title">📋 Task Manager</h1>
        </div>
      </header>
      <div class="container">
        <AddTaskForm />
        <Filters filter={filter} setFilter={setFilter} />
        <KanbanBoard />
      </div>
    </div>
  )
}
