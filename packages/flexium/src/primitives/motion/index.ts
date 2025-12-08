/**
 * Motion primitives - Declarative animations using Web Animations API
 */

export {
  createMotion,
  useMotion,
  MotionController,
  cleanupMotionState,
  type AnimatableProps,
  type SpringConfig,
  type MotionProps,
} from './Motion'

export {
  Transition,
  TransitionGroup,
  createTransition,
  transitions,
  type TransitionPreset,
  type TransitionTiming,
  type TransitionProps,
  type TransitionGroupProps,
} from './Transition'
