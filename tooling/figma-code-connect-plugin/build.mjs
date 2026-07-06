/**
 * esbuild bundler for the Code Connect Figma plugin. Mirrors
 * tooling/figma-component-bridge/build.mjs: a sandbox script (`dist/code.js`, has
 * the `figma` API, no React) and a single self-contained UI document
 * (`dist/ui.html`) with the React app's JS + CSS inlined. `--watch` rebuilds.
 */
import * as esbuild from "esbuild";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const watch = process.argv.includes("--watch");

const shared = {
  bundle: true,
  format: "iife",
  target: "es2017",
  logLevel: "info",
  define: { "process.env.NODE_ENV": '"production"' },
};

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
  outdir: "dist",
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
