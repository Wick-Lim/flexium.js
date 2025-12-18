import { useEffect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'
import type { DrawRectProps } from '../types'

export type { DrawRectProps }

export function DrawRect(props: DrawRectProps) {
  useEffect(() => {
    queueDraw({
      type: 'rect',
      props
    })
  })

  return null
}
