/**
 * Generate a hash for a style object
 * Uses djb2 algorithm for fast, low-collision hashing
 */
export function hash(str: string): string {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i)
  }
  return 'fx-' + (h >>> 0).toString(36)
}
