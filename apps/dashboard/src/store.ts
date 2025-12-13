import { state } from 'flexium/core'

export interface Stat {
  label: string
  value: number
  change: number
  changeType: 'positive' | 'negative'
}

export interface ChartData {
  label: string
  value: number
}

export interface Activity {
  id: number
  type: 'user' | 'order' | 'alert'
  title: string
  time: string
}

// Mock data generators
function generateRandomValue(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateStats(): Stat[] {
  return [
    {
      label: 'Total Users',
      value: generateRandomValue(10000, 50000),
      change: generateRandomValue(-5, 15),
      changeType: Math.random() > 0.5 ? 'positive' : 'negative'
    },
    {
      label: 'Revenue',
      value: generateRandomValue(50000, 200000),
      change: generateRandomValue(-3, 20),
      changeType: Math.random() > 0.3 ? 'positive' : 'negative'
    },
    {
      label: 'Orders',
      value: generateRandomValue(1000, 5000),
      change: generateRandomValue(-2, 10),
      changeType: Math.random() > 0.4 ? 'positive' : 'negative'
    },
    {
      label: 'Active Sessions',
      value: generateRandomValue(500, 2000),
      change: generateRandomValue(-10, 25),
      changeType: Math.random() > 0.5 ? 'positive' : 'negative'
    }
  ]
}

function generateChartData(): ChartData[] {
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  return labels.map(label => ({
    label,
    value: generateRandomValue(20, 100)
  }))
}

function generateActivities(): Activity[] {
  const userActivities = [
    'New user registration: john.doe@example.com',
    'User profile updated: sarah.smith@example.com',
    'New user registration: mike.johnson@example.com',
    'Password reset request: emma.wilson@example.com',
    'User logged in: alex.brown@example.com'
  ]

  const orderActivities = [
    'New order #1234 - $299.99',
    'Order #1235 shipped to New York',
    'New order #1236 - $149.50',
    'Order #1237 delivered successfully',
    'Order #1238 cancelled by customer',
    'New order #1239 - $599.00'
  ]

  const alertActivities = [
    'Server CPU usage exceeded 80%',
    'Database backup completed',
    'Security: Failed login attempts detected',
    'Payment gateway integration error',
    'Low inventory alert: Product SKU-12345',
    'API rate limit warning'
  ]

  const activities: Activity[] = []

  for (let i = 0; i < 10; i++) {
    const typeIndex = Math.floor(Math.random() * 3)
    const type: Activity['type'] = ['user', 'order', 'alert'][typeIndex] as Activity['type']

    let title = ''
    if (type === 'user') {
      title = userActivities[Math.floor(Math.random() * userActivities.length)]
    } else if (type === 'order') {
      title = orderActivities[Math.floor(Math.random() * orderActivities.length)]
    } else {
      title = alertActivities[Math.floor(Math.random() * alertActivities.length)]
    }

    activities.push({
      id: i + 1,
      type,
      title,
      time: `${generateRandomValue(1, 60)} minutes ago`
    })
  }

  return activities
}

// Global state
export function useStats() {
  return state<Stat[]>(generateStats(), { key: ['dashboard', 'stats'] })
}

export function useSalesChart() {
  return state<ChartData[]>(generateChartData(), { key: ['dashboard', 'sales-chart'] })
}

export function useTrafficChart() {
  return state<ChartData[]>(generateChartData(), { key: ['dashboard', 'traffic-chart'] })
}

export function useActivities() {
  return state<Activity[]>(generateActivities(), { key: ['dashboard', 'activities'] })
}

// Real-time updates
let updateInterval: number | null = null

export function startRealTimeUpdates() {
  // Prevent multiple intervals
  if (updateInterval !== null) return

  updateInterval = setInterval(() => {
    const [, setStats] = useStats()
    setStats(generateStats())

    const [, setSalesChart] = useSalesChart()
    setSalesChart(generateChartData())

    const [, setTrafficChart] = useTrafficChart()
    setTrafficChart(generateChartData())

    const [, setActivities] = useActivities()
    const current = useActivities()[0]

    const typeIndex = Math.floor(Math.random() * 3)
    const type: Activity['type'] = ['user', 'order', 'alert'][typeIndex] as Activity['type']

    const realtimeUserActivities = ['New user signed up', 'User updated profile', 'Password reset', 'User logged in']
    const realtimeOrderActivities = [`New order #${generateRandomValue(1000, 9999)}`, 'Order shipped', 'Order delivered', 'Order cancelled']
    const realtimeAlertActivities = ['High CPU usage', 'Backup completed', 'Security alert', 'API warning']

    let title = ''
    if (type === 'user') {
      title = realtimeUserActivities[Math.floor(Math.random() * realtimeUserActivities.length)]
    } else if (type === 'order') {
      title = realtimeOrderActivities[Math.floor(Math.random() * realtimeOrderActivities.length)]
    } else {
      title = realtimeAlertActivities[Math.floor(Math.random() * realtimeAlertActivities.length)]
    }

    const newActivity: Activity = {
      id: Date.now(),
      type,
      title,
      time: 'Just now'
    }
    setActivities([newActivity, ...current.slice(0, 9)])
  }, 3000) as unknown as number // Update every 3 seconds
}

export function stopRealTimeUpdates() {
  if (updateInterval !== null) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}
