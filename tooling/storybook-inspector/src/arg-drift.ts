/**
 * Per-prop drift between the manifest and the story's actual `argTypes`
 * (INSPECTOR.md §4 status indicators, §6). Pure.
 *
 * This is the *story-vs-manifest* drift shown as an inline warning on the specific
 * row — distinct from *code-vs-manifest* staleness (which comes from the shared
 * `computeStalenessCore`). Both surface in the panel; this one traces to the exact
 * property so "something's off" becomes "the `size` options differ."
 */

import { parseEnumValues } from "./controls.js";
import type { PropDefinition } from "@ui-organized/code-connect/browser";

/** The slice of a Storybook argType we compare against. */
export interface StoryArgType {
  options?: unknown[];
  control?: { type?: string; options?: unknown[] } | string;
}

export type ArgDriftKind = "missing-in-story" | "options-mismatch";

export interface ArgDrift {
  prop: string;
  kind: ArgDriftKind;
  detail: string;
}

function optionsOf(argType: StoryArgType | undefined): string[] | undefined {
  if (!argType) return undefined;
  const raw =
    argType.options ??
    (typeof argType.control === "object" ? argType.control.options : undefined);
  return raw?.map(String);
}

/** Compare each manifest prop against the story's argTypes. */
export function computeArgDrift(
  props: PropDefinition[],
  argTypes: Record<string, StoryArgType>,
): ArgDrift[] {
  const drift: ArgDrift[] = [];
  for (const prop of props) {
    const argType = argTypes[prop.name];
    if (!argType) {
      drift.push({
        prop: prop.name,
        kind: "missing-in-story",
        detail: `'${prop.name}' is in the manifest but not in this story's argTypes.`,
      });
      continue;
    }
    const manifestOptions = parseEnumValues(prop.type);
    const storyOptions = optionsOf(argType);
    if (manifestOptions && storyOptions) {
      const a = [...manifestOptions].sort();
      const b = [...storyOptions].sort();
      if (a.length !== b.length || a.some((v, i) => v !== b[i])) {
        drift.push({
          prop: prop.name,
          kind: "options-mismatch",
          detail: `manifest [${manifestOptions.join(", ")}] vs story [${storyOptions.join(", ")}]`,
        });
      }
    }
  }
  return drift;
}

/** Convenience: a set of prop names that have any drift, for quick row lookup. */
export function driftedPropNames(drift: ArgDrift[]): Set<string> {
  return new Set(drift.map((d) => d.prop));
}
