import { use } from 'flexium/core'
import { queueDraw } from '../Canvas'
import type { DrawRectProps } from '../types'

export type { DrawRectProps }

export function DrawRect(props: DrawRectProps) {
  use(() => {
    queueDraw({
      type: 'rect',
      props
    })
  })

  return null
}
