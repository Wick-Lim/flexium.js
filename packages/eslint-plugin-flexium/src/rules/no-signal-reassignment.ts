import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "signalReassignment";
type Options = [];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description:
        "Warn about reassigning signal variables (should use .value or .set() instead)",
    },
    messages: {
      signalReassignment:
        'Do not reassign signal variable "{{name}}". Use {{name}}.value = ... or {{name}}.set(...) to update the signal value instead.',
    },
    schema: [],
  },
  create(context) {
    // Track signal variables and their declaration kinds
    const signalVariables = new Map<string, "const" | "let" | "var">();

    return {
      // Track signal declarations
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (
          node.init?.type === "CallExpression" &&
          node.init.callee.type === "Identifier"
        ) {
          const calleeName = node.init.callee.name;

          if (
            calleeName === "signal" ||
            calleeName === "computed" ||
            calleeName === "state"
          ) {
            // Get the declaration kind (const, let, var)
            let parent: TSESTree.Node | undefined = node.parent;
            while (parent && parent.type !== "VariableDeclaration") {
              parent = parent.parent;
            }

            const declKind = (
              parent as TSESTree.VariableDeclaration | undefined
            )?.kind;
            const kind: "const" | "let" | "var" =
              declKind === "const" || declKind === "let" || declKind === "var"
                ? declKind
                : "const";

            if (calleeName === "signal" || calleeName === "computed") {
              if (node.id.type === "Identifier") {
                signalVariables.set(node.id.name, kind);
              }
            }

            if (calleeName === "state") {
              if (
                node.id.type === "ArrayPattern" &&
                node.id.elements[0]?.type === "Identifier"
              ) {
                signalVariables.set(node.id.elements[0].name, kind);
              }
            }
          }
        }
      },

      // Check for reassignments
      AssignmentExpression(node: TSESTree.AssignmentExpression) {
        // Check if left side is a signal variable
        if (node.left.type === "Identifier") {
          const varName = node.left.name;

          if (signalVariables.has(varName)) {
            // This is a reassignment of the signal variable itself
            context.report({
              node,
              messageId: "signalReassignment",
              data: { name: varName },
            });
          }
        }
      },

      // Check for update expressions (++, --)
      UpdateExpression(node: TSESTree.UpdateExpression) {
        if (node.argument.type === "Identifier") {
          const varName = node.argument.name;

          if (signalVariables.has(varName)) {
            context.report({
              node,
              messageId: "signalReassignment",
              data: { name: varName },
            });
          }
        }
      },

      // Note: We could also warn about let/var declarations (signals should be const)
      // but that would require tracking the declaration node during VariableDeclarator
    };
  },
};

export default rule;
