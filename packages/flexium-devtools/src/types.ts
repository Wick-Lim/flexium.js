// Message types for communication between extension components

export interface SignalInfo {
  id: number
  name: string
  value: unknown
  type: string
  subscribers: number
  createdAt: number
}

export interface ComponentInfo {
  id: number
  name: string
  parent: number | null
  children: number[]
  signals: number[]
  renderCount: number
}

export interface RenderEvent {
  timestamp: number
  componentId: number
  componentName: string
  trigger: string
  duration: number
}

export type MessageType =
  | 'FLEXIUM_DETECTED'
  | 'FLEXIUM_SIGNALS'
  | 'FLEXIUM_COMPONENTS'
  | 'FLEXIUM_RENDER'
  | 'FLEXIUM_GET_STATE'
  | 'FLEXIUM_DISCONNECT'

export interface DevToolsMessage {
  type: MessageType
  source: 'flexium-devtools'
  tabId?: number
  data?: {
    signals?: SignalInfo[]
    components?: ComponentInfo[]
    render?: RenderEvent
    version?: string
  }
}
