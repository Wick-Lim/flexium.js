import type { Meta, StoryObj } from '@storybook/html'
import { Card, type CardProps } from '../components/Card'
import { Text } from '../components/Text'
import { Button } from '../components/Button'
import { Column, Row } from '../layout'

const meta: Meta<CardProps> = {
  title: 'Components/Card',
  tags: ['autodocs'],
  argTypes: {
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Padding size',
    },
    shadow: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Shadow elevation',
    },
    borderRadius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'full'],
      description: 'Border radius',
    },
  },
  args: {
    padding: 'md',
    shadow: 'sm',
    borderRadius: 'md',
  },
  render: (args) => (
    <Card {...args}>
      <Text>Card content</Text>
    </Card>
  ),
}

export default meta
type Story = StoryObj<CardProps>

export const Default: Story = {}

export const Shadows: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px' }}>
      <Card shadow="none" padding="md">
        <Text>No Shadow</Text>
      </Card>
      <Card shadow="sm" padding="md">
        <Text>Small</Text>
      </Card>
      <Card shadow="md" padding="md">
        <Text>Medium</Text>
      </Card>
      <Card shadow="lg" padding="md">
        <Text>Large</Text>
      </Card>
    </div>
  ),
}

export const Paddings: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
      <Card padding="none" shadow="sm">
        <Text>None</Text>
      </Card>
      <Card padding="sm" shadow="sm">
        <Text>Small</Text>
      </Card>
      <Card padding="md" shadow="sm">
        <Text>Medium</Text>
      </Card>
      <Card padding="lg" shadow="sm">
        <Text>Large</Text>
      </Card>
      <Card padding="xl" shadow="sm">
        <Text>Extra Large</Text>
      </Card>
    </div>
  ),
}

export const WithContent: Story = {
  render: () => (
    <Card shadow="md" padding="lg" style={{ maxWidth: '320px' }}>
      <Column gap={16}>
        <Text variant="h3">Card Title</Text>
        <Text color="secondary">
          This is a card with some content. Cards can contain any type of content.
        </Text>
        <Row gap={8}>
          <Button>Action</Button>
          <Button variant="outlined">Cancel</Button>
        </Row>
      </Column>
    </Card>
  ),
}
