import { mount } from '../../../packages/flexium/dist/dom.mjs'
import { signal, computed } from '../../../packages/flexium/dist/core.mjs'
import { createForm, validators } from '../../../packages/flexium/dist/primitives/form.mjs'

// ============================================================================
// 1. BASIC FORM WITH VALIDATION
// ============================================================================
function BasicFormDemo() {
  const form = createForm({
    initialValues: {
      name: '',
      email: '',
      age: '',
      website: '',
    },
    validation: {
      name: [
        validators.required('Name is required'),
        validators.minLength(2, 'Name must be at least 2 characters'),
      ],
      email: [
        validators.required('Email is required'),
        validators.email('Please enter a valid email address'),
      ],
      age: [
        validators.required('Age is required'),
        validators.min(18, 'You must be at least 18 years old'),
        validators.max(120, 'Please enter a valid age'),
      ],
      website: [
        validators.pattern(
          /^https?:\/\/.+/,
          'Website must start with http:// or https://'
        ),
      ],
    },
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (data) => {
      console.log('Form submitted:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert('Form submitted successfully! Check console for data.')
    },
  })

  const nameField = form.getField<string>('name')
  const emailField = form.getField<string>('email')
  const ageField = form.getField<string>('age')
  const websiteField = form.getField<string>('website')

  return (
    <div class="form-section">
      <h3>Basic Form with Validation</h3>
      <p class="description">
        Demonstrates required fields, email validation, min/max values, and pattern matching.
      </p>

      <form onSubmit={(e: Event) => {
        e.preventDefault()
        form.handleSubmit(e)
      }}>
        <div class="form-group">
          <label for="name">Name *</label>
          <input
            id="name"
            type="text"
            value={nameField.value.value}
            onInput={(e: Event) => form.setFieldValue('name', (e.target as HTMLInputElement).value)}
            onBlur={() => form.setFieldTouched('name', true)}
            class={nameField.error.value && nameField.touched.value ? 'error' : ''}
          />
          {() => nameField.error.value && nameField.touched.value && (
            <span class="error-message">{nameField.error.value}</span>
          )}
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input
            id="email"
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

        <div class="form-group">
          <label for="age">Age *</label>
          <input
            id="age"
            type="number"
            value={ageField.value.value}
            onInput={(e: Event) => form.setFieldValue('age', (e.target as HTMLInputElement).value)}
            onBlur={() => form.setFieldTouched('age', true)}
            class={ageField.error.value && ageField.touched.value ? 'error' : ''}
          />
          {() => ageField.error.value && ageField.touched.value && (
            <span class="error-message">{ageField.error.value}</span>
          )}
        </div>

        <div class="form-group">
          <label for="website">Website (optional)</label>
          <input
            id="website"
            type="url"
            placeholder="https://example.com"
            value={websiteField.value.value}
            onInput={(e: Event) => form.setFieldValue('website', (e.target as HTMLInputElement).value)}
            onBlur={() => form.setFieldTouched('website', true)}
            class={websiteField.error.value && websiteField.touched.value ? 'error' : ''}
          />
          {() => websiteField.error.value && websiteField.touched.value && (
            <span class="error-message">{websiteField.error.value}</span>
          )}
        </div>

        <div style={{ marginTop: '20px' }}>
          <button type="submit" disabled={form.state.isSubmitting.value}>
            {() => form.state.isSubmitting.value ? (
              <>
                <span class="spinner"></span> Submitting...
              </>
            ) : (
              'Submit Form'
            )}
          </button>
          <button type="button" class="secondary" onClick={() => form.reset()}>
            Reset
          </button>
        </div>

        {() => form.state.isSubmitting.value && (
          <div class="form-status submitting">
            Submitting form...
          </div>
        )}
      </form>
    </div>
  )
}

// ============================================================================
// 2. REAL-TIME VALIDATION FEEDBACK
// ============================================================================
function RealTimeValidationDemo() {
  const form = createForm({
    initialValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
    validation: {
      username: [
        validators.required('Username is required'),
        validators.minLength(3, 'Username must be at least 3 characters'),
        validators.maxLength(20, 'Username must be at most 20 characters'),
        validators.pattern(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
      ],
      password: [
        validators.required('Password is required'),
        validators.minLength(8, 'Password must be at least 8 characters'),
        validators.custom((value) => {
          if (typeof value !== 'string') return true
          const hasUpper = /[A-Z]/.test(value)
          const hasLower = /[a-z]/.test(value)
          const hasNumber = /[0-9]/.test(value)
          return (hasUpper && hasLower && hasNumber) || 'Password must contain uppercase, lowercase, and number'
        }),
      ],
      confirmPassword: [
        validators.required('Please confirm your password'),
        validators.custom((value, formData) => {
          return value === formData.password || 'Passwords do not match'
        }),
      ],
    },
    validateOnChange: true,
    validateOnBlur: true,
  })

  const usernameField = form.getField<string>('username')
  const passwordField = form.getField<string>('password')
  const confirmPasswordField = form.getField<string>('confirmPassword')

  // Password strength indicator
  const passwordStrength = computed(() => {
    const pwd = passwordField.value.value as string
    if (!pwd) return { label: '', score: 0 }

    let score = 0
    if (pwd.length >= 8) score++
    if (pwd.length >= 12) score++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^a-zA-Z0-9]/.test(pwd)) score++

    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong']
    return { label: labels[score], score }
  })

  return (
    <div class="form-section">
      <h3>Real-Time Validation Feedback</h3>
      <p class="description">
        Watch validation messages appear as you type, with password strength indicator.
      </p>

      <form>
        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrapper">
            <input
              id="username"
              type="text"
              value={usernameField.value.value}
              onInput={(e: Event) => form.setFieldValue('username', (e.target as HTMLInputElement).value)}
              onBlur={() => form.setFieldTouched('username', true)}
              class={() => {
                if (!usernameField.touched.value) return ''
                return usernameField.error.value ? 'error' : 'success'
              }}
            />
            {() => usernameField.touched.value && !usernameField.error.value && usernameField.value.value && (
              <span class="validation-icon success">✓</span>
            )}
            {() => usernameField.touched.value && usernameField.error.value && (
              <span class="validation-icon error">✗</span>
            )}
          </div>
          {() => usernameField.error.value && usernameField.touched.value && (
            <span class="error-message">{usernameField.error.value}</span>
          )}
          <span class="helper-text">3-20 characters, letters, numbers, and underscores only</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            value={passwordField.value.value}
            onInput={(e: Event) => form.setFieldValue('password', (e.target as HTMLInputElement).value)}
            onBlur={() => form.setFieldTouched('password', true)}
            class={() => {
              if (!passwordField.touched.value) return ''
              return passwordField.error.value ? 'error' : 'success'
            }}
          />
          {() => passwordField.error.value && passwordField.touched.value && (
            <span class="error-message">{passwordField.error.value}</span>
          )}
          {() => passwordField.value.value && (
            <div style={{ marginTop: '10px' }}>
              <div style={{
                display: 'flex',
                gap: '5px',
                marginBottom: '5px'
              }}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: '6px',
                      borderRadius: '3px',
                      background: passwordStrength.value.score >= level ?
                        (passwordStrength.value.score <= 2 ? '#dc3545' :
                         passwordStrength.value.score === 3 ? '#ffc107' : '#28a745') : '#e0e0e0',
                      transition: 'background 0.3s ease'
                    }}
                  />
                ))}
              </div>
              <span class="helper-text" style={{
                color: passwordStrength.value.score <= 2 ? '#dc3545' :
                       passwordStrength.value.score === 3 ? '#ffc107' : '#28a745'
              }}>
                Password Strength: {passwordStrength.value.label}
              </span>
            </div>
          )}
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPasswordField.value.value}
            onInput={(e: Event) => form.setFieldValue('confirmPassword', (e.target as HTMLInputElement).value)}
            onBlur={() => form.setFieldTouched('confirmPassword', true)}
            class={() => {
              if (!confirmPasswordField.touched.value) return ''
              return confirmPasswordField.error.value ? 'error' : 'success'
            }}
          />
          {() => confirmPasswordField.error.value && confirmPasswordField.touched.value && (
            <span class="error-message">{confirmPasswordField.error.value}</span>
          )}
        </div>
      </form>
    </div>
  )
}

// ============================================================================
// 3. ASYNC VALIDATION (Username Availability)
// ============================================================================
function AsyncValidationDemo() {
  const checkingUsername = signal(false)

  // Simulate API call to check username availability
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const takenUsernames = ['admin', 'user', 'test', 'demo']
    return !takenUsernames.includes(username.toLowerCase())
  }

  const form = createForm({
    initialValues: {
      username: '',
      email: '',
    },
    validation: {
      username: [
        validators.required('Username is required'),
        validators.minLength(3, 'Username must be at least 3 characters'),
        validators.custom(async (value) => {
          if (typeof value !== 'string' || value.length < 3) return true

          checkingUsername.set(true)
          try {
            const isAvailable = await checkUsernameAvailability(value)
            return isAvailable || 'This username is already taken'
          } finally {
            checkingUsername.set(false)
          }
        }),
      ],
      email: [
        validators.required('Email is required'),
        validators.email('Invalid email address'),
      ],
    },
    validateOnBlur: true,
  })

  const usernameField = form.getField<string>('username')
  const emailField = form.getField<string>('email')

  return (
    <div class="form-section">
      <h3>Async Validation</h3>
      <p class="description">
        Username availability is checked against a simulated API. Try: 'admin', 'user', 'test', or 'demo'.
      </p>

      <form>
        <div class="form-group">
          <label for="async-username">Username</label>
          <div class="input-wrapper">
            <input
              id="async-username"
              type="text"
              value={usernameField.value.value}
              onInput={(e: Event) => form.setFieldValue('username', (e.target as HTMLInputElement).value)}
              onBlur={() => form.setFieldTouched('username', true)}
              class={() => {
                if (!usernameField.touched.value) return ''
                return usernameField.error.value ? 'error' : 'success'
              }}
            />
            {() => checkingUsername.value && (
              <span class="validation-icon validating">⟳</span>
            )}
            {() => !checkingUsername.value && usernameField.touched.value && !usernameField.error.value && usernameField.value.value && (
              <span class="validation-icon success">✓</span>
            )}
            {() => !checkingUsername.value && usernameField.touched.value && usernameField.error.value && (
              <span class="validation-icon error">✗</span>
            )}
          </div>
          {() => checkingUsername.value && (
            <span class="helper-text">Checking availability...</span>
          )}
          {() => !checkingUsername.value && usernameField.error.value && usernameField.touched.value && (
            <span class="error-message">{usernameField.error.value}</span>
          )}
          {() => !checkingUsername.value && !usernameField.error.value && usernameField.touched.value && usernameField.value.value && (
            <span class="helper-text" style={{ color: '#28a745' }}>Username is available!</span>
          )}
        </div>

        <div class="form-group">
          <label for="async-email">Email</label>
          <input
            id="async-email"
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
      </form>
    </div>
  )
}

// ============================================================================
// 4. MULTI-STEP WIZARD FORM
// ============================================================================
function MultiStepWizardDemo() {
  const currentStep = signal(1)
  const form = createForm({
    initialValues: {
      // Step 1: Personal Info
      firstName: '',
      lastName: '',
      birthDate: '',
      // Step 2: Contact Info
      email: '',
      phone: '',
      address: '',
      // Step 3: Preferences
      newsletter: false,
      notifications: 'email',
      bio: '',
    },
    validation: {
      firstName: validators.required('First name is required'),
      lastName: validators.required('Last name is required'),
      birthDate: validators.required('Birth date is required'),
      email: [validators.required('Email is required'), validators.email()],
      phone: [
        validators.required('Phone is required'),
        validators.pattern(/^\+?[0-9]{10,14}$/, 'Invalid phone number'),
      ],
      address: validators.required('Address is required'),
      bio: validators.maxLength(500, 'Bio must be at most 500 characters'),
    },
    onSubmit: async (data) => {
      console.log('Wizard completed:', data)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert('Registration completed! Check console for data.')
    },
  })

  const nextStep = async () => {
    // Validate current step fields
    const stepFields: { [key: number]: string[] } = {
      1: ['firstName', 'lastName', 'birthDate'],
      2: ['email', 'phone', 'address'],
      3: ['bio'],
    }

    const fieldsToValidate = stepFields[currentStep.value]
    let isStepValid = true

    for (const field of fieldsToValidate) {
      form.setFieldTouched(field, true)
      const error = await form.validateField(field)
      if (error) {
        isStepValid = false
      }
    }

    if (isStepValid) {
      currentStep.set(currentStep.value + 1)
    }
  }

  const prevStep = () => {
    currentStep.set(Math.max(1, currentStep.value - 1))
  }

  const getField = (name: string) => form.getField<string>(name)

  return (
    <div class="form-section">
      <h3>Multi-Step Wizard Form</h3>
      <p class="description">
        Navigate through multiple steps with validation at each stage.
      </p>

      <div class="wizard-steps">
        {[1, 2, 3].map((step) => (
          <div
            key={step}
            class={() => {
              if (currentStep.value === step) return 'wizard-step active'
              if (currentStep.value > step) return 'wizard-step completed'
              return 'wizard-step'
            }}
          >
            <div class="step-circle">{step}</div>
            <span class="step-label">
              {step === 1 ? 'Personal' : step === 2 ? 'Contact' : 'Preferences'}
            </span>
          </div>
        ))}
      </div>

      <form>
        {() => currentStep.value === 1 && (
          <div>
            <h4>Step 1: Personal Information</h4>
            <div class="form-grid">
              <div class="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={getField('firstName').value.value}
                  onInput={(e: Event) => form.setFieldValue('firstName', (e.target as HTMLInputElement).value)}
                  onBlur={() => form.setFieldTouched('firstName', true)}
                  class={getField('firstName').error.value && getField('firstName').touched.value ? 'error' : ''}
                />
                {() => getField('firstName').error.value && getField('firstName').touched.value && (
                  <span class="error-message">{getField('firstName').error.value}</span>
                )}
              </div>

              <div class="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={getField('lastName').value.value}
                  onInput={(e: Event) => form.setFieldValue('lastName', (e.target as HTMLInputElement).value)}
                  onBlur={() => form.setFieldTouched('lastName', true)}
                  class={getField('lastName').error.value && getField('lastName').touched.value ? 'error' : ''}
                />
                {() => getField('lastName').error.value && getField('lastName').touched.value && (
                  <span class="error-message">{getField('lastName').error.value}</span>
                )}
              </div>
            </div>

            <div class="form-group">
              <label>Birth Date</label>
              <input
                type="date"
                value={getField('birthDate').value.value}
                onInput={(e: Event) => form.setFieldValue('birthDate', (e.target as HTMLInputElement).value)}
                onBlur={() => form.setFieldTouched('birthDate', true)}
                class={getField('birthDate').error.value && getField('birthDate').touched.value ? 'error' : ''}
              />
              {() => getField('birthDate').error.value && getField('birthDate').touched.value && (
                <span class="error-message">{getField('birthDate').error.value}</span>
              )}
            </div>
          </div>
        )}

        {() => currentStep.value === 2 && (
          <div>
            <h4>Step 2: Contact Information</h4>
            <div class="form-group">
              <label>Email</label>
              <input
                type="email"
                value={getField('email').value.value}
                onInput={(e: Event) => form.setFieldValue('email', (e.target as HTMLInputElement).value)}
                onBlur={() => form.setFieldTouched('email', true)}
                class={getField('email').error.value && getField('email').touched.value ? 'error' : ''}
              />
              {() => getField('email').error.value && getField('email').touched.value && (
                <span class="error-message">{getField('email').error.value}</span>
              )}
            </div>

            <div class="form-group">
              <label>Phone</label>
              <input
                type="tel"
                placeholder="+1234567890"
                value={getField('phone').value.value}
                onInput={(e: Event) => form.setFieldValue('phone', (e.target as HTMLInputElement).value)}
                onBlur={() => form.setFieldTouched('phone', true)}
                class={getField('phone').error.value && getField('phone').touched.value ? 'error' : ''}
              />
              {() => getField('phone').error.value && getField('phone').touched.value && (
                <span class="error-message">{getField('phone').error.value}</span>
              )}
            </div>

            <div class="form-group">
              <label>Address</label>
              <textarea
                value={getField('address').value.value}
                onInput={(e: Event) => form.setFieldValue('address', (e.target as HTMLTextAreaElement).value)}
                onBlur={() => form.setFieldTouched('address', true)}
                class={getField('address').error.value && getField('address').touched.value ? 'error' : ''}
              />
              {() => getField('address').error.value && getField('address').touched.value && (
                <span class="error-message">{getField('address').error.value}</span>
              )}
            </div>
          </div>
        )}

        {() => currentStep.value === 3 && (
          <div>
            <h4>Step 3: Preferences</h4>
            <div class="form-group">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.getField<boolean>('newsletter').value.value}
                  onChange={(e: Event) => form.setFieldValue('newsletter', (e.target as HTMLInputElement).checked)}
                />
                Subscribe to newsletter
              </label>
            </div>

            <div class="form-group">
              <label>Notification Preference</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input
                    type="radio"
                    name="notifications"
                    value="email"
                    checked={getField('notifications').value.value === 'email'}
                    onChange={(e: Event) => form.setFieldValue('notifications', (e.target as HTMLInputElement).value)}
                  />
                  Email
                </label>
                <label class="radio-label">
                  <input
                    type="radio"
                    name="notifications"
                    value="sms"
                    checked={getField('notifications').value.value === 'sms'}
                    onChange={(e: Event) => form.setFieldValue('notifications', (e.target as HTMLInputElement).value)}
                  />
                  SMS
                </label>
                <label class="radio-label">
                  <input
                    type="radio"
                    name="notifications"
                    value="none"
                    checked={getField('notifications').value.value === 'none'}
                    onChange={(e: Event) => form.setFieldValue('notifications', (e.target as HTMLInputElement).value)}
                  />
                  None
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Bio (optional)</label>
              <textarea
                placeholder="Tell us about yourself..."
                value={getField('bio').value.value}
                onInput={(e: Event) => form.setFieldValue('bio', (e.target as HTMLTextAreaElement).value)}
                onBlur={() => form.setFieldTouched('bio', true)}
                class={getField('bio').error.value && getField('bio').touched.value ? 'error' : ''}
              />
              <span class="helper-text">
                {() => `${(getField('bio').value.value as string).length}/500 characters`}
              </span>
              {() => getField('bio').error.value && getField('bio').touched.value && (
                <span class="error-message">{getField('bio').error.value}</span>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
          <button
            type="button"
            class="secondary"
            onClick={prevStep}
            disabled={() => currentStep.value === 1}
          >
            Previous
          </button>

          {() => currentStep.value < 3 ? (
            <button type="button" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button
              type="button"
              class="success"
              onClick={() => form.handleSubmit()}
              disabled={form.state.isSubmitting.value}
            >
              {() => form.state.isSubmitting.value ? 'Submitting...' : 'Complete'}
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

// ============================================================================
// 5. DYNAMIC FORM FIELDS (Add/Remove)
// ============================================================================
function DynamicFieldsDemo() {
  const hobbies = signal<string[]>([''])

  const addHobby = () => {
    hobbies.set([...hobbies.value, ''])
  }

  const removeHobby = (index: number) => {
    hobbies.set(hobbies.value.filter((_, i) => i !== index))
  }

  const updateHobby = (index: number, value: string) => {
    const newHobbies = [...hobbies.value]
    newHobbies[index] = value
    hobbies.set(newHobbies)
  }

  return (
    <div class="form-section">
      <h3>Dynamic Form Fields</h3>
      <p class="description">
        Add or remove hobby fields dynamically. Try adding multiple hobbies!
      </p>

      <form>
        <label style={{ marginBottom: '15px', display: 'block' }}>Your Hobbies</label>
        {() => hobbies.value.map((hobby, index) => (
          <div key={index} class="dynamic-field-group">
            {hobbies.value.length > 1 && (
              <button
                type="button"
                class="remove-field-btn"
                onClick={() => removeHobby(index)}
                title="Remove hobby"
              >
                ×
              </button>
            )}
            <div class="form-group" style={{ marginBottom: '0' }}>
              <label>Hobby {index + 1}</label>
              <input
                type="text"
                placeholder="e.g., Reading, Gaming, Cooking..."
                value={hobby}
                onInput={(e: Event) => updateHobby(index, (e.target as HTMLInputElement).value)}
              />
            </div>
          </div>
        ))}

        <button type="button" class="add-field-btn" onClick={addHobby}>
          <span style={{ fontSize: '20px' }}>+</span>
          Add Another Hobby
        </button>

        <div class="data-preview">
          <strong>Current Hobbies:</strong>
          <pre>{() => JSON.stringify(hobbies.value.filter(h => h.trim()), null, 2)}</pre>
        </div>
      </form>
    </div>
  )
}

// ============================================================================
// 6. FORM WITH ALL INPUT TYPES
// ============================================================================
function AllInputTypesDemo() {
  const form = createForm({
    initialValues: {
      text: '',
      email: '',
      password: '',
      number: '',
      tel: '',
      url: '',
      date: '',
      time: '',
      color: '#667eea',
      range: 50,
      checkbox: false,
      radio: 'option1',
      select: '',
      textarea: '',
    },
  })

  return (
    <div class="form-section">
      <h3>All Input Types</h3>
      <p class="description">
        Comprehensive showcase of all HTML5 input types working with Flexium forms.
      </p>

      <form>
        <div class="form-grid">
          <div class="form-group">
            <label>Text Input</label>
            <input
              type="text"
              value={form.getField('text').value.value}
              onInput={(e: Event) => form.setFieldValue('text', (e.target as HTMLInputElement).value)}
              placeholder="Enter text..."
            />
          </div>

          <div class="form-group">
            <label>Email Input</label>
            <input
              type="email"
              value={form.getField('email').value.value}
              onInput={(e: Event) => form.setFieldValue('email', (e.target as HTMLInputElement).value)}
              placeholder="email@example.com"
            />
          </div>

          <div class="form-group">
            <label>Password Input</label>
            <input
              type="password"
              value={form.getField('password').value.value}
              onInput={(e: Event) => form.setFieldValue('password', (e.target as HTMLInputElement).value)}
              placeholder="Enter password..."
            />
          </div>

          <div class="form-group">
            <label>Number Input</label>
            <input
              type="number"
              value={form.getField('number').value.value}
              onInput={(e: Event) => form.setFieldValue('number', (e.target as HTMLInputElement).value)}
              placeholder="Enter number..."
            />
          </div>

          <div class="form-group">
            <label>Telephone Input</label>
            <input
              type="tel"
              value={form.getField('tel').value.value}
              onInput={(e: Event) => form.setFieldValue('tel', (e.target as HTMLInputElement).value)}
              placeholder="+1234567890"
            />
          </div>

          <div class="form-group">
            <label>URL Input</label>
            <input
              type="url"
              value={form.getField('url').value.value}
              onInput={(e: Event) => form.setFieldValue('url', (e.target as HTMLInputElement).value)}
              placeholder="https://example.com"
            />
          </div>

          <div class="form-group">
            <label>Date Input</label>
            <input
              type="date"
              value={form.getField('date').value.value}
              onInput={(e: Event) => form.setFieldValue('date', (e.target as HTMLInputElement).value)}
            />
          </div>

          <div class="form-group">
            <label>Time Input</label>
            <input
              type="time"
              value={form.getField('time').value.value}
              onInput={(e: Event) => form.setFieldValue('time', (e.target as HTMLInputElement).value)}
            />
          </div>

          <div class="form-group">
            <label>Color Picker</label>
            <input
              type="color"
              value={form.getField('color').value.value}
              onInput={(e: Event) => form.setFieldValue('color', (e.target as HTMLInputElement).value)}
            />
            <span class="helper-text">Selected: {() => form.getField('color').value.value}</span>
          </div>

          <div class="form-group">
            <label>Range Slider</label>
            <input
              type="range"
              min="0"
              max="100"
              value={form.getField('range').value.value}
              onInput={(e: Event) => form.setFieldValue('range', parseInt((e.target as HTMLInputElement).value))}
            />
            <span class="helper-text">Value: {() => form.getField('range').value.value}</span>
          </div>

          <div class="form-group">
            <label>Select Dropdown</label>
            <select
              value={form.getField('select').value.value}
              onChange={(e: Event) => form.setFieldValue('select', (e.target as HTMLSelectElement).value)}
            >
              <option value="">Choose an option...</option>
              <option value="option1">Option 1</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Checkbox</label>
          <label class="checkbox-label">
            <input
              type="checkbox"
              checked={form.getField<boolean>('checkbox').value.value}
              onChange={(e: Event) => form.setFieldValue('checkbox', (e.target as HTMLInputElement).checked)}
            />
            I agree to the terms and conditions
          </label>
        </div>

        <div class="form-group">
          <label>Radio Buttons</label>
          <div class="radio-group">
            {['option1', 'option2', 'option3'].map((option) => (
              <label key={option} class="radio-label">
                <input
                  type="radio"
                  name="radio"
                  value={option}
                  checked={form.getField('radio').value.value === option}
                  onChange={(e: Event) => form.setFieldValue('radio', (e.target as HTMLInputElement).value)}
                />
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <div class="form-group">
          <label>Textarea</label>
          <textarea
            value={form.getField('textarea').value.value}
            onInput={(e: Event) => form.setFieldValue('textarea', (e.target as HTMLTextAreaElement).value)}
            placeholder="Enter multi-line text..."
          />
        </div>

        <div class="data-preview">
          <strong>Form Data:</strong>
          <pre>{() => JSON.stringify(form.state.data.value, null, 2)}</pre>
        </div>
      </form>
    </div>
  )
}

// ============================================================================
// MAIN APP
// ============================================================================
function App() {
  return (
    <div class="container">
      <h1>Flexium Form Handling Demo</h1>
      <p class="description">
        Comprehensive demonstration of Flexium's signal-based form primitives with validation,
        async operations, and dynamic fields.
      </p>

      <div class="info-box">
        <strong>Features Demonstrated:</strong>
        <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
          <li>Signal-based reactive forms</li>
          <li>Built-in and custom validators</li>
          <li>Real-time validation feedback</li>
          <li>Async validation (username availability)</li>
          <li>Multi-step wizard with step validation</li>
          <li>Dynamic form fields (add/remove)</li>
          <li>All HTML5 input types</li>
          <li>Form state management (dirty, touched, errors)</li>
          <li>Form submission and reset</li>
        </ul>
      </div>

      <BasicFormDemo />
      <RealTimeValidationDemo />
      <AsyncValidationDemo />
      <MultiStepWizardDemo />
      <DynamicFieldsDemo />
      <AllInputTypesDemo />

      <div class="info-box" style={{ marginTop: '40px' }}>
        <strong>API Reference:</strong>
        <ul style={{ marginTop: '10px', marginLeft: '20px' }}>
          <li><code>createForm(config)</code> - Create a new form instance</li>
          <li><code>validators.required()</code> - Field is required</li>
          <li><code>validators.email()</code> - Valid email format</li>
          <li><code>validators.minLength(n)</code> - Minimum length validation</li>
          <li><code>validators.maxLength(n)</code> - Maximum length validation</li>
          <li><code>validators.min(n)</code> - Minimum value validation</li>
          <li><code>validators.max(n)</code> - Maximum value validation</li>
          <li><code>validators.pattern(regex)</code> - Pattern matching</li>
          <li><code>validators.custom(fn)</code> - Custom validation function</li>
        </ul>
      </div>
    </div>
  )
}

// Mount the app
const root = document.getElementById('app')
if (root) {
  mount(App, root)
}
