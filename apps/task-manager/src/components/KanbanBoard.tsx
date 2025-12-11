import { state, effect } from 'flexium/core'
import { useTasks, type Task, type TaskStatus, type Priority } from '../store'
import TaskCard from './TaskCard'

function Column({ status, title, icon, filter }: { status: TaskStatus, title: string, icon: string, filter: Priority | 'all' }) {
  const [tasks] = useTasks()
  const [filteredTasks, setFilteredTasks] = state<Task[]>([])

  effect(() => {
    let filtered = tasks.filter(task => task.status === status)
    
    if (filter !== 'all') {
      filtered = filtered.filter(task => task.priority === filter)
    }
    
    setFilteredTasks(filtered)
  })

  const count = filteredTasks.length

  return (
    <div class="column">
      <div class="column-header">
        <div class={`column-title ${status}`}>
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <span class="task-count">{count}</span>
      </div>
      <div class="task-list">
        {filteredTasks.length === 0 ? (
          <div class="empty-column">No tasks</div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard task={task} />
          ))
        )}
      </div>
    </div>
  )
}

export default function KanbanBoard({ filter }: { filter: Priority | 'all' }) {
  return (
    <div class="kanban-board">
      <Column status="todo" title="To Do" icon="📝" filter={filter} />
      <Column status="in-progress" title="In Progress" icon="⚡" filter={filter} />
      <Column status="done" title="Done" icon="✅" filter={filter} />
    </div>
  )
}
