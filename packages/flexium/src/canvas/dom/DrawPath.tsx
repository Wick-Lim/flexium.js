import { use } from '../../core/use'
import { queueDraw } from '../Canvas'
import type { DrawPathProps } from '../types'

export type { DrawPathProps }

export function DrawPath(props: DrawPathProps) {
  use(() => {
    queueDraw({
      type: 'path',
      props
    })
  })

  return null
}
