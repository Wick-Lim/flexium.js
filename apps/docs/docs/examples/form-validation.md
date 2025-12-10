---
title: Form Validation Example
---

# Form Validation Example

A complete form validation example including real-time validation, async validation, and error message display.

## Complete Form Validation Example

```tsx
import { state, sync } from 'flexium/core'

interface FormData {
  email: string
  password: string
  confirmPassword: string
  name: string
}

interface FormErrors {
  email?: string
  password?: string
  confirmPassword?: string
  name?: string
}

function RegistrationForm() {
  const [form, setForm] = state<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  
  const [touched, setTouched] = state<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = state(false)
  const [submitError, setSubmitError] = state<string | null>(null)
  const [isCheckingEmail, setIsCheckingEmail] = state(false)
  
  // Real-time validation
  const [errors] = state<FormErrors>(() => {
    const errs: FormErrors = {}
    
    // Email validation
    if (touched.email) {
      if (!form.email) {
        errs.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errs.email = 'Invalid email format'
      }
    }
    
    // Password validation
    if (touched.password) {
      if (!form.password) {
        errs.password = 'Password is required'
      } else if (form.password.length < 8) {
        errs.password = 'Password must be at least 8 characters'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
        errs.password = 'Password must contain uppercase, lowercase, and numbers'
      }
    }
    
    // Confirm password validation
    if (touched.confirmPassword) {
      if (!form.confirmPassword) {
        errs.confirmPassword = 'Please confirm your password'
      } else if (form.password !== form.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match'
      }
    }
    
    // Name validation
    if (touched.name) {
      if (!form.name) {
        errs.name = 'Name is required'
      } else if (form.name.length < 2) {
        errs.name = 'Name must be at least 2 characters'
      }
    }
    
    return errs
  })
  
  // Email availability check (async)
  const checkEmailAvailability = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return
    }
    
    setIsCheckingEmail(true)
    try {
      const res = await fetch(`/api/check-email?email=${email}`)
      const { available } = await res.json()
      
      if (!available) {
        setForm({ ...form })  // Update state to show error
        // In practice, using a separate error state is better
      }
    } catch (error) {
      console.error('Email check failed:', error)
    } finally {
      setIsCheckingEmail(false)
    }
  }
  
  const handleFieldChange = (field: keyof FormData, value: string) => {
    setForm({ ...form, [field]: value })
    setTouched({ ...touched, [field]: true })
    
    // Check email availability when email changes
    if (field === 'email') {
      checkEmailAvailability(value)
    }
  }
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    
    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
      confirmPassword: true,
      name: true
    })
    
    // Stop submission if validation fails
    if (Object.keys(errors).length > 0) {
      return
    }
    
    setIsSubmitting(true)
    setSubmitError(null)
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      
      if (!res.ok) {
        throw new Error('Registration failed')
      }
      
      const data = await res.json()
      // Handle success
      alert('Registration completed!')
      
    } catch (error) {
      setSubmitError((error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const isFormValid = Object.keys(errors).length === 0
  
  return (
    <form onsubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={form.email}
          oninput={(e) => handleFieldChange('email', e.currentTarget.value)}
          class={touched.email && errors.email ? 'error' : ''}
        />
        {isCheckingEmail && <span>Checking...</span>}
        {touched.email && errors.email && (
          <span class="error-message">{errors.email}</span>
        )}
      </div>
      
      <div>
        <label>Password</label>
        <input
          type="password"
          value={form.password}
          oninput={(e) => handleFieldChange('password', e.currentTarget.value)}
          class={touched.password && errors.password ? 'error' : ''}
        />
        {touched.password && errors.password && (
          <span class="error-message">{errors.password}</span>
        )}
      </div>
      
      <div>
        <label>Confirm Password</label>
        <input
          type="password"
          value={form.confirmPassword}
          oninput={(e) => handleFieldChange('confirmPassword', e.currentTarget.value)}
          class={touched.confirmPassword && errors.confirmPassword ? 'error' : ''}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <span class="error-message">{errors.confirmPassword}</span>
        )}
      </div>
      
      <div>
        <label>Name</label>
        <input
          type="text"
          value={form.name}
          oninput={(e) => handleFieldChange('name', e.currentTarget.value)}
          class={touched.name && errors.name ? 'error' : ''}
        />
        {touched.name && errors.name && (
          <span class="error-message">{errors.name}</span>
        )}
      </div>
      
      {submitError && (
        <div class="submit-error">{submitError}</div>
      )}
      
      <button type="submit" disabled={!isFormValid || isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Register'}
      </button>
    </form>
  )
}
```

---

## Key Features

### 1. Real-time Validation

Validation runs automatically whenever form fields change. Implemented using `state(() => ...)` as computed state.

### 2. Touch Tracking

Tracks whether the user has touched each field, so errors aren't shown for fields that haven't been entered yet.

### 3. Async Validation

Supports async validation like email availability checking.

### 4. Error Message Display

Shows specific error messages for each field.

### 5. Submit State Management

Manages submitting state and submit errors.

---

## Styling Example

```css
.error {
  border-color: #ef4444;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

.submit-error {
  background-color: #fee2e2;
  color: #991b1b;
  padding: 0.75rem;
  border-radius: 0.375rem;
  margin-bottom: 1rem;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## Related Documentation

- [state() API](/docs/core/state) - State API documentation
- [Best Practices - Common Patterns](/docs/guide/best-practices/patterns) - Form handling patterns