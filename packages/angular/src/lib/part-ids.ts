/**
 * The two things every hand-written part needs that the shared stylesheet does
 * not provide.
 */

/**
 * A per-instance machine id, in the shape Ark's ids are built from.
 *
 * Ark composes every id as `<scope>:<machine>:<part>`, and the root as
 * `<scope>:<machine>`. The literal value is not the contract and never could be
 * — React 18 produces `:r0:`, Svelte `c1`, Vue `v-0` — but the *shape* is, both
 * because the parity gate normalises ids by recovering the machine from it, and
 * because a consumer debugging a form should see the same structure whichever
 * library rendered it.
 *
 * A module counter rather than a random value, so a page renders the same ids
 * twice running; that matters for snapshot tests and for anyone diffing DOM.
 */
let machines = 0;
export function nextMachineId(): string {
  return `a${machines++}`;
}

/**
 * The inline style Ark puts on the hidden input behind a switch, checkbox or
 * radio — reproduced rather than replaced with a class, because the shared
 * stylesheet does not hide it and a new class would be a rule the other three
 * libraries do not have.
 *
 * The input is what takes focus and what a form submits; the visible track is
 * `aria-hidden` decoration.
 */
export const VISUALLY_HIDDEN_INPUT =
  "border: 0px; clip: rect(0px, 0px, 0px, 0px); height: 1px; margin: -1px; " +
  "overflow: hidden; padding: 0px; position: absolute; width: 1px; " +
  "white-space: nowrap; overflow-wrap: normal;";
