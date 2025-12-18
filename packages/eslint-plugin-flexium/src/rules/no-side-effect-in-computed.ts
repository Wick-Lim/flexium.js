import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "sideEffectInComputed";
type Options = [];

const SIDE_EFFECT_PATTERNS = [
  // Console methods
  "log",
  "warn",
  "error",
  "info",
  "debug",
  // DOM mutations
  "appendChild",
  "removeChild",
  "insertBefore",
  "replaceChild",
  "remove",
  "setAttribute",
  "removeAttribute",
  "classList",
  // Network
  "fetch",
  "XMLHttpRequest",
  // Storage
  "setItem",
  "removeItem",
  "clear",
  // Timers
  "setTimeout",
  "setInterval",
  // Events
  "addEventListener",
  "removeEventListener",
  "dispatchEvent",
];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description: "Disallow side effects in computed functions",
    },
    messages: {
      sideEffectInComputed:
        'Computed functions should be pure. Found side effect: "{{method}}". Use useEffect() for side effects instead.',
    },
    schema: [],
  },
  create(context) {
    let insideComputed = false;

    return {
      CallExpression(node: TSESTree.CallExpression) {
        // Track entering computed()
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "computed"
        ) {
          insideComputed = true;
          return;
        }

        // Also check useState() with a function argument (derived state)
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "useState" &&
          node.arguments[0]?.type === "ArrowFunctionExpression"
        ) {
          // This is derived state, treat like computed
          insideComputed = true;
          return;
        }

        // Check for side effects inside computed
        if (insideComputed) {
          // Check member expression calls
          if (
            node.callee.type === "MemberExpression" &&
            node.callee.property.type === "Identifier"
          ) {
            const methodName = node.callee.property.name;

            // Check console methods
            if (
              node.callee.object.type === "Identifier" &&
              node.callee.object.name === "console"
            ) {
              context.report({
                node,
                messageId: "sideEffectInComputed",
                data: { method: `console.${methodName}` },
              });
              return;
            }

            // Check other side effect patterns
            if (SIDE_EFFECT_PATTERNS.includes(methodName)) {
              context.report({
                node,
                messageId: "sideEffectInComputed",
                data: { method: methodName },
              });
            }
          }

          // Check direct calls like fetch(), setTimeout()
          if (node.callee.type === "Identifier") {
            const funcName = node.callee.name;
            if (SIDE_EFFECT_PATTERNS.includes(funcName)) {
              context.report({
                node,
                messageId: "sideEffectInComputed",
                data: { method: funcName },
              });
            }
          }
        }
      },

      "CallExpression:exit"(node: TSESTree.CallExpression) {
        // Track exiting computed()
        if (
          node.callee.type === "Identifier" &&
          (node.callee.name === "computed" || node.callee.name === "useState")
        ) {
          insideComputed = false;
        }
      },
    };
  },
};

export default rule;
