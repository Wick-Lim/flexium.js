import { effect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'

export interface DrawCircleProps {
  x: number | (() => number)
  y: number | (() => number)
  radius: number | (() => number)
  fill?: string | (() => string)
  stroke?: string | (() => string)
  strokeWidth?: number | (() => number)
  opacity?: number | (() => number)
}

export function DrawCircle(props: DrawCircleProps) {
  effect(() => {
    queueDraw({
      type: 'circle',
      props
    })
  })

  return null
}
