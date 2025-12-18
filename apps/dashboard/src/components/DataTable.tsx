import { use } from 'flexium/core'

interface TableRow {
  id: number
  name: string
  status: 'active' | 'pending' | 'inactive'
  revenue: number
  orders: number
}

const mockData: TableRow[] = [
  { id: 1, name: 'Product A', status: 'active', revenue: 12500, orders: 234 },
  { id: 2, name: 'Product B', status: 'active', revenue: 9800, orders: 189 },
  { id: 3, name: 'Product C', status: 'pending', revenue: 5600, orders: 98 },
  { id: 4, name: 'Product D', status: 'active', revenue: 15200, orders: 267 },
  { id: 5, name: 'Product E', status: 'inactive', revenue: 3200, orders: 45 },
]

export default function DataTable() {
  const [data] = use<TableRow[]>(mockData)

  function getStatusBadge(status: string) {
    const classes = {
      active: 'success',
      pending: 'warning',
      inactive: 'danger'
    }[status] || 'warning'
    
    return <span class={`badge ${classes}`}>{status}</span>
  }

  return (
    <div class="table-card">
      <h3 class="chart-title">Top Products</h3>
      <table class="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Status</th>
            <th>Revenue</th>
            <th>Orders</th>
          </tr>
        </thead>
        <tbody>
          {data.map(row => (
            <tr>
              <td>{row.name}</td>
              <td>{getStatusBadge(row.status)}</td>
              <td>${row.revenue.toLocaleString()}</td>
              <td>{row.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
