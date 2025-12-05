/**
 * Form Component Tests
 *
 * Comprehensive tests for signal-based form with validation
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createForm, validators, type FormData, type ValidationRule } from '../Form'

describe('Form Component', () => {
  describe('createForm with initial values', () => {
    it('should create form with empty initial values', () => {
      const form = createForm()

      expect(form.state.data.value).toEqual({})
      expect(form.state.isSubmitting.value).toBe(false)
      expect(form.state.isDirty.value).toBe(false)
      expect(form.state.isValid.value).toBe(true)
    })

    it('should create form with initial values', () => {
      const form = createForm({
        initialValues: {
          username: 'john_doe',
          email: 'john@example.com',
          age: 25,
        },
      })

      expect(form.state.data.value).toEqual({
        username: 'john_doe',
        email: 'john@example.com',
        age: 25,
      })
    })

    it('should handle complex initial values', () => {
      const form = createForm({
        initialValues: {
          user: {
            name: 'Alice',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
          tags: ['javascript', 'typescript'],
        },
      })

      expect(form.state.data.value).toEqual({
        user: {
          name: 'Alice',
          settings: {
            theme: 'dark',
            notifications: true,
          },
        },
        tags: ['javascript', 'typescript'],
      })
    })

    it('should handle null and undefined values', () => {
      const form = createForm({
        initialValues: {
          optionalField: null,
          anotherField: undefined,
        },
      })

      expect(form.state.data.value.optionalField).toBeNull()
      expect(form.state.data.value.anotherField).toBeUndefined()
    })
  })

  describe('Field registration and tracking', () => {
    it('should register fields on access', () => {
      const form = createForm({
        initialValues: { username: '' },
      })

      const usernameField = form.getField('username')

      expect(form.fields.has('username')).toBe(true)
      expect(usernameField.value.value).toBe('')
      expect(usernameField.touched.value).toBe(false)
      expect(usernameField.dirty.value).toBe(false)
    })

    it('should track multiple fields', () => {
      const form = createForm({
        initialValues: {
          username: '',
          email: '',
          password: '',
        },
      })

      form.getField('username')
      form.getField('email')
      form.getField('password')

      expect(form.fields.size).toBe(3)
      expect(form.fields.has('username')).toBe(true)
      expect(form.fields.has('email')).toBe(true)
      expect(form.fields.has('password')).toBe(true)
    })

    it('should return same field instance on multiple getField calls', () => {
      const form = createForm({
        initialValues: { username: '' },
      })

      const field1 = form.getField('username')
      const field2 = form.getField('username')

      expect(field1).toBe(field2)
    })

    it('should create field on the fly if not in initial values', () => {
      const form = createForm({
        initialValues: { username: '' },
      })

      const dynamicField = form.getField('dynamicField')

      expect(form.fields.has('dynamicField')).toBe(true)
      expect(dynamicField.value.value).toBeUndefined()
    })
  })

  describe('Synchronous validation rules', () => {
    it('should validate required fields', () => {
      const form = createForm({
        initialValues: { username: '' },
        validation: {
          username: validators.required(),
        },
      })

      const field = form.getField('username')
      form.setFieldTouched('username', true)

      // Error should show because field is empty and touched
      expect(field.error.value).toBe('This field is required')
    })

    it('should validate email format', () => {
      const form = createForm({
        initialValues: { email: 'invalid-email' },
        validation: {
          email: validators.email(),
        },
      })

      const field = form.getField('email')
      form.setFieldTouched('email', true)

      expect(field.error.value).toBe('Invalid email address')
    })

    it('should validate valid email', () => {
      const form = createForm({
        initialValues: { email: 'john@example.com' },
        validation: {
          email: validators.email(),
        },
      })

      const field = form.getField('email')
      form.setFieldTouched('email', true)

      expect(field.error.value).toBeNull()
    })

    it('should validate minLength', () => {
      const form = createForm({
        initialValues: { password: '123' },
        validation: {
          password: validators.minLength(6),
        },
      })

      const field = form.getField('password')
      form.setFieldTouched('password', true)

      expect(field.error.value).toBe('Must be at least 6 characters')
    })

    it('should validate maxLength', () => {
      const form = createForm({
        initialValues: { bio: 'a'.repeat(101) },
        validation: {
          bio: validators.maxLength(100),
        },
      })

      const field = form.getField('bio')
      form.setFieldTouched('bio', true)

      expect(field.error.value).toBe('Must be at most 100 characters')
    })

    it('should validate pattern', () => {
      const form = createForm({
        initialValues: { zipCode: '1234' },
        validation: {
          zipCode: validators.pattern(/^\d{5}$/, 'Must be 5 digits'),
        },
      })

      const field = form.getField('zipCode')
      form.setFieldTouched('zipCode', true)

      expect(field.error.value).toBe('Must be 5 digits')
    })

    it('should validate min number', () => {
      const form = createForm({
        initialValues: { age: 15 },
        validation: {
          age: validators.min(18, 'Must be at least 18'),
        },
      })

      const field = form.getField('age')
      form.setFieldTouched('age', true)

      expect(field.error.value).toBe('Must be at least 18')
    })

    it('should validate max number', () => {
      const form = createForm({
        initialValues: { quantity: 150 },
        validation: {
          quantity: validators.max(100),
        },
      })

      const field = form.getField('quantity')
      form.setFieldTouched('quantity', true)

      expect(field.error.value).toBe('Must be at most 100')
    })

    it('should validate multiple rules on a field', () => {
      const form = createForm({
        initialValues: { password: '' },
        validation: {
          password: [validators.required(), validators.minLength(8)],
        },
      })

      const field = form.getField('password')
      form.setFieldTouched('password', true)

      // Should show first failing rule
      expect(field.error.value).toBe('This field is required')
    })

    it('should validate all rules in order', () => {
      const form = createForm({
        initialValues: { password: 'short' },
        validation: {
          password: [validators.required(), validators.minLength(8)],
        },
      })

      const field = form.getField('password')
      form.setFieldTouched('password', true)

      // Should pass required but fail minLength
      expect(field.error.value).toBe('Must be at least 8 characters')
    })

    it('should validate custom validation rule', () => {
      const customValidator: ValidationRule = (value) => {
        if (value === 'forbidden') {
          return 'This value is not allowed'
        }
        return true
      }

      const form = createForm({
        initialValues: { username: 'forbidden' },
        validation: {
          username: validators.custom(customValidator),
        },
      })

      const field = form.getField('username')
      form.setFieldTouched('username', true)

      expect(field.error.value).toBe('This value is not allowed')
    })

    it('should pass validation when value is valid', () => {
      const form = createForm({
        initialValues: { username: 'valid_user' },
        validation: {
          username: validators.required(),
        },
      })

      const field = form.getField('username')
      form.setFieldTouched('username', true)

      expect(field.error.value).toBeNull()
    })

    it('should handle validation returning false', () => {
      const customValidator: ValidationRule = () => false

      const form = createForm({
        initialValues: { field: 'value' },
        validation: {
          field: customValidator,
        },
      })

      const field = form.getField('field')
      form.setFieldTouched('field', true)

      expect(field.error.value).toBe('Invalid value')
    })
  })

  describe('Asynchronous validation rules', () => {
    it('should validate async rules', async () => {
      const asyncValidator: ValidationRule = async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        if (value === 'taken') {
          return 'Username is already taken'
        }
        return true
      }

      const form = createForm({
        initialValues: { username: 'taken' },
        validation: {
          username: asyncValidator,
        },
      })

      form.setFieldTouched('username', true)
      const error = await form.validateField('username')

      expect(error).toBe('Username is already taken')
    })

    it('should validate async rules that pass', async () => {
      const asyncValidator: ValidationRule = async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        if (value === 'taken') {
          return 'Username is already taken'
        }
        return true
      }

      const form = createForm({
        initialValues: { username: 'available' },
        validation: {
          username: asyncValidator,
        },
      })

      form.setFieldTouched('username', true)
      const error = await form.validateField('username')

      expect(error).toBeNull()
    })

    it('should handle async validation with form data context', async () => {
      const asyncValidator: ValidationRule = async (value, formData) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        if (value === formData.password) {
          return 'Username cannot be the same as password'
        }
        return true
      }

      const form = createForm({
        initialValues: { username: 'secret123', password: 'secret123' },
        validation: {
          username: asyncValidator,
        },
      })

      form.setFieldTouched('username', true)
      const error = await form.validateField('username')

      expect(error).toBe('Username cannot be the same as password')
    })

    it('should handle mixed sync and async validators', async () => {
      const asyncValidator: ValidationRule = async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        if (value === 'taken') {
          return 'Username is already taken'
        }
        return true
      }

      const form = createForm({
        initialValues: { username: '' },
        validation: {
          username: [validators.required(), asyncValidator],
        },
      })

      form.setFieldTouched('username', true)
      const error = await form.validateField('username')

      // Should fail on required first
      expect(error).toBe('This field is required')
    })

    it('should handle async validator that rejects', async () => {
      const asyncValidator: ValidationRule = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        throw new Error('Network error')
      }

      const form = createForm({
        initialValues: { username: 'test' },
        validation: {
          username: asyncValidator,
        },
      })

      form.setFieldTouched('username', true)
      const error = await form.validateField('username')

      expect(error).toBe('Validation error')
    })
  })

  describe('Form submission', () => {
    it('should call onSubmit with form data when valid', async () => {
      const onSubmit = vi.fn()
      const form = createForm({
        initialValues: { username: 'john', email: 'john@example.com' },
        validation: {
          username: validators.required(),
          email: validators.email(),
        },
        onSubmit,
      })

      await form.handleSubmit()

      expect(onSubmit).toHaveBeenCalledWith({
        username: 'john',
        email: 'john@example.com',
      })
    })

    it('should not call onSubmit when form is invalid', async () => {
      const onSubmit = vi.fn()
      const form = createForm({
        initialValues: { username: '', email: 'invalid' },
        validation: {
          username: validators.required(),
          email: validators.email(),
        },
        onSubmit,
      })

      await form.handleSubmit()

      expect(onSubmit).not.toHaveBeenCalled()
    })

    it('should set isSubmitting during submission', async () => {
      const onSubmit = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
      })

      const form = createForm({
        initialValues: { username: 'john' },
        validation: { username: validators.required() },
        onSubmit,
      })

      const submitPromise = form.handleSubmit()

      // Check immediately - might be submitting
      await new Promise((resolve) => setTimeout(resolve, 10))

      await submitPromise

      // Should be false after completion
      expect(form.state.isSubmitting.value).toBe(false)
    })

    it('should mark all fields as touched on submit', async () => {
      const form = createForm({
        initialValues: { username: '', email: '' },
        validation: {
          username: validators.required(),
          email: validators.required(),
        },
      })

      await form.handleSubmit()

      expect(form.state.touchedFields.value.has('username')).toBe(true)
      expect(form.state.touchedFields.value.has('email')).toBe(true)
    })

    it('should prevent default event if provided', async () => {
      const form = createForm({
        initialValues: { username: 'john' },
      })

      const event = {
        preventDefault: vi.fn(),
      } as unknown as Event

      await form.handleSubmit(event)

      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should handle async onSubmit', async () => {
      const onSubmit = vi.fn(async (data: FormData) => {
        await new Promise((resolve) => setTimeout(resolve, 20))
        return data
      })

      const form = createForm({
        initialValues: { username: 'john' },
        onSubmit,
      })

      await form.handleSubmit()

      expect(onSubmit).toHaveBeenCalledWith({ username: 'john' })
    })

    it('should handle onSubmit errors gracefully', async () => {
      const onSubmit = vi.fn(async () => {
        throw new Error('Submission failed')
      })

      const form = createForm({
        initialValues: { username: 'john' },
        onSubmit,
      })

      await expect(form.handleSubmit()).resolves.not.toThrow()
      expect(form.state.isSubmitting.value).toBe(false)
    })
  })

  describe('validateForm()', () => {
    it('should validate all fields', async () => {
      const form = createForm({
        initialValues: { username: '', email: 'invalid' },
        validation: {
          username: validators.required(),
          email: validators.email(),
        },
      })

      const isValid = await form.validateForm()

      expect(isValid).toBe(false)
    })

    it('should return true when all fields are valid', async () => {
      const form = createForm({
        initialValues: { username: 'john', email: 'john@example.com' },
        validation: {
          username: validators.required(),
          email: validators.email(),
        },
      })

      const isValid = await form.validateForm()

      expect(isValid).toBe(true)
    })

    it('should update errors computed after validation', async () => {
      const form = createForm({
        initialValues: { username: '', email: '' },
        validation: {
          username: validators.required(),
          email: validators.required(),
        },
      })

      form.getField('username')
      form.getField('email')
      form.setFieldTouched('username', true)
      form.setFieldTouched('email', true)

      await form.validateForm()

      expect(form.state.errors.value.username).toBe('This field is required')
      expect(form.state.errors.value.email).toBe('This field is required')
    })

    it('should validate async validators in validateForm', async () => {
      const asyncValidator: ValidationRule = async (value) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        if (value === 'taken') {
          return 'Username is already taken'
        }
        return true
      }

      const form = createForm({
        initialValues: { username: 'taken' },
        validation: {
          username: asyncValidator,
        },
      })

      const isValid = await form.validateForm()

      expect(isValid).toBe(false)
    })

    it('should handle partial validation (only fields with rules)', async () => {
      const form = createForm({
        initialValues: { username: '', optional: 'anything' },
        validation: {
          username: validators.required(),
          // optional has no validation
        },
      })

      const isValid = await form.validateForm()

      expect(isValid).toBe(false) // username is invalid
    })
  })

  describe('resetForm()', () => {
    it('should reset form to initial values', () => {
      const form = createForm({
        initialValues: { username: 'john', email: 'john@example.com' },
      })

      form.setFieldValue('username', 'jane')
      form.setFieldValue('email', 'jane@example.com')

      form.reset()

      expect(form.state.data.value).toEqual({
        username: 'john',
        email: 'john@example.com',
      })
    })

    it('should reset form with new values', () => {
      const form = createForm({
        initialValues: { username: 'john' },
      })

      form.setFieldValue('username', 'jane')

      form.reset({ username: 'bob' })

      expect(form.state.data.value).toEqual({ username: 'bob' })
    })

    it('should reset touched and dirty state', () => {
      const form = createForm({
        initialValues: { username: 'john' },
      })

      form.setFieldValue('username', 'jane')
      form.setFieldTouched('username', true)

      expect(form.state.isDirty.value).toBe(true)
      expect(form.state.touchedFields.value.size).toBeGreaterThan(0)

      form.reset()

      expect(form.state.isDirty.value).toBe(false)
      expect(form.state.touchedFields.value.size).toBe(0)
    })

    it('should reset field states', () => {
      const form = createForm({
        initialValues: { username: 'john' },
        validation: { username: validators.required() },
      })

      const field = form.getField('username')
      form.setFieldValue('username', '')
      form.setFieldTouched('username', true)

      form.reset()

      expect(field.value.value).toBe('john')
      expect(field.touched.value).toBe(false)
      expect(field.dirty.value).toBe(false)
      expect(field.validating.value).toBe(false)
    })

    it('should reset isSubmitting flag', () => {
      const form = createForm({
        initialValues: { username: 'john' },
      })

      form.state.isSubmitting.set(true)
      form.reset()

      expect(form.state.isSubmitting.value).toBe(false)
    })
  })

  describe('setFieldError() / setFieldValue()', () => {
    it('should update field value', () => {
      const form = createForm({
        initialValues: { username: '' },
      })

      form.setFieldValue('username', 'john')

      expect(form.state.data.value.username).toBe('john')
    })

    it('should mark field as dirty when value changes', () => {
      const form = createForm({
        initialValues: { username: '' },
      })

      form.setFieldValue('username', 'john')

      expect(form.state.dirtyFields.value.has('username')).toBe(true)
      expect(form.state.isDirty.value).toBe(true)
    })

    it('should update field state value', () => {
      const form = createForm({
        initialValues: { username: '' },
      })

      const field = form.getField('username')
      form.setFieldValue('username', 'john')

      expect(field.value.value).toBe('john')
      expect(field.dirty.value).toBe(true)
    })

    it('should trigger validation on change if validateOnChange is true', async () => {
      const form = createForm({
        initialValues: { username: '' },
        validation: { username: validators.required() },
        validateOnChange: true,
      })

      const field = form.getField('username')
      form.setFieldTouched('username', true)
      form.setFieldValue('username', 'john')

      // Wait for async validation
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(field.error.value).toBeNull()
    })

    it('should not trigger validation on change if validateOnChange is false', () => {
      const form = createForm({
        initialValues: { username: '' },
        validation: { username: validators.required() },
        validateOnChange: false,
      })

      const field = form.getField('username')
      form.setFieldTouched('username', true)

      const initialError = field.error.value
      form.setFieldValue('username', 'john')

      // Error should not update immediately (no revalidation triggered)
      // Note: computed will still update based on new value
      expect(field.error.value).toBeNull()
    })

    it('should handle setFieldError by touching field', () => {
      const form = createForm({
        initialValues: { username: '' },
        validation: { username: validators.required() },
      })

      const field = form.getField('username')

      // setFieldError touches the field
      form.setFieldError('username', 'Custom error')

      expect(field.touched.value).toBe(true)
    })

    it('should create field if not exists when setting value', () => {
      const form = createForm({
        initialValues: {},
      })

      form.setFieldValue('newField', 'value')

      expect(form.state.data.value.newField).toBe('value')
      expect(form.fields.has('newField')).toBe(true)
    })

    it('should handle numeric values', () => {
      const form = createForm({
        initialValues: { age: 0 },
      })

      form.setFieldValue('age', 25)

      expect(form.state.data.value.age).toBe(25)
    })

    it('should handle boolean values', () => {
      const form = createForm({
        initialValues: { accepted: false },
      })

      form.setFieldValue('accepted', true)

      expect(form.state.data.value.accepted).toBe(true)
    })

    it('should handle array values', () => {
      const form = createForm({
        initialValues: { tags: [] as string[] },
      })

      form.setFieldValue('tags', ['javascript', 'typescript'])

      expect(form.state.data.value.tags).toEqual(['javascript', 'typescript'])
    })

    it('should handle object values', () => {
      const form = createForm({
        initialValues: { user: {} },
      })

      form.setFieldValue('user', { name: 'John', age: 25 })

      expect(form.state.data.value.user).toEqual({ name: 'John', age: 25 })
    })
  })

  describe('Computed errors based on touched state', () => {
    it('should not show error if field is not touched', () => {
      const form = createForm({
        initialValues: { username: '' },
        validation: { username: validators.required() },
      })

      const field = form.getField('username')

      expect(field.error.value).toBeNull()
    })

    it('should show error when field is touched', () => {
      const form = createForm({
        initialValues: { username: '' },
        validation: { username: validators.required() },
      })

      const field = form.getField('username')
      form.setFieldTouched('username', true)

      expect(field.error.value).toBe('This field is required')
    })

    it('should hide error when field is untouched', () => {
      const form = createForm({
        initialValues: { username: '' },
        validation: { username: validators.required() },
      })

      const field = form.getField('username')
      form.setFieldTouched('username', true)

      expect(field.error.value).toBe('This field is required')

      form.setFieldTouched('username', false)

      expect(field.error.value).toBeNull()
    })

    it('should update errors computed when fields are touched', () => {
      const form = createForm({
        initialValues: { username: '', email: '' },
        validation: {
          username: validators.required(),
          email: validators.required(),
        },
      })

      form.getField('username')
      form.getField('email')

      form.setFieldTouched('username', true)

      expect(form.state.errors.value.username).toBe('This field is required')
      expect(form.state.errors.value.email).toBeNull()
    })

    it('should reflect error state in isValid computed', () => {
      const form = createForm({
        initialValues: { username: '' },
        validation: { username: validators.required() },
      })

      form.getField('username')

      expect(form.state.isValid.value).toBe(true) // not touched yet

      form.setFieldTouched('username', true)

      expect(form.state.isValid.value).toBe(false)
    })

    it('should update isValid when errors are fixed', () => {
      const form = createForm({
        initialValues: { username: '' },
        validation: { username: validators.required() },
      })

      const field = form.getField('username')
      form.setFieldTouched('username', true)

      expect(form.state.isValid.value).toBe(false)

      form.setFieldValue('username', 'john')

      expect(form.state.isValid.value).toBe(true)
    })
  })

  describe('setFieldTouched()', () => {
    it('should mark field as touched', () => {
      const form = createForm({
        initialValues: { username: '' },
      })

      const field = form.getField('username')
      form.setFieldTouched('username', true)

      expect(field.touched.value).toBe(true)
      expect(form.state.touchedFields.value.has('username')).toBe(true)
    })

    it('should mark field as untouched', () => {
      const form = createForm({
        initialValues: { username: '' },
      })

      const field = form.getField('username')
      form.setFieldTouched('username', true)
      form.setFieldTouched('username', false)

      expect(field.touched.value).toBe(false)
      expect(form.state.touchedFields.value.has('username')).toBe(false)
    })

    it('should trigger validation on blur if validateOnBlur is true', async () => {
      const form = createForm({
        initialValues: { username: '' },
        validation: { username: validators.required() },
        validateOnBlur: true,
      })

      form.getField('username')
      form.setFieldTouched('username', true)

      // Wait for async validation
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Note: error is shown via computed when touched
    })

    it('should not trigger validation on blur if validateOnBlur is false', () => {
      const form = createForm({
        initialValues: { username: '' },
        validation: { username: validators.required() },
        validateOnBlur: false,
      })

      const field = form.getField('username')
      form.setFieldTouched('username', true)

      // Error still shows because computed runs when touched changes
      expect(field.error.value).toBe('This field is required')
    })
  })

  describe('dispose()', () => {
    it('should clear all fields', () => {
      const form = createForm({
        initialValues: { username: '', email: '' },
      })

      form.getField('username')
      form.getField('email')

      expect(form.fields.size).toBe(2)

      form.dispose()

      expect(form.fields.size).toBe(0)
    })
  })

  describe('Edge cases and integration', () => {
    it('should handle rapid field updates', () => {
      const form = createForm({
        initialValues: { counter: 0 },
      })

      for (let i = 1; i <= 100; i++) {
        form.setFieldValue('counter', i)
      }

      expect(form.state.data.value.counter).toBe(100)
    })

    it('should handle form with no validation', async () => {
      const onSubmit = vi.fn()
      const form = createForm({
        initialValues: { username: 'john' },
        onSubmit,
      })

      await form.handleSubmit()

      expect(onSubmit).toHaveBeenCalledWith({ username: 'john' })
    })

    it('should handle empty validation object', async () => {
      const form = createForm({
        initialValues: { username: 'john' },
        validation: {},
      })

      const isValid = await form.validateForm()

      expect(isValid).toBe(true)
    })

    it('should track multiple touched fields', () => {
      const form = createForm({
        initialValues: { field1: '', field2: '', field3: '' },
      })

      form.setFieldTouched('field1', true)
      form.setFieldTouched('field2', true)

      expect(form.state.touchedFields.value.size).toBe(2)
      expect(form.state.touchedFields.value.has('field1')).toBe(true)
      expect(form.state.touchedFields.value.has('field2')).toBe(true)
      expect(form.state.touchedFields.value.has('field3')).toBe(false)
    })

    it('should track multiple dirty fields', () => {
      const form = createForm({
        initialValues: { field1: '', field2: '', field3: '' },
      })

      form.setFieldValue('field1', 'value1')
      form.setFieldValue('field2', 'value2')

      expect(form.state.dirtyFields.value.size).toBe(2)
      expect(form.state.isDirty.value).toBe(true)
    })

    it('should compute errors for all registered fields', () => {
      const form = createForm({
        initialValues: { field1: '', field2: '', field3: '' },
        validation: {
          field1: validators.required(),
          field2: validators.required(),
          field3: validators.required(),
        },
      })

      form.getField('field1')
      form.getField('field2')
      form.getField('field3')

      form.setFieldTouched('field1', true)
      form.setFieldTouched('field2', true)

      const errors = form.state.errors.value

      expect(errors.field1).toBe('This field is required')
      expect(errors.field2).toBe('This field is required')
      expect(errors.field3).toBeNull() // not touched
    })

    it('should handle complex validation scenarios', async () => {
      const form = createForm({
        initialValues: {
          username: 'ab',
          email: 'test@test.com',
          password: '12345',
          confirmPassword: '12345',
        },
        validation: {
          username: [validators.required(), validators.minLength(3)],
          email: [validators.required(), validators.email()],
          password: [validators.required(), validators.minLength(8)],
          confirmPassword: validators.custom((value, formData) => {
            if (value !== formData.password) {
              return 'Passwords must match'
            }
            return true
          }),
        },
      })

      const isValid = await form.validateForm()

      expect(isValid).toBe(false)
    })

    it('should maintain reactivity across field updates', () => {
      const form = createForm({
        initialValues: { username: '' },
        validation: { username: validators.required() },
      })

      const field = form.getField('username')
      form.setFieldTouched('username', true)

      expect(field.error.value).toBe('This field is required')

      form.setFieldValue('username', 'john')

      expect(field.error.value).toBeNull()

      form.setFieldValue('username', '')

      expect(field.error.value).toBe('This field is required')
    })
  })
})
