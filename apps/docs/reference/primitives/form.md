---
title: Form - API Reference
description: Complete API reference for Flexium's Form primitives. Signal-based forms with built-in validation and reactive state management.
head:
  - - meta
    - property: og:title
      content: Form API Reference - Flexium
  - - meta
    - property: og:description
      content: createForm, createInput, createInputField, and validators for building reactive forms with validation in Flexium.
---

# Form

Complete API reference for Flexium's signal-based form primitives with built-in validation.

## Import

```tsx
import {
  createForm,
  createInput,
  createInputField,
  validators
} from 'flexium/primitives/form';
```

---

## Functions

### createForm

Creates a form with reactive state management and validation. Returns form state, field management functions, and submission handlers.

#### Usage

```tsx
import { createForm, validators } from 'flexium/primitives/form';

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
    await api.login(data);
  },
});

// Get field state
const emailField = form.getField('email');

// Update field value
form.setFieldValue('email', 'user@example.com');

// Submit form
form.handleSubmit();
```

#### Parameters

The function accepts a `FormConfig` object:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `initialValues` | `FormData` | `{}` | Initial form field values. |
| `validation` | `FieldValidation` | `{}` | Validation rules for each field. |
| `validateOnChange` | `boolean` | `true` | Whether to validate fields when they change. |
| `validateOnBlur` | `boolean` | `true` | Whether to validate fields when they lose focus. |
| `onSubmit` | `(data: FormData) => void \| Promise<void>` | - | Form submission handler. |

#### Return Value

Returns an object with the following properties and methods:

| Property/Method | Type | Description |
| --- | --- | --- |
| `state` | `FormState` | Reactive form state containing data, errors, and status flags. |
| `fields` | `Map<string, FieldState>` | Map of all field states. |
| `getField<T>(name)` | `(name: string) => FieldState<T>` | Get or create a field state. |
| `setFieldValue(name, value)` | `(name: string, value: FieldValue) => void` | Update a field's value. |
| `setFieldError(name, error)` | `(name: string, error: string \| null) => void` | Set a field's error state. |
| `setFieldTouched(name, touched)` | `(name: string, touched: boolean) => void` | Mark a field as touched or untouched. |
| `validateField(name)` | `(name: string) => Promise<string \| null>` | Validate a single field and return error message. |
| `validateForm()` | `() => Promise<boolean>` | Validate entire form and return whether valid. |
| `handleSubmit(e?)` | `(e?: Event) => Promise<void>` | Handle form submission with validation. |
| `reset(values?)` | `(values?: FormData) => void` | Reset form to initial or provided values. |
| `dispose()` | `() => void` | Clean up form resources. |

#### FormState Object

The `state` property contains:

```tsx
interface FormState {
  data: Signal<FormData>;                         // Current form data
  errors: Computed<{ [key: string]: string | null }>; // Field error messages
  isValid: Computed<boolean>;                     // Whether form is valid
  isSubmitting: Signal<boolean>;                  // Whether form is submitting
  isDirty: Computed<boolean>;                     // Whether any field changed
  touchedFields: Signal<Set<string>>;             // Set of touched fields
  dirtyFields: Signal<Set<string>>;               // Set of modified fields
}
```

#### FieldState Object

Each field returned by `getField()` contains:

```tsx
interface FieldState<T = FieldValue> {
  value: Signal<T>;              // Field value signal
  error: Computed<string | null>; // Field error message
  touched: Signal<boolean>;      // Whether field was touched
  dirty: Signal<boolean>;        // Whether field was modified
  validating: Signal<boolean>;   // Whether field is validating
}
```

#### Example: Complete Form

```tsx
const form = createForm({
  initialValues: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  validation: {
    username: [
      validators.required('Username is required'),
      validators.minLength(3, 'Username must be at least 3 characters'),
    ],
    email: [
      validators.required(),
      validators.email(),
    ],
    password: [
      validators.required(),
      validators.minLength(8),
    ],
    confirmPassword: [
      validators.custom((value, formData) => {
        return value === formData.password || 'Passwords must match';
      }),
    ],
  },
  onSubmit: async (data) => {
    console.log('Form submitted:', data);
  },
});

// Access form state
console.log(form.state.isValid.value); // false (initially)
console.log(form.state.isDirty.value); // false (initially)

// Update field
form.setFieldValue('email', 'user@example.com');

// Get field state
const emailField = form.getField('email');
console.log(emailField.value.value); // 'user@example.com'
console.log(emailField.error.value); // null (if valid)
```

---

### createInput

Creates a controlled input element with signal binding, validation state, and accessibility features.

#### Usage

```tsx
import { createInput, signal } from 'flexium';

const value = signal('');
const error = signal<string | null>(null);
const touched = signal(false);

const input = createInput({
  type: 'email',
  name: 'email',
  value,
  error,
  touched,
  placeholder: 'Enter your email',
  onInput: (val) => console.log('Input:', val),
});

document.body.appendChild(input.element);
```

#### Parameters

The function accepts an `InputProps` object:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `type` | `InputType` | `'text'` | Input type (text, email, password, etc.). |
| `name` | `string` | - | Input name attribute. |
| `value` | `Signal<string \| number>` | - | Reactive value signal for two-way binding. |
| `placeholder` | `string` | - | Placeholder text. |
| `disabled` | `boolean` | `false` | Whether input is disabled. |
| `required` | `boolean` | `false` | Whether input is required. |
| `readonly` | `boolean` | `false` | Whether input is read-only. |
| `autoComplete` | `string` | - | Browser autocomplete hint. |
| `autoFocus` | `boolean` | `false` | Whether to auto-focus on mount. |
| `maxLength` | `number` | - | Maximum character length. |
| `minLength` | `number` | - | Minimum character length. |
| `min` | `number \| string` | - | Minimum value (for number/date types). |
| `max` | `number \| string` | - | Maximum value (for number/date types). |
| `step` | `number \| string` | - | Step increment (for number types). |
| `pattern` | `string` | - | Validation pattern (regex). |
| `multiple` | `boolean` | `false` | Allow multiple values (for file inputs). |
| `accept` | `string` | - | Accepted file types (for file inputs). |
| `error` | `Signal<string \| null>` | - | Error message signal. |
| `touched` | `Signal<boolean>` | - | Touched state signal. |
| `className` | `string` | - | CSS class name. |
| `style` | `Partial<CSSStyleDeclaration>` | - | Inline styles object. |
| `id` | `string` | - | Element ID. |
| `ariaLabel` | `string` | - | ARIA label for accessibility. |
| `ariaDescribedby` | `string` | - | ARIA described-by attribute. |
| `ariaInvalid` | `boolean` | - | ARIA invalid state. |
| `onInput` | `(value: string, event: Event) => void` | - | Input event handler. |
| `onChange` | `(value: string, event: Event) => void` | - | Change event handler. |
| `onBlur` | `(event: FocusEvent) => void` | - | Blur event handler. |
| `onFocus` | `(event: FocusEvent) => void` | - | Focus event handler. |
| `onKeyDown` | `(event: KeyboardEvent) => void` | - | Key down event handler. |
| `onKeyUp` | `(event: KeyboardEvent) => void` | - | Key up event handler. |

#### InputType Values

```tsx
type InputType =
  | 'text' | 'email' | 'password' | 'number'
  | 'tel' | 'url' | 'search'
  | 'date' | 'time' | 'datetime-local'
  | 'month' | 'week' | 'color' | 'file'
```

#### Return Value

Returns an object with:

| Property | Type | Description |
| --- | --- | --- |
| `element` | `HTMLInputElement` | The input DOM element. |
| `update` | `(newProps: Partial<InputProps>) => void` | Update input properties. |
| `dispose` | `() => void` | Clean up event listeners and effects. |

#### Example: Integration with createForm

```tsx
const form = createForm({
  initialValues: { email: '', password: '' },
  validation: {
    email: validators.email(),
    password: validators.minLength(8),
  },
});

const emailField = form.getField('email');
const emailInput = createInput({
  type: 'email',
  name: 'email',
  value: emailField.value,
  error: emailField.error,
  touched: emailField.touched,
  placeholder: 'Enter email',
});

const passwordField = form.getField('password');
const passwordInput = createInput({
  type: 'password',
  name: 'password',
  value: passwordField.value,
  error: passwordField.error,
  touched: passwordField.touched,
  placeholder: 'Enter password',
});
```

---

### createInputField

Creates a complete input field with label, helper text, and error message display. A higher-level component that wraps `createInput`.

#### Usage

```tsx
import { createInputField, signal } from 'flexium';

const value = signal('');
const error = signal<string | null>(null);
const touched = signal(false);

const field = createInputField({
  type: 'email',
  name: 'email',
  label: 'Email Address',
  helperText: 'We will never share your email',
  value,
  error,
  touched,
  placeholder: 'you@example.com',
});

document.body.appendChild(field.element);
```

#### Parameters

Accepts all `InputProps` plus additional properties:

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | - | Label text for the input. |
| `helperText` | `string` | - | Helper text displayed below input. |
| `showError` | `boolean` | `true` | Whether to display error messages. |
| ...(all InputProps) | - | - | All properties from `createInput`. |

#### Return Value

Returns an object with:

| Property | Type | Description |
| --- | --- | --- |
| `element` | `HTMLDivElement` | The wrapper element containing label, input, and messages. |
| `input` | `HTMLInputElement` | Direct reference to the input element. |
| `dispose` | `() => void` | Clean up resources. |

#### Structure

The generated HTML structure:

```html
<div class="input-field">
  <label class="input-label" for="input-id">Label Text</label>
  <input id="input-id" ... />
  <div class="input-helper" id="input-id-helper">Helper text</div>
  <div class="input-error-message" id="input-id-error" role="alert">Error message</div>
</div>
```

#### Example: Complete Form with createInputField

```tsx
const form = createForm({
  initialValues: {
    name: '',
    email: '',
  },
  validation: {
    name: validators.required('Name is required'),
    email: [validators.required(), validators.email()],
  },
});

const nameField = form.getField('name');
const nameInput = createInputField({
  label: 'Full Name',
  type: 'text',
  name: 'name',
  value: nameField.value,
  error: nameField.error,
  touched: nameField.touched,
  placeholder: 'John Doe',
});

const emailField = form.getField('email');
const emailInput = createInputField({
  label: 'Email Address',
  type: 'email',
  name: 'email',
  value: emailField.value,
  error: emailField.error,
  touched: emailField.touched,
  helperText: 'We will never share your email',
  placeholder: 'john@example.com',
});

const submitButton = document.createElement('button');
submitButton.textContent = 'Submit';
submitButton.onclick = (e) => form.handleSubmit(e);

const formElement = document.createElement('form');
formElement.appendChild(nameInput.element);
formElement.appendChild(emailInput.element);
formElement.appendChild(submitButton);
```

---

## Validators

The `validators` object provides built-in validation functions for common use cases.

### validators.required

Validates that a field has a value.

#### Usage

```tsx
validators.required(message?: string): ValidationRule
```

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `message` | `string` | `'This field is required'` | Custom error message. |

#### Example

```tsx
validation: {
  username: validators.required('Username is required'),
}
```

---

### validators.email

Validates email address format.

#### Usage

```tsx
validators.email(message?: string): ValidationRule
```

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `message` | `string` | `'Invalid email address'` | Custom error message. |

#### Example

```tsx
validation: {
  email: validators.email('Please enter a valid email'),
}
```

---

### validators.minLength

Validates minimum string length.

#### Usage

```tsx
validators.minLength(min: number, message?: string): ValidationRule
```

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `min` | `number` | - | **Required.** Minimum length. |
| `message` | `string` | `'Must be at least {min} characters'` | Custom error message. |

#### Example

```tsx
validation: {
  password: validators.minLength(8, 'Password too short'),
}
```

---

### validators.maxLength

Validates maximum string length.

#### Usage

```tsx
validators.maxLength(max: number, message?: string): ValidationRule
```

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `max` | `number` | - | **Required.** Maximum length. |
| `message` | `string` | `'Must be at most {max} characters'` | Custom error message. |

#### Example

```tsx
validation: {
  bio: validators.maxLength(500, 'Bio is too long'),
}
```

---

### validators.pattern

Validates against a regular expression pattern.

#### Usage

```tsx
validators.pattern(pattern: RegExp, message?: string): ValidationRule
```

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `pattern` | `RegExp` | - | **Required.** Regular expression to match. |
| `message` | `string` | `'Invalid format'` | Custom error message. |

#### Example

```tsx
validation: {
  phone: validators.pattern(/^\d{3}-\d{3}-\d{4}$/, 'Use format: 123-456-7890'),
}
```

---

### validators.min

Validates minimum numeric value.

#### Usage

```tsx
validators.min(min: number, message?: string): ValidationRule
```

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `min` | `number` | - | **Required.** Minimum value. |
| `message` | `string` | `'Must be at least {min}'` | Custom error message. |

#### Example

```tsx
validation: {
  age: validators.min(18, 'Must be 18 or older'),
}
```

---

### validators.max

Validates maximum numeric value.

#### Usage

```tsx
validators.max(max: number, message?: string): ValidationRule
```

#### Parameters

| Parameter | Type | Default | Description |
| --- | --- | --- | --- |
| `max` | `number` | - | **Required.** Maximum value. |
| `message` | `string` | `'Must be at most {max}'` | Custom error message. |

#### Example

```tsx
validation: {
  quantity: validators.max(100, 'Maximum quantity is 100'),
}
```

---

### validators.custom

Creates a custom validation function.

#### Usage

```tsx
validators.custom(fn: ValidationRule): ValidationRule
```

#### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `fn` | `ValidationRule` | Custom validation function. |

#### ValidationRule Type

```tsx
type ValidationRule<T = FieldValue> = (
  value: T,
  formData: FormData
) => string | boolean | undefined | Promise<string | boolean | undefined>
```

- Return `true` or `undefined` for valid
- Return `false` or error message string for invalid
- Can be async for async validation

#### Example: Synchronous Custom Validation

```tsx
validation: {
  confirmPassword: validators.custom((value, formData) => {
    return value === formData.password || 'Passwords must match';
  }),
}
```

#### Example: Asynchronous Custom Validation

```tsx
validation: {
  username: validators.custom(async (value) => {
    const exists = await api.checkUsername(value);
    return !exists || 'Username already taken';
  }),
}
```

#### Example: Complex Custom Validation

```tsx
validation: {
  couponCode: validators.custom(async (value, formData) => {
    if (!value) return true; // Optional field

    const response = await api.validateCoupon(value, formData.total);

    if (!response.valid) {
      return response.message || 'Invalid coupon code';
    }

    return true;
  }),
}
```

---

## Type Definitions

### FieldValue

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

### FormData

```tsx
interface FormData {
  [fieldName: string]: FieldValue
}
```

### ValidationRule

```tsx
type ValidationRule<T = FieldValue> = (
  value: T,
  formData: FormData
) => string | boolean | undefined | Promise<string | boolean | undefined>
```

### FieldValidation

```tsx
interface FieldValidation {
  [fieldName: string]: ValidationRule | ValidationRule[]
}
```

### FormConfig

```tsx
interface FormConfig {
  initialValues?: FormData
  validation?: FieldValidation
  validateOnChange?: boolean
  validateOnBlur?: boolean
  onSubmit?: (data: FormData) => void | Promise<void>
}
```

### FormState

```tsx
interface FormState {
  data: Signal<FormData>
  errors: Computed<{ [key: string]: string | null }>
  isValid: Computed<boolean>
  isSubmitting: Signal<boolean>
  isDirty: Computed<boolean>
  touchedFields: Signal<Set<string>>
  dirtyFields: Signal<Set<string>>
}
```

### FieldState

```tsx
interface FieldState<T = FieldValue> {
  value: Signal<T>
  error: Computed<string | null>
  touched: Signal<boolean>
  dirty: Signal<boolean>
  validating: Signal<boolean>
}
```

---

## Complete Example

Here's a complete registration form example:

```tsx
import { createForm, createInputField, validators } from 'flexium/primitives/form';

// Create form with validation
const form = createForm({
  initialValues: {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: 0,
    terms: false,
  },
  validation: {
    username: [
      validators.required('Username is required'),
      validators.minLength(3),
      validators.maxLength(20),
      validators.pattern(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
    ],
    email: [
      validators.required(),
      validators.email(),
      validators.custom(async (value) => {
        const exists = await checkEmailExists(value);
        return !exists || 'Email already registered';
      }),
    ],
    password: [
      validators.required(),
      validators.minLength(8, 'Password must be at least 8 characters'),
      validators.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Must contain uppercase, lowercase, and number'
      ),
    ],
    confirmPassword: [
      validators.required('Please confirm your password'),
      validators.custom((value, data) => {
        return value === data.password || 'Passwords do not match';
      }),
    ],
    age: [
      validators.required(),
      validators.min(18, 'Must be 18 or older'),
      validators.max(120, 'Please enter a valid age'),
    ],
    terms: validators.custom((value) => {
      return value === true || 'You must accept the terms';
    }),
  },
  onSubmit: async (data) => {
    console.log('Submitting:', data);
    await api.register(data);
    alert('Registration successful!');
  },
});

// Create input fields
const usernameField = form.getField('username');
const usernameInput = createInputField({
  label: 'Username',
  type: 'text',
  name: 'username',
  value: usernameField.value,
  error: usernameField.error,
  touched: usernameField.touched,
  placeholder: 'johndoe',
  autoComplete: 'username',
});

const emailField = form.getField('email');
const emailInput = createInputField({
  label: 'Email',
  type: 'email',
  name: 'email',
  value: emailField.value,
  error: emailField.error,
  touched: emailField.touched,
  placeholder: 'you@example.com',
  autoComplete: 'email',
});

const passwordField = form.getField('password');
const passwordInput = createInputField({
  label: 'Password',
  type: 'password',
  name: 'password',
  value: passwordField.value,
  error: passwordField.error,
  touched: passwordField.touched,
  autoComplete: 'new-password',
});

const confirmPasswordField = form.getField('confirmPassword');
const confirmPasswordInput = createInputField({
  label: 'Confirm Password',
  type: 'password',
  name: 'confirmPassword',
  value: confirmPasswordField.value,
  error: confirmPasswordField.error,
  touched: confirmPasswordField.touched,
  autoComplete: 'new-password',
});

const ageField = form.getField('age');
const ageInput = createInputField({
  label: 'Age',
  type: 'number',
  name: 'age',
  value: ageField.value,
  error: ageField.error,
  touched: ageField.touched,
  min: 0,
  max: 120,
});

// Create submit button
const submitButton = document.createElement('button');
submitButton.textContent = 'Register';
submitButton.type = 'submit';
submitButton.disabled = !form.state.isValid.value;

// Update button state reactively
effect(() => {
  submitButton.disabled = !form.state.isValid.value || form.state.isSubmitting.value;
  submitButton.textContent = form.state.isSubmitting.value ? 'Registering...' : 'Register';
});

// Assemble form
const formElement = document.createElement('form');
formElement.onsubmit = (e) => form.handleSubmit(e);
formElement.appendChild(usernameInput.element);
formElement.appendChild(emailInput.element);
formElement.appendChild(passwordInput.element);
formElement.appendChild(confirmPasswordInput.element);
formElement.appendChild(ageInput.element);
formElement.appendChild(submitButton);

document.body.appendChild(formElement);
```

---

## See Also

- [Signals](/guide/signals) - Understanding Flexium's reactive primitives
- [Effects](/guide/effects) - Reactive side effects
- [State Management](/guide/state) - Managing application state
