import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "componentNaming";
type Options = [];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce PascalCase naming convention for components",
    },
    messages: {
      componentNaming:
        'Component "{{name}}" should use PascalCase naming convention (e.g., "{{suggestion}}").',
    },
    schema: [],
  },
  create(context) {
    function isPascalCase(name: string): boolean {
      return /^[A-Z][a-zA-Z0-9]*$/.test(name);
    }

    function toPascalCase(name: string): string {
      return name
        .split(/[-_]/)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("");
    }

    function returnsJSX(node: TSESTree.Node): boolean {
      // Check if function returns JSX
      if (node.type === "BlockStatement") {
        for (const statement of node.body) {
          if (statement.type === "ReturnStatement") {
            const arg = statement.argument;
            if (
              arg &&
              (arg.type === "JSXElement" || arg.type === "JSXFragment")
            ) {
              return true;
            }
          }
        }
      }

      // Arrow function with JSX expression body
      if (node.type === "JSXElement" || node.type === "JSXFragment") {
        return true;
      }

      return false;
    }

    return {
      // Check function declarations
      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
        if (!node.id) return;

        const name = node.id.name;

        // Check if this function returns JSX
        if (node.body && returnsJSX(node.body)) {
          if (!isPascalCase(name)) {
            context.report({
              node: node.id,
              messageId: "componentNaming",
              data: {
                name,
                suggestion: toPascalCase(name),
              },
            });
          }
        }
      },

      // Check variable declarations (const Component = () => ...)
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (node.id.type !== "Identifier") return;

        const name = node.id.name;

        // Check if this is a function that returns JSX
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" ||
            node.init.type === "FunctionExpression")
        ) {
          const body = node.init.body;

          if (returnsJSX(body)) {
            if (!isPascalCase(name)) {
              context.report({
                node: node.id,
                messageId: "componentNaming",
                data: {
                  name,
                  suggestion: toPascalCase(name),
                },
              });
            }
          }
        }
      },

      // Check JSX component usage (enforce that used components are PascalCase)
      JSXOpeningElement(node: TSESTree.JSXOpeningElement) {
        if (node.name.type === "JSXIdentifier") {
          const name = node.name.name;

          // Skip HTML elements (lowercase)
          if (name[0] === name[0].toLowerCase()) {
            return;
          }

          // Check if component name is PascalCase
          if (!isPascalCase(name)) {
            context.report({
              node: node.name,
              messageId: "componentNaming",
              data: {
                name,
                suggestion: toPascalCase(name),
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
