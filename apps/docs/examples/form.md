---
title: Form Handling Example - Inputs & Validation
description: Learn form handling in Flexium with controlled inputs, validation, and submission. Build reactive forms with ease.
head:
  - - meta
    - property: og:title
      content: Form Handling Example - Flexium
  - - meta
    - property: og:description
      content: Complete form handling example with controlled inputs, real-time validation, and form submission in Flexium.
---

# Form Handling Example

This example demonstrates form handling with validation in Flexium.

## Basic Form

```tsx
import { state } from 'flexium/core'
import { Column, Row, Text, Pressable } from 'flexium/primitives'

function BasicForm() {
  const [name, setName] = state('')
  const [email, setEmail] = state('')
  const [submitted, setSubmitted] = state(false)

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    console.log({ name: name(), email: email() })
    setSubmitted(true)
  }

  return (
    <Column gap={16} padding={20}>
      <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
        Contact Form
      </Text>

      <form onsubmit={handleSubmit}>
        <Column gap={12}>
          <Column gap={4}>
            <label>Name</label>
            <input
              type="text"
              value={name()}
              oninput={(e) => setName(e.target.value)}
              style={{ padding: '8px', width: '100%' }}
            />
          </Column>

          <Column gap={4}>
            <label>Email</label>
            <input
              type="email"
              value={email()}
              oninput={(e) => setEmail(e.target.value)}
              style={{ padding: '8px', width: '100%' }}
            />
          </Column>

          <Pressable>
            <button type="submit" style={{ padding: '10px 20px' }}>
              Submit
            </button>
          </Pressable>
        </Column>
      </form>

      {submitted() && (
        <Text style={{ color: 'green' }}>
          Form submitted successfully!
        </Text>
      )}
    </Column>
  )
}
```

## With Validation

```tsx
function FormWithValidation() {
  const [email, setEmail] = state('')
  const [password, setPassword] = state('')
  const [touched, setTouched] = state({ email: false, password: false })

  // Computed validation
  const [errors] = state(() => ({
    email: !email().includes('@') ? 'Invalid email address' : null,
    password: password().length < 8 ? 'Password must be at least 8 characters' : null
  }))

  const [isValid] = state(() =>
    !errors().email && !errors().password && email() && password()
  )

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    if (isValid()) {
      console.log('Form is valid!')
    }
  }

  return (
    <form onsubmit={handleSubmit}>
      <Column gap={16}>
        <Column gap={4}>
          <label>Email</label>
          <input
            type="email"
            value={email()}
            oninput={(e) => setEmail(e.target.value)}
            onblur={() => handleBlur('email')}
            style={{
              padding: '8px',
              borderColor: touched().email && errors().email ? 'red' : '#ccc'
            }}
          />
          {touched().email && errors().email && (
            <Text style={{ color: 'red', fontSize: '12px' }}>
              {errors().email}
            </Text>
          )}
        </Column>

        <Column gap={4}>
          <label>Password</label>
          <input
            type="password"
            value={password()}
            oninput={(e) => setPassword(e.target.value)}
            onblur={() => handleBlur('password')}
            style={{
              padding: '8px',
              borderColor: touched().password && errors().password ? 'red' : '#ccc'
            }}
          />
          {touched().password && errors().password && (
            <Text style={{ color: 'red', fontSize: '12px' }}>
              {errors().password}
            </Text>
          )}
        </Column>

        <button
          type="submit"
          disabled={!isValid()}
          style={{
            padding: '10px 20px',
            opacity: isValid() ? 1 : 0.5
          }}
        >
          Submit
        </button>
      </Column>
    </form>
  )
}
```

## Multi-Step Form

```tsx
function MultiStepForm() {
  const [step, setStep] = state(1)
  const [formData, setFormData] = state({
    name: '',
    email: '',
    address: '',
    city: ''
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const nextStep = () => setStep(s => Math.min(s + 1, 3))
  const prevStep = () => setStep(s => Math.max(s - 1, 1))

  return (
    <Column gap={16} padding={20}>
      <Row gap={8}>
        {[1, 2, 3].map(n => (
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: step() >= n ? '#646cff' : '#ccc',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {n}
          </div>
        ))}
      </Row>

      {step() === 1 && (
        <Column gap={12}>
          <Text>Step 1: Personal Info</Text>
          <input
            placeholder="Name"
            value={formData().name}
            oninput={(e) => updateField('name', e.target.value)}
          />
          <input
            placeholder="Email"
            value={formData().email}
            oninput={(e) => updateField('email', e.target.value)}
          />
        </Column>
      )}

      {step() === 2 && (
        <Column gap={12}>
          <Text>Step 2: Address</Text>
          <input
            placeholder="Address"
            value={formData().address}
            oninput={(e) => updateField('address', e.target.value)}
          />
          <input
            placeholder="City"
            value={formData().city}
            oninput={(e) => updateField('city', e.target.value)}
          />
        </Column>
      )}

      {step() === 3 && (
        <Column gap={8}>
          <Text>Step 3: Review</Text>
          <Text>Name: {formData().name}</Text>
          <Text>Email: {formData().email}</Text>
          <Text>Address: {formData().address}</Text>
          <Text>City: {formData().city}</Text>
        </Column>
      )}

      <Row gap={8}>
        {step() > 1 && (
          <Pressable onPress={prevStep}>
            <Text style={{ padding: '8px 16px', background: '#ccc' }}>Back</Text>
          </Pressable>
        )}
        {step() < 3 ? (
          <Pressable onPress={nextStep}>
            <Text style={{ padding: '8px 16px', background: '#646cff', color: 'white' }}>Next</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => console.log('Submit:', formData())}>
            <Text style={{ padding: '8px 16px', background: 'green', color: 'white' }}>Submit</Text>
          </Pressable>
        )}
      </Row>
    </Column>
  )
}
```

## Key Concepts

- **Controlled Inputs**: Using `value` and `oninput` for two-way binding
- **Computed Validation**: Auto-updating error states based on input values
- **Touch Tracking**: Only showing errors after field interaction
- **Multi-Step State**: Managing form wizard with step-based navigation
