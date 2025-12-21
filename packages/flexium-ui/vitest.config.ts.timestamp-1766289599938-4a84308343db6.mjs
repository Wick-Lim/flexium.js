// vitest.config.ts
import { defineConfig } from "file:///Users/wick/Documents/workspaces/flexium.js/node_modules/.pnpm/vitest@2.1.9_@types+node@20.19.26_@vitest+ui@1.6.1_jsdom@24.1.3/node_modules/vitest/dist/config.js";
import path from "path";
var __vite_injected_original_dirname = "/Users/wick/Documents/workspaces/flexium.js/packages/flexium-ui";
var vitest_config_default = defineConfig({
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "flexium"
  },
  test: {
    include: ["src/**/__tests__/*.test.ts", "src/**/__tests__/*.test.tsx"],
    exclude: ["**/node_modules/**"],
    environment: "jsdom",
    globals: true,
    testTimeout: 1e4,
    hookTimeout: 1e4,
    pool: "threads",
    fileParallelism: false,
    isolate: true,
    alias: {
      "flexium/jsx-runtime": path.resolve(__vite_injected_original_dirname, "../flexium/src/jsx-runtime.ts"),
      "flexium/jsx-dev-runtime": path.resolve(__vite_injected_original_dirname, "../flexium/src/jsx-runtime.ts"),
      "flexium/css": path.resolve(__vite_injected_original_dirname, "../flexium/src/css/index.ts"),
      "flexium/core": path.resolve(__vite_injected_original_dirname, "../flexium/src/core/index.ts"),
      "flexium/dom": path.resolve(__vite_injected_original_dirname, "../flexium/src/dom/index.ts"),
      "flexium": path.resolve(__vite_injected_original_dirname, "../flexium/src/index.ts")
    }
  }
});
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIi9Vc2Vycy93aWNrL0RvY3VtZW50cy93b3Jrc3BhY2VzL2ZsZXhpdW0uanMvcGFja2FnZXMvZmxleGl1bS11aVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3dpY2svRG9jdW1lbnRzL3dvcmtzcGFjZXMvZmxleGl1bS5qcy9wYWNrYWdlcy9mbGV4aXVtLXVpL3ZpdGVzdC5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3dpY2svRG9jdW1lbnRzL3dvcmtzcGFjZXMvZmxleGl1bS5qcy9wYWNrYWdlcy9mbGV4aXVtLXVpL3ZpdGVzdC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlc3QvY29uZmlnJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgZXNidWlsZDoge1xuICAgIGpzeDogJ2F1dG9tYXRpYycsXG4gICAganN4SW1wb3J0U291cmNlOiAnZmxleGl1bScsXG4gIH0sXG4gIHRlc3Q6IHtcbiAgICBpbmNsdWRlOiBbJ3NyYy8qKi9fX3Rlc3RzX18vKi50ZXN0LnRzJywgJ3NyYy8qKi9fX3Rlc3RzX18vKi50ZXN0LnRzeCddLFxuICAgIGV4Y2x1ZGU6IFsnKiovbm9kZV9tb2R1bGVzLyoqJ10sXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICB0ZXN0VGltZW91dDogMTAwMDAsXG4gICAgaG9va1RpbWVvdXQ6IDEwMDAwLFxuICAgIHBvb2w6ICd0aHJlYWRzJyxcbiAgICBmaWxlUGFyYWxsZWxpc206IGZhbHNlLFxuICAgIGlzb2xhdGU6IHRydWUsXG4gICAgYWxpYXM6IHtcbiAgICAgICdmbGV4aXVtL2pzeC1ydW50aW1lJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2ZsZXhpdW0vc3JjL2pzeC1ydW50aW1lLnRzJyksXG4gICAgICAnZmxleGl1bS9qc3gtZGV2LXJ1bnRpbWUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vZmxleGl1bS9zcmMvanN4LXJ1bnRpbWUudHMnKSxcbiAgICAgICdmbGV4aXVtL2Nzcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9mbGV4aXVtL3NyYy9jc3MvaW5kZXgudHMnKSxcbiAgICAgICdmbGV4aXVtL2NvcmUnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vZmxleGl1bS9zcmMvY29yZS9pbmRleC50cycpLFxuICAgICAgJ2ZsZXhpdW0vZG9tJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2ZsZXhpdW0vc3JjL2RvbS9pbmRleC50cycpLFxuICAgICAgJ2ZsZXhpdW0nOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vZmxleGl1bS9zcmMvaW5kZXgudHMnKSxcbiAgICB9XG4gIH0sXG59KVxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFtWCxTQUFTLG9CQUFvQjtBQUNoWixPQUFPLFVBQVU7QUFEakIsSUFBTSxtQ0FBbUM7QUFHekMsSUFBTyx3QkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsS0FBSztBQUFBLElBQ0wsaUJBQWlCO0FBQUEsRUFDbkI7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVMsQ0FBQyw4QkFBOEIsNkJBQTZCO0FBQUEsSUFDckUsU0FBUyxDQUFDLG9CQUFvQjtBQUFBLElBQzlCLGFBQWE7QUFBQSxJQUNiLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLGFBQWE7QUFBQSxJQUNiLE1BQU07QUFBQSxJQUNOLGlCQUFpQjtBQUFBLElBQ2pCLFNBQVM7QUFBQSxJQUNULE9BQU87QUFBQSxNQUNMLHVCQUF1QixLQUFLLFFBQVEsa0NBQVcsK0JBQStCO0FBQUEsTUFDOUUsMkJBQTJCLEtBQUssUUFBUSxrQ0FBVywrQkFBK0I7QUFBQSxNQUNsRixlQUFlLEtBQUssUUFBUSxrQ0FBVyw2QkFBNkI7QUFBQSxNQUNwRSxnQkFBZ0IsS0FBSyxRQUFRLGtDQUFXLDhCQUE4QjtBQUFBLE1BQ3RFLGVBQWUsS0FBSyxRQUFRLGtDQUFXLDZCQUE2QjtBQUFBLE1BQ3BFLFdBQVcsS0FBSyxRQUFRLGtDQUFXLHlCQUF5QjtBQUFBLElBQzlEO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
