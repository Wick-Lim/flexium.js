import noSignalOutsideReactive from './rules/no-signal-outside-reactive';
import effectCleanup from './rules/effect-cleanup';
import noSideEffectInComputed from './rules/no-side-effect-in-computed';
import preferBatch from './rules/prefer-batch';

const rules = {
  'no-signal-outside-reactive': noSignalOutsideReactive,
  'effect-cleanup': effectCleanup,
  'no-side-effect-in-computed': noSideEffectInComputed,
  'prefer-batch': preferBatch,
};

const configs = {
  recommended: {
    plugins: ['flexium'],
    rules: {
      'flexium/no-signal-outside-reactive': 'warn',
      'flexium/effect-cleanup': 'warn',
      'flexium/no-side-effect-in-computed': 'error',
      'flexium/prefer-batch': 'off',
    },
  },
  strict: {
    plugins: ['flexium'],
    rules: {
      'flexium/no-signal-outside-reactive': 'error',
      'flexium/effect-cleanup': 'error',
      'flexium/no-side-effect-in-computed': 'error',
      'flexium/prefer-batch': 'warn',
    },
  },
  all: {
    plugins: ['flexium'],
    rules: {
      'flexium/no-signal-outside-reactive': 'error',
      'flexium/effect-cleanup': 'error',
      'flexium/no-side-effect-in-computed': 'error',
      'flexium/prefer-batch': 'error',
    },
  },
};

export { rules, configs };

export default {
  rules,
  configs,
};
