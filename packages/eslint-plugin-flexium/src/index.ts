import noSignalOutsideReactive from "./rules/no-signal-outside-reactive";
import effectCleanup from "./rules/effect-cleanup";
import noSideEffectInComputed from "./rules/no-side-effect-in-computed";
import preferSync from "./rules/prefer-sync";
import noMissingDependencies from "./rules/no-missing-dependencies";
import effectDependenciesComplete from "./rules/effect-dependencies-complete";
import noSignalMutation from "./rules/no-signal-mutation";
import noEffectInRender from "./rules/no-effect-in-render";
import preferComputed from "./rules/prefer-computed";
import noCircularDependency from "./rules/no-circular-dependency";
import componentNaming from "./rules/component-naming";
import noSignalReassignment from "./rules/no-signal-reassignment";
import noStateComparison from "./rules/no-state-comparison";

const rules = {
  "no-signal-outside-reactive": noSignalOutsideReactive,
  "effect-cleanup": effectCleanup,
  "no-side-effect-in-computed": noSideEffectInComputed,
  "prefer-sync": preferSync,
  "no-missing-dependencies": noMissingDependencies,
  "effect-dependencies-complete": effectDependenciesComplete,
  "no-signal-mutation": noSignalMutation,
  "no-effect-in-render": noEffectInRender,
  "prefer-computed": preferComputed,
  "no-circular-dependency": noCircularDependency,
  "component-naming": componentNaming,
  "no-signal-reassignment": noSignalReassignment,
  "no-state-comparison": noStateComparison,
};

const configs = {
  recommended: {
    plugins: ["flexium"],
    rules: {
      "flexium/no-signal-outside-reactive": "warn",
      "flexium/effect-cleanup": "warn",
      "flexium/no-side-effect-in-computed": "error",
      "flexium/prefer-sync": "off",
      "flexium/no-missing-dependencies": "warn",
      "flexium/effect-dependencies-complete": "warn",
      "flexium/no-signal-mutation": "warn",
      "flexium/no-effect-in-render": "error",
      "flexium/prefer-computed": "off",
      "flexium/no-circular-dependency": "error",
      "flexium/component-naming": "warn",
      "flexium/no-signal-reassignment": "error",
      "flexium/no-state-comparison": "error",
    },
  },
  strict: {
    plugins: ["flexium"],
    rules: {
      "flexium/no-signal-outside-reactive": "error",
      "flexium/effect-cleanup": "error",
      "flexium/no-side-effect-in-computed": "error",
      "flexium/prefer-sync": "warn",
      "flexium/no-missing-dependencies": "error",
      "flexium/effect-dependencies-complete": "error",
      "flexium/no-signal-mutation": "error",
      "flexium/no-effect-in-render": "error",
      "flexium/prefer-computed": "warn",
      "flexium/no-circular-dependency": "error",
      "flexium/component-naming": "error",
      "flexium/no-signal-reassignment": "error",
      "flexium/no-state-comparison": "error",
    },
  },
  all: {
    plugins: ["flexium"],
    rules: {
      "flexium/no-signal-outside-reactive": "error",
      "flexium/effect-cleanup": "error",
      "flexium/no-side-effect-in-computed": "error",
      "flexium/prefer-sync": "error",
      "flexium/no-missing-dependencies": "error",
      "flexium/effect-dependencies-complete": "error",
      "flexium/no-signal-mutation": "error",
      "flexium/no-effect-in-render": "error",
      "flexium/prefer-computed": "error",
      "flexium/no-circular-dependency": "error",
      "flexium/component-naming": "error",
      "flexium/no-signal-reassignment": "error",
      "flexium/no-state-comparison": "error",
    },
  },
};

export { rules, configs };

export default {
  rules,
  configs,
};
