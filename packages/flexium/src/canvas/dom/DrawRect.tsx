import { effect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'

export interface DrawRectProps {
  x: number | (() => number)
  y: number | (() => number)
  width: number | (() => number)
  height: number | (() => number)
  fill?: string | (() => string)
  stroke?: string | (() => string)
  strokeWidth?: number | (() => number)
  opacity?: number | (() => number)
}

export function DrawRect(props: DrawRectProps) {
  effect(() => {
    queueDraw({
      type: 'rect',
      props
    })
  })

  return null
}
