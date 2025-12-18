import { use } from 'flexium/core'
import { updateTaskStatus, deleteTask, type Task, type TaskStatus } from '../store'

export default function TaskCard({ task }: { task: Task }) {
  const [isEditing, setIsEditing] = use(false)
  const [newStatus, setNewStatus] = use<TaskStatus>(task.status)

  function handleStatusChange(e: Event) {
    const target = e.target as HTMLSelectElement
    const status = target.value as TaskStatus
    updateTaskStatus(task.id, status)
    setNewStatus(status)
    setIsEditing(false)
  }

  function getPriorityClass(priority: string) {
    return `priority-badge ${priority}`
  }

  return (
    <div class="task-card">
      <div class="task-header">
        <div>
          <div class="task-title">{task.title}</div>
        </div>
        {isEditing ? (
          <select
            value={newStatus}
            onchange={handleStatusChange}
            style="padding: 0.25rem; border-radius: 4px; border: 1px solid var(--border-color);"
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        ) : (
          <button
            class="task-btn"
            onclick={() => setIsEditing(true)}
          >
            Move
          </button>
        )}
      </div>
      {task.description && (
        <div class="task-description">{task.description}</div>
      )}
      <div class="task-footer">
        <span class={getPriorityClass(task.priority)}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <div class="task-actions">
          <button
            class="task-btn delete"
            onclick={() => deleteTask(task.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
