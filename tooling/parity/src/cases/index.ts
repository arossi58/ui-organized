import type { ParitySpec } from "./spec.js";

export type { ParityCase, ParityAllowance, ParityTextAllowance, ParitySpec } from "./spec.js";

/**
 * Every case module in this directory, collected without a list anyone has to
 * remember to edit.
 *
 * A glob rather than a hand-written barrel, because the two failure modes are
 * not symmetric. A barrel entry that is forgotten leaves a component silently
 * uncovered — the gate stays green while saying nothing about it, which is the
 * exact failure this package exists to prevent. A glob cannot forget: dropping
 * a file in the directory is the whole of adding a component, and nothing
 * shared is touched, so several people can add several components at once
 * without editing the same line.
 *
 * `eager` because the specs are plain data read at collection time — the SSR
 * gate builds its `describe` blocks from them before any test runs, and the
 * browser harness reads them synchronously to answer "what can I mount".
 *
 * Sorted explicitly rather than trusting Vite's key order: the gate's test
 * titles are derived from this list, and an order that shifts with a Vite
 * upgrade would make an otherwise empty diff unreadable.
 */
const modules = import.meta.glob<{ default: ParitySpec }>("./*.tsx", { eager: true });

export const SPECS: ParitySpec[] = Object.keys(modules)
  .sort()
  .map((path) => modules[path]!.default);
