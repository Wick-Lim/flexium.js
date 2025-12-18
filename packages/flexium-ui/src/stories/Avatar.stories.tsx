import type { Meta, StoryObj } from '@storybook/html'
import { Avatar, type AvatarProps } from '../components/Avatar'
import { Row } from '../layout'

const meta: Meta<AvatarProps> = {
  title: 'Components/Avatar',
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Avatar size',
    },
    name: {
      control: 'text',
      description: 'Name for initials fallback',
    },
    src: {
      control: 'text',
      description: 'Image URL',
    },
  },
  args: {
    size: 'md',
    name: 'John Doe',
  },
  render: (args) => <Avatar {...args} />,
}

export default meta
type Story = StoryObj<AvatarProps>

export const Default: Story = {}

export const WithImage: Story = {
  args: {
    src: 'https://i.pravatar.cc/150?img=1',
    name: 'Jane Smith',
  },
}

export const Sizes: Story = {
  render: () => (
    <Row gap={16} crossAxisAlignment="center">
      <Avatar size="sm" name="Small" />
      <Avatar size="md" name="Medium" />
      <Avatar size="lg" name="Large" />
    </Row>
  ),
}

export const Initials: Story = {
  render: () => (
    <Row gap={16}>
      <Avatar name="John Doe" />
      <Avatar name="Alice" />
      <Avatar name="Bob Smith" />
      <Avatar name="XYZ" />
    </Row>
  ),
}

export const WithImages: Story = {
  render: () => (
    <Row gap={16}>
      <Avatar src="https://i.pravatar.cc/150?img=1" name="User 1" />
      <Avatar src="https://i.pravatar.cc/150?img=2" name="User 2" />
      <Avatar src="https://i.pravatar.cc/150?img=3" name="User 3" />
      <Avatar src="https://i.pravatar.cc/150?img=4" name="User 4" />
    </Row>
  ),
}
