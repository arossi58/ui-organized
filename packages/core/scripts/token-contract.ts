/**
 * CLI for the derived token contract: `pnpm --filter @ui-organized/core gen:contract`.
 *
 * The derivation itself lives in `src/contract.ts` so the tests and the React
 * package's overlay-stacking check can import it without shelling out.
 */
import { CONTRACT_PATH, MIRROR_PATHS, writeContract } from "../src/contract.js";

const tokens = writeContract();
const targets = [CONTRACT_PATH, ...MIRROR_PATHS].join(", ");
console.log(`✓ ${targets} — ${tokens.length} tokens a theme must supply`);
