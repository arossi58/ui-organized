import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";

/**
 * The three harness pages the browser parity gate drives.
 *
 * One Vite app rather than three, because the three pages must resolve the same
 * workspace packages the same way — separate configs are three chances for the
 * gate to compare a stale build of one library against a fresh build of another.
 * The pages themselves stay separate: each library portals into `document.body`,
 * and rendering them together would interleave three sets of overlays in one
 * document.
 */
export default defineConfig({
  // Vite's root defaults to the working directory, not the config file's, and
  // the harness is always launched from the package root.
  root: import.meta.dirname,
  plugins: [svelte({ hot: false }), vue()],
  // Set explicitly rather than inherited from the package's tsconfig, which
  // covers `src` and not this directory.
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
    tsconfigRaw: { compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false } },
  },
  resolve: {
    /**
     * `style` is for `@angular/cdk/overlay-prebuilt.css`, which the CDK exports
     * under that condition alone. Angular's own builder applies it; Vite does
     * not by default, so the import fails with "no known conditions" rather
     * than with a missing file. The rest of the list is Vite's default, which
     * naming any condition at all replaces.
     */
    conditions: ["style", "module", "browser", "development|production"],
  },
  server: {
    // Playwright reaches the server over 127.0.0.1; the default `localhost`
    // bind is reachable over IPv6 only on some machines.
    host: "127.0.0.1",
    // The case list lives in ../src and is shared with the SSR gate.
    fs: { allow: [".."] },
  },
});
