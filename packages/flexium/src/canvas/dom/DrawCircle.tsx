import { use } from '../../core/use'
import { queueDraw } from '../Canvas'
import type { DrawCircleProps } from '../types'

export type { DrawCircleProps }

export function DrawCircle(props: DrawCircleProps) {
  use(() => {
    queueDraw({
      type: 'circle',
      props
    })
  })

  return null
}
