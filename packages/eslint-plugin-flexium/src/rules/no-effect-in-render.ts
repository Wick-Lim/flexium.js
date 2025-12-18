import type { TSESLint, TSESTree } from "@typescript-eslint/utils";
import { isFunctionComponent } from "../utils/ast-helpers";

type MessageIds = "effectInRender";
type Options = [];

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description: "Prevent calling use() in component render body",
    },
    messages: {
      effectInRender:
        "use() should not be called during component render. Effects should be created at module level or inside other effects/lifecycle hooks.",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node: TSESTree.CallExpression) {
        // Check if this is a use() effect call
        if (
          node.callee.type !== "Identifier" ||
          node.callee.name !== "use"
        ) {
          return;
        }

        // Must have function as first arg and deps to be an effect
        if (node.arguments.length < 2) return;
        const firstArg = node.arguments[0];
        if (
          firstArg.type !== "ArrowFunctionExpression" &&
          firstArg.type !== "FunctionExpression"
        ) {
          return;
        }

        // Check if we're inside a function component
        const ancestors = context.getAncestors();

        for (let i = ancestors.length - 1; i >= 0; i--) {
          const ancestor = ancestors[i];

          // If we find a function component, check if effect is in its body
          if (isFunctionComponent(ancestor)) {
            // Check if use() is called directly in the component body
            // (not inside another function or effect)
            let isDirectlyInComponent = true;

            // Look for any intermediate functions between component and effect
            for (let j = i + 1; j < ancestors.length; j++) {
              const intermediate = ancestors[j];

              // If there's another function/effect between component and this effect call,
              // it's probably okay
              if (
                intermediate.type === "ArrowFunctionExpression" ||
                intermediate.type === "FunctionExpression" ||
                intermediate.type === "FunctionDeclaration"
              ) {
                // Unless it's the effect callback itself
                const parent = ancestors[j - 1];
                if (
                  parent?.type === "CallExpression" &&
                  parent.callee.type === "Identifier" &&
                  parent.callee.name === "use"
                ) {
                  continue;
                }
                isDirectlyInComponent = false;
                break;
              }

              // Also check for other reactive contexts
              if (
                intermediate.type === "CallExpression" &&
                intermediate.callee.type === "Identifier" &&
                (intermediate.callee.name === "use" ||
                  intermediate.callee.name === "computed" ||
                  intermediate.callee.name === "sync")
              ) {
                isDirectlyInComponent = false;
                break;
              }
            }

            if (isDirectlyInComponent) {
              context.report({
                node,
                messageId: "effectInRender",
              });
              return;
            }
          }
        }
      },
    };
  },
};

export default rule;
