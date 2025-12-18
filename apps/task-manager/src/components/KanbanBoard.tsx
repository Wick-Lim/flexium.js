import { use } from 'flexium/core'
import { type Task, type TaskStatus, useTasks } from '../store'
import TaskCard from './TaskCard'

function Column({ tasks, status, title, icon }: { tasks: Task[], status: TaskStatus, title: string, icon: string }) {
  return (
    <div class="column">
      <div class="column-header">
        <div class={`column-title ${status}`}>
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <span class="task-count">{tasks.length}</span>
      </div>
      <div class="task-list">
        {tasks.length === 0 ? (
          <div class="empty-column">No tasks</div>
        ) : (
          tasks.map(task => (
            <TaskCard task={task} />
          ))
        )}
      </div>
    </div>
  )
}

export default function KanbanBoard() {
  const [tasks] = useTasks()

  const [todo] = use(() => tasks.filter((task: Task) => task.status === 'todo'), [tasks]);
  const [inProgress] = use(() => tasks.filter((task: Task) => task.status === 'in-progress'), [tasks]);
  const [done] = use(() => tasks.filter((task: Task) => task.status === 'done'), [tasks]);

  return (
    <div class="kanban-board">
      <Column tasks={todo} status="todo" title="To Do" icon="📝" />
      <Column tasks={inProgress} status="in-progress" title="In Progress" icon="⚡" />
      <Column tasks={done} status="done" title="Done" icon="✅" />
    </div>
  )
}
