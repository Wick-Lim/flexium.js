/**
 * Form Component - Signal-based forms with built-in validation
 *
 * Provides reactive form state management without external libraries
 * Supports nested fields, async validation, and automatic error tracking
 */

import { signal, computed, batch, type Signal, type Computed } from '../../core/signal';

/**
 * Field value types
 */
export type FieldValue = string | number | boolean | File | null | undefined | FieldValue[] | { [key: string]: FieldValue };

/**
 * Validation function type
 * Returns true/undefined for valid, or error message string for invalid
 */
export type ValidationRule<T = FieldValue> = (value: T, formData: FormData) => string | boolean | undefined | Promise<string | boolean | undefined>;

/**
 * Field validation rules
 */
export interface FieldValidation {
  [fieldName: string]: ValidationRule | ValidationRule[];
}

/**
 * Form data type
 */
export interface FormData {
  [fieldName: string]: FieldValue;
}

/**
 * Field state
 */
export interface FieldState<T = FieldValue> {
  value: Signal<T>;
  error: Computed<string | null>;
  touched: Signal<boolean>;
  dirty: Signal<boolean>;
  validating: Signal<boolean>;
}

/**
 * Form state
 */
export interface FormState {
  data: Signal<FormData>;
  errors: Computed<{ [key: string]: string | null }>;
  isValid: Computed<boolean>;
  isSubmitting: Signal<boolean>;
  isDirty: Computed<boolean>;
  touchedFields: Signal<Set<string>>;
  dirtyFields: Signal<Set<string>>;
}

/**
 * Form configuration
 */
export interface FormConfig {
  initialValues?: FormData;
  validation?: FieldValidation;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (data: FormData) => void | Promise<void>;
}

/**
 * Built-in validation helpers
 */
export const validators = {
  required: (message = 'This field is required'): ValidationRule => {
    return (value) => {
      if (value === null || value === undefined || value === '') {
        return message;
      }
      return true;
    };
  },

  email: (message = 'Invalid email address'): ValidationRule => {
    return (value) => {
      if (!value || typeof value !== 'string') return true;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) || message;
    };
  },

  minLength: (min: number, message?: string): ValidationRule => {
    return (value) => {
      if (!value || typeof value !== 'string') return true;
      return value.length >= min || message || `Must be at least ${min} characters`;
    };
  },

  maxLength: (max: number, message?: string): ValidationRule => {
    return (value) => {
      if (!value || typeof value !== 'string') return true;
      return value.length <= max || message || `Must be at most ${max} characters`;
    };
  },

  pattern: (pattern: RegExp, message = 'Invalid format'): ValidationRule => {
    return (value) => {
      if (!value || typeof value !== 'string') return true;
      return pattern.test(value) || message;
    };
  },

  min: (min: number, message?: string): ValidationRule => {
    return (value) => {
      if (value === null || value === undefined) return true;
      const num = typeof value === 'number' ? value : parseFloat(value as string);
      return num >= min || message || `Must be at least ${min}`;
    };
  },

  max: (max: number, message?: string): ValidationRule => {
    return (value) => {
      if (value === null || value === undefined) return true;
      const num = typeof value === 'number' ? value : parseFloat(value as string);
      return num <= max || message || `Must be at most ${max}`;
    };
  },

  custom: (fn: ValidationRule): ValidationRule => fn,
};

/**
 * Create a form with reactive state and validation
 */
export function createForm(config: FormConfig = {}): {
  state: FormState;
  fields: Map<string, FieldState>;
  getField: <T = FieldValue>(name: string) => FieldState<T>;
  setFieldValue: (name: string, value: FieldValue) => void;
  setFieldError: (name: string, error: string | null) => void;
  setFieldTouched: (name: string, touched: boolean) => void;
  validateField: (name: string) => Promise<string | null>;
  validateForm: () => Promise<boolean>;
  handleSubmit: (e?: Event) => Promise<void>;
  reset: (values?: FormData) => void;
  dispose: () => void;
} {
  const {
    initialValues = {},
    validation = {},
    validateOnChange = true,
    validateOnBlur = true,
    onSubmit,
  } = config;

  // Form state
  const formData = signal<FormData>(initialValues);
  const isSubmitting = signal(false);
  const touchedFields = signal(new Set<string>());
  const dirtyFields = signal(new Set<string>());

  // Field states
  const fields = new Map<string, FieldState>();

  // Create computed errors
  const errors = computed(() => {
    const errorMap: { [key: string]: string | null } = {};
    for (const [name, field] of fields) {
      errorMap[name] = field.error.value;
    }
    return errorMap;
  });

  // Is form valid
  const isValid = computed(() => {
    const errorValues = Object.values(errors.value);
    return errorValues.every(err => err === null);
  });

  // Is form dirty
  const isDirty = computed(() => {
    return dirtyFields.value.size > 0;
  });

  // Validate a single field
  async function validateField(name: string): Promise<string | null> {
    const fieldValidation = validation[name];
    if (!fieldValidation) return null;

    const value = formData.value[name];
    const rules = Array.isArray(fieldValidation) ? fieldValidation : [fieldValidation];

    for (const rule of rules) {
      try {
        const result = await rule(value, formData.value);
        if (result === false || typeof result === 'string') {
          return typeof result === 'string' ? result : 'Invalid value';
        }
      } catch (error) {
        console.error(`Validation error for field ${name}:`, error);
        return 'Validation error';
      }
    }

    return null;
  }

  // Validate entire form
  async function validateForm(): Promise<boolean> {
    const validationPromises = Object.keys(validation).map(async (name) => {
      const error = await validateField(name);
      const field = fields.get(name);
      if (field) {
        setFieldError(name, error);
      }
      return error === null;
    });

    const results = await Promise.all(validationPromises);
    return results.every(valid => valid);
  }

  // Get or create field state
  function getField<T = FieldValue>(name: string): FieldState<T> {
    if (fields.has(name)) {
      return fields.get(name) as FieldState<T>;
    }

    // Create new field state
    const fieldValue = signal(formData.value[name] as T);
    const fieldTouched = signal(touchedFields.value.has(name));
    const fieldDirty = signal(dirtyFields.value.has(name));
    const fieldValidating = signal(false);

    const fieldError = computed(() => {
      // Only show error if field has been touched
      if (!fieldTouched.value) return null;

      const fieldValidation = validation[name];
      if (!fieldValidation) return null;

      // Synchronous validation only for computed
      const value = fieldValue.value;
      const rules = Array.isArray(fieldValidation) ? fieldValidation : [fieldValidation];

      for (const rule of rules) {
        try {
          const result = rule(value as FieldValue, formData.value);
          // Only handle synchronous results in computed
          if (result instanceof Promise) {
            // Async validation handled separately
            continue;
          }
          if (result === false || typeof result === 'string') {
            return typeof result === 'string' ? result : 'Invalid value';
          }
        } catch (error) {
          console.error(`Validation error for field ${name}:`, error);
          return 'Validation error';
        }
      }

      return null;
    });

    const field: FieldState<T> = {
      value: fieldValue,
      error: fieldError,
      touched: fieldTouched,
      dirty: fieldDirty,
      validating: fieldValidating,
    };

    fields.set(name, field as FieldState);
    return field;
  }

  // Set field value
  function setFieldValue(name: string, value: FieldValue): void {
    batch(() => {
      // Update form data
      formData.set({ ...formData.value, [name]: value });

      // Update field state
      const field = getField(name);
      field.value.set(value as any);
      field.dirty.set(true);

      // Mark as dirty
      const newDirtyFields = new Set(dirtyFields.value);
      newDirtyFields.add(name);
      dirtyFields.set(newDirtyFields);

      // Validate on change if enabled
      if (validateOnChange && field.touched.value) {
        validateField(name).then(error => {
          setFieldError(name, error);
        });
      }
    });
  }

  // Set field error
  function setFieldError(name: string, _error: string | null): void {
    // Error is computed automatically, but we can force update by re-validating
    // This is mainly used after async validation
    const field = fields.get(name);
    if (field) {
      // Trigger re-validation by touching the field
      field.touched.set(true);
    }
  }

  // Set field touched
  function setFieldTouched(name: string, touched: boolean): void {
    const field = getField(name);
    field.touched.set(touched);

    const newTouchedFields = new Set(touchedFields.value);
    if (touched) {
      newTouchedFields.add(name);
    } else {
      newTouchedFields.delete(name);
    }
    touchedFields.set(newTouchedFields);

    // Validate on blur if enabled
    if (touched && validateOnBlur) {
      validateField(name).then(error => {
        setFieldError(name, error);
      });
    }
  }

  // Handle form submission
  async function handleSubmit(e?: Event): Promise<void> {
    if (e) {
      e.preventDefault();
    }

    // Mark all fields as touched
    batch(() => {
      const allFields = new Set(Object.keys(validation));
      for (const name of allFields) {
        setFieldTouched(name, true);
      }
    });

    // Validate form
    const valid = await validateForm();

    if (!valid) {
      return;
    }

    // Submit form
    if (onSubmit) {
      isSubmitting.set(true);
      try {
        await onSubmit(formData.value);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        isSubmitting.set(false);
      }
    }
  }

  // Reset form
  function reset(values?: FormData): void {
    batch(() => {
      formData.set(values || initialValues);
      touchedFields.set(new Set());
      dirtyFields.set(new Set());
      isSubmitting.set(false);

      // Reset all field states
      for (const [name, field] of fields) {
        field.value.set(formData.value[name] as any);
        field.touched.set(false);
        field.dirty.set(false);
        field.validating.set(false);
      }
    });
  }

  // Cleanup
  function dispose(): void {
    fields.clear();
  }

  return {
    state: {
      data: formData,
      errors,
      isValid,
      isSubmitting,
      isDirty,
      touchedFields,
      dirtyFields,
    },
    fields,
    getField,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    validateField,
    validateForm,
    handleSubmit,
    reset,
    dispose,
  };
}
