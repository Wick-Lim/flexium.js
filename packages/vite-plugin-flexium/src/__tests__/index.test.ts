import { describe, it, expect, vi } from 'vitest';
import type { HmrContext } from 'vite';
import {
  flexium,
  createJsxPlugin,
  createHmrPlugin,
  createDevToolsPlugin,
  createAutoImportPlugin,
} from '../index';

// Helper function to call plugin hooks that might be functions or objects
function callPluginHook(hook: any, ...args: any[]): any {
  if (!hook) return undefined;
  if (typeof hook === 'function') {
    return hook(...args);
  }
  if (typeof hook === 'object' && 'handler' in hook && typeof hook.handler === 'function') {
    return hook.handler(...args);
  }
  if (typeof hook === 'object' && 'transform' in hook && typeof hook.transform === 'function') {
    return hook.transform(...args);
  }
  return undefined;
}

describe('vite-plugin-flexium', () => {
  describe('flexium() function', () => {
    it('should return array of plugins with default options', () => {
      const plugins = flexium();
      expect(Array.isArray(plugins)).toBe(true);
      expect(plugins.length).toBeGreaterThan(0);
    });

    it('should return correct plugins when all features enabled', () => {
      const plugins = flexium({
        jsx: true,
        hmr: true,
        devtools: true,
        autoImport: true,
      });

      // Should have: JSX, HMR, DevTools, AutoImport
      expect(plugins.length).toBe(4);
      expect(plugins[0].name).toBe('vite-plugin-flexium:jsx');
      expect(plugins[1].name).toBe('vite-plugin-flexium:hmr');
      expect(plugins[2].name).toBe('vite-plugin-flexium:devtools');
      expect(plugins[3].name).toBe('vite-plugin-flexium:auto-import');
    });

    it('should exclude JSX plugin when jsx is false', () => {
      const plugins = flexium({ jsx: false });
      const pluginNames = plugins.map((p) => p.name);
      expect(pluginNames).not.toContain('vite-plugin-flexium:jsx');
    });

    it('should exclude HMR plugin when hmr is false', () => {
      const plugins = flexium({ hmr: false });
      const pluginNames = plugins.map((p) => p.name);
      expect(pluginNames).not.toContain('vite-plugin-flexium:hmr');
    });

    it('should always include DevTools plugin', () => {
      const plugins = flexium({ jsx: false, hmr: false });
      const pluginNames = plugins.map((p) => p.name);
      expect(pluginNames).toContain('vite-plugin-flexium:devtools');
    });

    it('should exclude AutoImport plugin when autoImport is false', () => {
      const plugins = flexium({ autoImport: false });
      const pluginNames = plugins.map((p) => p.name);
      expect(pluginNames).not.toContain('vite-plugin-flexium:auto-import');
    });

    it('should include AutoImport plugin when autoImport is true', () => {
      const plugins = flexium({ autoImport: true });
      const pluginNames = plugins.map((p) => p.name);
      expect(pluginNames).toContain('vite-plugin-flexium:auto-import');
    });
  });

  describe('JSX Plugin (createJsxPlugin)', () => {
    it('should have correct plugin name', () => {
      const plugin = createJsxPlugin({
        jsx: true,
        hmr: true,
        devtools: true,
        include: [/\.[jt]sx?$/],
        exclude: [/node_modules/],
        autoImport: false,
      });

      expect(plugin.name).toBe('vite-plugin-flexium:jsx');
    });

    it('should have pre enforcement', () => {
      const plugin = createJsxPlugin({
        jsx: true,
        hmr: true,
        devtools: true,
        include: [/\.[jt]sx?$/],
        exclude: [/node_modules/],
        autoImport: false,
      });

      expect(plugin.enforce).toBe('pre');
    });

    it('should configure esbuild for JSX transform', () => {
      const plugin = createJsxPlugin({
        jsx: true,
        hmr: true,
        devtools: true,
        include: [/\.[jt]sx?$/],
        exclude: [/node_modules/],
        autoImport: false,
      });

      const config = callPluginHook(plugin.config);
      expect(config).toBeDefined();
      expect(config?.esbuild).toEqual({
        jsxFactory: 'h',
        jsxFragment: 'Fragment',
        jsxInject: `import { h, Fragment } from 'flexium'`,
      });
    });

    it('should configure optimizeDeps for flexium', () => {
      const plugin = createJsxPlugin({
        jsx: true,
        hmr: true,
        devtools: true,
        include: [/\.[jt]sx?$/],
        exclude: [/node_modules/],
        autoImport: false,
      });

      const config = callPluginHook(plugin.config);
      expect(config?.optimizeDeps).toEqual({
        include: ['flexium'],
      });
    });

    it('should configure resolve dedupe for flexium', () => {
      const plugin = createJsxPlugin({
        jsx: true,
        hmr: true,
        devtools: true,
        include: [/\.[jt]sx?$/],
        exclude: [/node_modules/],
        autoImport: false,
      });

      const config = callPluginHook(plugin.config);
      expect(config?.resolve).toEqual({
        dedupe: ['flexium'],
      });
    });
  });

  describe('HMR Plugin (createHmrPlugin)', () => {
    const defaultOpts = {
      jsx: true,
      hmr: true,
      devtools: true,
      include: [/\.[jt]sx?$/],
      exclude: [/node_modules/],
      autoImport: false,
    };

    it('should have correct plugin name', () => {
      const plugin = createHmrPlugin(defaultOpts);
      expect(plugin.name).toBe('vite-plugin-flexium:hmr');
    });

    it('should have post enforcement', () => {
      const plugin = createHmrPlugin(defaultOpts);
      expect(plugin.enforce).toBe('post');
    });

    it('should return null for files not matching include patterns', () => {
      const plugin = createHmrPlugin(defaultOpts);
      const result = callPluginHook(plugin.transform, 'const x = 1;', '/test/file.css', {});
      expect(result).toBeNull();
    });

    it('should return null for files matching exclude patterns', () => {
      const plugin = createHmrPlugin(defaultOpts);
      const result = callPluginHook(
        plugin.transform,
        'const x = 1;',
        '/node_modules/package/index.js',
        {}
      );
      expect(result).toBeNull();
    });

    it('should return null for files without component exports', () => {
      const plugin = createHmrPlugin(defaultOpts);
      const code = 'const x = 1;\nconst y = 2;';
      const result = callPluginHook(plugin.transform, code, '/test/file.tsx', {});
      expect(result).toBeNull();
    });

    it('should inject HMR code for files with default function export', () => {
      const plugin = createHmrPlugin(defaultOpts);
      const code = 'export default function MyComponent() { return <div />; }';
      const result = callPluginHook(plugin.transform, code, '/test/MyComponent.tsx', {});

      expect(result).not.toBeNull();
      expect(result?.code).toContain('import.meta.hot');
      expect(result?.code).toContain('__FLEXIUM_HMR__');
    });

    it('should inject HMR code for files with named function export', () => {
      const plugin = createHmrPlugin(defaultOpts);
      const code = 'export function MyComponent() { return <div />; }';
      const result = callPluginHook(plugin.transform, code, '/test/MyComponent.tsx', {});

      expect(result).not.toBeNull();
      expect(result?.code).toContain('import.meta.hot');
    });

    it('should inject HMR code for files with const arrow function export', () => {
      const plugin = createHmrPlugin(defaultOpts);
      const code = 'export const MyComponent = () => { return <div />; }';
      const result = callPluginHook(plugin.transform, code, '/test/MyComponent.tsx', {});

      expect(result).not.toBeNull();
      expect(result?.code).toContain('import.meta.hot');
    });

    it('should include module id in HMR code', () => {
      const plugin = createHmrPlugin(defaultOpts);
      const code = 'export default function MyComponent() { return <div />; }';
      const id = '/test/MyComponent.tsx';
      const result = callPluginHook(plugin.transform, code, id, {});

      expect(result?.code).toContain(JSON.stringify(id));
    });

    it('should return modules for handleHotUpdate when file matches patterns', () => {
      const plugin = createHmrPlugin(defaultOpts);
      const ctx: HmrContext = {
        file: '/test/component.tsx',
        timestamp: Date.now(),
        modules: [{ id: '/test/component.tsx' }] as any,
        read: vi.fn(),
        server: {} as any,
      };

      const result = callPluginHook(plugin.handleHotUpdate, ctx);
      expect(result).toBe(ctx.modules);
    });

    it('should return undefined for handleHotUpdate when file does not match patterns', () => {
      const plugin = createHmrPlugin(defaultOpts);
      const ctx: HmrContext = {
        file: '/test/styles.css',
        timestamp: Date.now(),
        modules: [{ id: '/test/styles.css' }] as any,
        read: vi.fn(),
        server: {} as any,
      };

      const result = callPluginHook(plugin.handleHotUpdate, ctx);
      expect(result).toBeUndefined();
    });
  });

  describe('DevTools Plugin (createDevToolsPlugin)', () => {
    const defaultOpts = {
      jsx: true,
      hmr: true,
      devtools: true,
      include: [/\.[jt]sx?$/],
      exclude: [/node_modules/],
      autoImport: false,
    };

    it('should have correct plugin name', () => {
      const plugin = createDevToolsPlugin(defaultOpts);
      expect(plugin.name).toBe('vite-plugin-flexium:devtools');
    });

    it('should define __DEV__ as true in development mode', () => {
      const plugin = createDevToolsPlugin(defaultOpts);
      const config = callPluginHook(plugin.config, {}, { command: 'serve', mode: 'development' });

      expect(config?.define).toBeDefined();
      expect(config?.define?.['__DEV__']).toBe(JSON.stringify(true));
    });

    it('should define __DEV__ as false in production mode', () => {
      const plugin = createDevToolsPlugin(defaultOpts);
      const config = callPluginHook(plugin.config, {}, { command: 'build', mode: 'production' });

      expect(config?.define).toBeDefined();
      expect(config?.define?.['__DEV__']).toBe(JSON.stringify(false));
    });

    it('should define __FLEXIUM_VERSION__', () => {
      const plugin = createDevToolsPlugin(defaultOpts);
      const config = callPluginHook(plugin.config, {}, { command: 'serve', mode: 'development' });

      expect(config?.define?.['__FLEXIUM_VERSION__']).toBeDefined();
      expect(config?.define?.['__FLEXIUM_VERSION__']).toBe(JSON.stringify('0.4.6'));
    });

    it('should define process.env.NODE_ENV', () => {
      const plugin = createDevToolsPlugin(defaultOpts);
      const config = callPluginHook(plugin.config, {}, { command: 'serve', mode: 'development' });

      expect(config?.define?.['process.env.NODE_ENV']).toBe(
        JSON.stringify('development')
      );
    });

    it('should inject devtools script in development with server', () => {
      const plugin = createDevToolsPlugin(defaultOpts);
      const html = '<html><head></head><body></body></html>';
      const result = callPluginHook(plugin.transformIndexHtml, html, {
        server: {} as any,
        filename: 'index.html',
        originalUrl: '/',
      });

      expect(result).toContain('__FLEXIUM_DEVTOOLS__');
      expect(result).toContain('__FLEXIUM_HMR__');
      expect(result).toContain('<script type="module">');
    });

    it('should not inject devtools script without server', () => {
      const plugin = createDevToolsPlugin(defaultOpts);
      const html = '<html><head></head><body></body></html>';
      const result = callPluginHook(plugin.transformIndexHtml, html, {
        filename: 'index.html',
        originalUrl: '/',
      });

      expect(result).toBe(html);
    });

    it('should not inject devtools script when devtools is disabled', () => {
      const plugin = createDevToolsPlugin({ ...defaultOpts, devtools: false });
      const html = '<html><head></head><body></body></html>';
      const result = callPluginHook(plugin.transformIndexHtml, html, {
        server: {} as any,
        filename: 'index.html',
        originalUrl: '/',
      });

      expect(result).toBe(html);
    });

    it('should insert devtools script before closing head tag', () => {
      const plugin = createDevToolsPlugin(defaultOpts);
      const html = '<html><head><title>Test</title></head><body></body></html>';
      const result = callPluginHook(plugin.transformIndexHtml, html, {
        server: {} as any,
        filename: 'index.html',
        originalUrl: '/',
      });

      const headCloseIndex = result!.indexOf('</head>');
      const scriptIndex = result!.indexOf('__FLEXIUM_DEVTOOLS__');
      expect(scriptIndex).toBeLessThan(headCloseIndex);
    });
  });

  describe('AutoImport Plugin (createAutoImportPlugin)', () => {
    const defaultOpts = {
      jsx: true,
      hmr: true,
      devtools: true,
      include: [/\.[jt]sx?$/],
      exclude: [/node_modules/],
      autoImport: false,
    };

    it('should have correct plugin name', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      expect(plugin.name).toBe('vite-plugin-flexium:auto-import');
    });

    it('should have pre enforcement', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      expect(plugin.enforce).toBe('pre');
    });

    it('should return null for files not matching patterns', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      const result = callPluginHook(plugin.transform, 'const x = 1;', '/test/file.css', {});
      expect(result).toBeNull();
    });

    it('should return null when no auto-imports are used', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      const code = 'const x = 1;\nconst y = 2;';
      const result = callPluginHook(plugin.transform, code, '/test/file.tsx', {});
      expect(result).toBeNull();
    });

    it('should add import for signal when used', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      const code = 'const count = signal(0);';
      const result = callPluginHook(plugin.transform, code, '/test/file.tsx', {});

      expect(result).not.toBeNull();
      expect(result?.code).toContain("import { signal } from 'flexium'");
    });

    it('should add import for computed when used', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      const code = 'const doubled = computed(() => count.value * 2);';
      const result = callPluginHook(plugin.transform, code, '/test/file.tsx', {});

      expect(result).not.toBeNull();
      expect(result?.code).toContain("import { computed } from 'flexium'");
    });

    it('should add import for effect when used', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      const code = 'effect(() => console.log(count.value));';
      const result = callPluginHook(plugin.transform, code, '/test/file.tsx', {});

      expect(result).not.toBeNull();
      expect(result?.code).toContain("import { effect } from 'flexium'");
    });

    it('should add import for batch when used', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      const code = 'batch(() => { count.value++; name.value = "test"; });';
      const result = callPluginHook(plugin.transform, code, '/test/file.tsx', {});

      expect(result).not.toBeNull();
      expect(result?.code).toContain("import { batch } from 'flexium'");
    });

    it('should add import for onCleanup when used', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      const code = 'onCleanup(() => clearInterval(id));';
      const result = callPluginHook(plugin.transform, code, '/test/file.tsx', {});

      expect(result).not.toBeNull();
      expect(result?.code).toContain("import { onCleanup } from 'flexium'");
    });

    it('should add import for createContext when used', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      const code = 'const ThemeContext = createContext();';
      const result = callPluginHook(plugin.transform, code, '/test/file.tsx', {});

      expect(result).not.toBeNull();
      expect(result?.code).toContain("import { createContext } from 'flexium'");
    });

    it('should add import for useContext when used', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      const code = 'const theme = useContext(ThemeContext);';
      const result = callPluginHook(plugin.transform, code, '/test/file.tsx', {});

      expect(result).not.toBeNull();
      expect(result?.code).toContain("import { useContext } from 'flexium'");
    });

    it('should add multiple imports when multiple primitives are used', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      const code = `
        const count = signal(0);
        const doubled = computed(() => count.value * 2);
        effect(() => console.log(doubled.value));
      `;
      const result = callPluginHook(plugin.transform, code, '/test/file.tsx', {});

      expect(result).not.toBeNull();
      expect(result?.code).toContain('signal');
      expect(result?.code).toContain('computed');
      expect(result?.code).toContain('effect');
    });

    it('should not add imports if already imported from flexium', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      const code = `
        import { signal, computed } from 'flexium';
        const count = signal(0);
        const doubled = computed(() => count.value * 2);
      `;
      const result = callPluginHook(plugin.transform, code, '/test/file.tsx', {});
      expect(result).toBeNull();
    });

    it('should prepend import statement to code', () => {
      const plugin = createAutoImportPlugin(defaultOpts);
      const code = 'const count = signal(0);\nconsole.log(count.value);';
      const result = callPluginHook(plugin.transform, code, '/test/file.tsx', {});

      expect(result?.code).toMatch(/^import.*\n/);
      expect(result?.code).toContain(code);
    });
  });

  describe('shouldProcess helper function', () => {
    it('should process .ts files by default', () => {
      const plugins = flexium();
      const hmrPlugin = plugins.find((p) => p.name === 'vite-plugin-flexium:hmr');
      const result = callPluginHook(hmrPlugin?.transform, 'const x = 1;', '/test/file.ts', {});
      // Should not return null due to non-matching patterns, but due to no component
      expect(result).toBeNull();
    });

    it('should process .tsx files by default', () => {
      const plugins = flexium();
      const hmrPlugin = plugins.find((p) => p.name === 'vite-plugin-flexium:hmr');
      const code = 'export default function Test() {}';
      const result = callPluginHook(hmrPlugin?.transform, code, '/test/file.tsx', {});
      expect(result).not.toBeNull();
    });

    it('should process .js files by default', () => {
      const plugins = flexium();
      const hmrPlugin = plugins.find((p) => p.name === 'vite-plugin-flexium:hmr');
      const code = 'export default function Test() {}';
      const result = callPluginHook(hmrPlugin?.transform, code, '/test/file.js', {});
      expect(result).not.toBeNull();
    });

    it('should process .jsx files by default', () => {
      const plugins = flexium();
      const hmrPlugin = plugins.find((p) => p.name === 'vite-plugin-flexium:hmr');
      const code = 'export default function Test() {}';
      const result = callPluginHook(hmrPlugin?.transform, code, '/test/file.jsx', {});
      expect(result).not.toBeNull();
    });

    it('should not process node_modules by default', () => {
      const plugins = flexium();
      const hmrPlugin = plugins.find((p) => p.name === 'vite-plugin-flexium:hmr');
      const code = 'export default function Test() {}';
      const result = callPluginHook(
        hmrPlugin?.transform,
        code,
        '/node_modules/package/index.js',
        {}
      );
      expect(result).toBeNull();
    });

    it('should respect custom include patterns (string)', () => {
      const plugins = flexium({ include: ['custom-pattern'] });
      const hmrPlugin = plugins.find((p) => p.name === 'vite-plugin-flexium:hmr');
      const code = 'export default function Test() {}';
      const result = callPluginHook(
        hmrPlugin?.transform,
        code,
        '/test/custom-pattern/file.js',
        {}
      );
      expect(result).not.toBeNull();
    });

    it('should respect custom include patterns (regex)', () => {
      const plugins = flexium({ include: [/\.custom$/] });
      const hmrPlugin = plugins.find((p) => p.name === 'vite-plugin-flexium:hmr');
      const code = 'export default function Test() {}';
      const result = callPluginHook(hmrPlugin?.transform, code, '/test/file.custom', {});
      expect(result).not.toBeNull();
    });

    it('should respect custom exclude patterns (string)', () => {
      const plugins = flexium({ exclude: ['excluded'] });
      const hmrPlugin = plugins.find((p) => p.name === 'vite-plugin-flexium:hmr');
      const code = 'export default function Test() {}';
      const result = callPluginHook(hmrPlugin?.transform, code, '/excluded/file.tsx', {});
      expect(result).toBeNull();
    });

    it('should respect custom exclude patterns (regex)', () => {
      const plugins = flexium({ exclude: [/\.excluded\.tsx$/] });
      const hmrPlugin = plugins.find((p) => p.name === 'vite-plugin-flexium:hmr');
      const code = 'export default function Test() {}';
      const result = callPluginHook(hmrPlugin?.transform, code, '/test/file.excluded.tsx', {});
      expect(result).toBeNull();
    });

    it('should prioritize exclude over include', () => {
      const plugins = flexium({
        include: [/\.tsx$/],
        exclude: [/test\.tsx$/],
      });
      const hmrPlugin = plugins.find((p) => p.name === 'vite-plugin-flexium:hmr');
      const code = 'export default function Test() {}';
      const result = callPluginHook(hmrPlugin?.transform, code, '/test/test.tsx', {});
      expect(result).toBeNull();
    });
  });
});
