import type { StyleObject, CSSValue } from '../types'

/**
 * Properties that should not have 'px' auto-added
 */
const unitlessProperties = new Set([
  'animationIterationCount',
  'borderImageOutset',
  'borderImageSlice',
  'borderImageWidth',
  'boxFlex',
  'boxFlexGroup',
  'boxOrdinalGroup',
  'columnCount',
  'columns',
  'flex',
  'flexGrow',
  'flexPositive',
  'flexShrink',
  'flexNegative',
  'flexOrder',
  'gridArea',
  'gridRow',
  'gridRowEnd',
  'gridRowSpan',
  'gridRowStart',
  'gridColumn',
  'gridColumnEnd',
  'gridColumnSpan',
  'gridColumnStart',
  'fontWeight',
  'lineClamp',
  'lineHeight',
  'opacity',
  'order',
  'orphans',
  'tabSize',
  'widows',
  'zIndex',
  'zoom',
  'fillOpacity',
  'floodOpacity',
  'stopOpacity',
  'strokeDasharray',
  'strokeDashoffset',
  'strokeMiterlimit',
  'strokeOpacity',
  'strokeWidth',
])

/**
 * Convert camelCase to kebab-case
 */
export function toKebabCase(str: string): string {
  return str.replace(/[A-Z]/g, (match) => '-' + match.toLowerCase())
}

/**
 * Add unit to numeric values where appropriate
 */
export function addUnit(property: string, value: CSSValue): string {
  if (typeof value === 'number' && value !== 0 && !unitlessProperties.has(property)) {
    return value + 'px'
  }
  return String(value)
}

/**
 * Serialize a style object to CSS string
 */
export function serialize(styles: StyleObject, selector: string): string {
  let properties = ''
  let nested = ''

  for (const key in styles) {
    const value = styles[key]

    if (value === undefined || value === null) {
      continue
    }

    if (key.startsWith('&')) {
      // Nested selector: &:hover, &::before, & > div
      const nestedSelector = key.replace(/&/g, selector)
      nested += serialize(value as StyleObject, nestedSelector)
    } else if (key.startsWith('@')) {
      // At-rule: @media, @supports, @container
      nested += `${key}{${serialize(value as StyleObject, selector)}}`
    } else if (typeof value === 'object') {
      // Skip invalid nested objects without & or @
      continue
    } else {
      // Regular CSS property
      properties += `${toKebabCase(key)}:${addUnit(key, value)};`
    }
  }

  let result = ''
  if (properties) {
    result = `${selector}{${properties}}`
  }
  result += nested

  return result
}

/**
 * Serialize keyframes to CSS string
 */
export function serializeKeyframes(
  name: string,
  keyframes: Record<string, Record<string, CSSValue>>
): string {
  let frames = ''

  for (const key in keyframes) {
    const styles = keyframes[key]
    let properties = ''

    for (const prop in styles) {
      const value = styles[prop]
      if (value !== undefined && value !== null && typeof value !== 'object') {
        properties += `${toKebabCase(prop)}:${addUnit(prop, value)};`
      }
    }

    frames += `${key}{${properties}}`
  }

  return `@keyframes ${name}{${frames}}`
}
