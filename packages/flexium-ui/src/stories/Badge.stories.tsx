import type { Meta, StoryObj } from '@storybook/html'
import { Badge, type BadgeProps } from '../components/Badge'
import { Row } from '../layout'
import { Button } from '../components/Button'

const meta: Meta<BadgeProps> = {
  title: 'Components/Badge',
  tags: ['autodocs'],
  argTypes: {
    count: {
      control: 'number',
      description: 'Badge count',
    },
    max: {
      control: 'number',
      description: 'Max count before showing +',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error'],
      description: 'Badge color',
    },
    dot: {
      control: 'boolean',
      description: 'Show as dot instead of count',
    },
    showZero: {
      control: 'boolean',
      description: 'Show badge when count is 0',
    },
  },
  args: {
    count: 5,
    max: 99,
    color: 'error',
    dot: false,
    showZero: false,
  },
  render: (args) => (
    <Badge {...args}>
      <Button>Notifications</Button>
    </Badge>
  ),
}

export default meta
type Story = StoryObj<BadgeProps>

export const Default: Story = {}

export const Counts: Story = {
  render: () => (
    <Row gap={24}>
      <Badge count={5}>
        <Button>Messages</Button>
      </Badge>
      <Badge count={25}>
        <Button>Updates</Button>
      </Badge>
      <Badge count={150} max={99}>
        <Button>Alerts</Button>
      </Badge>
    </Row>
  ),
}

export const Colors: Story = {
  render: () => (
    <Row gap={24}>
      <Badge count={3} color="primary">
        <Button>Primary</Button>
      </Badge>
      <Badge count={3} color="secondary">
        <Button>Secondary</Button>
      </Badge>
      <Badge count={3} color="error">
        <Button>Error</Button>
      </Badge>
    </Row>
  ),
}

export const Dot: Story = {
  render: () => (
    <Row gap={24}>
      <Badge dot color="primary">
        <Button>Status</Button>
      </Badge>
      <Badge dot color="error">
        <Button>Alert</Button>
      </Badge>
    </Row>
  ),
}

export const ShowZero: Story = {
  render: () => (
    <Row gap={24}>
      <Badge count={0} showZero>
        <Button>With Zero</Button>
      </Badge>
      <Badge count={0}>
        <Button>Hidden Zero</Button>
      </Badge>
    </Row>
  ),
}
