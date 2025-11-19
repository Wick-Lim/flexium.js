/**
 * Flexium Primitives
 *
 * UX-first components (Motion, Form, UI elements)
 */

// Re-export core reactivity
export { signal, computed, effect, batch, untrack, root } from './core/signal'
export type { Signal, Computed } from './core/signal'

// Motion primitives
export { MotionController, createMotion, useMotion } from './primitives/motion/Motion'
export type { MotionProps, SpringConfig } from './primitives/motion/Motion'

// Form primitives
export { createForm } from './primitives/form/Form'
export { createInput, createInputField } from './primitives/form/Input'
export type {
  FormState,
  FieldState,
  ValidationRule
} from './primitives/form/Form'

// UI primitives
export { createButton, createIconButton } from './primitives/ui/Button'
export { createText, createHeading, createParagraph, createLabel, createCode } from './primitives/ui/Text'
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize
} from './primitives/ui/Button'
