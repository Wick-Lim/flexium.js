# Flexium Form Handling Demo

A comprehensive demonstration of Flexium's signal-based form primitives with validation, async operations, and dynamic fields.

## Features

This demo showcases all major form handling capabilities:

- **Signal-based reactive forms** - Automatic UI updates with Flexium's signal system
- **Built-in validators** - Required, email, min/max, pattern matching
- **Custom validators** - Create your own validation logic
- **Real-time validation** - Instant feedback as users type
- **Async validation** - Check username availability with simulated API calls
- **Multi-step wizard** - Navigate through form steps with validation at each stage
- **Dynamic fields** - Add/remove form fields dynamically
- **All HTML5 input types** - Text, email, password, number, date, color, range, etc.
- **Form state management** - Track dirty, touched, and error states
- **Form submission** - Handle form submission with loading states
- **Form reset** - Reset forms to initial values

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Opens the demo at http://localhost:3006

## Build

```bash
npm run build
```

## Form API Overview

### Creating a Form

```typescript
import { createForm, validators } from 'flexium'

const form = createForm({
  initialValues: {
    email: '',
    password: '',
  },
  validation: {
    email: [
      validators.required('Email is required'),
      validators.email('Invalid email address'),
    ],
    password: [
      validators.required('Password is required'),
      validators.minLength(8, 'Password must be at least 8 characters'),
    ],
  },
  validateOnChange: true,
  validateOnBlur: true,
  onSubmit: async (data) => {
    console.log('Form submitted:', data)
  },
})
```

### Built-in Validators

#### Required Field
```typescript
validators.required('This field is required')
```

#### Email Validation
```typescript
validators.email('Invalid email address')
```

#### Length Validation
```typescript
validators.minLength(3, 'Must be at least 3 characters')
validators.maxLength(20, 'Must be at most 20 characters')
```

#### Number Validation
```typescript
validators.min(18, 'Must be at least 18')
validators.max(120, 'Must be at most 120')
```

#### Pattern Matching
```typescript
validators.pattern(/^[a-zA-Z0-9]+$/, 'Only letters and numbers allowed')
```

#### Custom Validation
```typescript
validators.custom((value, formData) => {
  return value === formData.password || 'Passwords do not match'
})
```

#### Async Validation
```typescript
validators.custom(async (value) => {
  const isAvailable = await checkUsername(value)
  return isAvailable || 'Username is already taken'
})
```

### Form State

Access form state through signals and computed values:

```typescript
form.state.data          // Signal<FormData> - All form values
form.state.errors        // Computed<{ [key: string]: string | null }> - All errors
form.state.isValid       // Computed<boolean> - Is form valid?
form.state.isSubmitting  // Signal<boolean> - Is form submitting?
form.state.isDirty       // Computed<boolean> - Has form been modified?
form.state.touchedFields // Signal<Set<string>> - Which fields were touched
form.state.dirtyFields   // Signal<Set<string>> - Which fields were modified
```

### Field State

Get individual field state:

```typescript
const emailField = form.getField<string>('email')

emailField.value      // Signal<string> - Field value
emailField.error      // Computed<string | null> - Field error message
emailField.touched    // Signal<boolean> - Has field been touched?
emailField.dirty      // Signal<boolean> - Has field been modified?
emailField.validating // Signal<boolean> - Is field being validated?
```

### Form Methods

#### Set Field Value
```typescript
form.setFieldValue('email', 'user@example.com')
```

#### Set Field Touched
```typescript
form.setFieldTouched('email', true)
```

#### Validate Field
```typescript
const error = await form.validateField('email')
```

#### Validate Entire Form
```typescript
const isValid = await form.validateForm()
```

#### Submit Form
```typescript
await form.handleSubmit()
```

#### Reset Form
```typescript
form.reset() // Reset to initial values
form.reset({ email: '', password: '' }) // Reset to specific values
```

#### Cleanup
```typescript
form.dispose() // Clean up effects and listeners
```

## JSX Integration

### Basic Input Field

```tsx
const emailField = form.getField<string>('email')

<div class="form-group">
  <label>Email</label>
  <input
    type="email"
    value={emailField.value.value}
    onInput={(e: Event) => form.setFieldValue('email', (e.target as HTMLInputElement).value)}
    onBlur={() => form.setFieldTouched('email', true)}
    class={emailField.error.value && emailField.touched.value ? 'error' : ''}
  />
  {() => emailField.error.value && emailField.touched.value && (
    <span class="error-message">{emailField.error.value}</span>
  )}
</div>
```

### Form Submission

```tsx
<form onSubmit={(e: Event) => {
  e.preventDefault()
  form.handleSubmit(e)
}}>
  {/* form fields */}
  <button type="submit" disabled={form.state.isSubmitting.value}>
    {() => form.state.isSubmitting.value ? 'Submitting...' : 'Submit'}
  </button>
</form>
```

### Reactive Validation Icons

```tsx
<div class="input-wrapper">
  <input
    type="text"
    value={field.value.value}
    onInput={(e: Event) => form.setFieldValue('username', (e.target as HTMLInputElement).value)}
  />
  {() => field.validating.value && (
    <span class="validation-icon validating">⟳</span>
  )}
  {() => !field.validating.value && field.touched.value && !field.error.value && (
    <span class="validation-icon success">✓</span>
  )}
  {() => !field.validating.value && field.touched.value && field.error.value && (
    <span class="validation-icon error">✗</span>
  )}
</div>
```

## Examples in This Demo

### 1. Basic Form with Validation
- Required fields
- Email validation
- Min/max number validation
- Pattern matching (URL)
- Form submission
- Form reset

### 2. Real-Time Validation Feedback
- Validation messages appear as you type
- Password strength indicator
- Custom validation (password confirmation)
- Visual feedback with icons

### 3. Async Validation
- Username availability check
- Loading states during async validation
- Simulated API call with timeout

### 4. Multi-Step Wizard Form
- Navigate through multiple steps
- Validate each step before proceeding
- Track completion status
- Combined validation across steps

### 5. Dynamic Form Fields
- Add/remove fields dynamically
- Array-based field management
- Preview current values

### 6. All Input Types
- Text, email, password
- Number, tel, url
- Date, time
- Color picker
- Range slider
- Checkbox, radio
- Select dropdown
- Textarea

## Validation Patterns

### Cross-Field Validation

```typescript
validators.custom((value, formData) => {
  return value === formData.password || 'Passwords do not match'
})
```

### Conditional Validation

```typescript
validators.custom((value, formData) => {
  if (formData.country === 'US') {
    return /^\d{5}(-\d{4})?$/.test(value) || 'Invalid US ZIP code'
  }
  return true
})
```

### Complex Async Validation

```typescript
validators.custom(async (value) => {
  if (!value || value.length < 3) return true

  try {
    const response = await fetch(`/api/check-username?username=${value}`)
    const data = await response.json()
    return data.available || 'Username is already taken'
  } catch (error) {
    return 'Could not verify username availability'
  }
})
```

### Multiple Validators

```typescript
validation: {
  password: [
    validators.required('Password is required'),
    validators.minLength(8, 'At least 8 characters'),
    validators.custom((value) => {
      const hasUpper = /[A-Z]/.test(value)
      const hasLower = /[a-z]/.test(value)
      const hasNumber = /[0-9]/.test(value)
      return (hasUpper && hasLower && hasNumber) ||
        'Must contain uppercase, lowercase, and number'
    }),
  ],
}
```

## Form Configuration Options

```typescript
interface FormConfig {
  // Initial field values
  initialValues?: FormData

  // Validation rules for each field
  validation?: FieldValidation

  // Validate fields as user types (default: true)
  validateOnChange?: boolean

  // Validate fields when they lose focus (default: true)
  validateOnBlur?: boolean

  // Form submission handler
  onSubmit?: (data: FormData) => void | Promise<void>
}
```

## Best Practices

### 1. Field Naming
Use consistent, descriptive field names:
```typescript
initialValues: {
  firstName: '',    // Good
  lastName: '',     // Good
  fn: '',          // Avoid
  ln: '',          // Avoid
}
```

### 2. Validation Messages
Provide clear, helpful error messages:
```typescript
validators.minLength(8, 'Password must be at least 8 characters')  // Good
validators.minLength(8, 'Too short')                               // Avoid
```

### 3. Async Validation
Debounce async validators to avoid excessive API calls:
```typescript
let timeout: NodeJS.Timeout
validators.custom(async (value) => {
  clearTimeout(timeout)
  return new Promise((resolve) => {
    timeout = setTimeout(async () => {
      const isAvailable = await checkUsername(value)
      resolve(isAvailable || 'Username taken')
    }, 500)
  })
})
```

### 4. Form State
Check form validity before allowing submission:
```tsx
<button
  type="submit"
  disabled={() => !form.state.isValid.value || form.state.isSubmitting.value}
>
  Submit
</button>
```

### 5. Field Touched State
Only show errors after user interaction:
```tsx
{() => field.error.value && field.touched.value && (
  <span class="error-message">{field.error.value}</span>
)}
```

### 6. Cleanup
Always dispose forms when unmounting:
```typescript
effect(() => {
  return () => {
    form.dispose()
  }
})
```

## Performance Tips

1. **Use computed values** for derived state instead of recalculating
2. **Validate on blur** for expensive validations instead of on change
3. **Debounce async validators** to reduce API calls
4. **Lazy field creation** - fields are created on first access
5. **Batch updates** when setting multiple field values

## Accessibility

The form primitives include built-in accessibility features:

- ARIA labels and descriptions
- `aria-invalid` for error states
- `role="alert"` for error messages
- Proper label associations
- Keyboard navigation support

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Learn More

- [Flexium Documentation](../../packages/flexium/README.md)
- [Signal Documentation](../../packages/flexium/src/core/signal/README.md)
- [Form Primitives Source](../../packages/flexium/src/primitives/form/)

## License

MIT
