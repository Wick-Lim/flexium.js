import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "circularDependency";
type Options = [];

interface SignalInfo {
  name: string;
  dependencies: Set<string>;
  node: TSESTree.Node;
}

const rule: TSESLint.RuleModule<MessageIds, Options> = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description: "Detect circular dependencies between signals",
    },
    messages: {
      circularDependency:
        'Circular dependency detected: "{{name}}" depends on signals that eventually depend back on it. This creates an infinite loop: {{cycle}}',
    },
    schema: [],
  },
  create(context) {
    const signals = new Map<string, SignalInfo>();

    // Helper function to find dependencies in a node tree
    const findDependencies = (
      n: TSESTree.Node,
      dependencies: Set<string>,
    ): void => {
      // Check for signal.value
      if (
        n.type === "MemberExpression" &&
        n.property.type === "Identifier" &&
        n.property.name === "value" &&
        n.object.type === "Identifier"
      ) {
        dependencies.add(n.object.name);
      }

      // Check for signal()
      if (
        n.type === "CallExpression" &&
        n.callee.type === "Identifier" &&
        n.arguments.length === 0
      ) {
        dependencies.add(n.callee.name);
      }

      // Recurse
      for (const key in n) {
        const child = (n as unknown as Record<string, unknown>)[key];
        if (child && typeof child === "object") {
          if (Array.isArray(child)) {
            for (const item of child) {
              if (item && typeof item === "object" && "type" in item) {
                findDependencies(item as TSESTree.Node, dependencies);
              }
            }
          } else if ("type" in child) {
            findDependencies(child as TSESTree.Node, dependencies);
          }
        }
      }
    };

    return {
      // Collect signal/computed declarations
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        if (
          node.init?.type === "CallExpression" &&
          node.init.callee.type === "Identifier"
        ) {
          const calleeName = node.init.callee.name;

          if (calleeName === "signal" || calleeName === "computed") {
            let signalName: string | null = null;

            if (node.id.type === "Identifier") {
              signalName = node.id.name;
            }

            if (signalName) {
              const dependencies = new Set<string>();

              // For computed, find what signals it depends on
              if (calleeName === "computed") {
                const callback = node.init.arguments[0];

                if (
                  callback &&
                  (callback.type === "ArrowFunctionExpression" ||
                    callback.type === "FunctionExpression")
                ) {
                  findDependencies(callback.body, dependencies);
                }
              }

              signals.set(signalName, {
                name: signalName,
                dependencies,
                node,
              });
            }
          }
        }
      },

      // After collecting all signals, check for cycles
      "Program:exit"() {
        // Build dependency graph and detect cycles
        function hasCycle(
          signalName: string,
          visited: Set<string>,
          path: string[],
        ): string[] | null {
          if (path.includes(signalName)) {
            // Found a cycle
            return [...path, signalName];
          }

          if (visited.has(signalName)) {
            return null;
          }

          visited.add(signalName);
          const signal = signals.get(signalName);

          if (!signal) return null;

          for (const dep of signal.dependencies) {
            // Only check if the dependency is also a tracked signal
            if (signals.has(dep)) {
              const cycle = hasCycle(dep, visited, [...path, signalName]);
              if (cycle) {
                return cycle;
              }
            }
          }

          return null;
        }

        // Check each signal for cycles
        for (const [signalName, signalInfo] of signals) {
          const visited = new Set<string>();
          const cycle = hasCycle(signalName, visited, []);

          if (cycle) {
            // Report the cycle
            const cycleStr = cycle.join(" -> ");
            context.report({
              node: signalInfo.node,
              messageId: "circularDependency",
              data: {
                name: signalName,
                cycle: cycleStr,
              },
            });
          }
        }
      },
    };
  },
};

export default rule;
