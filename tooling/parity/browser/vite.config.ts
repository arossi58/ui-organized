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
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  server: {
    // Playwright reaches the server over 127.0.0.1; the default `localhost`
    // bind is reachable over IPv6 only on some machines.
    host: "127.0.0.1",
    // The case list lives in ../src and is shared with the SSR gate.
    fs: { allow: [".."] },
  },
});
