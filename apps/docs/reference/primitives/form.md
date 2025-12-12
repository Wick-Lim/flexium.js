---
title: Form - Building Forms with state()
description: Guide to building reactive forms in Flexium using the state() API. Create forms with validation and reactive state management.
head:
  - - meta
    - property: og:title
      content: Form Guide - Flexium
  - - meta
    - property: og:description
      content: Build reactive forms with validation in Flexium using the state() API.
---

# Building Forms with state()

Learn how to build reactive forms in Flexium using the `state()` API for form state management and validation.

## Basic Form Example

Use `state()` to manage form values and validation state:

```tsx
import { state } from 'flexium';

function LoginForm() {
  const formData = state({
    email: '',
    password: ''
  });

  const errors = state({
    email: null as string | null,
    password: null as string | null
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Reset errors
    errors.set({ email: null, password: null });

    // Validate
    const newErrors: any = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      errors.set(newErrors);
      return;
    }

    // Submit form
    console.log('Submitting:', formData);
    await submitLogin(formData);
  };

  return (
    <form onsubmit={handleSubmit}>
      <div>
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          oninput={(e) => formData.set({ ...formData.valueOf(), email: e.target.value })}
        />
        {errors.email && <div class="error">{errors.email}</div>}
      </div>

      <div>
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          oninput={(e) => formData.set({ ...formData.valueOf(), password: e.target.value })}
        />
        {errors.password && <div class="error">{errors.password}</div>}
      </div>

      <button type="submit">Login</button>
    </form>
  );
}
```

## Form with Real-time Validation

Add validation as users type:

```tsx
import { state, effect } from 'flexium';

function RegistrationForm() {
  const formData = state({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const errors = state({
    username: null as string | null,
    email: null as string | null,
    password: null as string | null,
    confirmPassword: null as string | null
  });

  const touched = state({
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  // Validate on change
  effect(() => {
    const newErrors: any = {};

    if (touched.username && !formData.username) {
      newErrors.username = 'Username is required';
    } else if (touched.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (touched.email && !formData.email) {
      newErrors.email = 'Email is required';
    } else if (touched.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (touched.password && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (touched.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (touched.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    errors.set(newErrors);
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Mark all as touched
    touched.set({
      username: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    // Check if there are any errors
    if (Object.values(errors.valueOf()).some(error => error !== null)) {
      return;
    }

    // Submit form
    console.log('Submitting:', formData);
    await submitRegistration(formData);
  };

  return (
    <form onsubmit={handleSubmit}>
      <div>
        <label for="username">Username</label>
        <input
          id="username"
          type="text"
          value={formData.username}
          oninput={(e) => formData.set({ ...formData.valueOf(), username: e.target.value })}
          onblur={() => touched.set({ ...touched.valueOf(), username: true })}
        />
        {touched.username && errors.username && (
          <div class="error">{errors.username}</div>
        )}
      </div>

      <div>
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          oninput={(e) => formData.set({ ...formData.valueOf(), email: e.target.value })}
          onblur={() => touched.set({ ...touched.valueOf(), email: true })}
        />
        {touched.email && errors.email && (
          <div class="error">{errors.email}</div>
        )}
      </div>

      <div>
        <label for="password">Password</label>
        <input
          id="password"
          type="password"
          value={formData.password}
          oninput={(e) => formData.set({ ...formData.valueOf(), password: e.target.value })}
          onblur={() => touched.set({ ...touched.valueOf(), password: true })}
        />
        {touched.password && errors.password && (
          <div class="error">{errors.password}</div>
        )}
      </div>

      <div>
        <label for="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          oninput={(e) => formData.set({ ...formData.valueOf(), confirmPassword: e.target.value })}
          onblur={() => touched.set({ ...touched.valueOf(), confirmPassword: true })}
        />
        {touched.confirmPassword && errors.confirmPassword && (
          <div class="error">{errors.confirmPassword}</div>
        )}
      </div>

      <button type="submit">Register</button>
    </form>
  );
}
```

## Custom Form Hook

Create a reusable form hook pattern:

```tsx
import { state, effect } from 'flexium';

interface ValidationRule<T> {
  validate: (value: T, allValues: any) => string | null;
  message?: string;
}

interface FieldConfig<T = any> {
  initial: T;
  rules?: ValidationRule<T>[];
}

interface FormConfig {
  [key: string]: FieldConfig;
}

function useForm<T extends FormConfig>(config: T) {
  // Initialize form data
  const initialValues = Object.keys(config).reduce((acc, key) => {
    acc[key] = config[key].initial;
    return acc;
  }, {} as any);

  const formData = state(initialValues);
  const errors = state<Record<string, string | null>>({});
  const touched = state<Record<string, boolean>>({});

  // Validate a single field
  const validateField = (fieldName: string) => {
    const field = config[fieldName];
    if (!field || !field.rules) return null;

    for (const rule of field.rules) {
      const error = rule.validate(formData[fieldName], formData);
      if (error) return error;
    }

    return null;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors: Record<string, string | null> = {};
    let isValid = true;

    for (const fieldName of Object.keys(config)) {
      const error = validateField(fieldName);
      newErrors[fieldName] = error;
      if (error) isValid = false;
    }

    errors.set(newErrors);
    return isValid;
  };

  // Validate on change for touched fields
  effect(() => {
    const newErrors: Record<string, string | null> = {};

    for (const fieldName of Object.keys(config)) {
      if (touched[fieldName]) {
        newErrors[fieldName] = validateField(fieldName);
      }
    }

    errors.set(newErrors);
  });

  const setFieldValue = (fieldName: string, value: any) => {
    formData.set({ ...formData.valueOf(), [fieldName]: value });
  };

  const setFieldTouched = (fieldName: string) => {
    touched.set({ ...touched.valueOf(), [fieldName]: true });
  };

  const reset = () => {
    formData.set(initialValues);
    errors.set({});
    touched.set({});
  };

  return {
    formData,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateForm,
    reset
  };
}

// Usage
function UserForm() {
  const form = useForm({
    email: {
      initial: '',
      rules: [
        {
          validate: (value) => value ? null : 'Email is required'
        },
        {
          validate: (value) => /\S+@\S+\.\S+/.test(value) ? null : 'Invalid email'
        }
      ]
    },
    age: {
      initial: 0,
      rules: [
        {
          validate: (value) => value >= 18 ? null : 'Must be 18 or older'
        }
      ]
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (form.validateForm()) {
      console.log('Valid form:', form.formData);
      await submitForm(form.formData);
      form.reset();
    }
  };

  return (
    <form onsubmit={handleSubmit}>
      <div>
        <label>Email</label>
        <input
          type="email"
          value={form.formData.email}
          oninput={(e) => form.setFieldValue('email', e.target.value)}
          onblur={() => form.setFieldTouched('email')}
        />
        {form.touched.email && form.errors.email && (
          <div class="error">{form.errors.email}</div>
        )}
      </div>

      <div>
        <label>Age</label>
        <input
          type="number"
          value={form.formData.age}
          oninput={(e) => form.setFieldValue('age', parseInt(e.target.value))}
          onblur={() => form.setFieldTouched('age')}
        />
        {form.touched.age && form.errors.age && (
          <div class="error">{form.errors.age}</div>
        )}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Async Validation

Handle async validation like checking if an email already exists:

```tsx
import { state } from 'flexium';

function SignupForm() {
  const formData = state({
    email: ''
  });

  const errors = state({
    email: null as string | null
  });

  const validating = state({
    email: false
  });

  const validateEmail = async (email: string) => {
    if (!email) {
      errors.set({ ...errors.valueOf(), email: 'Email is required' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      errors.set({ ...errors.valueOf(), email: 'Invalid email format' });
      return;
    }

    validating.set({ ...validating.valueOf(), email: true });

    try {
      const response = await fetch(`/api/check-email?email=${email}`);
      const data = await response.json();

      if (data.exists) {
        errors.set({ ...errors.valueOf(), email: 'Email already registered' });
      } else {
        errors.set({ ...errors.valueOf(), email: null });
      }
    } catch (error) {
      errors.set({ ...errors.valueOf(), email: 'Failed to validate email' });
    } finally {
      validating.set({ ...validating.valueOf(), email: false });
    }
  };

  const handleEmailBlur = () => {
    validateEmail(formData.email);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    await validateEmail(formData.email);

    if (!errors.email) {
      console.log('Submitting:', formData);
      await submitSignup(formData);
    }
  };

  return (
    <form onsubmit={handleSubmit}>
      <div>
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          oninput={(e) => formData.set({ ...formData.valueOf(), email: e.target.value })}
          onblur={handleEmailBlur}
        />
        {validating.email && <div class="validating">Checking email...</div>}
        {errors.email && <div class="error">{errors.email}</div>}
      </div>

      <button type="submit" disabled={validating.email}>
        Sign Up
      </button>
    </form>
  );
}
```

## Form with Loading State

Show loading state during form submission:

```tsx
import { state } from 'flexium';

function ContactForm() {
  const formData = state({
    name: '',
    email: '',
    message: ''
  });

  const submitting = state(false);
  const submitted = state(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    submitting.set(true);

    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      submitted.set(true);
      formData.set({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Failed to submit form:', error);
    } finally {
      submitting.set(false);
    }
  };

  if (submitted.valueOf()) {
    return <div class="success">Thank you! Your message has been sent.</div>;
  }

  return (
    <form onsubmit={handleSubmit}>
      <div>
        <label for="name">Name</label>
        <input
          id="name"
          type="text"
          value={formData.name}
          oninput={(e) => formData.set({ ...formData.valueOf(), name: e.target.value })}
          disabled={submitting.valueOf()}
        />
      </div>

      <div>
        <label for="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          oninput={(e) => formData.set({ ...formData.valueOf(), email: e.target.value })}
          disabled={submitting.valueOf()}
        />
      </div>

      <div>
        <label for="message">Message</label>
        <textarea
          id="message"
          value={formData.message}
          oninput={(e) => formData.set({ ...formData.valueOf(), message: e.target.value })}
          disabled={submitting.valueOf()}
        />
      </div>

      <button type="submit" disabled={submitting.valueOf()}>
        {submitting.valueOf() ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}
```

## See Also

- [State Management](/guide/state) - Understanding the state() API
- [Effects](/guide/effects) - Reactive side effects for validation
- [Button Component](/reference/primitives/button) - Accessible form buttons
