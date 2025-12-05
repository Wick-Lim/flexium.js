import type { Plugin, HmrContext } from "vite";

export interface FlexiumPluginOptions {
  /**
   * Enable JSX transform for Flexium
   * @default true
   */
  jsx?: boolean;

  /**
   * Enable Hot Module Replacement for components
   * @default true
   */
  hmr?: boolean;

  /**
   * Enable DevTools integration
   * @default true in development
   */
  devtools?: boolean;

  /**
   * Include patterns for processing
   * @default [/\.[jt]sx?$/]
   */
  include?: (string | RegExp)[];

  /**
   * Exclude patterns from processing
   * @default [/node_modules/]
   */
  exclude?: (string | RegExp)[];

  /**
   * Enable auto-imports for Flexium primitives
   * @default false
   */
  autoImport?: boolean;
}

const defaultOptions: Required<FlexiumPluginOptions> = {
  jsx: true,
  hmr: true,
  devtools: true,
  include: [/\.[jt]sx?$/],
  exclude: [/node_modules/],
  autoImport: false,
};

/**
 * Vite plugin for Flexium
 *
 * Features:
 * - JSX transform using Flexium's h() function
 * - Hot Module Replacement for components
 * - DevTools integration
 * - Auto-imports (optional)
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import flexium from 'vite-plugin-flexium';
 *
 * export default defineConfig({
 *   plugins: [flexium()],
 * });
 * ```
 */
export function flexium(options: FlexiumPluginOptions = {}): Plugin[] {
  const opts = { ...defaultOptions, ...options };

  const plugins: Plugin[] = [];

  // JSX Transform Plugin
  if (opts.jsx) {
    plugins.push(createJsxPlugin(opts));
  }

  // HMR Plugin
  if (opts.hmr) {
    plugins.push(createHmrPlugin(opts));
  }

  // DevTools Plugin
  plugins.push(createDevToolsPlugin(opts));

  // Auto-import Plugin
  if (opts.autoImport) {
    plugins.push(createAutoImportPlugin(opts));
  }

  return plugins;
}

/**
 * JSX Transform Plugin
 * Configures esbuild to use Flexium's h() and Fragment
 */
function createJsxPlugin(_opts: Required<FlexiumPluginOptions>): Plugin {
  return {
    name: "vite-plugin-flexium:jsx",
    enforce: "pre",

    config() {
      return {
        esbuild: {
          jsxFactory: "h",
          jsxFragment: "Fragment",
          jsxInject: `import { h, Fragment } from 'flexium'`,
        },
        optimizeDeps: {
          include: ["flexium"],
        },
        resolve: {
          dedupe: ["flexium"],
        },
      };
    },
  };
}

/**
 * HMR Plugin
 * Enables component-level hot reloading
 */
function createHmrPlugin(opts: Required<FlexiumPluginOptions>): Plugin {
  const hmrBoundaryModules = new Set<string>();

  return {
    name: "vite-plugin-flexium:hmr",
    enforce: "post",

    transform(code: string, id: string) {
      // Skip non-matching files
      if (!shouldProcess(id, opts)) {
        return null;
      }

      // Check if this file exports a Flexium component
      const hasComponent =
        /export\s+(default\s+)?function\s+\w+\s*\(/.test(code) ||
        /export\s+const\s+\w+\s*=\s*\(/.test(code);

      if (!hasComponent) {
        return null;
      }

      // Track this module as an HMR boundary
      hmrBoundaryModules.add(id);

      // Inject HMR accept code
      const hmrCode = `
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // Flexium will handle component re-render through signals
      window.__FLEXIUM_HMR__?.handleUpdate?.(${JSON.stringify(id)}, newModule);
    }
  });
}
`;

      return {
        code: code + hmrCode,
        map: null,
      };
    },

    handleHotUpdate(ctx: HmrContext) {
      const { file, modules } = ctx;

      // Check if this is a Flexium component
      if (!shouldProcess(file, opts)) {
        return;
      }

      // Let Vite handle the update with our injected code
      return modules;
    },
  };
}

/**
 * DevTools Plugin
 * Adds development tools support
 */
function createDevToolsPlugin(opts: Required<FlexiumPluginOptions>): Plugin {
  return {
    name: "vite-plugin-flexium:devtools",

    config(_config, { mode }) {
      const isDev = mode === "development";

      return {
        define: {
          __DEV__: JSON.stringify(isDev),
          __FLEXIUM_VERSION__: JSON.stringify(getFlexiumVersion()),
          "process.env.NODE_ENV": JSON.stringify(mode),
        },
      };
    },

    transformIndexHtml(html: string, { server }) {
      // Only inject devtools in development
      if (!server || !opts.devtools) {
        return html;
      }

      const devtoolsScript = `
<script type="module">
  // Flexium DevTools initialization
  window.__FLEXIUM_DEVTOOLS__ = {
    version: ${JSON.stringify(getFlexiumVersion())},
    enabled: true,
    signals: new Map(),
    effects: new Map(),
    components: new Map(),
  };

  // HMR handler
  window.__FLEXIUM_HMR__ = {
    handleUpdate(id, newModule) {
      console.log('[Flexium HMR] Updating:', id);
      // Signal-based reactivity handles re-renders automatically
    }
  };
</script>
`;

      // Insert before closing </head> tag
      return html.replace("</head>", `${devtoolsScript}</head>`);
    },
  };
}

/**
 * Auto-import Plugin
 * Automatically imports commonly used Flexium primitives
 */
function createAutoImportPlugin(opts: Required<FlexiumPluginOptions>): Plugin {
  const autoImports = [
    "signal",
    "computed",
    "effect",
    "batch",
    "onCleanup",
    "createContext",
    "useContext",
  ];

  return {
    name: "vite-plugin-flexium:auto-import",
    enforce: "pre",

    transform(code: string, id: string) {
      if (!shouldProcess(id, opts)) {
        return null;
      }

      // Check which auto-imports are used in the code
      const usedImports = autoImports.filter((name) => {
        const regex = new RegExp(`\\b${name}\\s*\\(`);
        return regex.test(code);
      });

      if (usedImports.length === 0) {
        return null;
      }

      // Check if already imported from flexium
      if (/from\s+['"]flexium['"]/.test(code)) {
        return null;
      }

      // Add import statement
      const importStatement = `import { ${usedImports.join(", ")} } from 'flexium';\n`;

      return {
        code: importStatement + code,
        map: null,
      };
    },
  };
}

/**
 * Check if a file should be processed
 */
function shouldProcess(
  id: string,
  opts: Required<FlexiumPluginOptions>,
): boolean {
  // Check exclude patterns
  for (const pattern of opts.exclude) {
    if (typeof pattern === "string") {
      if (id.includes(pattern)) return false;
    } else {
      if (pattern.test(id)) return false;
    }
  }

  // Check include patterns
  for (const pattern of opts.include) {
    if (typeof pattern === "string") {
      if (id.includes(pattern)) return true;
    } else {
      if (pattern.test(id)) return true;
    }
  }

  return false;
}

/**
 * Get Flexium version from package.json
 */
function getFlexiumVersion(): string {
  try {
    // This will be resolved at build time
    return "0.4.6";
  } catch {
    return "unknown";
  }
}

// Default export
export default flexium;

// Named exports for individual plugins
export {
  createJsxPlugin,
  createHmrPlugin,
  createDevToolsPlugin,
  createAutoImportPlugin,
};
