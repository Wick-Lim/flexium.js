/**
 * Flexium Accessibility Demo
 *
 * This example demonstrates comprehensive accessibility patterns including:
 * - ARIA attributes and roles
 * - Keyboard navigation
 * - Focus management
 * - Screen reader support
 * - Form accessibility
 * - Live regions
 * - Modal dialogs
 * - Color contrast (WCAG AA)
 * - Skip links
 * - Error handling and validation
 */

import { signal, computed, effect } from '../../../packages/flexium/src/core/signal'
import { h, render } from '../../../packages/flexium/src/core/h'

// ========================================
// STATE MANAGEMENT
// ========================================

// Form state
const formData = {
  name: signal(''),
  email: signal(''),
  message: signal(''),
  agree: signal(false),
}

// Form validation
const formErrors = {
  name: signal<string | null>(null),
  email: signal<string | null>(null),
  message: signal<string | null>(null),
}

const formTouched = {
  name: signal(false),
  email: signal(false),
  message: signal(false),
}

// Task list state
interface Task {
  id: number
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

const tasks = signal<Task[]>([
  { id: 1, text: 'Review accessibility documentation', completed: false, priority: 'high' },
  { id: 2, text: 'Test with screen reader', completed: false, priority: 'high' },
  { id: 3, text: 'Verify keyboard navigation', completed: false, priority: 'medium' },
  { id: 4, text: 'Check color contrast ratios', completed: true, priority: 'medium' },
])

const newTaskText = signal('')
const taskPriority = signal<'low' | 'medium' | 'high'>('medium')

// Modal state
const isModalOpen = signal(false)
const modalTitle = signal('Accessible Modal Dialog')
const modalMessage = signal('')
const previousFocusElement = signal<HTMLElement | null>(null)

// Notification state
const notifications = signal<Array<{ id: number; type: 'success' | 'error' | 'info'; message: string }>>([])

// Tab state for demonstration
const activeTab = signal<'form' | 'tasks' | 'modal'>('form')

// Computed values
const completedTaskCount = computed(() => tasks.value.filter(t => t.completed).length)
const totalTaskCount = computed(() => tasks.value.length)
const isFormValid = computed(() =>
  !formErrors.name.value &&
  !formErrors.email.value &&
  !formErrors.message.value &&
  formData.name.value.trim() !== '' &&
  formData.email.value.trim() !== '' &&
  formData.message.value.trim() !== '' &&
  formData.agree.value
)

// ========================================
// VALIDATION FUNCTIONS
// ========================================

function validateName(value: string): string | null {
  if (!value.trim()) {
    return 'Name is required'
  }
  if (value.trim().length < 2) {
    return 'Name must be at least 2 characters'
  }
  return null
}

function validateEmail(value: string): string | null {
  if (!value.trim()) {
    return 'Email is required'
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address'
  }
  return null
}

function validateMessage(value: string): string | null {
  if (!value.trim()) {
    return 'Message is required'
  }
  if (value.trim().length < 10) {
    return 'Message must be at least 10 characters'
  }
  return null
}

// ========================================
// ACTIONS
// ========================================

function handleFormSubmit(e: Event) {
  e.preventDefault()

  // Mark all fields as touched
  formTouched.name.set(true)
  formTouched.email.set(true)
  formTouched.message.set(true)

  // Validate all fields
  formErrors.name.set(validateName(formData.name.value))
  formErrors.email.set(validateEmail(formData.email.value))
  formErrors.message.set(validateMessage(formData.message.value))

  if (isFormValid.value) {
    addNotification('success', 'Form submitted successfully!')
    announceToScreenReader('Form submitted successfully!')

    // Reset form
    formData.name.set('')
    formData.email.set('')
    formData.message.set('')
    formData.agree.set(false)
    formTouched.name.set(false)
    formTouched.email.set(false)
    formTouched.message.set(false)
  } else {
    addNotification('error', 'Please fix the errors in the form')
    announceToScreenReader('Form has errors. Please review and correct them.')

    // Focus first error field
    if (formErrors.name.value) {
      setTimeout(() => document.getElementById('name')?.focus(), 100)
    } else if (formErrors.email.value) {
      setTimeout(() => document.getElementById('email')?.focus(), 100)
    } else if (formErrors.message.value) {
      setTimeout(() => document.getElementById('message')?.focus(), 100)
    }
  }
}

function addTask() {
  const text = newTaskText.value.trim()
  if (!text) {
    addNotification('error', 'Task description is required')
    return
  }

  const newTask: Task = {
    id: Date.now(),
    text,
    completed: false,
    priority: taskPriority.value,
  }

  tasks.set([...tasks.value, newTask])
  newTaskText.set('')
  taskPriority.set('medium')

  announceToScreenReader(`Task "${text}" added with ${taskPriority.value} priority`)
  addNotification('success', 'Task added successfully')
}

function toggleTask(id: number) {
  const task = tasks.value.find(t => t.id === id)
  if (!task) return

  tasks.set(tasks.value.map(t =>
    t.id === id ? { ...t, completed: !t.completed } : t
  ))

  const status = !task.completed ? 'completed' : 'incomplete'
  announceToScreenReader(`Task "${task.text}" marked as ${status}`)
}

function deleteTask(id: number) {
  const task = tasks.value.find(t => t.id === id)
  if (!task) return

  if (confirm(`Are you sure you want to delete "${task.text}"?`)) {
    tasks.set(tasks.value.filter(t => t.id !== id))
    announceToScreenReader(`Task "${task.text}" deleted`)
    addNotification('info', 'Task deleted')
  }
}

function openModal(title: string, message: string) {
  // Store currently focused element
  previousFocusElement.set(document.activeElement as HTMLElement)

  modalTitle.set(title)
  modalMessage.set(message)
  isModalOpen.set(true)

  // Focus modal after a short delay to allow rendering
  setTimeout(() => {
    const modalElement = document.getElementById('modal-dialog')
    if (modalElement) {
      modalElement.focus()
    }
  }, 100)

  announceToScreenReader('Dialog opened')
}

function closeModal() {
  isModalOpen.set(false)

  // Restore focus to previously focused element
  setTimeout(() => {
    const prevElement = previousFocusElement.value
    if (prevElement && typeof prevElement.focus === 'function') {
      prevElement.focus()
    }
  }, 100)

  announceToScreenReader('Dialog closed')
}

function addNotification(type: 'success' | 'error' | 'info', message: string) {
  const notification = {
    id: Date.now(),
    type,
    message,
  }

  notifications.set([...notifications.value, notification])

  // Auto-remove after 5 seconds
  setTimeout(() => {
    notifications.set(notifications.value.filter(n => n.id !== notification.id))
  }, 5000)
}

function announceToScreenReader(message: string) {
  const liveRegion = document.getElementById('live-region')
  if (liveRegion) {
    liveRegion.textContent = message
  }
}

// ========================================
// EFFECTS
// ========================================

// Validate fields on change
effect(() => {
  if (formTouched.name.value) {
    formErrors.name.set(validateName(formData.name.value))
  }
})

effect(() => {
  if (formTouched.email.value) {
    formErrors.email.set(validateEmail(formData.email.value))
  }
})

effect(() => {
  if (formTouched.message.value) {
    formErrors.message.set(validateMessage(formData.message.value))
  }
})

// Trap focus in modal when open
effect(() => {
  if (!isModalOpen.value) return

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal()
      return
    }

    // Tab trap
    if (e.key === 'Tab') {
      const modal = document.getElementById('modal-dialog')
      if (!modal) return

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      }
    }
  }

  document.addEventListener('keydown', handleKeyDown)

  return () => {
    document.removeEventListener('keydown', handleKeyDown)
  }
})

// ========================================
// COMPONENTS
// ========================================

function FormSection() {
  return h('section', {
    className: 'section',
    'aria-labelledby': 'form-title',
  }, [
    h('h2', { id: 'form-title', className: 'section-title' }, 'Accessible Form'),
    h('p', { className: 'section-description' },
      'This form demonstrates proper labeling, error handling, ARIA attributes, and validation messages.'
    ),

    h('form', { onSubmit: handleFormSubmit, noValidate: true }, [
      // Name field
      h('div', { className: 'form-group' }, [
        h('label', {
          htmlFor: 'name',
          className: 'form-label required',
        }, 'Name'),
        h('input', {
          type: 'text',
          id: 'name',
          className: 'form-input',
          value: formData.name.value,
          'aria-required': 'true',
          'aria-invalid': formTouched.name.value && formErrors.name.value ? 'true' : 'false',
          'aria-describedby': formErrors.name.value ? 'name-error' : 'name-helper',
          onInput: (e: Event) => {
            formData.name.set((e.target as HTMLInputElement).value)
          },
          onBlur: () => {
            formTouched.name.set(true)
          },
        }),
        h('span', { id: 'name-helper', className: 'form-helper' },
          'Enter your full name (minimum 2 characters)'
        ),
        formTouched.name.value && formErrors.name.value
          ? h('span', {
              id: 'name-error',
              className: 'form-error',
              role: 'alert',
            }, formErrors.name.value)
          : null,
      ]),

      // Email field
      h('div', { className: 'form-group' }, [
        h('label', {
          htmlFor: 'email',
          className: 'form-label required',
        }, 'Email'),
        h('input', {
          type: 'email',
          id: 'email',
          className: 'form-input',
          value: formData.email.value,
          'aria-required': 'true',
          'aria-invalid': formTouched.email.value && formErrors.email.value ? 'true' : 'false',
          'aria-describedby': formErrors.email.value ? 'email-error' : 'email-helper',
          autoComplete: 'email',
          onInput: (e: Event) => {
            formData.email.set((e.target as HTMLInputElement).value)
          },
          onBlur: () => {
            formTouched.email.set(true)
          },
        }),
        h('span', { id: 'email-helper', className: 'form-helper' },
          'Enter a valid email address'
        ),
        formTouched.email.value && formErrors.email.value
          ? h('span', {
              id: 'email-error',
              className: 'form-error',
              role: 'alert',
            }, formErrors.email.value)
          : null,
      ]),

      // Message field
      h('div', { className: 'form-group' }, [
        h('label', {
          htmlFor: 'message',
          className: 'form-label required',
        }, 'Message'),
        h('textarea', {
          id: 'message',
          className: 'form-textarea',
          value: formData.message.value,
          'aria-required': 'true',
          'aria-invalid': formTouched.message.value && formErrors.message.value ? 'true' : 'false',
          'aria-describedby': formErrors.message.value ? 'message-error' : 'message-helper',
          onInput: (e: Event) => {
            formData.message.set((e.target as HTMLTextAreaElement).value)
          },
          onBlur: () => {
            formTouched.message.set(true)
          },
        }),
        h('span', { id: 'message-helper', className: 'form-helper' },
          'Enter your message (minimum 10 characters)'
        ),
        formTouched.message.value && formErrors.message.value
          ? h('span', {
              id: 'message-error',
              className: 'form-error',
              role: 'alert',
            }, formErrors.message.value)
          : null,
      ]),

      // Checkbox
      h('div', { className: 'form-group' }, [
        h('label', { style: { display: 'flex', alignItems: 'center', gap: '8px' } }, [
          h('input', {
            type: 'checkbox',
            id: 'agree',
            checked: formData.agree.value,
            'aria-required': 'true',
            onChange: (e: Event) => {
              formData.agree.set((e.target as HTMLInputElement).checked)
            },
          }),
          h('span', {}, 'I agree to the terms and conditions'),
        ]),
      ]),

      // Submit button
      h('button', {
        type: 'submit',
        className: 'btn btn-primary',
        disabled: !isFormValid.value,
        'aria-label': isFormValid.value ? 'Submit form' : 'Form has errors, please correct them',
      }, 'Submit Form'),
    ]),
  ])
}

function TaskSection() {
  return h('section', {
    className: 'section',
    'aria-labelledby': 'tasks-title',
  }, [
    h('h2', { id: 'tasks-title', className: 'section-title' }, 'Accessible Task List'),
    h('p', { className: 'section-description' },
      'Keyboard navigable task list with proper ARIA labels and live region announcements.'
    ),

    // Task statistics
    h('div', {
      className: 'alert alert-info',
      role: 'status',
      'aria-label': 'Task statistics',
    }, [
      h('p', {}, `${completedTaskCount.value} of ${totalTaskCount.value} tasks completed`),
    ]),

    // Add task form
    h('div', { style: { marginBottom: '24px' } }, [
      h('div', { className: 'form-group' }, [
        h('label', { htmlFor: 'new-task', className: 'form-label' }, 'New Task'),
        h('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px' } }, [
          h('input', {
            type: 'text',
            id: 'new-task',
            className: 'form-input',
            value: newTaskText.value,
            placeholder: 'Enter task description',
            style: { flex: '1' },
            onInput: (e: Event) => {
              newTaskText.set((e.target as HTMLInputElement).value)
            },
            onKeyPress: (e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTask()
              }
            },
          }),
          h('select', {
            id: 'task-priority',
            className: 'form-select',
            value: taskPriority.value,
            'aria-label': 'Task priority',
            style: { width: '150px' },
            onChange: (e: Event) => {
              taskPriority.set((e.target as HTMLSelectElement).value as any)
            },
          }, [
            h('option', { value: 'low' }, 'Low Priority'),
            h('option', { value: 'medium' }, 'Medium Priority'),
            h('option', { value: 'high' }, 'High Priority'),
          ]),
          h('button', {
            type: 'button',
            className: 'btn btn-primary',
            onClick: addTask,
            'aria-label': 'Add task',
          }, 'Add Task'),
        ]),
      ]),
    ]),

    // Task list
    h('ul', {
      className: 'list',
      role: 'list',
      'aria-label': 'Task list',
    }, tasks.value.map(task =>
      h('li', {
        className: 'list-item',
        role: 'listitem',
        key: task.id,
      }, [
        h('input', {
          type: 'checkbox',
          id: `task-${task.id}`,
          checked: task.completed,
          'aria-label': `Mark "${task.text}" as ${task.completed ? 'incomplete' : 'complete'}`,
          onChange: () => toggleTask(task.id),
          style: { width: '20px', height: '20px' },
        }),
        h('label', {
          htmlFor: `task-${task.id}`,
          style: {
            flex: '1',
            textDecoration: task.completed ? 'line-through' : 'none',
            color: task.completed ? '#6c757d' : '#212529',
          },
        }, [
          h('span', {}, task.text),
          ' ',
          h('span', {
            className: `badge badge-${task.priority}`,
            style: {
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              background: task.priority === 'high' ? '#ffe3e3' :
                         task.priority === 'medium' ? '#fff3bf' : '#d3f9d8',
              color: task.priority === 'high' ? '#c92a2a' :
                     task.priority === 'medium' ? '#e67700' : '#087f5b',
            },
          }, task.priority),
        ]),
        h('button', {
          type: 'button',
          className: 'btn btn-danger',
          onClick: () => deleteTask(task.id),
          'aria-label': `Delete task "${task.text}"`,
          style: { padding: '8px 16px' },
        }, 'Delete'),
      ])
    )),
  ])
}

function ModalSection() {
  return h('section', {
    className: 'section',
    'aria-labelledby': 'modal-title',
  }, [
    h('h2', { id: 'modal-title', className: 'section-title' }, 'Accessible Modal Dialog'),
    h('p', { className: 'section-description' },
      'Modal with proper focus management, keyboard trap, and ESC key support.'
    ),

    h('div', { className: 'button-group' }, [
      h('button', {
        type: 'button',
        className: 'btn btn-primary',
        onClick: () => openModal('Welcome!', 'This is an accessible modal dialog with proper focus management.'),
      }, 'Open Modal'),

      h('button', {
        type: 'button',
        className: 'btn btn-success',
        onClick: () => openModal('Success', 'Your action was completed successfully!'),
      }, 'Success Modal'),

      h('button', {
        type: 'button',
        className: 'btn btn-danger',
        onClick: () => openModal('Warning', 'Please review this important information.'),
      }, 'Warning Modal'),
    ]),
  ])
}

function Modal() {
  if (!isModalOpen.value) return null

  return h('div', {
    className: 'modal-overlay',
    onClick: (e: Event) => {
      if (e.target === e.currentTarget) {
        closeModal()
      }
    },
  }, [
    h('div', {
      id: 'modal-dialog',
      className: 'modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'modal-dialog-title',
      'aria-describedby': 'modal-dialog-description',
      tabIndex: -1,
    }, [
      h('div', { className: 'modal-header' }, [
        h('h3', {
          id: 'modal-dialog-title',
          className: 'modal-title',
        }, modalTitle.value),
        h('button', {
          type: 'button',
          className: 'btn btn-secondary',
          onClick: closeModal,
          'aria-label': 'Close dialog',
        }, 'X'),
      ]),
      h('div', { className: 'modal-body' }, [
        h('p', { id: 'modal-dialog-description' }, modalMessage.value),
      ]),
      h('div', { className: 'modal-footer' }, [
        h('button', {
          type: 'button',
          className: 'btn btn-secondary',
          onClick: closeModal,
        }, 'Cancel'),
        h('button', {
          type: 'button',
          className: 'btn btn-primary',
          onClick: () => {
            addNotification('success', 'Modal action confirmed!')
            closeModal()
          },
        }, 'Confirm'),
      ]),
    ]),
  ])
}

function Notifications() {
  if (notifications.value.length === 0) return null

  return h('div', {
    style: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: '9999',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxWidth: '400px',
    },
    'aria-live': 'polite',
    'aria-atomic': 'true',
    role: 'status',
  }, notifications.value.map(notification =>
    h('div', {
      key: notification.id,
      className: `alert alert-${notification.type}`,
      role: 'alert',
    }, notification.message)
  ))
}

function App() {
  return h('div', {}, [
    h('main', {
      id: 'main-content',
      className: 'main-content',
    }, [
      // Tab navigation
      h('div', {
        role: 'tablist',
        'aria-label': 'Accessibility demos',
        style: {
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid #dee2e6',
          paddingBottom: '8px',
        },
      }, [
        h('button', {
          role: 'tab',
          'aria-selected': activeTab.value === 'form' ? 'true' : 'false',
          'aria-controls': 'form-panel',
          id: 'form-tab',
          className: 'btn ' + (activeTab.value === 'form' ? 'btn-primary' : 'btn-secondary'),
          onClick: () => activeTab.set('form'),
        }, 'Form Demo'),
        h('button', {
          role: 'tab',
          'aria-selected': activeTab.value === 'tasks' ? 'true' : 'false',
          'aria-controls': 'tasks-panel',
          id: 'tasks-tab',
          className: 'btn ' + (activeTab.value === 'tasks' ? 'btn-primary' : 'btn-secondary'),
          onClick: () => activeTab.set('tasks'),
        }, 'Task List Demo'),
        h('button', {
          role: 'tab',
          'aria-selected': activeTab.value === 'modal' ? 'true' : 'false',
          'aria-controls': 'modal-panel',
          id: 'modal-tab',
          className: 'btn ' + (activeTab.value === 'modal' ? 'btn-primary' : 'btn-secondary'),
          onClick: () => activeTab.set('modal'),
        }, 'Modal Demo'),
      ]),

      // Tab panels
      h('div', {
        id: 'form-panel',
        role: 'tabpanel',
        'aria-labelledby': 'form-tab',
        hidden: activeTab.value !== 'form',
      }, activeTab.value === 'form' ? [FormSection()] : null),

      h('div', {
        id: 'tasks-panel',
        role: 'tabpanel',
        'aria-labelledby': 'tasks-tab',
        hidden: activeTab.value !== 'tasks',
      }, activeTab.value === 'tasks' ? [TaskSection()] : null),

      h('div', {
        id: 'modal-panel',
        role: 'tabpanel',
        'aria-labelledby': 'modal-tab',
        hidden: activeTab.value !== 'modal',
      }, activeTab.value === 'modal' ? [ModalSection()] : null),
    ]),

    // Modal overlay
    Modal(),

    // Notifications
    Notifications(),
  ])
}

// ========================================
// INITIALIZATION
// ========================================

const appContainer = document.getElementById('app')
if (appContainer) {
  render(App(), appContainer)
  console.log('Flexium Accessibility Demo loaded!')
  console.log('Features demonstrated:')
  console.log('  - ARIA attributes and roles')
  console.log('  - Keyboard navigation (Tab, Shift+Tab, Enter, Space, Escape)')
  console.log('  - Focus management and trap')
  console.log('  - Screen reader announcements (live regions)')
  console.log('  - Form accessibility with validation')
  console.log('  - Color contrast (WCAG AA)')
  console.log('  - Skip links')
  console.log('  - Modal dialogs with proper semantics')
  console.log('  - Accessible task list')
}
