import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "signalMutation";
type Options = [];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description:
        "Warn about direct object/array mutations in signals without reassignment",
    },
    messages: {
      signalMutation:
        'Direct mutation of signal "{{name}}" detected. Signals containing objects/arrays should be updated immutably (e.g., {{name}}.value = {...{{name}}.value, ...}).',
    },
    schema: [],
  },
  create(context) {
    // Track signal variables
    const signalVariables = new Set<string>();

    return {
      // Track signal declarations
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (
          node.init?.type === "CallExpression" &&
          node.init.callee.type === "Identifier"
        ) {
          const calleeName = node.init.callee.name;

          if (calleeName === "signal" || calleeName === "computed") {
            if (node.id.type === "Identifier") {
              signalVariables.add(node.id.name);
            }
          }

          if (calleeName === "state") {
            if (
              node.id.type === "ArrayPattern" &&
              node.id.elements[0]?.type === "Identifier"
            ) {
              signalVariables.add(node.id.elements[0].name);
            }
          }
        }
      },

      // Check for mutations like signal.value.property = x
      AssignmentExpression(node: TSESTree.AssignmentExpression) {
        // Check if left side is signal.value.property
        if (node.left.type === "MemberExpression") {
          let current: TSESTree.MemberExpression | TSESTree.Expression =
            node.left;

          // Walk up the member expression chain
          while (current.type === "MemberExpression") {
            const object: TSESTree.Expression = current.object;

            // Check if we reached signal.value
            if (
              object.type === "MemberExpression" &&
              object.property.type === "Identifier" &&
              object.property.name === "value" &&
              object.object.type === "Identifier" &&
              signalVariables.has(object.object.name)
            ) {
              context.report({
                node,
                messageId: "signalMutation",
                data: { name: object.object.name },
              });
              return;
            }

            current = object;
          }
        }
      },

      // Check for mutations like signal.value.push(), signal.value.pop(), etc.
      CallExpression(node: TSESTree.CallExpression) {
        if (node.callee.type === "MemberExpression") {
          const callee = node.callee;
          const methodName =
            callee.property.type === "Identifier" ? callee.property.name : null;

          // Check for array mutating methods
          const mutatingMethods = [
            "push",
            "pop",
            "shift",
            "unshift",
            "splice",
            "sort",
            "reverse",
          ];

          if (methodName && mutatingMethods.includes(methodName)) {
            // Check if called on signal.value
            if (
              callee.object.type === "MemberExpression" &&
              callee.object.property.type === "Identifier" &&
              callee.object.property.name === "value" &&
              callee.object.object.type === "Identifier" &&
              signalVariables.has(callee.object.object.name)
            ) {
              context.report({
                node,
                messageId: "signalMutation",
                data: { name: callee.object.object.name },
              });
            }
          }
        }
      },

      // Check for delete signal.value.property
      UnaryExpression(node: TSESTree.UnaryExpression) {
        if (node.operator === "delete") {
          if (node.argument.type === "MemberExpression") {
            const arg = node.argument;

            // Check if deleting from signal.value
            if (
              arg.object.type === "MemberExpression" &&
              arg.object.property.type === "Identifier" &&
              arg.object.property.name === "value" &&
              arg.object.object.type === "Identifier" &&
              signalVariables.has(arg.object.object.name)
            ) {
              context.report({
                node,
                messageId: "signalMutation",
                data: { name: arg.object.object.name },
              });
            }
          }
        }
      },

      // Check for ++ and -- operators on signal.value properties
      UpdateExpression(node: TSESTree.UpdateExpression) {
        if (node.argument.type === "MemberExpression") {
          const arg = node.argument;

          // Check if updating signal.value.property
          if (
            arg.object.type === "MemberExpression" &&
            arg.object.property.type === "Identifier" &&
            arg.object.property.name === "value" &&
            arg.object.object.type === "Identifier" &&
            signalVariables.has(arg.object.object.name)
          ) {
            context.report({
              node,
              messageId: "signalMutation",
              data: { name: arg.object.object.name },
            });
          }
        }
      },
    };
  },
};

export default rule;
