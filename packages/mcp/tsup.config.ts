import { defineConfig } from "tsup";

/**
 * `@ui-organized/code-connect` is private, so its code has to travel inside this
 * bundle. tsup externalizes `dependencies` and bundles `devDependencies`, which is
 * why it's listed as the latter.
 */
export default defineConfig({
  entry: { server: "src/server.ts" },
  format: ["esm"],
  clean: true,
  sourcemap: false,
});
