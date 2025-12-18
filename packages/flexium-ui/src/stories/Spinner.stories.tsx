import type { Meta, StoryObj } from '@storybook/html'
import { Spinner, type SpinnerProps } from '../components/Spinner'
import { Row, Column } from '../layout'
import { Text } from '../components/Text'
import { Button } from '../components/Button'

const meta: Meta<SpinnerProps> = {
  title: 'Components/Spinner',
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Spinner size',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'white'],
      description: 'Spinner color',
    },
  },
  args: {
    size: 'md',
    color: 'primary',
  },
  render: (args) => <Spinner {...args} />,
}

export default meta
type Story = StoryObj<SpinnerProps>

export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <Row gap={24} crossAxisAlignment="center">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
    </Row>
  ),
}

export const Colors: Story = {
  render: () => (
    <Row gap={24} crossAxisAlignment="center">
      <Spinner color="primary" />
      <Spinner color="secondary" />
      <div style={{ background: '#333', padding: '16px', borderRadius: '8px' }}>
        <Spinner color="white" />
      </div>
    </Row>
  ),
}

export const LoadingState: Story = {
  render: () => (
    <Column gap={16} crossAxisAlignment="center">
      <Spinner size="lg" />
      <Text color="secondary">Loading...</Text>
    </Column>
  ),
}

export const ButtonWithSpinner: Story = {
  render: () => (
    <Row gap={16}>
      <Button disabled>
        <Row gap={8} crossAxisAlignment="center">
          <Spinner size="sm" color="white" />
          <span>Loading...</span>
        </Row>
      </Button>
      <Button>Normal</Button>
    </Row>
  ),
}
