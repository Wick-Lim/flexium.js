/**
 * Error System Tests
 *
 * Tests for Flexium's standardized error handling system
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  ErrorCodes,
  FlexiumError,
  createErrorInfo,
  formatErrorMessage,
  logError,
  logWarning,
  type ErrorCode,
  type FlexiumErrorInfo
} from '../errors'

describe('ErrorCodes', () => {
  it('should have all expected error codes', () => {
    expect(ErrorCodes).toHaveProperty('EFFECT_EXECUTION_FAILED')
    expect(ErrorCodes).toHaveProperty('CLEANUP_OUTSIDE_EFFECT')
    expect(ErrorCodes).toHaveProperty('SIGNAL_UPDATE_DURING_RENDER')
    expect(ErrorCodes).toHaveProperty('CONTEXT_MISSING_PROVIDER')
    expect(ErrorCodes).toHaveProperty('ROUTER_OUTSIDE_PROVIDER')
    expect(ErrorCodes).toHaveProperty('FORM_VALIDATION_FAILED')
    expect(ErrorCodes).toHaveProperty('FORM_SUBMISSION_FAILED')
    expect(ErrorCodes).toHaveProperty('BUTTON_HANDLER_FAILED')
    expect(ErrorCodes).toHaveProperty('BUTTON_MISSING_ARIA_LABEL')
    expect(ErrorCodes).toHaveProperty('HYDRATION_MISMATCH')
    expect(ErrorCodes).toHaveProperty('HYDRATION_TEXT_MISMATCH')
    expect(ErrorCodes).toHaveProperty('HYDRATION_TAG_MISMATCH')
    expect(ErrorCodes).toHaveProperty('DEVTOOLS_LISTENER_ERROR')
    expect(ErrorCodes).toHaveProperty('UNCAUGHT_RENDER_ERROR')
    expect(ErrorCodes).toHaveProperty('ERROR_BOUNDARY_CALLBACK_FAILED')
  })

  it('should have correct error code format (FLXxxx)', () => {
    const codeValues = Object.values(ErrorCodes)

    codeValues.forEach(code => {
      expect(code).toMatch(/^FLX\d{3}$/)
    })
  })

  it('should have unique error codes', () => {
    const codeValues = Object.values(ErrorCodes)
    const uniqueCodes = new Set(codeValues)

    expect(uniqueCodes.size).toBe(codeValues.length)
  })

  it('should group error codes by category', () => {
    // Signal/Effect errors (1xx)
    expect(ErrorCodes.EFFECT_EXECUTION_FAILED).toBe('FLX101')
    expect(ErrorCodes.CLEANUP_OUTSIDE_EFFECT).toBe('FLX102')
    expect(ErrorCodes.SIGNAL_UPDATE_DURING_RENDER).toBe('FLX103')

    // Context errors (2xx)
    expect(ErrorCodes.CONTEXT_MISSING_PROVIDER).toBe('FLX201')
    expect(ErrorCodes.ROUTER_OUTSIDE_PROVIDER).toBe('FLX202')

    // Form errors (3xx)
    expect(ErrorCodes.FORM_VALIDATION_FAILED).toBe('FLX301')
    expect(ErrorCodes.FORM_SUBMISSION_FAILED).toBe('FLX302')

    // Component errors (4xx)
    expect(ErrorCodes.BUTTON_HANDLER_FAILED).toBe('FLX401')
    expect(ErrorCodes.BUTTON_MISSING_ARIA_LABEL).toBe('FLX402')

    // Hydration errors (5xx)
    expect(ErrorCodes.HYDRATION_MISMATCH).toBe('FLX501')
    expect(ErrorCodes.HYDRATION_TEXT_MISMATCH).toBe('FLX502')
    expect(ErrorCodes.HYDRATION_TAG_MISMATCH).toBe('FLX503')

    // DevTools errors (6xx)
    expect(ErrorCodes.DEVTOOLS_LISTENER_ERROR).toBe('FLX601')

    // Render errors (7xx)
    expect(ErrorCodes.UNCAUGHT_RENDER_ERROR).toBe('FLX701')
    expect(ErrorCodes.ERROR_BOUNDARY_CALLBACK_FAILED).toBe('FLX702')
  })
})

describe('createErrorInfo', () => {
  it('should create error info with message and suggestion', () => {
    const info = createErrorInfo(ErrorCodes.EFFECT_EXECUTION_FAILED)

    expect(info.code).toBe('FLX101')
    expect(info.message).toBe('Effect execution failed')
    expect(info.suggestion).toBe('Check the effect callback for runtime errors. Consider wrapping async operations in try-catch.')
  })

  it('should include context when provided', () => {
    const context = { component: 'MyComponent', line: 42 }
    const info = createErrorInfo(ErrorCodes.CLEANUP_OUTSIDE_EFFECT, context)

    expect(info.context).toEqual(context)
    expect(info.context?.component).toBe('MyComponent')
    expect(info.context?.line).toBe(42)
  })

  it('should include originalError when provided', () => {
    const originalError = new Error('Original error')
    const info = createErrorInfo(
      ErrorCodes.EFFECT_EXECUTION_FAILED,
      undefined,
      originalError
    )

    expect(info.originalError).toBe(originalError)
  })

  it('should include both context and originalError', () => {
    const context = { file: 'app.ts' }
    const originalError = new Error('Test error')
    const info = createErrorInfo(
      ErrorCodes.EFFECT_EXECUTION_FAILED,
      context,
      originalError
    )

    expect(info.context).toEqual(context)
    expect(info.originalError).toBe(originalError)
  })

  it('should work for all error codes', () => {
    const errorCodes = Object.values(ErrorCodes)

    errorCodes.forEach(code => {
      const info = createErrorInfo(code as ErrorCode)

      expect(info.code).toBe(code)
      expect(info.message).toBeTruthy()
      expect(typeof info.message).toBe('string')
    })
  })
})

describe('formatErrorMessage', () => {
  it('should format basic error message', () => {
    const info: FlexiumErrorInfo = {
      code: ErrorCodes.EFFECT_EXECUTION_FAILED,
      message: 'Effect execution failed'
    }

    const formatted = formatErrorMessage(info)

    expect(formatted).toBe('[Flexium FLX101] Effect execution failed')
  })

  it('should include suggestion in formatted message', () => {
    const info: FlexiumErrorInfo = {
      code: ErrorCodes.CLEANUP_OUTSIDE_EFFECT,
      message: 'onCleanup must be called from within an effect',
      suggestion: 'Move the onCleanup() call inside an effect() callback.'
    }

    const formatted = formatErrorMessage(info)

    expect(formatted).toContain('[Flexium FLX102]')
    expect(formatted).toContain('onCleanup must be called from within an effect')
    expect(formatted).toContain('→ Move the onCleanup() call inside an effect() callback.')
  })

  it('should include context in formatted message', () => {
    const info: FlexiumErrorInfo = {
      code: ErrorCodes.EFFECT_EXECUTION_FAILED,
      message: 'Effect execution failed',
      context: { component: 'App', line: 10 }
    }

    const formatted = formatErrorMessage(info)

    expect(formatted).toContain('component: "App"')
    expect(formatted).toContain('line: 10')
  })

  it('should handle complex context objects', () => {
    const info: FlexiumErrorInfo = {
      code: ErrorCodes.HYDRATION_MISMATCH,
      message: 'Hydration mismatch detected',
      context: {
        expected: 'div',
        actual: 'span',
        path: ['App', 'Container', 'Item']
      }
    }

    const formatted = formatErrorMessage(info)

    expect(formatted).toContain('expected: "div"')
    expect(formatted).toContain('actual: "span"')
    expect(formatted).toContain('path: ["App","Container","Item"]')
  })

  it('should handle empty context object', () => {
    const info: FlexiumErrorInfo = {
      code: ErrorCodes.EFFECT_EXECUTION_FAILED,
      message: 'Effect execution failed',
      context: {}
    }

    const formatted = formatErrorMessage(info)

    expect(formatted).toBe('[Flexium FLX101] Effect execution failed')
    expect(formatted).not.toContain('()')
  })

  it('should format complete error info with all fields', () => {
    const info = createErrorInfo(
      ErrorCodes.CONTEXT_MISSING_PROVIDER,
      { context: 'UserContext', component: 'UserProfile' }
    )

    const formatted = formatErrorMessage(info)

    expect(formatted).toContain('[Flexium FLX201]')
    expect(formatted).toContain('Context used outside of Provider')
    expect(formatted).toContain('context: "UserContext"')
    expect(formatted).toContain('component: "UserProfile"')
    expect(formatted).toContain('→ Wrap your component tree with the appropriate Context.Provider.')
  })
})

describe('logError', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('should log error to console', () => {
    logError(ErrorCodes.EFFECT_EXECUTION_FAILED)

    expect(consoleErrorSpy).toHaveBeenCalledOnce()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Flexium FLX101]')
    )
  })

  it('should log error with context', () => {
    const context = { component: 'TestComponent' }
    logError(ErrorCodes.CLEANUP_OUTSIDE_EFFECT, context)

    expect(consoleErrorSpy).toHaveBeenCalledOnce()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('component: "TestComponent"')
    )
  })

  it('should log error with original error', () => {
    const originalError = new Error('Original error')
    logError(ErrorCodes.EFFECT_EXECUTION_FAILED, undefined, originalError)

    expect(consoleErrorSpy).toHaveBeenCalledOnce()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Flexium FLX101]'),
      originalError
    )
  })

  it('should log error with context and original error', () => {
    const context = { file: 'app.ts' }
    const originalError = new Error('Test error')
    logError(ErrorCodes.EFFECT_EXECUTION_FAILED, context, originalError)

    expect(consoleErrorSpy).toHaveBeenCalledOnce()
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('file: "app.ts"'),
      originalError
    )
  })

  it('should include suggestion in logged message', () => {
    logError(ErrorCodes.CLEANUP_OUTSIDE_EFFECT)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('→ Move the onCleanup() call inside an effect() callback.')
    )
  })
})

describe('logWarning', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleWarnSpy.mockRestore()
  })

  it('should log warning to console', () => {
    logWarning(ErrorCodes.BUTTON_MISSING_ARIA_LABEL)

    expect(consoleWarnSpy).toHaveBeenCalledOnce()
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Flexium FLX402]')
    )
  })

  it('should log warning with context', () => {
    const context = { component: 'IconButton', id: 'submit-btn' }
    logWarning(ErrorCodes.BUTTON_MISSING_ARIA_LABEL, context)

    expect(consoleWarnSpy).toHaveBeenCalledOnce()
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('component: "IconButton"')
    )
  })

  it('should include suggestion in warning', () => {
    logWarning(ErrorCodes.BUTTON_MISSING_ARIA_LABEL)

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('→ Add an aria-label prop to IconButton')
    )
  })
})

describe('FlexiumError', () => {
  it('should create a FlexiumError instance', () => {
    const error = new FlexiumError(ErrorCodes.EFFECT_EXECUTION_FAILED)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(FlexiumError)
    expect(error.name).toBe('FlexiumError')
  })

  it('should set error message from error code', () => {
    const error = new FlexiumError(ErrorCodes.CLEANUP_OUTSIDE_EFFECT)

    expect(error.message).toBe('onCleanup must be called from within an effect')
  })

  it('should set code property', () => {
    const error = new FlexiumError(ErrorCodes.SIGNAL_UPDATE_DURING_RENDER)

    expect(error.code).toBe('FLX103')
  })

  it('should set suggestion property', () => {
    const error = new FlexiumError(ErrorCodes.CONTEXT_MISSING_PROVIDER)

    expect(error.suggestion).toBe('Wrap your component tree with the appropriate Context.Provider.')
  })

  it('should set context when provided', () => {
    const context = { component: 'App', file: 'app.ts' }
    const error = new FlexiumError(ErrorCodes.EFFECT_EXECUTION_FAILED, context)

    expect(error.context).toEqual(context)
  })

  it('should format toString() with all information', () => {
    const context = { component: 'TestComponent' }
    const error = new FlexiumError(ErrorCodes.CLEANUP_OUTSIDE_EFFECT, context)
    const errorString = error.toString()

    expect(errorString).toContain('[Flexium FLX102]')
    expect(errorString).toContain('onCleanup must be called from within an effect')
    expect(errorString).toContain('component: "TestComponent"')
    expect(errorString).toContain('→ Move the onCleanup() call inside an effect() callback.')
  })

  it('should be throwable', () => {
    expect(() => {
      throw new FlexiumError(ErrorCodes.EFFECT_EXECUTION_FAILED)
    }).toThrow(FlexiumError)

    expect(() => {
      throw new FlexiumError(ErrorCodes.EFFECT_EXECUTION_FAILED)
    }).toThrow('Effect execution failed')
  })

  it('should be catchable as Error', () => {
    try {
      throw new FlexiumError(ErrorCodes.CLEANUP_OUTSIDE_EFFECT)
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(FlexiumError)
      expect((error as FlexiumError).code).toBe('FLX102')
    }
  })

  it('should work for all error codes', () => {
    const errorCodes = Object.values(ErrorCodes)

    errorCodes.forEach(code => {
      const error = new FlexiumError(code as ErrorCode)

      expect(error.code).toBe(code)
      expect(error.message).toBeTruthy()
      expect(error.name).toBe('FlexiumError')
    })
  })

  it('should preserve stack trace', () => {
    const error = new FlexiumError(ErrorCodes.EFFECT_EXECUTION_FAILED)

    expect(error.stack).toBeTruthy()
    expect(error.stack).toContain('FlexiumError')
  })

  it('should handle context with various data types', () => {
    const context = {
      string: 'value',
      number: 42,
      boolean: true,
      null: null,
      array: [1, 2, 3],
      object: { nested: 'value' }
    }
    const error = new FlexiumError(ErrorCodes.HYDRATION_MISMATCH, context)

    expect(error.context).toEqual(context)
    const errorString = error.toString()
    expect(errorString).toContain('string: "value"')
    expect(errorString).toContain('number: 42')
    expect(errorString).toContain('boolean: true')
  })
})

describe('Error System Integration', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('should create, format, and log errors consistently', () => {
    const context = { component: 'App' }
    const info = createErrorInfo(ErrorCodes.EFFECT_EXECUTION_FAILED, context)
    const formatted = formatErrorMessage(info)

    logError(ErrorCodes.EFFECT_EXECUTION_FAILED, context)

    expect(consoleErrorSpy).toHaveBeenCalledWith(formatted)
  })

  it('should allow creating error from error info', () => {
    const context = { test: 'value' }
    const error = new FlexiumError(ErrorCodes.CLEANUP_OUTSIDE_EFFECT, context)
    const info = createErrorInfo(ErrorCodes.CLEANUP_OUTSIDE_EFFECT, context)

    expect(error.code).toBe(info.code)
    expect(error.message).toBe(info.message)
    expect(error.suggestion).toBe(info.suggestion)
    expect(error.context).toEqual(info.context)
  })

  it('should handle error workflow: create -> format -> throw', () => {
    const context = { field: 'email' }

    expect(() => {
      const error = new FlexiumError(ErrorCodes.FORM_VALIDATION_FAILED, context)
      throw error
    }).toThrow(FlexiumError)

    try {
      throw new FlexiumError(ErrorCodes.FORM_VALIDATION_FAILED, context)
    } catch (error) {
      const flexError = error as FlexiumError
      const formatted = flexError.toString()

      expect(formatted).toContain('[Flexium FLX301]')
      expect(formatted).toContain('field: "email"')
    }
  })
})
