/**
 * CLI for the derived state contract:
 * `pnpm --filter @ui-organized/core gen:state-contract`.
 *
 * The derivation lives in `src/stateContract.ts` so the tests — and the Angular
 * package, which is the reason it exists — can import it without shelling out.
 */
import { STATE_CONTRACT_PATH, writeStateContract } from "../src/stateContract.js";

const contract = writeStateContract();
const attributes = new Set(
  Object.values(contract).flatMap((entry) => Object.keys(entry.attributes)),
);
console.log(
  `✓ ${STATE_CONTRACT_PATH} — ${Object.keys(contract).length} components, ` +
    `${attributes.size} distinct attributes a library must emit`,
);
