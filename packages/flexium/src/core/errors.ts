/**
 * Flexium Error System
 *
 * Standardized error handling with error codes, contextual information,
 * and actionable suggestions for developers.
 */

// Error codes for all Flexium errors
export const ErrorCodes = {
  // Signal/Effect errors (1xx)
  EFFECT_EXECUTION_FAILED: 'FLX101',
  CLEANUP_OUTSIDE_EFFECT: 'FLX102',
  SIGNAL_UPDATE_DURING_RENDER: 'FLX103',

  // Context errors (2xx)
  CONTEXT_MISSING_PROVIDER: 'FLX201',
  ROUTER_OUTSIDE_PROVIDER: 'FLX202',

  // Form errors (3xx)
  FORM_VALIDATION_FAILED: 'FLX301',
  FORM_SUBMISSION_FAILED: 'FLX302',

  // Component errors (4xx)
  BUTTON_HANDLER_FAILED: 'FLX401',
  BUTTON_MISSING_ARIA_LABEL: 'FLX402',

  // Hydration errors (5xx)
  HYDRATION_MISMATCH: 'FLX501',
  HYDRATION_TEXT_MISMATCH: 'FLX502',
  HYDRATION_TAG_MISMATCH: 'FLX503',

  // DevTools errors (6xx)
  DEVTOOLS_LISTENER_ERROR: 'FLX601',

  // Render errors (7xx)
  UNCAUGHT_RENDER_ERROR: 'FLX701',
  ERROR_BOUNDARY_CALLBACK_FAILED: 'FLX702',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

interface ErrorDefinition {
  message: string;
  suggestion?: string;
}

// Error message definitions with suggestions
const errorDefinitions: Record<ErrorCode, ErrorDefinition> = {
  [ErrorCodes.EFFECT_EXECUTION_FAILED]: {
    message: 'Effect execution failed',
    suggestion: 'Check the effect callback for runtime errors. Consider wrapping async operations in try-catch.',
  },
  [ErrorCodes.CLEANUP_OUTSIDE_EFFECT]: {
    message: 'onCleanup must be called from within an effect',
    suggestion: 'Move the onCleanup() call inside an effect() callback.',
  },
  [ErrorCodes.SIGNAL_UPDATE_DURING_RENDER]: {
    message: 'Signal was updated during render',
    suggestion: 'Avoid updating signals inside render functions. Use effect() for side effects.',
  },
  [ErrorCodes.CONTEXT_MISSING_PROVIDER]: {
    message: 'Context used outside of Provider',
    suggestion: 'Wrap your component tree with the appropriate Context.Provider.',
  },
  [ErrorCodes.ROUTER_OUTSIDE_PROVIDER]: {
    message: 'useRouter must be used within a <Router> component',
    suggestion: 'Ensure your component is a descendant of <Router>.',
  },
  [ErrorCodes.FORM_VALIDATION_FAILED]: {
    message: 'Form field validation failed',
    suggestion: 'Check the validation rules for the field and the input value.',
  },
  [ErrorCodes.FORM_SUBMISSION_FAILED]: {
    message: 'Form submission failed',
    suggestion: 'Check the onSubmit handler and network connectivity.',
  },
  [ErrorCodes.BUTTON_HANDLER_FAILED]: {
    message: 'Button press handler failed',
    suggestion: 'Check the onPress/onClick callback for errors.',
  },
  [ErrorCodes.BUTTON_MISSING_ARIA_LABEL]: {
    message: 'IconButton is missing an aria-label',
    suggestion: 'Add an aria-label prop to IconButton for screen reader accessibility.',
  },
  [ErrorCodes.HYDRATION_MISMATCH]: {
    message: 'Hydration mismatch detected',
    suggestion: 'Ensure server and client render the same content. Check for browser-only code.',
  },
  [ErrorCodes.HYDRATION_TEXT_MISMATCH]: {
    message: 'Text content mismatch during hydration',
    suggestion: 'Server and client rendered different text. Check for Date.now(), Math.random(), or client-only data.',
  },
  [ErrorCodes.HYDRATION_TAG_MISMATCH]: {
    message: 'Element tag mismatch during hydration',
    suggestion: 'Server and client rendered different elements. Verify conditional rendering logic.',
  },
  [ErrorCodes.DEVTOOLS_LISTENER_ERROR]: {
    message: 'DevTools listener threw an error',
    suggestion: 'Check your DevTools event listener callback.',
  },
  [ErrorCodes.UNCAUGHT_RENDER_ERROR]: {
    message: 'Uncaught error during render',
    suggestion: 'Wrap components with <ErrorBoundary> to catch and handle errors gracefully.',
  },
  [ErrorCodes.ERROR_BOUNDARY_CALLBACK_FAILED]: {
    message: 'ErrorBoundary callback failed',
    suggestion: 'Check your onError or onReset callback for errors.',
  },
};

export interface FlexiumErrorInfo {
  code: ErrorCode;
  message: string;
  suggestion?: string;
  context?: Record<string, unknown>;
  originalError?: unknown;
}

/**
 * Create a standardized error info object
 */
export function createErrorInfo(
  code: ErrorCode,
  context?: Record<string, unknown>,
  originalError?: unknown
): FlexiumErrorInfo {
  const definition = errorDefinitions[code];
  return {
    code,
    message: definition.message,
    suggestion: definition.suggestion,
    context,
    originalError,
  };
}

/**
 * Format error message for console output
 */
export function formatErrorMessage(info: FlexiumErrorInfo): string {
  let message = `[Flexium ${info.code}] ${info.message}`;

  if (info.context && Object.keys(info.context).length > 0) {
    const contextStr = Object.entries(info.context)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
    message += ` (${contextStr})`;
  }

  if (info.suggestion) {
    message += `\n  → ${info.suggestion}`;
  }

  return message;
}

/**
 * Log an error with standardized formatting
 */
export function logError(
  code: ErrorCode,
  context?: Record<string, unknown>,
  originalError?: unknown
): void {
  const info = createErrorInfo(code, context, originalError);
  const message = formatErrorMessage(info);

  if (originalError) {
    console.error(message, originalError);
  } else {
    console.error(message);
  }
}

/**
 * Log a warning with standardized formatting
 */
export function logWarning(
  code: ErrorCode,
  context?: Record<string, unknown>
): void {
  const info = createErrorInfo(code, context);
  const message = formatErrorMessage(info);
  console.warn(message);
}

/**
 * Create a FlexiumError with standardized information
 */
export class FlexiumError extends Error {
  code: ErrorCode;
  suggestion?: string;
  context?: Record<string, unknown>;

  constructor(code: ErrorCode, context?: Record<string, unknown>) {
    const definition = errorDefinitions[code];
    super(definition.message);
    this.name = 'FlexiumError';
    this.code = code;
    this.suggestion = definition.suggestion;
    this.context = context;
  }

  toString(): string {
    return formatErrorMessage({
      code: this.code,
      message: this.message,
      suggestion: this.suggestion,
      context: this.context,
    });
  }
}
