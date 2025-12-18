import { useState } from 'flexium/core'
import { addTask, type Priority, type TaskStatus } from '../store'

export default function AddTaskForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('todo')
  const [priority, setPriority] = useState<Priority>('medium')

  function handleSubmit(e: Event) {
    e.preventDefault()
    if (!title.trim()) return

    addTask({
      title: title.trim(),
      description: description.trim(),
      status,
      priority
    })

    setTitle('')
    setDescription('')
    setStatus('todo')
    setPriority('medium')
  }

  return (
    <form class="add-task-form" onsubmit={handleSubmit}>
      <h2 class="form-title">Add New Task</h2>
      <div class="form-grid">
        <input
          type="text"
          class="form-input"
          placeholder="Task title"
          value={title}
          oninput={(e: any) => setTitle(e.target.value)}
          required
        />
        <select
          class="form-select"
          value={status}
          onchange={(e: any) => setStatus(e.target.value)}
        >
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          class="form-select"
          value={priority}
          onchange={(e: any) => setPriority(e.target.value)}
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
        </select>
        <textarea
          class="form-textarea"
          placeholder="Task description (optional)"
          value={description}
          oninput={(e: any) => setDescription(e.target.value)}
        />
      </div>
      <button type="submit" class="submit-btn">Add Task</button>
    </form>
  )
}
