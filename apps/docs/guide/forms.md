---
title: Forms - Signal-based Form Handling
description: Build reactive forms with built-in validation using Flexium's signal-based form primitives. Learn about form state, validation rules, and submission handling.
head:
  - - meta
    - property: og:title
      content: Forms - Flexium Form Handling
  - - meta
    - property: og:description
      content: Signal-based forms with built-in validation, field state management, and automatic error tracking.
---

# Forms

Flexium provides signal-based form primitives for reactive form state management without external libraries. Forms support nested fields, async validation, and automatic error tracking.

## Basic Usage

```tsx
import { createForm, validators } from 'flexium/primitives/form'
import { createInput } from 'flexium/primitives/form'

function LoginForm() {
  const form = createForm({
    initialValues: {
      email: '',
      password: '',
    },
    validation: {
      email: [validators.required(), validators.email()],
      password: [validators.required(), validators.minLength(8)],
    },
    onSubmit: async (data) => {
      await login(data.email, data.password)
    },
  })

  const emailField = form.getField('email')
  const passwordField = form.getField('password')

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={emailField.value}
          onInput={(e) => form.setFieldValue('email', e.target.value)}
          onBlur={() => form.setFieldTouched('email', true)}
        />
        {emailField.error.value && (
          <span class="error">{emailField.error.value}</span>
        )}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value={passwordField.value}
          onInput={(e) => form.setFieldValue('password', e.target.value)}
          onBlur={() => form.setFieldTouched('password', true)}
        />
        {passwordField.error.value && (
          <span class="error">{passwordField.error.value}</span>
        )}
      </div>

      <button type="submit" disabled={!form.state.isValid.value}>
        {form.state.isSubmitting.value ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

## createForm API

The `createForm` function creates a form instance with reactive state and validation.

### Configuration

```tsx
interface FormConfig {
  initialValues?: FormData
  validation?: FieldValidation
  validateOnChange?: boolean  // Default: true
  validateOnBlur?: boolean    // Default: true
  onSubmit?: (data: FormData) => void | Promise<void>
}
```

### Return Value

```tsx
{
  state: FormState              // Reactive form state
  fields: Map<string, FieldState>  // Field states
  getField: (name) => FieldState   // Get/create field state
  setFieldValue: (name, value) => void
  setFieldError: (name, error) => void
  setFieldTouched: (name, touched) => void
  validateField: (name) => Promise<string | null>
  validateForm: () => Promise<boolean>
  handleSubmit: (e?) => Promise<void>
  reset: (values?) => void
  dispose: () => void
}
```

## Form State

The form state is fully reactive using signals and computed values.

```tsx
interface FormState {
  data: Signal<FormData>           // All form data
  errors: Computed<{ [key: string]: string | null }>
  isValid: Computed<boolean>       // True when all fields are valid
  isSubmitting: Signal<boolean>    // True during submission
  isDirty: Computed<boolean>       // True when any field is modified
  touchedFields: Signal<Set<string>>
  dirtyFields: Signal<Set<string>>
}
```

### Example

```tsx
const form = createForm({ initialValues: { name: '' } })

// Access form state
console.log(form.state.isValid.value)    // false
console.log(form.state.isDirty.value)    // false
console.log(form.state.data.value)       // { name: '' }

// Update field
form.setFieldValue('name', 'John')
console.log(form.state.isDirty.value)    // true
```

## Field State

Each field has its own reactive state with validation.

```tsx
interface FieldState<T = FieldValue> {
  value: Signal<T>              // Field value
  error: Computed<string | null>  // Validation error
  touched: Signal<boolean>      // True after blur
  dirty: Signal<boolean>        // True after modification
  validating: Signal<boolean>   // True during async validation
}
```

### Example

```tsx
const emailField = form.getField('email')

// Access field state
console.log(emailField.value.value)      // Current value
console.log(emailField.error.value)      // Validation error
console.log(emailField.touched.value)    // Has been touched
console.log(emailField.dirty.value)      // Has been modified
```

## Built-in Validators

Flexium provides common validation rules out of the box.

### Required

```tsx
validators.required(message?: string)
```

```tsx
validation: {
  email: validators.required('Email is required')
}
```

### Email

```tsx
validators.email(message?: string)
```

```tsx
validation: {
  email: validators.email('Invalid email address')
}
```

### Length Validation

```tsx
validators.minLength(min: number, message?: string)
validators.maxLength(max: number, message?: string)
```

```tsx
validation: {
  password: validators.minLength(8, 'Password must be at least 8 characters'),
  bio: validators.maxLength(500)
}
```

### Numeric Validation

```tsx
validators.min(min: number, message?: string)
validators.max(max: number, message?: string)
```

```tsx
validation: {
  age: [
    validators.min(18, 'Must be 18 or older'),
    validators.max(120, 'Invalid age')
  ]
}
```

### Pattern Matching

```tsx
validators.pattern(pattern: RegExp, message?: string)
```

```tsx
validation: {
  phone: validators.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Format: 123-456-7890')
}
```

### Custom Validators

```tsx
validators.custom(fn: ValidationRule)
```

```tsx
validation: {
  username: validators.custom((value) => {
    if (value.includes(' ')) {
      return 'Username cannot contain spaces'
    }
    return true
  })
}
```

## Async Validation

Validation rules can be async for server-side checks.

```tsx
const form = createForm({
  validation: {
    username: [
      validators.required(),
      async (value) => {
        const available = await checkUsernameAvailability(value)
        return available || 'Username is taken'
      }
    ]
  }
})
```

## Multiple Validators

Fields can have multiple validation rules that run in order.

```tsx
validation: {
  password: [
    validators.required(),
    validators.minLength(8),
    validators.pattern(/[A-Z]/, 'Must contain uppercase'),
    validators.pattern(/[0-9]/, 'Must contain number'),
  ]
}
```

The first failing validator stops the chain and returns its error.

## Form Submission

### Basic Submission

```tsx
const form = createForm({
  onSubmit: async (data) => {
    await saveData(data)
  }
})

// In JSX
<form onSubmit={form.handleSubmit}>
  {/* fields */}
</form>

// Or programmatically
await form.handleSubmit()
```

### Submission Flow

1. Prevents default form submission
2. Marks all fields as touched
3. Validates entire form
4. If valid, calls `onSubmit` handler
5. Sets `isSubmitting` during submission
6. Handles errors automatically

### Manual Validation

```tsx
// Validate single field
const error = await form.validateField('email')

// Validate entire form
const isValid = await form.validateForm()

if (isValid) {
  // Proceed with submission
}
```

## Resetting Forms

```tsx
// Reset to initial values
form.reset()

// Reset to new values
form.reset({
  email: 'new@example.com',
  password: ''
})
```

This clears all touched/dirty states and validation errors.

## Input Components

Flexium provides pre-built input components with signal binding.

### createInput

```tsx
import { createInput } from 'flexium/primitives/form'

const emailField = form.getField('email')

const { element, dispose } = createInput({
  type: 'email',
  name: 'email',
  value: emailField.value,
  error: emailField.error,
  touched: emailField.touched,
  placeholder: 'Enter your email',
  onBlur: () => form.setFieldTouched('email', true),
})

document.body.appendChild(element)
```

### createInputField

Includes label and error message display.

```tsx
import { createInputField } from 'flexium/primitives/form'

const { element, input, dispose } = createInputField({
  type: 'email',
  name: 'email',
  label: 'Email Address',
  value: emailField.value,
  error: emailField.error,
  touched: emailField.touched,
  helperText: 'We will never share your email',
  required: true,
})

document.body.appendChild(element)
```

## Complete Example

```tsx
import { createForm, validators, createInputField } from 'flexium/primitives/form'

function RegistrationForm() {
  const form = createForm({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
    },
    validation: {
      username: [
        validators.required(),
        validators.minLength(3),
        validators.maxLength(20),
        async (value) => {
          const available = await checkUsername(value)
          return available || 'Username is already taken'
        }
      ],
      email: [
        validators.required(),
        validators.email(),
      ],
      password: [
        validators.required(),
        validators.minLength(8, 'Password must be at least 8 characters'),
        validators.pattern(/[A-Z]/, 'Must contain uppercase letter'),
        validators.pattern(/[0-9]/, 'Must contain number'),
      ],
      confirmPassword: validators.custom((value, formData) => {
        return value === formData.password || 'Passwords must match'
      }),
      age: [
        validators.required(),
        validators.min(18, 'Must be 18 or older'),
      ],
    },
    onSubmit: async (data) => {
      try {
        await registerUser(data)
        alert('Registration successful!')
        form.reset()
      } catch (error) {
        alert('Registration failed: ' + error.message)
      }
    },
  })

  const fields = {
    username: form.getField('username'),
    email: form.getField('email'),
    password: form.getField('password'),
    confirmPassword: form.getField('confirmPassword'),
    age: form.getField('age'),
  }

  return (
    <form onSubmit={form.handleSubmit}>
      <h2>Register</h2>

      {Object.entries(fields).map(([name, field]) => {
        const { element } = createInputField({
          type: name.includes('password') ? 'password' :
                name === 'email' ? 'email' :
                name === 'age' ? 'number' : 'text',
          name,
          label: name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1'),
          value: field.value,
          error: field.error,
          touched: field.touched,
          required: true,
        })

        return element
      })}

      <button
        type="submit"
        disabled={!form.state.isValid.value || form.state.isSubmitting.value}
      >
        {form.state.isSubmitting.value ? 'Registering...' : 'Register'}
      </button>

      <button
        type="button"
        onClick={() => form.reset()}
        disabled={!form.state.isDirty.value}
      >
        Reset
      </button>
    </form>
  )
}
```

## Field Value Types

Forms support various field value types:

```tsx
type FieldValue =
  | string
  | number
  | boolean
  | File
  | null
  | undefined
  | FieldValue[]
  | { [key: string]: FieldValue }
```

### File Uploads

```tsx
const form = createForm({
  initialValues: {
    avatar: null
  },
  validation: {
    avatar: (value) => {
      if (!value) return 'Please select a file'
      if (value.size > 5000000) return 'File too large (max 5MB)'
      return true
    }
  }
})

const { element } = createInput({
  type: 'file',
  accept: 'image/*',
  onChange: (_, event) => {
    const file = event.target.files[0]
    form.setFieldValue('avatar', file)
  }
})
```

## Validation Timing

Control when validation runs:

```tsx
const form = createForm({
  validateOnChange: true,  // Validate as user types (default)
  validateOnBlur: true,    // Validate on field blur (default)
})
```

Set both to `false` to only validate on submit:

```tsx
const form = createForm({
  validateOnChange: false,
  validateOnBlur: false,
  // Validation only runs on submit
})
```

## Cleanup

Always dispose of forms when unmounting components:

```tsx
onCleanup(() => {
  form.dispose()
})
```

This clears all field states and removes event listeners.

## Best Practices

1. **Use validators array** - Combine multiple validators for comprehensive validation
2. **Provide clear error messages** - Custom messages improve UX
3. **Validate on blur** - Less intrusive than validating on every keystroke
4. **Handle submission errors** - Always catch and display submission failures
5. **Dispose properly** - Prevent memory leaks by calling `dispose()`
6. **Async validation** - Debounce server checks to reduce API calls
7. **Type safety** - Use TypeScript for better field typing

## TypeScript

Forms are fully typed:

```tsx
interface LoginData {
  email: string
  password: string
}

const form = createForm<LoginData>({
  initialValues: {
    email: '',
    password: '',
  },
  // TypeScript knows the field names
  validation: {
    email: validators.email(),
    password: validators.required(),
  },
  onSubmit: async (data) => {
    // data is typed as LoginData
    await login(data.email, data.password)
  }
})
```
