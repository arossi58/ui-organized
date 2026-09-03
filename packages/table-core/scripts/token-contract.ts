/**
 * The derived token contract for this package: every CSS custom property the
 * table's stylesheets consume but do not define, and which a theme is therefore
 * responsible for supplying.
 *
 * The derivation is `@ui-organized/core`'s — reused rather than copied, because
 * two implementations of "which tokens does this CSS need" is exactly how the
 * two answers drift apart. Only the paths differ, and they are this package's.
 *
 * Run as `pnpm --filter @ui-organized/table-core gen:contract`. The checked-in
 * file is asserted up to date by `src/tokenContract.test.ts` and by the lint
 * gate, so a new `var(--token)` shows up as a diff rather than as a theme that
 * silently renders wrong.
 */
import { writeFileSync } from "node:fs";
// Reached by relative path rather than by package specifier, and deliberately:
// this has to run before anything in the workspace has been built, which rules
// out `@ui-organized/core/contract` (that resolves to dist). It is the same
// cross-package reach `core`'s own generator already makes to mirror its
// contract into `packages/react`.
import { deriveContract } from "../../core/src/contract.js";

const CONTRACT_PATH = "token-contract.json";

const { required } = deriveContract("src");
const body = {
  $comment:
    "GENERATED — do not edit. Every CSS custom property the ui-organized table stylesheets consume but do not define; a theme must supply all of them. Regenerate with `pnpm --filter @ui-organized/table-core gen:contract`.",
  tokens: required,
};
writeFileSync(CONTRACT_PATH, `${JSON.stringify(body, null, 2)}\n`, "utf8");
console.log(`✓ ${CONTRACT_PATH} — ${required.length} tokens a theme must supply`);
