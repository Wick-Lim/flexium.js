import { effect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'
import type { DrawCircleProps } from '../types'

export type { DrawCircleProps }

export function DrawCircle(props: DrawCircleProps) {
  effect(() => {
    queueDraw({
      type: 'circle',
      props
    })
  })

  return null
}
