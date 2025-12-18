import { use } from 'flexium/core'

export type TaskStatus = 'todo' | 'in-progress' | 'done'
export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: Priority
  createdAt: number
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Design new landing page',
    description: 'Create wireframes and mockups for the new landing page design',
    status: 'todo',
    priority: 'high',
    createdAt: Date.now() - 86400000
  },
  {
    id: 2,
    title: 'Implement user authentication',
    description: 'Add login and registration functionality with JWT tokens',
    status: 'in-progress',
    priority: 'high',
    createdAt: Date.now() - 172800000
  },
  {
    id: 3,
    title: 'Write API documentation',
    description: 'Document all API endpoints with examples and error codes',
    status: 'todo',
    priority: 'medium',
    createdAt: Date.now() - 43200000
  },
  {
    id: 4,
    title: 'Fix mobile responsive issues',
    description: 'Address layout issues on mobile devices',
    status: 'in-progress',
    priority: 'medium',
    createdAt: Date.now() - 259200000
  },
  {
    id: 5,
    title: 'Update dependencies',
    description: 'Update npm packages to latest versions',
    status: 'done',
    priority: 'low',
    createdAt: Date.now() - 345600000
  },
  {
    id: 6,
    title: 'Code review for PR #42',
    description: 'Review and provide feedback on the pull request',
    status: 'done',
    priority: 'medium',
    createdAt: Date.now() - 518400000
  }
]

export function useTasks() {
  return use<Task[]>(initialTasks, undefined, { key: ['tasks'] })
}

let nextId = Math.max(...initialTasks.map(t => t.id)) + 1

export function addTask(task: Omit<Task, 'id' | 'createdAt'>) {
  const [tasks, setTasks] = useTasks()
  const newTask: Task = {
    ...task,
    id: nextId++,
    createdAt: Date.now()
  }
  setTasks([...tasks, newTask])
}

export function updateTaskStatus(taskId: number, status: TaskStatus) {
  const [tasks, setTasks] = useTasks()
  setTasks(tasks.map(task =>
    task.id === taskId ? { ...task, status } : task
  ))
}

export function deleteTask(taskId: number) {
  const [tasks, setTasks] = useTasks()
  setTasks(tasks.filter(task => task.id !== taskId))
}

export function updateTask(taskId: number, updates: Partial<Task>) {
  const [tasks, setTasks] = useTasks()
  setTasks(tasks.map(task =>
    task.id === taskId ? { ...task, ...updates } : task
  ))
}
