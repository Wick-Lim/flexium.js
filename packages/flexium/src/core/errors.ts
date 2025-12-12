/**
 * Error System
 * 
 * 핵심: 간단한 에러 로깅만 제공
 */

export const ErrorCodes = {
  EFFECT_EXECUTION_FAILED: 'FLX101',
  CLEANUP_OUTSIDE_EFFECT: 'FLX102',
  COMPUTED_EXECUTION_FAILED: 'FLX104',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

function getErrorMessage(code: ErrorCode): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCodes.EFFECT_EXECUTION_FAILED]: 'Effect execution failed',
    [ErrorCodes.CLEANUP_OUTSIDE_EFFECT]: 'onCleanup must be called from within an effect',
    [ErrorCodes.COMPUTED_EXECUTION_FAILED]: 'Computed value execution failed',
  }
  return messages[code] || `Error ${code}`
}

export function logError(code: ErrorCode, context?: Record<string, unknown>, originalError?: unknown): void {
  const message = `[Flexium ${code}] ${getErrorMessage(code)}`
  if (originalError) {
    console.error(message, originalError)
  } else {
    console.error(message)
  }
}

export function logWarning(code: ErrorCode, context?: Record<string, unknown>): void {
  console.warn(`[Flexium ${code}] ${getErrorMessage(code)}`)
}
