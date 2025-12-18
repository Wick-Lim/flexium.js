import type { Meta, StoryObj } from '@storybook/html'
import { Checkbox, type CheckboxProps } from '../components/Checkbox'
import { Column, Row } from '../layout'

const meta: Meta<CheckboxProps> = {
  title: 'Components/Checkbox',
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Checked state',
    },
    label: {
      control: 'text',
      description: 'Checkbox label',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Checkbox size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
  args: {
    label: 'Checkbox',
    checked: false,
    size: 'md',
    disabled: false,
  },
  render: (args) => <Checkbox {...args} />,
}

export default meta
type Story = StoryObj<CheckboxProps>

export const Default: Story = {}

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Checked',
  },
}

export const Sizes: Story = {
  render: () => (
    <Column gap={16}>
      <Checkbox size="sm" label="Small checkbox" />
      <Checkbox size="md" label="Medium checkbox" />
      <Checkbox size="lg" label="Large checkbox" />
    </Column>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Column gap={16}>
      <Checkbox disabled label="Disabled unchecked" />
      <Checkbox disabled checked label="Disabled checked" />
    </Column>
  ),
}

export const Group: Story = {
  render: () => (
    <Column gap={8}>
      <Checkbox label="Option 1" />
      <Checkbox label="Option 2" checked />
      <Checkbox label="Option 3" />
      <Checkbox label="Option 4" disabled />
    </Column>
  ),
}
