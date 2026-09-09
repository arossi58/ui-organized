import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import vue from "@vitejs/plugin-vue";

/**
 * Four pages, one app.
 *
 * One app rather than four, for the same reason the parity harness gives for
 * its three: the pages have to resolve the same workspace packages the same
 * way, and separate configs are four chances to show a stale build of one
 * library beside a fresh build of another. That is exactly the failure a
 * side-by-side preview is supposed to make visible.
 *
 * The pages themselves stay separate, also for the harness's reason: every
 * library portals its overlays into `document.body`, and rendering four
 * libraries into one document interleaves four sets of them.
 *
 * The settings below are not preferences. Each one is load-bearing and was paid
 * for in `tooling/parity/browser/vite.config.ts`.
 */
export default defineConfig({
  root: import.meta.dirname,
  plugins: [svelte({ hot: false }), vue()],

  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
    /**
     * Angular's decorators need `experimentalDecorators`, and
     * `useDefineForClassFields: false` is load-bearing rather than stylistic —
     * with it on, a decorated field's initializer overwrites what the decorator
     * installed and every component silently loses its inputs.
     */
    tsconfigRaw: {
      compilerOptions: { experimentalDecorators: true, useDefineForClassFields: false },
    },
  },

  resolve: {
    /**
     * `style` is for `@angular/cdk/overlay-prebuilt.css`, which the CDK exports
     * under that condition alone. Angular's own builder applies it; Vite does
     * not by default, and the failure is "no known conditions" rather than a
     * missing file, which reads like a broken import. The rest of the list is
     * Vite's default, which naming any condition at all replaces.
     */
    conditions: ["style", "module", "browser", "development|production"],

    /**
     * One copy of each framework runtime, shared with the library that renders
     * against it.
     *
     * The parity harness needs none of this because each of its pages loads a
     * single library. Here all four are workspace links resolving their own
     * peer, and this app declares its own — so React ends up instantiated twice
     * and every hook throws "Invalid hook call", which reads as a broken
     * component rather than a broken resolution. Vue and Svelte fail the same
     * way through duplicated reactivity and context.
     */
    dedupe: ["react", "react-dom", "vue", "svelte", "@angular/core", "@angular/common"],
  },

  build: {
    /**
     * es2022 for top-level await, which `entry-angular.ts` uses: `createApplication`
     * is async and the page has nothing to do until it resolves. Vite's default
     * target is es2020, where the failure is a build error naming five browsers
     * rather than anything about the code — and wrapping the entry in an async IIFE
     * to satisfy a target this app has no reason to hold to would be the wrong way
     * round. Every browser this design system supports has had top-level await
     * since 2021.
     */
    target: "es2022",
    rollupOptions: {
      input: {
        index: "index.html",
        react: "react.html",
        svelte: "svelte.html",
        vue: "vue.html",
        angular: "angular.html",
      },
    },
  },

  server: { host: "127.0.0.1", port: 5180, strictPort: true },
});
