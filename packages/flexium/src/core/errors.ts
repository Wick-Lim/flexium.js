/**
 * Error System
 * 
 * 핵심: 간단한 에러 로깅만 제공
 */

export const ErrorCodes = {
  EFFECT_EXECUTION_FAILED: 'FLX101',
  CLEANUP_OUTSIDE_EFFECT: 'FLX102',
  SIGNAL_UPDATE_DURING_RENDER: 'FLX103',
  COMPUTED_EXECUTION_FAILED: 'FLX104',
  CONTEXT_MISSING_PROVIDER: 'FLX201',
  ROUTER_OUTSIDE_PROVIDER: 'FLX202',
  FORM_VALIDATION_FAILED: 'FLX301',
  FORM_SUBMISSION_FAILED: 'FLX302',
  BUTTON_HANDLER_FAILED: 'FLX401',
  BUTTON_MISSING_ARIA_LABEL: 'FLX402',
  HYDRATION_MISMATCH: 'FLX501',
  HYDRATION_TEXT_MISMATCH: 'FLX502',
  HYDRATION_TAG_MISMATCH: 'FLX503',
  DEVTOOLS_LISTENER_ERROR: 'FLX601',
  UNCAUGHT_RENDER_ERROR: 'FLX701',
  ERROR_BOUNDARY_CALLBACK_FAILED: 'FLX702',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export interface FlexiumErrorInfo {
  code: ErrorCode
  message: string
  suggestion?: string
  context?: Record<string, unknown>
  originalError?: unknown
}

function getErrorMessage(code: ErrorCode): string {
  const messages: Record<string, string> = {
    [ErrorCodes.EFFECT_EXECUTION_FAILED]: 'Effect execution failed',
    [ErrorCodes.CLEANUP_OUTSIDE_EFFECT]: 'onCleanup must be called from within an effect',
    [ErrorCodes.COMPUTED_EXECUTION_FAILED]: 'Computed value execution failed',
    // 테스트용 (사용되지 않는 에러 코드)
    'FLX103': 'Signal was updated during render',
    'FLX201': 'Context used outside of Provider',
    'FLX202': 'router() must be used within a <Router> component',
    'FLX301': 'Form field validation failed',
    'FLX302': 'Form submission failed',
    'FLX401': 'Button press handler failed',
    'FLX402': 'IconButton is missing an aria-label',
    'FLX501': 'Hydration mismatch detected',
    'FLX502': 'Text content mismatch during hydration',
    'FLX503': 'Element tag mismatch during hydration',
    'FLX601': 'DevTools listener threw an error',
    'FLX701': 'Uncaught error during render',
    'FLX702': 'ErrorBoundary callback failed',
  }
  return messages[code] || `Error ${code}`
}

function getSuggestion(code: ErrorCode): string | undefined {
  const suggestions: Record<string, string> = {
    [ErrorCodes.EFFECT_EXECUTION_FAILED]: 'Check the effect callback for runtime errors. Consider wrapping async operations in try-catch.',
    [ErrorCodes.CLEANUP_OUTSIDE_EFFECT]: 'Move the onCleanup() call inside an effect() callback.',
    [ErrorCodes.SIGNAL_UPDATE_DURING_RENDER]: 'Avoid updating signals inside render functions. Use effect() for side effects.',
    [ErrorCodes.COMPUTED_EXECUTION_FAILED]: 'Check the computed callback for runtime errors. Ensure all dependencies are valid.',
    [ErrorCodes.CONTEXT_MISSING_PROVIDER]: 'Wrap your component tree with the appropriate Context.Provider.',
    [ErrorCodes.ROUTER_OUTSIDE_PROVIDER]: 'Ensure your component is a descendant of <Router>.',
    [ErrorCodes.FORM_VALIDATION_FAILED]: 'Check the validation rules for the field and the input value.',
    [ErrorCodes.FORM_SUBMISSION_FAILED]: 'Check the onSubmit handler and network connectivity.',
    [ErrorCodes.BUTTON_HANDLER_FAILED]: 'Check the onPress/onClick callback for errors.',
    [ErrorCodes.BUTTON_MISSING_ARIA_LABEL]: 'Add an aria-label prop to IconButton for screen reader accessibility.',
    [ErrorCodes.HYDRATION_MISMATCH]: 'Ensure server and client render the same content. Check for browser-only code.',
    [ErrorCodes.HYDRATION_TEXT_MISMATCH]: 'Server and client rendered different text. Check for Date.now(), Math.random(), or client-only data.',
    [ErrorCodes.HYDRATION_TAG_MISMATCH]: 'Server and client rendered different elements. Verify conditional rendering logic.',
    [ErrorCodes.DEVTOOLS_LISTENER_ERROR]: 'Check your DevTools event listener callback.',
    [ErrorCodes.UNCAUGHT_RENDER_ERROR]: 'Wrap components with <ErrorBoundary> to catch and handle errors gracefully.',
    [ErrorCodes.ERROR_BOUNDARY_CALLBACK_FAILED]: 'Check your onError or onReset callback for errors.',
  }
  return suggestions[code]
}

export function createErrorInfo(
  code: ErrorCode,
  context?: Record<string, unknown>,
  originalError?: unknown
): FlexiumErrorInfo {
  return {
    code,
    message: getErrorMessage(code),
    suggestion: getSuggestion(code),
    context,
    originalError,
  }
}

export function formatErrorMessage(info: FlexiumErrorInfo): string {
  let message = `[Flexium ${info.code}] ${info.message}`
  if (info.context && Object.keys(info.context).length > 0) {
    const contextStr = Object.entries(info.context)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ')
    message += ` (${contextStr})`
  }
  if (info.suggestion) {
    message += `\n  → ${info.suggestion}`
  }
  return message
}

export function logError(code: ErrorCode, context?: Record<string, unknown>, originalError?: unknown): void {
  const info = createErrorInfo(code, context, originalError)
  const message = formatErrorMessage(info)
  if (originalError) {
    console.error(message, originalError)
  } else {
    console.error(message)
  }
}

export function logWarning(code: ErrorCode, context?: Record<string, unknown>): void {
  const info = createErrorInfo(code, context)
  const message = formatErrorMessage(info)
  console.warn(message)
}

export class FlexiumError extends Error {
  code: ErrorCode
  suggestion?: string
  context?: Record<string, unknown>

  constructor(code: ErrorCode, context?: Record<string, unknown>) {
    super(getErrorMessage(code))
    this.name = 'FlexiumError'
    this.code = code
    this.suggestion = getSuggestion(code)
    this.context = context
  }

  toString(): string {
    return formatErrorMessage({
      code: this.code,
      message: this.message,
      suggestion: this.suggestion,
      context: this.context,
    })
  }
}
