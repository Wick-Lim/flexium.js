import type { Meta, StoryObj } from '@storybook/html'
import { TextField, type TextFieldProps } from '../components/TextField'

const meta: Meta<TextFieldProps> = {
  title: 'Components/TextField',
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Field label',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text',
    },
    type: {
      control: 'select',
      options: ['text', 'password', 'email'],
      description: 'Input type',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Input size',
    },
    error: {
      control: 'text',
      description: 'Error message',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
  args: {
    placeholder: 'Enter text...',
    size: 'md',
    type: 'text',
    disabled: false,
  },
  render: (args) => <TextField {...args} />,
}

export default meta
type Story = StoryObj<TextFieldProps>

export const Default: Story = {}

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
  },
}

export const WithError: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    error: 'Password must be at least 8 characters',
  },
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}>
      <TextField size="sm" placeholder="Small" label="Small" />
      <TextField size="md" placeholder="Medium" label="Medium" />
      <TextField size="lg" placeholder="Large" label="Large" />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    label: 'Disabled Field',
    placeholder: 'Cannot edit',
    disabled: true,
  },
}

export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px' }}>
      <TextField type="text" label="Text" placeholder="Enter text" />
      <TextField type="email" label="Email" placeholder="Enter email" />
      <TextField type="password" label="Password" placeholder="Enter password" />
    </div>
  ),
}
