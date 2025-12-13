import { effect } from '../../core/lifecycle'
import { queueDraw } from '../Canvas'

export interface DrawTextProps {
  text: string | (() => string)
  x: number | (() => number)
  y: number | (() => number)
  fill?: string | (() => string)
  fontSize?: number | (() => number)
  fontFamily?: string | (() => string)
  fontWeight?: string | (() => string)
  textAlign?: 'left' | 'center' | 'right'
  opacity?: number | (() => number)
}

export function DrawText(props: DrawTextProps) {
  effect(() => {
    queueDraw({
      type: 'text',
      props
    })
  })

  return null
}
