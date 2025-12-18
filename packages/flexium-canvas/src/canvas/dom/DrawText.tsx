import { use } from 'flexium/core'
import { queueDraw } from '../Canvas'
import type { DrawTextProps } from '../types'

export type { DrawTextProps }

export function DrawText(props: DrawTextProps) {
  use(() => {
    queueDraw({
      type: 'text',
      props
    })
  })

  return null
}
