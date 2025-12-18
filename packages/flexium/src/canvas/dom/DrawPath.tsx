import { useEffect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'
import type { DrawPathProps } from '../types'

export type { DrawPathProps }

export function DrawPath(props: DrawPathProps) {
  useEffect(() => {
    queueDraw({
      type: 'path',
      props
    })
  })

  return null
}
