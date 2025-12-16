import { effect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'
import type { DrawLineProps } from '../types'

export type { DrawLineProps }

export function DrawLine(props: DrawLineProps) {
  effect(() => {
    queueDraw({
      type: 'line',
      props
    })
  })

  return null
}
