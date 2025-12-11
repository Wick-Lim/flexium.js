import { useSalesChart, useTrafficChart } from '../store'

function BarChart({ data, title }: { data: any[], title: string }) {
  const maxValue = Math.max(...data.map(d => d.value))

  return (
    <div class="chart-card">
      <h3 class="chart-title">{title}</h3>
      <div class="chart-container">
        {data.map(item => (
          <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
            <div
              class="bar"
              style={`height: ${(item.value / maxValue) * 100}%`}
              title={`${item.label}: ${item.value}`}
            />
            <div class="bar-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Charts() {
  const [salesData] = useSalesChart()
  const [trafficData] = useTrafficChart()

  return (
    <div class="charts-grid">
      <BarChart data={salesData} title="Sales Overview" />
      <BarChart data={trafficData} title="Traffic Overview" />
    </div>
  )
}
