import { effect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'

export interface DrawPathProps {
  d: string | (() => string)
  fill?: string | (() => string)
  stroke?: string | (() => string)
  strokeWidth?: number | (() => number)
  opacity?: number | (() => number)
}

export function DrawPath(props: DrawPathProps) {
  effect(() => {
    queueDraw({
      type: 'path',
      props
    })
  })

  return null
}
