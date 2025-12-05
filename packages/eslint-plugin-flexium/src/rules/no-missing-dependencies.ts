import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "missingDependency";
type Options = [];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description:
        "Ensure all reactive dependencies are tracked in effect/computed",
    },
    messages: {
      missingDependency:
        'Signal "{{name}}" is used but may not be properly tracked as a dependency. Ensure it is accessed within the reactive context.',
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        // Check if this is an effect() or computed() call
        if (
          node.callee.type !== "Identifier" ||
          (node.callee.name !== "effect" && node.callee.name !== "computed")
        ) {
          return;
        }

        const callback = node.arguments[0];
        if (!callback) return;

        if (
          callback.type !== "ArrowFunctionExpression" &&
          callback.type !== "FunctionExpression"
        ) {
          return;
        }

        // Track signal variables that exist in outer scope
        const signalVariables = new Set<string>();
        const usedSignals = new Set<string>();

        // Find signals declared outside this callback
        const ancestors = context.getAncestors();
        const sourceCode = context.getSourceCode();

        // Walk through ancestors to find signal declarations
        for (const ancestor of ancestors) {
          if (ancestor.type === "VariableDeclarator") {
            if (
              ancestor.init?.type === "CallExpression" &&
              ancestor.init.callee.type === "Identifier" &&
              (ancestor.init.callee.name === "signal" ||
                ancestor.init.callee.name === "computed")
            ) {
              if (ancestor.id.type === "Identifier") {
                signalVariables.add(ancestor.id.name);
              }
            }
          }
        }

        // Check if signals are accessed properly in the callback
        function checkNode(node: TSESTree.Node) {
          // Check for signal variable usage without .value or ()
          if (node.type === "Identifier" && signalVariables.has(node.name)) {
            // Check if this is part of a member expression or call expression
            const parent = sourceCode.getNodeByRangeIndex(
              node.range[0],
            )?.parent;

            if (parent) {
              // Allow: signal.value or signal()
              if (
                parent.type === "MemberExpression" &&
                parent.property.type === "Identifier" &&
                parent.property.name === "value"
              ) {
                return; // Valid access
              }
              if (parent.type === "CallExpression" && parent.callee === node) {
                return; // Valid access
              }
            }

            usedSignals.add(node.name);
          }

          // Recurse into children
          for (const key in node) {
            const child = (node as unknown as Record<string, unknown>)[key];
            if (child && typeof child === "object") {
              if (Array.isArray(child)) {
                for (const item of child) {
                  if (item && typeof item === "object" && "type" in item) {
                    checkNode(item as TSESTree.Node);
                  }
                }
              } else if ("type" in child) {
                checkNode(child as TSESTree.Node);
              }
            }
          }
        }

        if (callback.body) {
          checkNode(callback.body);
        }

        // Report signals used without proper access
        for (const signalName of usedSignals) {
          context.report({
            node: callback,
            messageId: "missingDependency",
            data: { name: signalName },
          });
        }
      },
    };
  },
};

export default rule;
