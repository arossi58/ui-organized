import { defineConfig } from "tsup";

/**
 * Four entries, and the split is the point.
 *
 * `index` must not reach any icon library — that is what makes the optional
 * peers genuinely optional. Each `icons/*` entry is the only module that imports
 * its library, so a consumer who imports `icons/lucide` never resolves Tabler or
 * Heroicons, and a bundler never tries to.
 *
 * Output names are chosen to match the `exports` map in package.json:
 * `dist/icons/lucide.mjs` ← `src/icons/entry-lucide.ts`.
 */
export default defineConfig({
  entry: {
    index: "src/index.ts",
    "icons/lucide": "src/icons/entry-lucide.ts",
    "icons/tabler": "src/icons/entry-tabler.ts",
    "icons/heroicons": "src/icons/entry-heroicons.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  // react/react-dom and the icon peers are externalised from peerDependencies
  // automatically; react is named here to match the previous CLI invocation.
  external: ["react"],
  // Shared modules become a chunk both entries import, rather than being inlined
  // twice. The icon registry doesn't depend on this — it's keyed on globalThis
  // precisely because the CJS build can't split — but it keeps the ESM output
  // from carrying two copies of the component library.
  splitting: true,
  sourcemap: false,
  clean: true,
});
