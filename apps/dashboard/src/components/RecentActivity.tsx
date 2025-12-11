import { useActivities } from '../store'

function getActivityIcon(type: string) {
  switch (type) {
    case 'user':
      return '👤'
    case 'order':
      return '📦'
    case 'alert':
      return '⚠️'
    default:
      return '📋'
  }
}

export default function RecentActivity() {
  const [activities] = useActivities()

  return (
    <div class="chart-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h3 class="chart-title">Recent Activity</h3>
        <div class="realtime-indicator">
          <span class="pulse"></span>
          Live
        </div>
      </div>
      <div class="activity-feed">
        {activities.map(activity => (
          <div class="activity-item">
            <div class={`activity-icon ${activity.type}`}>
              {getActivityIcon(activity.type)}
            </div>
            <div class="activity-content">
              <div class="activity-title">{activity.title}</div>
              <div class="activity-time">{activity.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
