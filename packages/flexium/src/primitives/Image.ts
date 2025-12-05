/**
 * Image - Universal image component
 *
 * Maps to:
 * - Web: <img>
 * - React Native: <Image>
 *
 * @example
 * ```tsx
 * <Image
 *   src="/logo.png"
 *   alt="Logo"
 *   width={100}
 *   height={100}
 * />
 * ```
 */

import type { FNode } from '../types'
import type { ImageProps } from './types'
import { normalizeStyle } from './utils'

export function Image(props: ImageProps): FNode {
  const { src, alt, width, height, style, onLoad, onError, ...rest } = props

  const imageStyle = {
    ...style,
    width: width || style?.width,
    height: height || style?.height,
  }

  return {
    type: 'img',
    props: {
      ...rest,
      src,
      alt: alt || '',
      style: normalizeStyle(imageStyle),
      onload: onLoad,
      onerror: onError,
    },
    children: [],
  }
}
