import { defineConfig } from "vitest/config";

/**
 * Angular's own TestBed, JIT-compiling in jsdom.
 *
 * No Angular build plugin: `@angular/compiler` compiles the decorators at
 * runtime, which is all a test needs, and the constraint on this package is that
 * nothing third-party comes in behind the CDK. esbuild only has to understand
 * the decorator syntax, hence `experimentalDecorators` — and
 * `useDefineForClassFields: false`, without which a subclass's field
 * initialisers run after the base constructor and blank out what it set.
 */
export default defineConfig({
  esbuild: {
    tsconfigRaw: {
      compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false },
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.spec.ts"],
    setupFiles: ["src/test-setup.ts"],
  },
});
