import type { Meta, StoryObj } from '@storybook/html'
import { Switch, type SwitchProps } from '../components/Switch'
import { Column, Row } from '../layout'
import { Text } from '../components/Text'

const meta: Meta<SwitchProps> = {
  title: 'Components/Switch',
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Checked state',
    },
    label: {
      control: 'text',
      description: 'Switch label',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Switch size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
  args: {
    label: 'Toggle',
    checked: false,
    size: 'md',
    disabled: false,
  },
  render: (args) => <Switch {...args} />,
}

export default meta
type Story = StoryObj<SwitchProps>

export const Default: Story = {}

export const Checked: Story = {
  args: {
    checked: true,
    label: 'Enabled',
  },
}

export const Sizes: Story = {
  render: () => (
    <Column gap={16}>
      <Switch size="sm" label="Small" />
      <Switch size="md" label="Medium" />
      <Switch size="lg" label="Large" />
    </Column>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Column gap={16}>
      <Switch disabled label="Disabled off" />
      <Switch disabled checked label="Disabled on" />
    </Column>
  ),
}

export const Settings: Story = {
  render: () => (
    <Column gap={16} style={{ maxWidth: '300px' }}>
      <Row mainAxisAlignment="spaceBetween" crossAxisAlignment="center">
        <Text>Dark Mode</Text>
        <Switch checked />
      </Row>
      <Row mainAxisAlignment="spaceBetween" crossAxisAlignment="center">
        <Text>Notifications</Text>
        <Switch />
      </Row>
      <Row mainAxisAlignment="spaceBetween" crossAxisAlignment="center">
        <Text>Auto-save</Text>
        <Switch checked />
      </Row>
      <Row mainAxisAlignment="spaceBetween" crossAxisAlignment="center">
        <Text>Beta Features</Text>
        <Switch disabled />
      </Row>
    </Column>
  ),
}
