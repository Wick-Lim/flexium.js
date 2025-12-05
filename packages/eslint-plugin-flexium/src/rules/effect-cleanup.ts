import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "missingCleanup";
type Options = [];

const CLEANUP_REQUIRED_PATTERNS = [
  "addEventListener",
  "setTimeout",
  "setInterval",
  "subscribe",
  "on",
  "observe",
  "watch",
];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce cleanup functions in effects that add event listeners or timers",
    },
    messages: {
      missingCleanup:
        'Effect uses "{{method}}" but does not return a cleanup function. This may cause memory leaks.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        // Check if this is an effect() call
        if (
          node.callee.type !== "Identifier" ||
          node.callee.name !== "effect"
        ) {
          return;
        }

        // Get the callback function
        const callback = node.arguments[0];
        if (!callback) return;

        if (
          callback.type !== "ArrowFunctionExpression" &&
          callback.type !== "FunctionExpression"
        ) {
          return;
        }

        // Track if the callback has cleanup-requiring operations
        const cleanupRequiredMethods: string[] = [];
        let hasReturnStatement = false;

        // Helper to check if a node contains cleanup-requiring patterns
        function checkForCleanupPatterns(
          node: TSESTree.Node,
          methods: string[],
        ) {
          if (node.type === "CallExpression") {
            // Check member expression calls like element.addEventListener
            if (
              node.callee.type === "MemberExpression" &&
              node.callee.property.type === "Identifier"
            ) {
              const methodName = node.callee.property.name;
              if (CLEANUP_REQUIRED_PATTERNS.includes(methodName)) {
                methods.push(methodName);
              }
            }

            // Check direct calls like setTimeout
            if (node.callee.type === "Identifier") {
              const funcName = node.callee.name;
              if (CLEANUP_REQUIRED_PATTERNS.includes(funcName)) {
                methods.push(funcName);
              }
            }
          }

          // Check return statement
          if (node.type === "ReturnStatement" && node.argument) {
            hasReturnStatement = true;
          }

          // Recurse into child nodes
          for (const key in node) {
            const child = (node as Record<string, unknown>)[key];
            if (child && typeof child === "object") {
              if (Array.isArray(child)) {
                for (const item of child) {
                  if (item && typeof item === "object" && "type" in item) {
                    checkForCleanupPatterns(item as TSESTree.Node, methods);
                  }
                }
              } else if ("type" in child) {
                checkForCleanupPatterns(child as TSESTree.Node, methods);
              }
            }
          }
        }

        // Analyze the callback body
        if (callback.body.type === "BlockStatement") {
          checkForCleanupPatterns(callback.body, cleanupRequiredMethods);
        }

        // Report if cleanup-requiring methods found but no return
        if (cleanupRequiredMethods.length > 0 && !hasReturnStatement) {
          context.report({
            node: callback,
            messageId: "missingCleanup",
            data: {
              method: cleanupRequiredMethods[0],
            },
          });
        }
      },
    };
  },
};

export default rule;
