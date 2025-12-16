import { effect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'
import type { DrawTextProps } from '../types'

export type { DrawTextProps }

export function DrawText(props: DrawTextProps) {
  effect(() => {
    queueDraw({
      type: 'text',
      props
    })
  })

  return null
}
