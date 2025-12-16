import { effect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'
import type { DrawArcProps } from '../types'

export type { DrawArcProps }

export function DrawArc(props: DrawArcProps) {
  effect(() => {
    queueDraw({
      type: 'arc',
      props
    })
  })

  return null
}
