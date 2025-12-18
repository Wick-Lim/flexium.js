import { useEffect } from 'flexium/core'
import { startRealTimeUpdates, stopRealTimeUpdates } from './store'
import Stats from './components/Stats'
import Charts from './components/Charts'
import RecentActivity from './components/RecentActivity'
import DataTable from './components/DataTable'

export default function App() {
  useEffect(() => {
    startRealTimeUpdates()
    return () => {
      stopRealTimeUpdates()
    }
  }, [])

  return (
    <div>
      <header class="dashboard-header">
        <h1 class="dashboard-title">Analytics Dashboard</h1>
        <p class="dashboard-subtitle">Real-time metrics and insights</p>
      </header>
      <div class="dashboard-container">
        <Stats />
        <Charts />
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
          <DataTable />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
