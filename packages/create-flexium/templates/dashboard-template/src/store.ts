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
  const types: Activity['type'][] = ['user', 'order', 'alert']
  const activities: Activity[] = []
  
  for (let i = 0; i < 10; i++) {
    activities.push({
      id: i + 1,
      type: types[Math.floor(Math.random() * types.length)],
      title: `Activity ${i + 1}`,
      time: `${generateRandomValue(1, 60)} minutes ago`
    })
  }
  
  return activities
}

// Global state
export function useStats() {
  return state<Stat[]>(generateStats(), { key: 'dashboard/stats' })
}

export function useSalesChart() {
  return state<ChartData[]>(generateChartData(), { key: 'dashboard/sales-chart' })
}

export function useTrafficChart() {
  return state<ChartData[]>(generateChartData(), { key: 'dashboard/traffic-chart' })
}

export function useActivities() {
  return state<Activity[]>(generateActivities(), { key: 'dashboard/activities' })
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
    const newActivity: Activity = {
      id: Date.now(),
      type: ['user', 'order', 'alert'][Math.floor(Math.random() * 3)] as Activity['type'],
      title: `New ${['user', 'order', 'alert'][Math.floor(Math.random() * 3)]} activity`,
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
