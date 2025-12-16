import { effect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'
import type { DrawRectProps } from '../types'

export type { DrawRectProps }

export function DrawRect(props: DrawRectProps) {
  effect(() => {
    queueDraw({
      type: 'rect',
      props
    })
  })

  return null
}
