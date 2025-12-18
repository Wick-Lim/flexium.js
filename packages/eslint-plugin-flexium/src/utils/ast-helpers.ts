import type { TSESTree } from "@typescript-eslint/utils";

export const SIGNAL_FUNCTIONS = ["signal", "computed", "useState"];
export const REACTIVE_CONTEXTS = ["useEffect", "computed", "useSync", "root"];
export const SIGNAL_READ_METHODS = ["value", "peek"];

export function isSignalCreation(node: TSESTree.CallExpression): boolean {
  if (node.callee.type === "Identifier") {
    return SIGNAL_FUNCTIONS.includes(node.callee.name);
  }
  return false;
}

export function isReactiveContext(node: TSESTree.CallExpression): boolean {
  if (node.callee.type === "Identifier") {
    return REACTIVE_CONTEXTS.includes(node.callee.name);
  }
  return false;
}

export function isInsideReactiveContext(
  node: TSESTree.Node,
  context: { getAncestors: () => TSESTree.Node[] },
): boolean {
  const ancestors = context.getAncestors();

  for (let i = ancestors.length - 1; i >= 0; i--) {
    const ancestor = ancestors[i];

    if (
      ancestor.type === "CallExpression" &&
      ancestor.callee.type === "Identifier" &&
      REACTIVE_CONTEXTS.includes(ancestor.callee.name)
    ) {
      return true;
    }

    // Check for JSX elements (component render functions are reactive)
    if (ancestor.type === "JSXElement" || ancestor.type === "JSXFragment") {
      return true;
    }

    // Check if inside a function that's passed to a reactive context
    if (
      ancestor.type === "ArrowFunctionExpression" ||
      ancestor.type === "FunctionExpression"
    ) {
      const parent = ancestors[i - 1];
      if (
        parent?.type === "CallExpression" &&
        parent.callee.type === "Identifier" &&
        REACTIVE_CONTEXTS.includes(parent.callee.name)
      ) {
        return true;
      }
    }
  }

  return false;
}

export function isInsideJSX(
  node: TSESTree.Node,
  context: { getAncestors: () => TSESTree.Node[] },
): boolean {
  const ancestors = context.getAncestors();

  for (const ancestor of ancestors) {
    if (ancestor.type === "JSXElement" || ancestor.type === "JSXFragment") {
      return true;
    }
  }

  return false;
}

export function getVariableName(
  node: TSESTree.MemberExpression | TSESTree.CallExpression,
): string | null {
  if (node.type === "MemberExpression" && node.object.type === "Identifier") {
    return node.object.name;
  }
  if (node.type === "CallExpression" && node.callee.type === "Identifier") {
    return node.callee.name;
  }
  return null;
}

export function isFunctionComponent(node: TSESTree.Node): boolean {
  // Check if this is a function that returns JSX
  if (
    node.type === "FunctionDeclaration" ||
    node.type === "ArrowFunctionExpression" ||
    node.type === "FunctionExpression"
  ) {
    // Function name starts with uppercase (component convention)
    if (node.type === "FunctionDeclaration" && node.id) {
      return /^[A-Z]/.test(node.id.name);
    }

    // Check if parent is variable declaration with uppercase name
    if (node.parent?.type === "VariableDeclarator") {
      const declarator = node.parent as TSESTree.VariableDeclarator;
      if (declarator.id.type === "Identifier") {
        return /^[A-Z]/.test(declarator.id.name);
      }
    }
  }

  return false;
}
