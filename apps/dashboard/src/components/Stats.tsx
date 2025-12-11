import { useStats } from '../store'

export default function Stats() {
  const [stats] = useStats()

  return (
    <div class="stats-grid">
      {stats.map(stat => (
        <div class="stat-card">
          <div class="stat-label">{stat.label}</div>
          <div class="stat-value">
            {stat.value.toLocaleString()}
          </div>
          <div class={`stat-change ${stat.changeType}`}>
            {stat.changeType === 'positive' ? '↑' : '↓'} {Math.abs(stat.change)}%
          </div>
        </div>
      ))}
    </div>
  )
}
