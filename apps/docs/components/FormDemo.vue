<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const container = ref(null)

onMounted(() => {
  if (!container.value) return

  let formData = {
    email: '',
    password: '',
    remember: false
  }
  let errors = {
    email: null,
    password: null
  }
  let touched = {
    email: false,
    password: false
  }
  let isSubmitting = false
  let submitted = false

  const validateEmail = (value) => {
    if (!value) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format'
    return null
  }

  const validatePassword = (value) => {
    if (!value) return 'Password is required'
    if (value.length < 8) return 'At least 8 characters'
    return null
  }

  const render = () => {
    const isValid = !errors.email && !errors.password && formData.email && formData.password

    container.value.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 32px; padding: 24px; background: #f9fafb; border-radius: 12px;">
        <div>
          <h3 style="margin: 0 0 4px 0; color: #111; font-size: 20px; font-weight: 600;">Form Component Demo</h3>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">Signal-based form with built-in validation</p>
        </div>

        ${submitted ? `
          <div style="padding: 20px; background: #d1fae5; border-radius: 8px; text-align: center;">
            <div style="font-size: 32px; margin-bottom: 8px;">✅</div>
            <div style="font-weight: 600; color: #065f46;">Form Submitted Successfully!</div>
            <div style="font-size: 14px; color: #047857; margin-top: 4px;">Email: ${formData.email}</div>
            <button class="reset-btn" style="margin-top: 16px; padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
              Reset Form
            </button>
          </div>
        ` : `
          <form class="demo-form" style="display: flex; flex-direction: column; gap: 16px; max-width: 400px;">
            <!-- Email Field -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-weight: 500; color: #374151; font-size: 14px;">Email</label>
              <input
                type="email"
                class="email-input"
                value="${formData.email}"
                placeholder="Enter your email"
                style="padding: 10px 12px; border: 2px solid ${touched.email && errors.email ? '#ef4444' : '#e5e7eb'}; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
              />
              ${touched.email && errors.email ? `
                <div style="font-size: 12px; color: #ef4444; display: flex; align-items: center; gap: 4px;">
                  <span>⚠️</span> ${errors.email}
                </div>
              ` : ''}
            </div>

            <!-- Password Field -->
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <label style="font-weight: 500; color: #374151; font-size: 14px;">Password</label>
              <input
                type="password"
                class="password-input"
                value="${formData.password}"
                placeholder="Enter your password"
                style="padding: 10px 12px; border: 2px solid ${touched.password && errors.password ? '#ef4444' : '#e5e7eb'}; border-radius: 8px; font-size: 14px; outline: none; transition: border-color 0.2s;"
              />
              ${touched.password && errors.password ? `
                <div style="font-size: 12px; color: #ef4444; display: flex; align-items: center; gap: 4px;">
                  <span>⚠️</span> ${errors.password}
                </div>
              ` : ''}
              <div style="font-size: 12px; color: #9ca3af;">
                ${formData.password.length}/8 characters minimum
              </div>
            </div>

            <!-- Remember Me -->
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input
                type="checkbox"
                class="remember-input"
                ${formData.remember ? 'checked' : ''}
                style="width: 16px; height: 16px; cursor: pointer;"
              />
              <span style="font-size: 14px; color: #374151;">Remember me</span>
            </label>

            <!-- Submit Button -->
            <button
              type="submit"
              class="submit-btn"
              ${!isValid || isSubmitting ? 'disabled' : ''}
              style="padding: 12px 20px; background: ${isValid && !isSubmitting ? '#4f46e5' : '#9ca3af'}; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: ${isValid && !isSubmitting ? 'pointer' : 'not-allowed'}; transition: background 0.2s;"
            >
              ${isSubmitting ? 'Submitting...' : 'Sign In'}
            </button>
          </form>
        `}

        <!-- Form State Display -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Form State (Reactive)</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
            <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">isValid</div>
              <div style="font-weight: 600; color: ${!errors.email && !errors.password && formData.email && formData.password ? '#10b981' : '#ef4444'};">
                ${!errors.email && !errors.password && formData.email && formData.password ? 'true ✓' : 'false ✗'}
              </div>
            </div>
            <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">isDirty</div>
              <div style="font-weight: 600; color: ${formData.email || formData.password ? '#f59e0b' : '#6b7280'};">
                ${formData.email || formData.password ? 'true' : 'false'}
              </div>
            </div>
            <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">touchedFields</div>
              <div style="font-weight: 600; color: #374151; font-size: 12px;">
                [${Object.keys(touched).filter(k => touched[k]).join(', ') || 'none'}]
              </div>
            </div>
            <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
              <div style="font-size: 12px; color: #6b7280; margin-bottom: 4px;">isSubmitting</div>
              <div style="font-weight: 600; color: ${isSubmitting ? '#3b82f6' : '#6b7280'};">
                ${isSubmitting ? 'true' : 'false'}
              </div>
            </div>
          </div>
        </div>

        <div style="padding: 16px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
          <div style="font-weight: 600; color: #1e40af; margin-bottom: 4px;">Built-in Validators</div>
          <div style="font-size: 14px; color: #3b82f6;">
            required(), email(), minLength(), maxLength(), pattern(), custom()
          </div>
        </div>
      </div>
    `

    // Add event listeners
    const form = container.value.querySelector('.demo-form')
    const emailInput = container.value.querySelector('.email-input')
    const passwordInput = container.value.querySelector('.password-input')
    const rememberInput = container.value.querySelector('.remember-input')
    const resetBtn = container.value.querySelector('.reset-btn')

    if (emailInput) {
      emailInput.addEventListener('input', (e) => {
        formData.email = e.target.value
        if (touched.email) {
          errors.email = validateEmail(formData.email)
        }
        render()
      })
      emailInput.addEventListener('blur', () => {
        touched.email = true
        errors.email = validateEmail(formData.email)
        render()
      })
      emailInput.addEventListener('focus', () => {
        emailInput.style.borderColor = '#4f46e5'
      })
    }

    if (passwordInput) {
      passwordInput.addEventListener('input', (e) => {
        formData.password = e.target.value
        if (touched.password) {
          errors.password = validatePassword(formData.password)
        }
        render()
      })
      passwordInput.addEventListener('blur', () => {
        touched.password = true
        errors.password = validatePassword(formData.password)
        render()
      })
      passwordInput.addEventListener('focus', () => {
        passwordInput.style.borderColor = '#4f46e5'
      })
    }

    if (rememberInput) {
      rememberInput.addEventListener('change', (e) => {
        formData.remember = e.target.checked
        render()
      })
    }

    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault()
        touched.email = true
        touched.password = true
        errors.email = validateEmail(formData.email)
        errors.password = validatePassword(formData.password)

        if (!errors.email && !errors.password) {
          isSubmitting = true
          render()

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1500))

          isSubmitting = false
          submitted = true
          render()
        } else {
          render()
        }
      })
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        formData = { email: '', password: '', remember: false }
        errors = { email: null, password: null }
        touched = { email: false, password: false }
        isSubmitting = false
        submitted = false
        render()
      })
    }
  }

  render()
})

onUnmounted(() => {
  if (container.value) {
    container.value.innerHTML = ''
  }
})
</script>

<template>
  <div class="showcase-wrapper">
    <div ref="container" class="flexium-container"></div>
  </div>
</template>

<style scoped>
.showcase-wrapper {
  margin: 40px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
}

.flexium-container :deep(input:focus) {
  border-color: #4f46e5 !important;
}

.flexium-container :deep(button:not(:disabled):hover) {
  filter: brightness(110%);
}
</style>
