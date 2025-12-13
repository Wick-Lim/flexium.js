import { effect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'

export interface DrawLineProps {
  x1: number | (() => number)
  y1: number | (() => number)
  x2: number | (() => number)
  y2: number | (() => number)
  stroke?: string | (() => string)
  strokeWidth?: number | (() => number)
  opacity?: number | (() => number)
}

export function DrawLine(props: DrawLineProps) {
  effect(() => {
    queueDraw({
      type: 'line',
      props
    })
  })

  return null
}
