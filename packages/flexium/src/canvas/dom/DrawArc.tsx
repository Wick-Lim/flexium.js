import { use } from '../../core/use'
import { queueDraw } from '../Canvas'
import type { DrawArcProps } from '../types'

export type { DrawArcProps }

export function DrawArc(props: DrawArcProps) {
  use(() => {
    queueDraw({
      type: 'arc',
      props
    })
  })

  return null
}
