/**
 * Token build entry point.
 *
 * Runs Style Dictionary to generate output/variables.css from the
 * DTCG source files in src/.
 *
 * Usage:
 *   pnpm build:tokens          — generate CSS (runs via tsx)
 *   pnpm build                 — generate CSS then compile TS library
 *
 * When Figma exports are available, run the transform first:
 *   pnpm transform             — convert Figma exports → src/ DTCG files
 *   pnpm build:tokens          — regenerate CSS from updated src/ files
 */

import { buildTokens } from "./config.js";

buildTokens()
  .then(() => {
    console.log("✓ Token CSS built → output/variables.css");
  })
  .catch((err: unknown) => {
    console.error("✗ Token build failed:", err);
    process.exit(1);
  });
