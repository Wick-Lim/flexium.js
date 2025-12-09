# Forms

State-based form handling with validation.

<script setup>
import FormDemo from '../../components/FormDemo.vue'
</script>

## Live Demo

<ClientOnly>
  <FormDemo />
</ClientOnly>

## Import

```ts
import { state } from 'flexium/core'
```

## Usage

### Basic Form

```tsx
import { state } from 'flexium/core'

function LoginForm() {
  const [formData, setFormData] = state({
    email: '',
    password: ''
  })

  const [errors, setErrors] = state({})
  const [isSubmitting, setIsSubmitting] = state(false)

  const validateEmail = (email) => {
    if (!email) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format'
    return null
  }

  const validatePassword = (password) => {
    if (!password) return 'Password is required'
    if (password.length < 8) return 'Password must be at least 8 characters'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const emailError = validateEmail(formData.email)
    const passwordError = validatePassword(formData.password)

    setErrors({
      email: emailError,
      password: passwordError
    })

    if (!emailError && !passwordError) {
      setIsSubmitting(true)
      await login(formData.email, formData.password)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="email"
          value={formData.email}
          onInput={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        {errors.email && <span class="error">{errors.email}</span>}
      </div>

      <div>
        <input
          type="password"
          value={formData.password}
          onInput={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        {errors.password && <span class="error">{errors.password}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Login'}
      </button>
    </form>
  )
}
```

## Validation Helpers

You can create reusable validation functions:

```tsx
const validators = {
  required: (message = 'This field is required') => (value) => {
    return value ? null : message
  },
  email: (message = 'Invalid email format') => (value) => {
    return /\S+@\S+\.\S+/.test(value) ? null : message
  },
  minLength: (min, message) => (value) => {
    return value.length >= min ? null : message || `Must be at least ${min} characters`
  },
  pattern: (regex, message) => (value) => {
    return regex.test(value) ? null : message
  }
}
```

### Custom Async Validation

```tsx
const validateUsername = async (username) => {
  if (!username) return 'Username is required'
  const taken = await checkUsername(username)
  return taken ? 'Username is taken' : null
}

const [usernameError, setUsernameError] = state(null)

const handleUsernameBlur = async () => {
  const error = await validateUsername(formData.username)
  setErrors({ ...errors, username: error })
}
```

## Examples

### Registration Form

```tsx
function RegistrationForm() {
  const [formData, setFormData] = state({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })

  const [errors, setErrors] = state({})
  const [isSubmitting, setIsSubmitting] = state(false)

  const validate = () => {
    const newErrors = {}

    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email'

    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'At least 8 characters'
    else if (!/[A-Z]/.test(formData.password)) newErrors.password = 'Must contain uppercase'
    else if (!/[0-9]/.test(formData.password)) newErrors.password = 'Must contain number'

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords must match'
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept terms'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validate()) {
      setIsSubmitting(true)
      await registerUser(formData)
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          value={formData.name}
          onInput={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Full Name"
        />
        {errors.name && <span class="error">{errors.name}</span>}
      </div>

      <div>
        <input
          type="email"
          value={formData.email}
          onInput={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
        />
        {errors.email && <span class="error">{errors.email}</span>}
      </div>

      <div>
        <input
          type="password"
          value={formData.password}
          onInput={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Password"
        />
        {errors.password && <span class="error">{errors.password}</span>}
      </div>

      <div>
        <input
          type="password"
          value={formData.confirmPassword}
          onInput={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          placeholder="Confirm Password"
        />
        {errors.confirmPassword && <span class="error">{errors.confirmPassword}</span>}
      </div>

      <label>
        <input
          type="checkbox"
          checked={formData.acceptTerms}
          onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
        />
        I accept the terms
      </label>
      {errors.acceptTerms && <span class="error">{errors.acceptTerms}</span>}

      <button type="submit" disabled={isSubmitting}>
        Register
      </button>
    </form>
  )
}
```

### Dynamic Form Fields

```tsx
function DynamicForm() {
  const [formData, setFormData] = state({
    title: '',
    items: [{ id: 1, name: '' }]
  })

  const addField = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { id: Date.now(), name: '' }]
    })
  }

  const removeField = (id) => {
    setFormData({
      ...formData,
      items: formData.items.filter(f => f.id !== id)
    })
  }

  const updateField = (id, value) => {
    setFormData({
      ...formData,
      items: formData.items.map(f =>
        f.id === id ? { ...f, name: value } : f
      )
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          value={formData.title}
          onInput={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Title"
        />
      </div>

      {formData.items.map((field, index) => (
        <div key={field.id}>
          <input
            value={field.name}
            onInput={(e) => updateField(field.id, e.target.value)}
            placeholder={`Item ${index + 1}`}
          />
          <button type="button" onClick={() => removeField(field.id)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={addField}>Add Item</button>
      <button type="submit">Submit</button>
    </form>
  )
}
```

### Form Reset

```tsx
function EditForm(props) {
  const initialData = props.user
  const [formData, setFormData] = state(initialData)

  const handleCancel = () => {
    setFormData(initialData) // Reset to initial values
  }

  const handleClear = () => {
    setFormData({ name: '', email: '' }) // Reset to empty values
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* fields */}
      <button type="button" onClick={handleCancel}>Cancel</button>
      <button type="button" onClick={handleClear}>Clear</button>
      <button type="submit">Save</button>
    </form>
  )
}
```

## Best Practices

- **Use state() for form data**: Keep all form values in a single state object
- **Validate on submit**: Run validation when the form is submitted
- **Show errors conditionally**: Only display errors after user interaction
- **Keep validation simple**: Use plain JavaScript validation functions
- **Handle async validation**: Use separate state for loading/validation states

## Notes

- Form data is reactive using `state()`
- Validation is manual and flexible
- Handle form submission with `onSubmit` handler
- Prevent default form submission with `e.preventDefault()`

## See Also

- [state()](/docs/core/state) - Reactive state management
- [Button](/docs/primitives/button) - Button component
