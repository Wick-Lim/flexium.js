import { type Priority } from '../store'

export default function Filters({ filter, setFilter }: { filter: Priority | 'all', setFilter: (f: Priority | 'all') => void }) {
  return (
    <div class="filters">
      <button
        class={`filter-btn ${filter === 'all' ? 'active' : ''}`}
        onclick={() => setFilter('all')}
      >
        All Tasks
      </button>
      <button
        class={`filter-btn ${filter === 'high' ? 'active' : ''}`}
        onclick={() => setFilter('high')}
      >
        High Priority
      </button>
      <button
        class={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
        onclick={() => setFilter('medium')}
      >
        Medium Priority
      </button>
      <button
        class={`filter-btn ${filter === 'low' ? 'active' : ''}`}
        onclick={() => setFilter('low')}
      >
        Low Priority
      </button>
    </div>
  )
}
