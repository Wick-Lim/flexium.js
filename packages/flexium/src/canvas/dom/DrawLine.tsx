import { use } from '../../core/use'
import { queueDraw } from '../Canvas'
import type { DrawLineProps } from '../types'

export type { DrawLineProps }

export function DrawLine(props: DrawLineProps) {
  use(() => {
    queueDraw({
      type: 'line',
      props
    })
  })

  return null
}
