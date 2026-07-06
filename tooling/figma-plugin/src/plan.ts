/**
 * Shared, Figma-free data shapes for the import preview (dry-run diff) and the
 * export inventory. Kept in its own module so the UI iframe bundle (ui.tsx) can
 * import these types without pulling in any code that touches the `figma`
 * sandbox global — planImport.ts / exportTheme.ts own that side.
 */

/** How a single variable is affected by an import. */
export type ChangeStatus =
  /** No same-named variable exists yet — it will be created. */
  | "add"
  /** A same-named variable exists and at least one value differs. */
  | "update"
  /** A same-named variable exists and every value already matches. */
  | "unchanged";

/** The value of one variable in one mode, in display form. */
export interface PlanCell {
  /** Mode label: "Value" for single-mode collections, "Light" / "Dark" for Semantic. */
  mode: string;
  /** Primary text: the token name when `token` is set, else a hex/rgba string, a number, a font family, or "—". */
  display: string;
  /** CSS color for a swatch, when the cell represents a color; also the raw value revealed on click. */
  color?: string;
  /** When this value references another variable (e.g. a semantic color aliasing a primitive), its token name — shown instead of the raw color. */
  token?: string;
}

/** One variable's before → after picture for the import preview. */
export interface PlanRow {
  collection: string;
  name: string;
  kind: "color" | "number" | "string";
  status: ChangeStatus;
  /** Current values (empty when `status === "add"`). */
  before: PlanCell[];
  /** Values after the import applies. */
  after: PlanCell[];
}

export interface ImportPlan {
  rows: PlanRow[];
  warnings: string[];
  counts: { add: number; update: number; unchanged: number; total: number };
}

/** How variable names are rendered in an inserted table. */
export type NameFormat = "figma" | "css" | "scss";

/** A variable collection the user can pick to insert as a table. */
export interface CollectionSummary {
  id: string;
  name: string;
  modes: { modeId: string; name: string }[];
  variableCount: number;
}

/** One existing variable and its resolved value(s), for the export listing. */
export interface InventoryRow {
  collection: string;
  name: string;
  kind: "color" | "number" | "string";
  cells: PlanCell[];
}
