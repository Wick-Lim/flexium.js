/**
 * HTML character escaping utilities
 */
const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;'
}

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, char => ESCAPE_MAP[char])
}

export function escapeAttribute(str: string): string {
  return str.replace(/[&<>"]/g, char => ESCAPE_MAP[char])
}

const VALID_ATTR_NAME = /^[a-zA-Z_:][-a-zA-Z0-9_:.]*$/

export function isValidAttributeName(name: string): boolean {
  return VALID_ATTR_NAME.test(name)
}
