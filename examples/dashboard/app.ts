/**
 * Flexium Dashboard Example
 *
 * This example demonstrates:
 * - Grid layout with responsive columns
 * - Multiple signal instances for different data
 * - Card components with consistent styling
 * - Real-time data updates
 * - Complex layouts with nested components
 */

import { signal, computed, effect } from 'flexium'
import { render, Column, Row, Grid, Text, Button, Motion } from 'flexium/dom'

interface Stat {
  id: string
  label: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: string
}

interface Activity {
  id: number
  user: string
  action: string
  time: string
}

function Dashboard() {
  // Stats data
  const stats = signal<Stat[]>([
    { id: '1', label: 'Total Users', value: '1,234', change: '+12%', trend: 'up', icon: '👥' },
    { id: '2', label: 'Revenue', value: '$56,789', change: '+23%', trend: 'up', icon: '💰' },
    { id: '3', label: 'Active Sessions', value: '789', change: '-5%', trend: 'down', icon: '⚡' },
    { id: '4', label: 'Conversion Rate', value: '3.24%', change: '+8%', trend: 'up', icon: '📈' },
  ])

  // Recent activity
  const activities = signal<Activity[]>([
    { id: 1, user: 'Alice Johnson', action: 'Created new project', time: '2 minutes ago' },
    { id: 2, user: 'Bob Smith', action: 'Updated dashboard', time: '15 minutes ago' },
    { id: 3, user: 'Carol White', action: 'Shared report', time: '1 hour ago' },
    { id: 4, user: 'David Lee', action: 'Commented on task', time: '2 hours ago' },
  ])

  // Simulate real-time updates
  effect(() => {
    const interval = setInterval(() => {
      // Update random stat
      const randomIndex = Math.floor(Math.random() * stats.value.length)
      const newStats = [...stats.value]
      const stat = newStats[randomIndex]

      // Generate random value
      const baseValue = parseInt(stat.value.replace(/[^0-9]/g, ''))
      const change = Math.floor(Math.random() * 200) - 100
      const newValue = baseValue + change

      newStats[randomIndex] = {
        ...stat,
        value: stat.label === 'Revenue'
          ? `$${newValue.toLocaleString()}`
          : stat.label === 'Conversion Rate'
          ? `${(newValue / 100).toFixed(2)}%`
          : newValue.toLocaleString()
      }

      stats.value = newStats
    }, 3000)

    return () => clearInterval(interval)
  })

  return (
    <Column gap={0} minHeight="100vh">
      {/* Header */}
      <Row
        justify="space-between"
        align="center"
        padding={24}
        backgroundColor="white"
        borderBottom="1px solid #e5e7eb"
      >
        <Column gap={4}>
          <Text fontSize={28} fontWeight="bold" color="#111827">
            Dashboard
          </Text>
          <Text fontSize={14} color="#6b7280">
            Welcome back! Here's what's happening today.
          </Text>
        </Column>

        <Row gap={12}>
          <Button
            backgroundColor="#f3f4f6"
            color="#374151"
            padding="10px 20px"
            borderRadius={8}
            border="none"
            fontSize={14}
            cursor="pointer"
            hover={{ backgroundColor: '#e5e7eb' }}
          >
            Export
          </Button>
          <Button
            backgroundColor="#3b82f6"
            color="white"
            padding="10px 20px"
            borderRadius={8}
            border="none"
            fontSize={14}
            fontWeight="600"
            cursor="pointer"
            hover={{ backgroundColor: '#2563eb' }}
          >
            New Report
          </Button>
        </Row>
      </Row>

      {/* Main Content */}
      <Column gap={24} padding={24}>
        {/* Stats Grid */}
        <Grid
          cols={{ base: 1, sm: 2, lg: 4 }}
          gap={20}
        >
          {stats.value.map(stat => (
            <Motion
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Column
                gap={16}
                padding={24}
                backgroundColor="white"
                borderRadius={12}
                border="1px solid #e5e7eb"
                hover={{
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              >
                {/* Icon and Trend */}
                <Row justify="space-between" align="center">
                  <Text fontSize={32}>{stat.icon}</Text>
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={stat.trend === 'up' ? '#10b981' : '#ef4444'}
                  >
                    {stat.change}
                  </Text>
                </Row>

                {/* Label */}
                <Text fontSize={14} color="#6b7280">
                  {stat.label}
                </Text>

                {/* Value */}
                <Text fontSize={32} fontWeight="bold" color="#111827">
                  {stat.value}
                </Text>
              </Column>
            </Motion>
          ))}
        </Grid>

        {/* Content Grid */}
        <Grid
          cols={{ base: 1, lg: 2 }}
          gap={20}
        >
          {/* Recent Activity */}
          <Column
            gap={0}
            backgroundColor="white"
            borderRadius={12}
            border="1px solid #e5e7eb"
            overflow="hidden"
          >
            {/* Card Header */}
            <Row
              justify="space-between"
              align="center"
              padding={20}
              borderBottom="1px solid #e5e7eb"
            >
              <Text fontSize={18} fontWeight="bold" color="#111827">
                Recent Activity
              </Text>
              <Button
                backgroundColor="transparent"
                color="#3b82f6"
                padding="6px 12px"
                borderRadius={6}
                border="none"
                fontSize={14}
                cursor="pointer"
                hover={{ backgroundColor: '#eff6ff' }}
              >
                View all
              </Button>
            </Row>

            {/* Activity List */}
            <Column gap={0}>
              {activities.value.map(activity => (
                <Row
                  key={activity.id}
                  gap={16}
                  padding={20}
                  align="center"
                  borderBottom="1px solid #f3f4f6"
                  hover={{ backgroundColor: '#f9fafb' }}
                >
                  {/* Avatar */}
                  <Column
                    width={40}
                    height={40}
                    borderRadius="50%"
                    backgroundColor="#dbeafe"
                    align="center"
                    justify="center"
                  >
                    <Text fontSize={16} fontWeight="600" color="#3b82f6">
                      {activity.user.charAt(0)}
                    </Text>
                  </Column>

                  {/* Content */}
                  <Column flex={1} gap={4}>
                    <Text fontSize={14} fontWeight="600" color="#111827">
                      {activity.user}
                    </Text>
                    <Text fontSize={14} color="#6b7280">
                      {activity.action}
                    </Text>
                  </Column>

                  {/* Time */}
                  <Text fontSize={12} color="#9ca3af">
                    {activity.time}
                  </Text>
                </Row>
              ))}
            </Column>
          </Column>

          {/* Quick Actions */}
          <Column
            gap={0}
            backgroundColor="white"
            borderRadius={12}
            border="1px solid #e5e7eb"
            overflow="hidden"
          >
            {/* Card Header */}
            <Row
              padding={20}
              borderBottom="1px solid #e5e7eb"
            >
              <Text fontSize={18} fontWeight="bold" color="#111827">
                Quick Actions
              </Text>
            </Row>

            {/* Actions Grid */}
            <Grid
              cols={2}
              gap={16}
              padding={20}
            >
              {[
                { label: 'Create User', icon: '➕', color: '#3b82f6' },
                { label: 'Send Email', icon: '✉️', color: '#8b5cf6' },
                { label: 'Generate Report', icon: '📊', color: '#10b981' },
                { label: 'Export Data', icon: '📥', color: '#f59e0b' },
              ].map(action => (
                <Button
                  key={action.label}
                  backgroundColor={action.color}
                  color="white"
                  padding={24}
                  borderRadius={8}
                  border="none"
                  cursor="pointer"
                  hover={{ opacity: 0.9 }}
                >
                  <Column gap={8} align="center">
                    <Text fontSize={32}>{action.icon}</Text>
                    <Text fontSize={14} fontWeight="600">
                      {action.label}
                    </Text>
                  </Column>
                </Button>
              ))}
            </Grid>
          </Column>
        </Grid>

        {/* Performance Chart Placeholder */}
        <Column
          gap={0}
          backgroundColor="white"
          borderRadius={12}
          border="1px solid #e5e7eb"
          overflow="hidden"
        >
          <Row
            padding={20}
            borderBottom="1px solid #e5e7eb"
          >
            <Text fontSize={18} fontWeight="bold" color="#111827">
              Performance Overview
            </Text>
          </Row>

          <Column
            align="center"
            justify="center"
            padding={60}
            backgroundColor="#f9fafb"
          >
            <Text fontSize={48} marginBottom={16}>📈</Text>
            <Text fontSize={16} color="#6b7280" textAlign="center">
              Chart component would go here
            </Text>
            <Text fontSize={14} color="#9ca3af" textAlign="center" marginTop={8}>
              Integration with charting libraries like Chart.js or D3
            </Text>
          </Column>
        </Column>
      </Column>
    </Column>
  )
}

// Render to DOM
render(<Dashboard />, document.getElementById('app')!)
