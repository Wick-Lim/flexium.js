import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "preferSync";
type Options = [{ threshold?: number }];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [{ threshold: 2 }],
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Suggest using useSync() when multiple signals are updated consecutively",
    },
    messages: {
      preferSync:
        "Multiple signal updates ({{count}}) detected. Consider using useSync() to prevent cascading re-renders.",
    },
    schema: [
      {
        type: "object",
        properties: {
          threshold: {
            type: "number",
            minimum: 2,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || { threshold: 2 };
    const threshold = options.threshold || 2;

    // Track signal variables
    const signalVariables = new Set<string>();

    // Track consecutive signal updates
    let consecutiveUpdates: TSESTree.Node[] = [];
    let lastStatementEnd = -1;

    function isSignalUpdate(node: TSESTree.Node): boolean {
      // Check assignment to .value property
      if (
        node.type === "AssignmentExpression" &&
        node.left.type === "MemberExpression" &&
        node.left.property.type === "Identifier" &&
        node.left.property.name === "value" &&
        node.left.object.type === "Identifier" &&
        signalVariables.has(node.left.object.name)
      ) {
        return true;
      }

      // Check .set() call
      if (
        node.type === "CallExpression" &&
        node.callee.type === "MemberExpression" &&
        node.callee.property.type === "Identifier" &&
        node.callee.property.name === "set" &&
        node.callee.object.type === "Identifier" &&
        signalVariables.has(node.callee.object.name)
      ) {
        return true;
      }

      // Check setter call from useState() (e.g., setCount(5))
      if (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        node.callee.name.startsWith("set") &&
        node.arguments.length > 0
      ) {
        return true;
      }

      return false;
    }

    function checkConsecutiveUpdates() {
      if (consecutiveUpdates.length >= threshold) {
        context.report({
          node: consecutiveUpdates[0],
          messageId: "preferSync",
          data: {
            count: String(consecutiveUpdates.length),
          },
        });
      }
      consecutiveUpdates = [];
    }

    return {
      // Track signal declarations
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (
          node.init?.type === "CallExpression" &&
          node.init.callee.type === "Identifier"
        ) {
          const calleeName = node.init.callee.name;

          if (calleeName === "signal" && node.id.type === "Identifier") {
            signalVariables.add(node.id.name);
          }

          if (
            calleeName === "useState" &&
            node.id.type === "ArrayPattern" &&
            node.id.elements[1]?.type === "Identifier"
          ) {
            // Track the setter name
            signalVariables.add(node.id.elements[1].name);
            if (node.id.elements[0]?.type === "Identifier") {
              signalVariables.add(node.id.elements[0].name);
            }
          }
        }
      },

      ExpressionStatement(node: TSESTree.ExpressionStatement) {
        // Check if already inside useSync()
        const ancestors = context.getAncestors();
        for (const ancestor of ancestors) {
          if (
            ancestor.type === "CallExpression" &&
            ancestor.callee.type === "Identifier" &&
            ancestor.callee.name === "useSync"
          ) {
            return; // Already inside useSync, don't warn
          }
        }

        const isUpdate = isSignalUpdate(node.expression);

        // Check if this statement is consecutive to the last one
        const isConsecutive =
          lastStatementEnd === -1 || node.range[0] - lastStatementEnd < 50; // Allow some whitespace

        if (isUpdate) {
          if (isConsecutive) {
            consecutiveUpdates.push(node);
          } else {
            checkConsecutiveUpdates();
            consecutiveUpdates = [node];
          }
        } else {
          checkConsecutiveUpdates();
        }

        lastStatementEnd = node.range[1];
      },

      "Program:exit"() {
        checkConsecutiveUpdates();
      },

      "BlockStatement:exit"() {
        checkConsecutiveUpdates();
      },
    };
  },
};

export default rule;
