/**
 * Bundles the manager entry (src/manager.tsx → dist/manager.js) for Storybook.
 * React and the `storybook/*` runtime are provided by Storybook's manager, so they
 * stay external; our shared logic (@ui-organized/code-connect/browser) is bundled.
 * CSS is loaded as text and injected as a <style> at runtime (see manager.tsx).
 */
import * as esbuild from "esbuild";

const watch = process.argv.includes("--watch");

const ctx = await esbuild.context({
  entryPoints: ["src/manager.tsx"],
  outfile: "dist/manager.js",
  bundle: true,
  format: "esm",
  target: "es2020",
  jsx: "automatic",
  logLevel: "info",
  loader: { ".css": "text" },
  external: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "storybook", "storybook/*"],
});

if (watch) {
  await ctx.watch();
  console.log("watching…");
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
