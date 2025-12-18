import type { Meta, StoryObj } from '@storybook/html'
import { Column, Row, Stack, Divider, Scroll } from '../layout'
import { Text } from '../components/Text'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { css } from 'flexium/css'

const meta: Meta = {
  title: 'Layout/Overview',
}

export default meta
type Story = StoryObj

const boxStyle = css({
  padding: '16px',
  backgroundColor: '#e3f2fd',
  borderRadius: '4px',
  textAlign: 'center',
})

export const ColumnLayout: Story = {
  render: () => (
    <Column gap={16} padding={16} background="#f5f5f5" borderRadius={8}>
      <div class={boxStyle}>Item 1</div>
      <div class={boxStyle}>Item 2</div>
      <div class={boxStyle}>Item 3</div>
    </Column>
  ),
}

export const RowLayout: Story = {
  render: () => (
    <Row gap={16} padding={16} background="#f5f5f5" borderRadius={8}>
      <div class={boxStyle}>Item 1</div>
      <div class={boxStyle}>Item 2</div>
      <div class={boxStyle}>Item 3</div>
    </Row>
  ),
}

export const ColumnAlignments: Story = {
  render: () => (
    <Row gap={24}>
      <Column gap={8} mainAxisAlignment="start" crossAxisAlignment="start" height={200} width={150} background="#f5f5f5" padding={8}>
        <Text variant="caption">start / start</Text>
        <div class={boxStyle}>A</div>
        <div class={boxStyle}>B</div>
      </Column>
      <Column gap={8} mainAxisAlignment="center" crossAxisAlignment="center" height={200} width={150} background="#f5f5f5" padding={8}>
        <Text variant="caption">center / center</Text>
        <div class={boxStyle}>A</div>
        <div class={boxStyle}>B</div>
      </Column>
      <Column gap={8} mainAxisAlignment="end" crossAxisAlignment="end" height={200} width={150} background="#f5f5f5" padding={8}>
        <Text variant="caption">end / end</Text>
        <div class={boxStyle}>A</div>
        <div class={boxStyle}>B</div>
      </Column>
      <Column gap={8} mainAxisAlignment="spaceBetween" crossAxisAlignment="stretch" height={200} width={150} background="#f5f5f5" padding={8}>
        <Text variant="caption">spaceBetween / stretch</Text>
        <div class={boxStyle}>A</div>
        <div class={boxStyle}>B</div>
      </Column>
    </Row>
  ),
}

export const RowAlignments: Story = {
  render: () => (
    <Column gap={24}>
      <Row gap={8} mainAxisAlignment="start" crossAxisAlignment="start" height={100} background="#f5f5f5" padding={8}>
        <Text variant="caption">start / start</Text>
        <div class={boxStyle}>A</div>
        <div class={boxStyle}>B</div>
      </Row>
      <Row gap={8} mainAxisAlignment="center" crossAxisAlignment="center" height={100} background="#f5f5f5" padding={8}>
        <Text variant="caption">center / center</Text>
        <div class={boxStyle}>A</div>
        <div class={boxStyle}>B</div>
      </Row>
      <Row gap={8} mainAxisAlignment="end" crossAxisAlignment="end" height={100} background="#f5f5f5" padding={8}>
        <Text variant="caption">end / end</Text>
        <div class={boxStyle}>A</div>
        <div class={boxStyle}>B</div>
      </Row>
      <Row gap={8} mainAxisAlignment="spaceBetween" height={100} background="#f5f5f5" padding={8}>
        <Text variant="caption">spaceBetween</Text>
        <div class={boxStyle}>A</div>
        <div class={boxStyle}>B</div>
      </Row>
    </Column>
  ),
}

export const StackLayout: Story = {
  render: () => (
    <Stack width={300} height={200} background="#f5f5f5" borderRadius={8}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', padding: '8px', background: '#ffcdd2', borderRadius: '4px' }}>
        Layer 1 (back)
      </div>
      <div style={{ position: 'absolute', top: '50px', left: '50px', padding: '8px', background: '#c8e6c9', borderRadius: '4px' }}>
        Layer 2 (middle)
      </div>
      <div style={{ position: 'absolute', top: '80px', left: '80px', padding: '8px', background: '#bbdefb', borderRadius: '4px' }}>
        Layer 3 (front)
      </div>
    </Stack>
  ),
}

export const DividerUsage: Story = {
  render: () => (
    <Column gap={0}>
      <Card shadow="none" padding="md">
        <Text>Section 1</Text>
      </Card>
      <Divider />
      <Card shadow="none" padding="md">
        <Text>Section 2</Text>
      </Card>
      <Divider />
      <Card shadow="none" padding="md">
        <Text>Section 3</Text>
      </Card>
    </Column>
  ),
}

export const VerticalDivider: Story = {
  render: () => (
    <Row gap={0} crossAxisAlignment="stretch" height={100}>
      <div style={{ padding: '16px' }}>Left</div>
      <Divider orientation="vertical" />
      <div style={{ padding: '16px' }}>Center</div>
      <Divider orientation="vertical" />
      <div style={{ padding: '16px' }}>Right</div>
    </Row>
  ),
}

export const ScrollContainer: Story = {
  render: () => (
    <Scroll height={200} direction="y" padding={16} background="#f5f5f5" borderRadius={8}>
      <Column gap={8}>
        {Array.from({ length: 20 }, (_, i) => (
          <Card padding="sm" shadow="sm">
            <Text>Item {i + 1}</Text>
          </Card>
        ))}
      </Column>
    </Scroll>
  ),
}

export const HorizontalScroll: Story = {
  render: () => (
    <Scroll direction="x" height={100} padding={16} background="#f5f5f5" borderRadius={8}>
      <Row gap={16}>
        {Array.from({ length: 20 }, (_, i) => (
          <Card padding="md" shadow="sm" style={{ minWidth: '150px' }}>
            <Text>Card {i + 1}</Text>
          </Card>
        ))}
      </Row>
    </Scroll>
  ),
}
