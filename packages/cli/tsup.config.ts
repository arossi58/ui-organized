import { defineConfig } from "tsup";

/**
 * ESM only, with a shebang banner. The bin is meant to be run as
 * `npx @ui-organized/cli`, so startup cost is user-visible: no dependencies to
 * resolve, one file to load.
 */
export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: false,
  banner: { js: "#!/usr/bin/env node" },
});
