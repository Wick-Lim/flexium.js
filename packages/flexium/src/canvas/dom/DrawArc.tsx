import { effect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'

export interface DrawArcProps {
  x: number | (() => number)
  y: number | (() => number)
  radius: number | (() => number)
  startAngle: number | (() => number)
  endAngle: number | (() => number)
  counterclockwise?: boolean
  fill?: string | (() => string)
  stroke?: string | (() => string)
  strokeWidth?: number | (() => number)
  opacity?: number | (() => number)
}

export function DrawArc(props: DrawArcProps) {
  effect(() => {
    queueDraw({
      type: 'arc',
      props
    })
  })

  return null
}
