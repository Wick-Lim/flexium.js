# createForm()

Signal-based form management with built-in validation.

<script setup>
import FormDemo from '../../components/FormDemo.vue'
</script>

## Live Demo

<ClientOnly>
  <FormDemo />
</ClientOnly>

## Import

```ts
import { createForm, validators } from 'flexium/primitives'
```

## Signature

```ts
function createForm(config?: FormConfig): FormReturn

interface FormConfig {
  initialValues?: FormData
  validation?: FieldValidation
  validateOnChange?: boolean  // default: true
  validateOnBlur?: boolean    // default: true
  onSubmit?: (data: FormData) => void | Promise<void>
}

interface FormReturn {
  state: FormState
  fields: Map<string, FieldState>
  getField: (name: string) => FieldState
  setFieldValue: (name: string, value: any) => void
  setFieldError: (name: string, error: string | null) => void
  setFieldTouched: (name: string, touched: boolean) => void
  validateField: (name: string) => Promise<string | null>
  validateForm: () => Promise<boolean>
  handleSubmit: (e?: Event) => Promise<void>
  reset: (values?: FormData) => void
  dispose: () => void
}
```

## Usage

### Basic Form

```tsx
import { createForm, validators } from 'flexium/primitives'

function LoginForm() {
  const form = createForm({
    initialValues: {
      email: '',
      password: ''
    },
    validation: {
      email: [validators.required(), validators.email()],
      password: [validators.required(), validators.minLength(8)]
    },
    onSubmit: async (data) => {
      await login(data.email, data.password)
    }
  })

  const email = form.getField('email')
  const password = form.getField('password')

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <input
          type="email"
          value={email.value}
          onInput={(e) => form.setFieldValue('email', e.target.value)}
          onBlur={() => form.setFieldTouched('email', true)}
        />
        {email.error && <span class="error">{email.error}</span>}
      </div>

      <div>
        <input
          type="password"
          value={password.value}
          onInput={(e) => form.setFieldValue('password', e.target.value)}
          onBlur={() => form.setFieldTouched('password', true)}
        />
        {password.error && <span class="error">{password.error}</span>}
      </div>

      <button type="submit" disabled={!form.state.isValid || form.state.isSubmitting}>
        {form.state.isSubmitting ? 'Submitting...' : 'Login'}
      </button>
    </form>
  )
}
```

## Built-in Validators

| Validator | Description |
|-----------|-------------|
| `validators.required(message?)` | Field must have a value |
| `validators.email(message?)` | Must be valid email format |
| `validators.minLength(min, message?)` | String minimum length |
| `validators.maxLength(max, message?)` | String maximum length |
| `validators.min(min, message?)` | Number minimum value |
| `validators.max(max, message?)` | Number maximum value |
| `validators.pattern(regex, message?)` | Must match regex pattern |
| `validators.custom(fn)` | Custom validation function |

### Custom Validators

```tsx
const form = createForm({
  validation: {
    username: validators.custom(async (value) => {
      const taken = await checkUsername(value)
      return taken ? 'Username is taken' : true
    }),
    confirmPassword: validators.custom((value, formData) => {
      return value === formData.password || 'Passwords must match'
    })
  }
})
```

## Form State

| Property | Type | Description |
|----------|------|-------------|
| `data` | `Signal<FormData>` | All form values |
| `errors` | `Computed<{[key]: string \| null}>` | All field errors |
| `isValid` | `Computed<boolean>` | True if no errors |
| `isSubmitting` | `Signal<boolean>` | True during submission |
| `isDirty` | `Computed<boolean>` | True if any field changed |
| `touchedFields` | `Signal<Set<string>>` | Fields that have been touched |
| `dirtyFields` | `Signal<Set<string>>` | Fields that have been modified |

## Field State

| Property | Type | Description |
|----------|------|-------------|
| `value` | `Signal<T>` | Field value |
| `error` | `Computed<string \| null>` | Validation error |
| `touched` | `Signal<boolean>` | Has been focused/blurred |
| `dirty` | `Signal<boolean>` | Value has changed |
| `validating` | `Signal<boolean>` | Async validation running |

## Examples

### Registration Form

```tsx
function RegistrationForm() {
  const form = createForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    },
    validation: {
      name: validators.required('Name is required'),
      email: [
        validators.required('Email is required'),
        validators.email('Invalid email')
      ],
      password: [
        validators.required('Password is required'),
        validators.minLength(8, 'At least 8 characters'),
        validators.pattern(/[A-Z]/, 'Must contain uppercase'),
        validators.pattern(/[0-9]/, 'Must contain number')
      ],
      confirmPassword: validators.custom((value, data) =>
        value === data.password || 'Passwords must match'
      ),
      acceptTerms: validators.custom((value) =>
        value === true || 'You must accept terms'
      )
    },
    onSubmit: async (data) => {
      await registerUser(data)
    }
  })

  return (
    <form onSubmit={form.handleSubmit}>
      <FormField form={form} name="name" label="Full Name" />
      <FormField form={form} name="email" label="Email" type="email" />
      <FormField form={form} name="password" label="Password" type="password" />
      <FormField form={form} name="confirmPassword" label="Confirm Password" type="password" />

      <label>
        <input
          type="checkbox"
          checked={form.getField('acceptTerms').value}
          onChange={(e) => form.setFieldValue('acceptTerms', e.target.checked)}
        />
        I accept the terms
      </label>

      <button type="submit" disabled={!form.state.isValid}>
        Register
      </button>
    </form>
  )
}
```

### Dynamic Form Fields

```tsx
function DynamicForm() {
  const [fields, setFields] = state([
    { id: 1, name: '' }
  ])

  const form = createForm({
    initialValues: {
      title: ''
    },
    validation: {
      title: validators.required()
    }
  })

  const addField = () => {
    setFields([...fields, { id: Date.now(), name: '' }])
  }

  const removeField = (id) => {
    setFields(fields.filter(f => f.id !== id))
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const data = {
        title: form.getField('title').value,
        items: fields
      }
      console.log(data)
    }}>
      <FormField form={form} name="title" label="Title" />

      {fields.map((field, index) => (
        <div key={field.id}>
          <input
            value={field.name}
            onInput={(e) => {
              const updated = [...fields]
              updated[index] = { ...field, name: e.target.value }
              setFields(updated)
            }}
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

### Async Validation

```tsx
const form = createForm({
  validation: {
    username: [
      validators.required(),
      validators.minLength(3),
      validators.custom(async (value) => {
        // Debounced server check
        const exists = await checkUsernameExists(value)
        return exists ? 'Username already taken' : true
      })
    ]
  }
})
```

### Form Reset

```tsx
function EditForm(props) {
  const form = createForm({
    initialValues: props.user
  })

  const handleCancel = () => {
    form.reset() // Reset to initial values
  }

  const handleClear = () => {
    form.reset({ name: '', email: '' }) // Reset to custom values
  }

  return (
    <form onSubmit={form.handleSubmit}>
      {/* fields */}
      <button type="button" onClick={handleCancel}>Cancel</button>
      <button type="button" onClick={handleClear}>Clear</button>
      <button type="submit">Save</button>
    </form>
  )
}
```

## Behavior

- **Reactive fields**: Field values and errors are signals
- **Auto validation**: Validates on change/blur by default
- **Async support**: Validators can be async functions
- **Form-level validation**: Access all form data in validators
- **Dirty tracking**: Tracks which fields have been modified
- **Touch tracking**: Errors shown only for touched fields

## Notes

- Errors only display after a field is touched
- Async validators can run in parallel
- `handleSubmit` prevents default form submission
- Call `dispose()` when form is no longer needed

## See Also

- [&lt;Input /&gt;](/docs/primitives/input) - Form input component
- [state()](/docs/core/state) - Reactive state
- [computed()](/docs/core/computed) - Derived values
