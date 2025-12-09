---
title: Forms - State-based Form Handling
description: Build reactive forms using Flexium's state() API. Learn about form state management, validation, and submission handling.
head:
  - - meta
    - property: og:title
      content: Forms - Flexium Form Handling
  - - meta
    - property: og:description
      content: State-based forms with validation, field state management, and error tracking.
---

# Forms

Flexium handles forms using the `state()` API for reactive form state management. This guide shows how to build forms with validation and error handling.

## Basic Usage

```tsx
import { state } from 'flexium/core'

function LoginForm() {
  const [formData, setFormData] = state({
    email: '',
    password: '',
  })

  const [errors, setErrors] = state({
    email: '',
    password: '',
  })

  const [touched, setTouched] = state({
    email: false,
    password: false,
  })

  const [isSubmitting, setIsSubmitting] = state(false)

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email address'
    return ''
  }

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    return ''
  }

  const handleEmailChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value
    setFormData(prev => ({ ...prev, email: value }))
    setErrors(prev => ({ ...prev, email: validateEmail(value) }))
  }

  const handlePasswordChange = (e: Event) => {
    const value = (e.target as HTMLInputElement).value
    setFormData(prev => ({ ...prev, password: value }))
    setErrors(prev => ({ ...prev, password: validatePassword(value) }))
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)

    setErrors({ email: emailError, password: passwordError })

    if (emailError || passwordError) return

    setIsSubmitting(true)
    try {
      await login(formData.email, formData.password)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onInput={handleEmailChange}
          onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
        />
        {touched.email && errors.email && (
          <span class="error">{errors.email}</span>
        )}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value={formData.password}
          onInput={handlePasswordChange}
          onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
        />
        {touched.password && errors.password && (
          <span class="error">{errors.password}</span>
        )}
      </div>

      <button type="submit" disabled={!!(errors.email || errors.password) || isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
```

## Form State Management

Use Flexium's `state()` API to manage form state reactively.

### Form State Structure

```tsx
// Form data
const [formData, setFormData] = state({
  email: '',
  password: '',
  // ... more fields
})

// Validation errors
const [errors, setErrors] = state({
  email: '',
  password: '',
  // ... matching field errors
})

// Field touched state
const [touched, setTouched] = state({
  email: false,
  password: false,
  // ... matching fields
})

// Submission state
const [isSubmitting, setIsSubmitting] = state(false)
```

## Validation

Implement validation functions for your form fields.

### Validation Functions

```tsx
const validateEmail = (email: string) => {
  if (!email) return 'Email is required'
  if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email address'
  return ''
}

const validatePassword = (password: string) => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Password must be at least 8 characters'
  return ''
}

const validateRequired = (value: string, fieldName: string) => {
  return value ? '' : `${fieldName} is required`
}
```

### Applying Validation

```tsx
const handleFieldChange = (field: string, value: string) => {
  setFormData(prev => ({ ...prev, [field]: value }))

  // Validate on change
  let error = ''
  if (field === 'email') error = validateEmail(value)
  if (field === 'password') error = validatePassword(value)

  setErrors(prev => ({ ...prev, [field]: error }))
}
```

## Common Validation Patterns

### Email Validation

```tsx
const validateEmail = (email: string) => {
  if (!email) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Invalid email address'
  }
  return ''
}
```

### Password Validation

```tsx
const validatePassword = (password: string) => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Must contain uppercase letter'
  if (!/[0-9]/.test(password)) return 'Must contain number'
  return ''
}
```

### Length Validation

```tsx
const validateMinLength = (value: string, min: number) => {
  return value.length >= min ? '' : `Must be at least ${min} characters`
}

const validateMaxLength = (value: string, max: number) => {
  return value.length <= max ? '' : `Must be at most ${max} characters`
}
```

### Pattern Matching

```tsx
const validatePhone = (phone: string) => {
  if (!phone) return 'Phone is required'
  if (!/^\d{3}-\d{3}-\d{4}$/.test(phone)) {
    return 'Format: 123-456-7890'
  }
  return ''
}
```

### Custom Validation

```tsx
const validateUsername = (username: string) => {
  if (!username) return 'Username is required'
  if (username.includes(' ')) return 'Cannot contain spaces'
  if (username.length < 3) return 'Must be at least 3 characters'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Only letters, numbers, and underscores allowed'
  }
  return ''
}
```

## Async Validation

Perform async validation for server-side checks.

```tsx
const [isValidating, setIsValidating] = state(false)

const validateUsernameAsync = async (username: string) => {
  if (!username) return 'Username is required'

  setIsValidating(true)
  try {
    const available = await checkUsernameAvailability(username)
    return available ? '' : 'Username is taken'
  } finally {
    setIsValidating(false)
  }
}

const handleUsernameBlur = async () => {
  setTouched(prev => ({ ...prev, username: true }))
  const error = await validateUsernameAsync(formData.username)
  setErrors(prev => ({ ...prev, username: error }))
}
```

## Combining Multiple Validators

Run multiple validation checks on a single field.

```tsx
const validatePasswordStrength = (password: string) => {
  if (!password) return 'Password is required'
  if (password.length < 8) return 'Must be at least 8 characters'
  if (!/[A-Z]/.test(password)) return 'Must contain uppercase letter'
  if (!/[0-9]/.test(password)) return 'Must contain number'
  return ''
}

// Or chain validators
const runValidators = (value: string, validators: Array<(val: string) => string>) => {
  for (const validator of validators) {
    const error = validator(value)
    if (error) return error
  }
  return ''
}

const passwordValidators = [
  (val: string) => val ? '' : 'Password is required',
  (val: string) => val.length >= 8 ? '' : 'Must be at least 8 characters',
  (val: string) => /[A-Z]/.test(val) ? '' : 'Must contain uppercase',
  (val: string) => /[0-9]/.test(val) ? '' : 'Must contain number',
]

const error = runValidators(formData.password, passwordValidators)
```

## Form Submission

### Handling Form Submit

```tsx
const handleSubmit = async (e: Event) => {
  e.preventDefault()

  // Mark all fields as touched
  setTouched({
    email: true,
    password: true,
  })

  // Validate all fields
  const emailError = validateEmail(formData.email)
  const passwordError = validatePassword(formData.password)

  setErrors({
    email: emailError,
    password: passwordError,
  })

  // Check if valid
  if (emailError || passwordError) return

  // Submit
  setIsSubmitting(true)
  try {
    await saveData(formData)
  } catch (error) {
    // Handle error
    setErrors(prev => ({
      ...prev,
      submit: 'Submission failed. Please try again.'
    }))
  } finally {
    setIsSubmitting(false)
  }
}
```

### Validation Before Submit

```tsx
const validateAllFields = () => {
  const newErrors = {
    email: validateEmail(formData.email),
    password: validatePassword(formData.password),
  }

  setErrors(newErrors)

  // Check if form is valid
  return !Object.values(newErrors).some(error => error)
}

const handleSubmit = async (e: Event) => {
  e.preventDefault()

  const isValid = validateAllFields()
  if (!isValid) return

  setIsSubmitting(true)
  try {
    await saveData(formData)
  } finally {
    setIsSubmitting(false)
  }
}
```

## Resetting Forms

```tsx
const initialFormData = {
  email: '',
  password: '',
}

const initialErrors = {
  email: '',
  password: '',
}

const initialTouched = {
  email: false,
  password: false,
}

const resetForm = () => {
  setFormData(initialFormData)
  setErrors(initialErrors)
  setTouched(initialTouched)
  setIsSubmitting(false)
}

// Use in component
<button type="button" onClick={resetForm}>
  Reset Form
</button>
```

## Complete Example

```tsx
import { state } from 'flexium/core'

function RegistrationForm() {
  const [formData, setFormData] = state({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
  })

  const [errors, setErrors] = state({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
  })

  const [touched, setTouched] = state({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    age: false,
  })

  const [isSubmitting, setIsSubmitting] = state(false)

  const validateUsername = (username: string) => {
    if (!username) return 'Username is required'
    if (username.length < 3) return 'Must be at least 3 characters'
    if (username.length > 20) return 'Must be at most 20 characters'
    return ''
  }

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email'
    return ''
  }

  const validatePassword = (password: string) => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Must be at least 8 characters'
    if (!/[A-Z]/.test(password)) return 'Must contain uppercase letter'
    if (!/[0-9]/.test(password)) return 'Must contain number'
    return ''
  }

  const validateConfirmPassword = (confirmPassword: string) => {
    if (!confirmPassword) return 'Please confirm password'
    if (confirmPassword !== formData.password) return 'Passwords must match'
    return ''
  }

  const validateAge = (age: string) => {
    if (!age) return 'Age is required'
    const ageNum = parseInt(age)
    if (ageNum < 18) return 'Must be 18 or older'
    return ''
  }

  const handleChange = (field: string) => (e: Event) => {
    const value = (e.target as HTMLInputElement).value
    setFormData(prev => ({ ...prev, [field]: value }))

    let error = ''
    if (field === 'username') error = validateUsername(value)
    if (field === 'email') error = validateEmail(value)
    if (field === 'password') error = validatePassword(value)
    if (field === 'confirmPassword') error = validateConfirmPassword(value)
    if (field === 'age') error = validateAge(value)

    setErrors(prev => ({ ...prev, [field]: error }))
  }

  const handleBlur = (field: string) => () => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    const newErrors = {
      username: validateUsername(formData.username),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword),
      age: validateAge(formData.age),
    }

    setErrors(newErrors)
    setTouched({
      username: true,
      email: true,
      password: true,
      confirmPassword: true,
      age: true,
    })

    if (Object.values(newErrors).some(error => error)) return

    setIsSubmitting(true)
    try {
      await registerUser(formData)
      alert('Registration successful!')
      resetForm()
    } catch (error) {
      alert('Registration failed: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
    })
    setErrors({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: '',
    })
    setTouched({
      username: false,
      email: false,
      password: false,
      confirmPassword: false,
      age: false,
    })
  }

  const isFormValid = !Object.values(errors).some(error => error)

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>

      <div>
        <label>Username</label>
        <input
          type="text"
          value={formData.username}
          onInput={handleChange('username')}
          onBlur={handleBlur('username')}
        />
        {touched.username && errors.username && (
          <span class="error">{errors.username}</span>
        )}
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          value={formData.email}
          onInput={handleChange('email')}
          onBlur={handleBlur('email')}
        />
        {touched.email && errors.email && (
          <span class="error">{errors.email}</span>
        )}
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          value={formData.password}
          onInput={handleChange('password')}
          onBlur={handleBlur('password')}
        />
        {touched.password && errors.password && (
          <span class="error">{errors.password}</span>
        )}
      </div>

      <div>
        <label>Confirm Password</label>
        <input
          type="password"
          value={formData.confirmPassword}
          onInput={handleChange('confirmPassword')}
          onBlur={handleBlur('confirmPassword')}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <span class="error">{errors.confirmPassword}</span>
        )}
      </div>

      <div>
        <label>Age</label>
        <input
          type="number"
          value={formData.age}
          onInput={handleChange('age')}
          onBlur={handleBlur('age')}
        />
        {touched.age && errors.age && (
          <span class="error">{errors.age}</span>
        )}
      </div>

      <button type="submit" disabled={!isFormValid || isSubmitting}>
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>

      <button type="button" onClick={resetForm}>
        Reset
      </button>
    </form>
  )
}
```

## File Uploads

Handle file uploads with state management:

```tsx
const [file, setFile] = state<File | null>(null)
const [fileError, setFileError] = state('')

const validateFile = (file: File | null) => {
  if (!file) return 'Please select a file'
  if (file.size > 5000000) return 'File too large (max 5MB)'
  if (!file.type.startsWith('image/')) return 'Must be an image file'
  return ''
}

const handleFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const selectedFile = input.files?.[0] || null
  setFile(selectedFile)
  setFileError(validateFile(selectedFile))
}

// In JSX
<input
  type="file"
  accept="image/*"
  onChange={handleFileChange}
/>
{fileError && <span class="error">{fileError}</span>}
```

## Validation Timing

Choose when to validate:

```tsx
// Validate on change (as user types)
<input
  value={formData.email}
  onInput={handleChange('email')}
/>

// Validate on blur (when field loses focus)
<input
  value={formData.email}
  onBlur={() => {
    const error = validateEmail(formData.email)
    setErrors(prev => ({ ...prev, email: error }))
  }}
/>

// Validate only on submit
// Don't validate on change or blur, only in handleSubmit
```

## Best Practices

1. **Define initial values** - Use a constant for initial state that can be reused for reset
2. **Provide clear error messages** - Make errors actionable and user-friendly
3. **Validate on blur** - Less intrusive than validating on every keystroke
4. **Handle submission errors** - Always catch and display submission failures
5. **Debounce async validation** - Reduce API calls for server-side checks
6. **Type your state** - Use TypeScript interfaces for better type safety
7. **Show errors only after touched** - Don't show errors before user interacts with field

## TypeScript

Type your form state for better safety:

```tsx
interface LoginData {
  email: string
  password: string
}

interface FormErrors {
  email: string
  password: string
}

interface FormTouched {
  email: boolean
  password: boolean
}

const [formData, setFormData] = state<LoginData>({
  email: '',
  password: '',
})

const [errors, setErrors] = state<FormErrors>({
  email: '',
  password: '',
})

const [touched, setTouched] = state<FormTouched>({
  email: false,
  password: false,
})

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  // TypeScript knows the structure
  await login(formData.email, formData.password)
}
```
