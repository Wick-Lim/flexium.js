import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "preferComputed";
type Options = [];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Suggest using computed() for derived state instead of use()",
    },
    messages: {
      preferComputed:
        "This effect only updates a signal based on other signals. Consider using computed() instead for better performance and clarity.",
    },
    schema: [],
  },
  create(context) {
    // Track signal variables
    const signalVariables = new Set<string>();
    const setterFunctions = new Set<string>();

    return {
      // Track signal declarations
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (
          node.init?.type === "CallExpression" &&
          node.init.callee.type === "Identifier"
        ) {
          const calleeName = node.init.callee.name;

          if (calleeName === "signal") {
            if (node.id.type === "Identifier") {
              signalVariables.add(node.id.name);
            }
          }

          if (calleeName === "useState") {
            if (node.id.type === "ArrayPattern") {
              if (node.id.elements[0]?.type === "Identifier") {
                signalVariables.add(node.id.elements[0].name);
              }
              if (node.id.elements[1]?.type === "Identifier") {
                setterFunctions.add(node.id.elements[1].name);
              }
            }
          }
        }
      },

      CallExpression(node: TSESTree.CallExpression) {
        // Check if this is an use() call
        if (
          node.callee.type !== "Identifier" ||
          node.callee.name !== "useEffect"
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

        // Skip if effect returns a cleanup function
        if (
          callback.body.type === "BlockStatement" &&
          callback.body.body.some(
            (stmt) =>
              stmt.type === "ReturnStatement" &&
              (stmt.argument?.type === "ArrowFunctionExpression" ||
                stmt.argument?.type === "FunctionExpression"),
          )
        ) {
          return;
        }

        // Analyze the effect body
        let hasOnlySignalUpdate = false;
        let updateCount = 0;
        let hasSideEffects = false;

        function analyzeNode(node: TSESTree.Node) {
          // Check for signal updates
          if (
            node.type === "AssignmentExpression" &&
            node.left.type === "MemberExpression" &&
            node.left.property.type === "Identifier" &&
            node.left.property.name === "value" &&
            node.left.object.type === "Identifier" &&
            signalVariables.has(node.left.object.name)
          ) {
            updateCount++;
            return;
          }

          // Check for setter calls
          if (
            node.type === "CallExpression" &&
            node.callee.type === "Identifier" &&
            setterFunctions.has(node.callee.name)
          ) {
            updateCount++;
            return;
          }

          // Check for side effects
          if (node.type === "CallExpression") {
            if (
              node.callee.type === "MemberExpression" &&
              node.callee.object.type === "Identifier" &&
              node.callee.object.name === "console"
            ) {
              hasSideEffects = true;
            }

            if (
              node.callee.type === "Identifier" &&
              (node.callee.name === "fetch" ||
                node.callee.name === "setTimeout" ||
                node.callee.name === "setInterval")
            ) {
              hasSideEffects = true;
            }
          }

          // Recurse
          for (const key in node) {
            const child = (node as unknown as Record<string, unknown>)[key];
            if (child && typeof child === "object") {
              if (Array.isArray(child)) {
                for (const item of child) {
                  if (item && typeof item === "object" && "type" in item) {
                    analyzeNode(item as TSESTree.Node);
                  }
                }
              } else if ("type" in child) {
                analyzeNode(child as TSESTree.Node);
              }
            }
          }
        }

        if (callback.body) {
          analyzeNode(callback.body);
        }

        // If effect only contains signal updates and no side effects, suggest computed
        if (updateCount === 1 && !hasSideEffects) {
          // Check if the effect body is simple enough
          if (callback.body.type === "BlockStatement") {
            const statements = callback.body.body;
            // Simple case: single expression statement with assignment
            if (
              statements.length === 1 &&
              statements[0].type === "ExpressionStatement"
            ) {
              hasOnlySignalUpdate = true;
            }
          } else {
            // Arrow function with direct assignment
            hasOnlySignalUpdate = true;
          }

          if (hasOnlySignalUpdate) {
            context.report({
              node,
              messageId: "preferComputed",
            });
          }
        }
      },
    };
  },
};

export default rule;
