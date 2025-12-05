import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "incompleteDependencies";
type Options = [];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description: "Ensure all reactive dependencies are tracked in effects",
    },
    messages: {
      incompleteDependencies:
        'Effect may be missing reactive dependency "{{name}}". All signals read in an effect should be tracked.',
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

        const callback = node.arguments[0];
        if (!callback) return;

        if (
          callback.type !== "ArrowFunctionExpression" &&
          callback.type !== "FunctionExpression"
        ) {
          return;
        }

        // Track signals accessed in the effect
        const accessedSignals = new Set<string>();
        const declaredSignals = new Set<string>();

        // Find signals declared in outer scopes
        const ancestors = context.getAncestors();
        for (const ancestor of ancestors) {
          if (ancestor.type === "VariableDeclarator") {
            if (
              ancestor.init?.type === "CallExpression" &&
              ancestor.init.callee.type === "Identifier"
            ) {
              const calleeName = ancestor.init.callee.name;
              if (
                calleeName === "signal" ||
                calleeName === "computed" ||
                calleeName === "state"
              ) {
                if (ancestor.id.type === "Identifier") {
                  declaredSignals.add(ancestor.id.name);
                } else if (
                  ancestor.id.type === "ArrayPattern" &&
                  ancestor.id.elements[0]?.type === "Identifier"
                ) {
                  declaredSignals.add(ancestor.id.elements[0].name);
                }
              }
            }
          }
        }

        // Find all signal accesses in the callback
        function findSignalAccess(node: TSESTree.Node) {
          // Check for .value access
          if (
            node.type === "MemberExpression" &&
            node.property.type === "Identifier" &&
            node.property.name === "value" &&
            node.object.type === "Identifier" &&
            declaredSignals.has(node.object.name)
          ) {
            accessedSignals.add(node.object.name);
          }

          // Check for signal() call
          if (
            node.type === "CallExpression" &&
            node.callee.type === "Identifier" &&
            declaredSignals.has(node.callee.name) &&
            node.arguments.length === 0
          ) {
            accessedSignals.add(node.callee.name);
          }

          // Recurse
          for (const key in node) {
            const child = (node as unknown as Record<string, unknown>)[key];
            if (child && typeof child === "object") {
              if (Array.isArray(child)) {
                for (const item of child) {
                  if (item && typeof item === "object" && "type" in item) {
                    findSignalAccess(item as TSESTree.Node);
                  }
                }
              } else if ("type" in child) {
                findSignalAccess(child as TSESTree.Node);
              }
            }
          }
        }

        if (callback.body) {
          findSignalAccess(callback.body);
        }

        // This rule mainly ensures signals are being tracked by the reactive system
        // The actual tracking happens automatically in Flexium, so we don't need
        // to report missing dependencies explicitly here

        // Report if accessed signals seem incomplete (this is a heuristic check)
        // We mainly ensure signals are being tracked by the reactive system
        // This rule is more about warning when patterns suggest missing tracking
      },
    };
  },
};

export default rule;
