import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "stateStrictComparison" | "stateBooleanCoercion";
type Options = [];

/**
 * ESLint rule to prevent direct comparison of useState() values.
 *
 * State values are Proxy objects, so:
 * - `stateValue === 5` always returns false (Proxy !== primitive)
 * - `if (stateValue)` always returns true (Proxy is truthy)
 * - `if (!stateValue)` always returns false
 *
 * Users should use:
 * - `stateValue() === 5` (function call syntax)
 * - `+stateValue === 5` (unary plus for numbers)
 * - `String(stateValue) === 'x'` (String() for strings)
 */
const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevent direct comparison of useState() proxy values which always fail",
    },
    messages: {
      stateStrictComparison:
        'Direct comparison of state "{{name}}" will always fail. State values are Proxy objects. Use {{name}}() for comparison, e.g., `{{name}}() === value`.',
      stateBooleanCoercion:
        'Direct boolean check of state "{{name}}" is unreliable. Proxy objects are always truthy. Use {{name}}() for boolean checks, e.g., `if ({{name}}())`.',
    },
    schema: [],
    hasSuggestions: true,
  },
  create(context) {
    // Track state variables declared via destructuring: const [val, setVal] = useState(...)
    const stateVariables = new Set<string>();

    /**
     * Check if a node is a state variable identifier
     */
    function isStateVariable(node: TSESTree.Node): node is TSESTree.Identifier {
      return node.type === "Identifier" && stateVariables.has(node.name);
    }

    /**
     * Check if a node is accessing state variable (not calling it)
     * Valid: stateVar (just identifier)
     * Invalid for this check: stateVar() (call expression)
     */
    function isDirectStateAccess(node: TSESTree.Node): boolean {
      // Direct identifier access
      if (isStateVariable(node)) {
        return true;
      }
      return false;
    }

    /**
     * Check if the node is a function call of state variable: stateVar()
     */
    function isStateCall(node: TSESTree.Node): boolean {
      return (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        stateVariables.has(node.callee.name)
      );
    }

    /**
     * Check if a comparison operand is safe (called with parentheses or coerced)
     */
    function isSafeAccess(node: TSESTree.Node): boolean {
      // stateVar() - function call is safe
      if (isStateCall(node)) {
        return true;
      }

      // +stateVar - unary plus coercion is safe
      if (
        node.type === "UnaryExpression" &&
        node.operator === "+" &&
        isStateVariable(node.argument)
      ) {
        return true;
      }

      // String(stateVar), Number(stateVar), Boolean(stateVar) - explicit coercion is safe
      if (
        node.type === "CallExpression" &&
        node.callee.type === "Identifier" &&
        ["String", "Number", "Boolean"].includes(node.callee.name)
      ) {
        return true;
      }

      return false;
    }

    return {
      // Track state declarations: const [val, setVal] = useState(...)
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (
          node.init?.type === "CallExpression" &&
          node.init.callee.type === "Identifier" &&
          node.init.callee.name === "useState"
        ) {
          // Handle array destructuring: const [val, setVal] = useState(...)
          if (node.id.type === "ArrayPattern") {
            // First element is the value (proxy)
            const firstElement = node.id.elements[0];
            if (firstElement?.type === "Identifier") {
              stateVariables.add(firstElement.name);
            }
          }
        }
      },

      // Check binary expressions: stateVar === x, stateVar == x, etc.
      BinaryExpression(node: TSESTree.BinaryExpression) {
        const comparisonOperators = ["===", "!==", "==", "!="];

        if (!comparisonOperators.includes(node.operator)) {
          return;
        }

        // Check left operand
        if (isDirectStateAccess(node.left) && !isSafeAccess(node.left)) {
          const name = (node.left as TSESTree.Identifier).name;
          context.report({
            node: node.left,
            messageId: "stateStrictComparison",
            data: { name },
          });
        }

        // Check right operand
        if (isDirectStateAccess(node.right) && !isSafeAccess(node.right)) {
          const name = (node.right as TSESTree.Identifier).name;
          context.report({
            node: node.right,
            messageId: "stateStrictComparison",
            data: { name },
          });
        }
      },

      // Check unary expressions: !stateVar, !!stateVar
      UnaryExpression(node: TSESTree.UnaryExpression) {
        if (node.operator !== "!") {
          return;
        }

        // Direct negation: !stateVar
        if (isDirectStateAccess(node.argument)) {
          const name = (node.argument as TSESTree.Identifier).name;
          context.report({
            node: node.argument,
            messageId: "stateBooleanCoercion",
            data: { name },
          });
        }
      },

      // Check if statements: if (stateVar)
      IfStatement(node: TSESTree.IfStatement) {
        // Direct use in condition: if (stateVar)
        if (isDirectStateAccess(node.test)) {
          const name = (node.test as TSESTree.Identifier).name;
          context.report({
            node: node.test,
            messageId: "stateBooleanCoercion",
            data: { name },
          });
        }
      },

      // Check conditional expressions: stateVar ? a : b
      ConditionalExpression(node: TSESTree.ConditionalExpression) {
        if (isDirectStateAccess(node.test)) {
          const name = (node.test as TSESTree.Identifier).name;
          context.report({
            node: node.test,
            messageId: "stateBooleanCoercion",
            data: { name },
          });
        }
      },

      // Check logical expressions: stateVar && x, stateVar || x
      LogicalExpression(node: TSESTree.LogicalExpression) {
        // Left side of && or || is used as boolean
        if (
          (node.operator === "&&" || node.operator === "||") &&
          isDirectStateAccess(node.left)
        ) {
          const name = (node.left as TSESTree.Identifier).name;
          context.report({
            node: node.left,
            messageId: "stateBooleanCoercion",
            data: { name },
          });
        }
      },

      // Check while statements: while (stateVar)
      WhileStatement(node: TSESTree.WhileStatement) {
        if (isDirectStateAccess(node.test)) {
          const name = (node.test as TSESTree.Identifier).name;
          context.report({
            node: node.test,
            messageId: "stateBooleanCoercion",
            data: { name },
          });
        }
      },

      // Check for statements: for (; stateVar; )
      ForStatement(node: TSESTree.ForStatement) {
        if (node.test && isDirectStateAccess(node.test)) {
          const name = (node.test as TSESTree.Identifier).name;
          context.report({
            node: node.test,
            messageId: "stateBooleanCoercion",
            data: { name },
          });
        }
      },

      // Check do-while statements: do {} while (stateVar)
      DoWhileStatement(node: TSESTree.DoWhileStatement) {
        if (isDirectStateAccess(node.test)) {
          const name = (node.test as TSESTree.Identifier).name;
          context.report({
            node: node.test,
            messageId: "stateBooleanCoercion",
            data: { name },
          });
        }
      },
    };
  },
};

export default rule;
