import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import {
  isInsideReactiveContext,
  isInsideJSX,
  isFunctionComponent,
} from "../utils/ast-helpers";

type MessageIds = "signalOutsideReactive";
type Options = [];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow reading signal values outside of reactive contexts",
    },
    messages: {
      signalOutsideReactive:
        'Signal "{{name}}" is read outside a reactive context (use(), computed, or JSX). This read will not be tracked and won\'t trigger re-renders.',
    },
    schema: [],
  },
  create(context) {
    // Track signals declared in the current scope
    const signalVariables = new Set<string>();

    return {
      // Track signal declarations
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (
          node.init?.type === "CallExpression" &&
          node.init.callee.type === "Identifier"
        ) {
          const calleeName = node.init.callee.name;

          // signal() creates a signal
          if (calleeName === "signal") {
            if (node.id.type === "Identifier") {
              signalVariables.add(node.id.name);
            }
          }

          // use() returns [getter, setter]
          if (calleeName === "use") {
            if (
              node.id.type === "ArrayPattern" &&
              node.id.elements[0]?.type === "Identifier"
            ) {
              signalVariables.add(node.id.elements[0].name);
            }
          }

          // computed() creates a read-only signal
          if (calleeName === "computed") {
            if (node.id.type === "Identifier") {
              signalVariables.add(node.id.name);
            }
          }
        }
      },

      // Check .value property access
      MemberExpression(node: TSESTree.MemberExpression) {
        if (
          node.property.type === "Identifier" &&
          node.property.name === "value" &&
          node.object.type === "Identifier" &&
          signalVariables.has(node.object.name)
        ) {
          // Check if we're inside a function component (which is implicitly reactive)
          const ancestors = context.getAncestors();
          for (const ancestor of ancestors) {
            if (isFunctionComponent(ancestor)) {
              return; // Component functions are reactive
            }
          }

          // Check if inside reactive context or JSX
          if (
            !isInsideReactiveContext(node, context) &&
            !isInsideJSX(node, context)
          ) {
            context.report({
              node,
              messageId: "signalOutsideReactive",
              data: {
                name: node.object.name,
              },
            });
          }
        }
      },

      // Check signal() function call (e.g., count())
      CallExpression(node: TSESTree.CallExpression) {
        if (
          node.callee.type === "Identifier" &&
          signalVariables.has(node.callee.name) &&
          node.arguments.length === 0
        ) {
          // Check if we're inside a function component
          const ancestors = context.getAncestors();
          for (const ancestor of ancestors) {
            if (isFunctionComponent(ancestor)) {
              return; // Component functions are reactive
            }
          }

          // Check if inside reactive context or JSX
          if (
            !isInsideReactiveContext(node, context) &&
            !isInsideJSX(node, context)
          ) {
            context.report({
              node,
              messageId: "signalOutsideReactive",
              data: {
                name: node.callee.name,
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
