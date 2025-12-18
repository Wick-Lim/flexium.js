import type { Meta, StoryObj } from '@storybook/html'
import { Button, type ButtonProps } from '../components/Button'

const meta: Meta<ButtonProps> = {
  title: 'Components/Button',
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'outlined', 'text'],
      description: 'Button style variant',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'error'],
      description: 'Button color',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Full width button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    children: {
      control: 'text',
      description: 'Button label',
    },
  },
  args: {
    children: 'Button',
    variant: 'filled',
    color: 'primary',
    size: 'md',
    disabled: false,
    fullWidth: false,
  },
  render: (args) => <Button {...args} />,
}

export default meta
type Story = StoryObj<ButtonProps>

export const Default: Story = {}

export const Filled: Story = {
  args: {
    variant: 'filled',
    children: 'Filled Button',
  },
}

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'Outlined Button',
  },
}

export const Text: Story = {
  args: {
    variant: 'text',
    children: 'Text Button',
  },
}

export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button color="primary">Primary</Button>
      <Button color="secondary">Secondary</Button>
      <Button color="error">Error</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
}

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="filled" color="primary">Filled</Button>
        <Button variant="outlined" color="primary">Outlined</Button>
        <Button variant="text" color="primary">Text</Button>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="filled" color="secondary">Filled</Button>
        <Button variant="outlined" color="secondary">Outlined</Button>
        <Button variant="text" color="secondary">Text</Button>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button variant="filled" color="error">Filled</Button>
        <Button variant="outlined" color="error">Outlined</Button>
        <Button variant="text" color="error">Text</Button>
      </div>
    </div>
  ),
}
