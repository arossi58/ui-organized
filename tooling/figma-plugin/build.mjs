/**
 * esbuild bundler for the Figma plugin.
 *
 * Figma loads two artifacts: a sandbox script (`dist/code.js`, has the `figma`
 * API) and a single self-contained UI document (`dist/ui.html`). The UI is a
 * React app that uses the design-system component library, so its bundle pulls
 * in React + `@ui-organized/react` and the design-system CSS; we inline both
 * the JS and the CSS into the HTML template so the manifest points at one file.
 * Pass `--watch` to rebuild on change.
 */
import * as esbuild from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const watch = process.argv.includes("--watch");

const shared = {
  bundle: true,
  format: "iife",
  target: "es2017",
  logLevel: "info",
  // React (and friends) branch on this; without it they reference an undefined
  // `process` in the iframe and ship dev-only warnings.
  define: { "process.env.NODE_ENV": '"production"' },
  // Embed Roboto woff2 as data URIs (offline plugin); the legacy .woff fallback
  // is dropped since Figma's Chromium supports woff2.
  loader: { ".woff2": "dataurl", ".woff": "empty" },
};

/** Inline the bundled UI JS + CSS into src/ui.html → dist/ui.html. */
const inlineHtmlPlugin = {
  name: "inline-html",
  setup(build) {
    build.onEnd(async (result) => {
      if (result.errors.length) return;
      const out = result.outputFiles ?? [];
      const js = out.find((f) => f.path.endsWith(".js"))?.text ?? "";
      const css = out.find((f) => f.path.endsWith(".css"))?.text ?? "";
      const template = await readFile("src/ui.html", "utf8");
      const html = template
        .replace("<!-- INLINE_STYLE -->", () => `<style>\n${css}\n</style>`)
        .replace("<!-- INLINE_SCRIPT -->", () => `<script>\n${js}\n</script>`);
      await mkdir("dist", { recursive: true });
      await writeFile("dist/ui.html", html);
      console.log(`ui.html written (${(html.length / 1024).toFixed(0)} kB)`);
    });
  },
};

const codeCtx = await esbuild.context({
  ...shared,
  entryPoints: ["src/code.ts"],
  outfile: "dist/code.js",
});

const uiCtx = await esbuild.context({
  ...shared,
  entryPoints: ["src/ui.tsx"],
  outdir: "dist", // js + css outputs → kept in memory, inlined into the HTML
  jsx: "automatic",
  write: false,
  plugins: [inlineHtmlPlugin],
});

if (watch) {
  await Promise.all([codeCtx.watch(), uiCtx.watch()]);
  console.log("watching for changes…");
} else {
  await codeCtx.rebuild();
  await uiCtx.rebuild();
  await codeCtx.dispose();
  await uiCtx.dispose();
}
