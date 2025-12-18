import type { Meta, StoryObj } from '@storybook/html'
import { Chip, type ChipProps } from '../components/Chip'
import { Row } from '../layout'

const meta: Meta<ChipProps> = {
  title: 'Components/Chip',
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Chip label',
    },
    variant: {
      control: 'select',
      options: ['filled', 'outlined'],
      description: 'Chip variant',
    },
    color: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'error'],
      description: 'Chip color',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Chip size',
    },
    onDelete: {
      action: 'deleted',
      description: 'Delete handler',
    },
  },
  args: {
    label: 'Chip',
    variant: 'filled',
    color: 'default',
    size: 'md',
  },
  render: (args) => <Chip {...args} />,
}

export default meta
type Story = StoryObj<ChipProps>

export const Default: Story = {}

export const Variants: Story = {
  render: () => (
    <Row gap={8}>
      <Chip label="Filled" variant="filled" />
      <Chip label="Outlined" variant="outlined" />
    </Row>
  ),
}

export const Colors: Story = {
  render: () => (
    <Row gap={8}>
      <Chip label="Default" color="default" />
      <Chip label="Primary" color="primary" />
      <Chip label="Secondary" color="secondary" />
      <Chip label="Error" color="error" />
    </Row>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Row gap={8} crossAxisAlignment="center">
      <Chip label="Small" size="sm" />
      <Chip label="Medium" size="md" />
    </Row>
  ),
}

export const Deletable: Story = {
  render: () => (
    <Row gap={8}>
      <Chip label="Deletable" onDelete={() => alert('Deleted!')} />
      <Chip label="Primary" color="primary" onDelete={() => alert('Deleted!')} />
      <Chip label="Outlined" variant="outlined" onDelete={() => alert('Deleted!')} />
    </Row>
  ),
}

export const Tags: Story = {
  render: () => (
    <Row gap={8} wrap>
      <Chip label="JavaScript" color="primary" />
      <Chip label="TypeScript" color="primary" />
      <Chip label="React" color="secondary" />
      <Chip label="Vue" color="secondary" />
      <Chip label="Flexium" color="error" />
    </Row>
  ),
}
