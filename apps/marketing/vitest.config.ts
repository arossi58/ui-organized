import { defineConfig } from "vitest/config";

// None of the marketing app's unit tests render anything: they cover the theme
// builder's state and export, the docs registry and its data, the lattice math,
// and the copy editor's source rewriting. So the node environment is enough, and
// a test that needs a browser global fakes just that one (savedThemes.test.ts
// brings its own localStorage). Kept separate from vite.config.ts so the build
// config stays free of test concerns.
export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts", "copy-editor/**/*.test.ts", "scripts/**/*.test.ts"],
  },
});
