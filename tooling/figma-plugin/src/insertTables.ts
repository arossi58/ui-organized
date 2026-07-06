/**
 * Insert tables of variables as native Figma frames.
 *
 * For each chosen collection we build an auto-layout table:
 *
 *   Name | <mode> | <mode> | … | Scopes
 *
 * There is always a Name column, then one column per mode in the collection,
 * and (optionally) a Scopes column. Colour cells carry a swatch whose fill is
 * bound to the actual variable — with the cell pinned to that column's mode via
 * setExplicitVariableModeForCollection — so the inserted table renders live in
 * the user's colours. The table chrome (surface, text, border) binds to the
 * user's semantic tokens when they exist, so it's "styled with their variables".
 */

import { parseColor, rgbaToCss, type RGBA } from "./color";
import type { CollectionSummary, NameFormat } from "./plan";

type RGB = { r: number; g: number; b: number };

/**
 * Natural sort so embedded numbers order low→high (e.g. gray/50 before gray/100),
 * matching how Figma lists them. localeCompare's `numeric` option isn't reliable
 * in the plugin sandbox, so compare digit / non-digit chunks by hand.
 */
function compareNatural(a: string, b: string): number {
  const ax = a.match(/\d+|\D+/g) ?? [];
  const bx = b.match(/\d+|\D+/g) ?? [];
  const len = Math.min(ax.length, bx.length);
  for (let i = 0; i < len; i++) {
    const as = ax[i]!;
    const bs = bx[i]!;
    if (/^\d/.test(as) && /^\d/.test(bs)) {
      const diff = Number(as) - Number(bs);
      if (diff !== 0) return diff;
    } else if (as !== bs) {
      return as < bs ? -1 : 1;
    }
  }
  return ax.length - bx.length;
}

/** Slashes → dashes for CSS/SCSS identifiers. */
const toDashed = (name: string): string => name.replace(/\//g, "-");

/** Format a full variable name; `figma` uses the short (grouped) label. */
function formatName(fullName: string, label: string, format: NameFormat): string {
  if (format === "css") return `--${toDashed(fullName)}`;
  if (format === "scss") return `$${toDashed(fullName)}`;
  return label;
}

/** Format a referenced variable's name (always the full path, not the group label). */
function formatRef(targetName: string, format: NameFormat): string {
  if (format === "css") return `--${toDashed(targetName)}`;
  if (format === "scss") return `$${toDashed(targetName)}`;
  return targetName;
}

const NAME_W = 240;
const MODE_W = 200;
const SCOPE_W = 240;
const SWATCH = 16;

/** Human labels for Figma variable scopes. */
const SCOPE_LABELS: Record<string, string> = {
  ALL_SCOPES: "All",
  ALL_FILLS: "All fills",
  FRAME_FILL: "Frame fill",
  SHAPE_FILL: "Shape fill",
  TEXT_FILL: "Text fill",
  STROKE_COLOR: "Stroke",
  STROKE_FLOAT: "Stroke width",
  EFFECT_COLOR: "Effect colour",
  EFFECT_FLOAT: "Effect",
  CORNER_RADIUS: "Corner radius",
  GAP: "Gap",
  WIDTH_HEIGHT: "Width/height",
  OPACITY: "Opacity",
  FONT_FAMILY: "Font family",
  FONT_STYLE: "Font style",
  FONT_WEIGHT: "Font weight",
  FONT_SIZE: "Font size",
  LINE_HEIGHT: "Line height",
  LETTER_SPACING: "Letter spacing",
  PARAGRAPH_SPACING: "Paragraph spacing",
  PARAGRAPH_INDENT: "Paragraph indent",
  TEXT_CONTENT: "Text content",
};

function formatScopes(scopes: VariableScope[]): string {
  // An empty array means the variable is hidden from every picker (no scopes) —
  // the opposite of ALL_SCOPES, which exposes it everywhere.
  if (scopes.length === 0) return "None";
  if (scopes.includes("ALL_SCOPES")) return "All";
  return scopes.map((s) => SCOPE_LABELS[s] ?? s.toLowerCase().replace(/_/g, " ")).join(", ");
}

/** Neutral fallbacks used when a matching semantic token isn't in the file. */
const FALLBACK = {
  base: "#f5f5f6", // heading rows (surface/base)
  primary: "#ffffff", // variable rows (surface/primary)
  text: "#1a1a1a",
  textMuted: "#6b7280",
  border: "#e5e7eb",
};
function hexRgb(hex: string): RGB {
  const c = parseColor(hex)!;
  return { r: c.r, g: c.g, b: c.b };
}

export interface InsertResult {
  inserted: number;
  warnings: string[];
}

export async function listCollections(): Promise<CollectionSummary[]> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  const counts = new Map<string, number>();
  for (const v of vars) counts.set(v.variableCollectionId, (counts.get(v.variableCollectionId) ?? 0) + 1);
  return collections.map((c) => ({
    id: c.id,
    name: c.name,
    modes: c.modes.map((m) => ({ modeId: m.modeId, name: m.name })),
    variableCount: counts.get(c.id) ?? 0,
  }));
}

/** Load a UI font available in the file for the table text. */
async function loadFonts(): Promise<{ regular: FontName; bold: FontName }> {
  const tries: Array<{ family: string; regular: string; bold: string }> = [
    { family: "Inter", regular: "Regular", bold: "Semi Bold" },
    { family: "Roboto", regular: "Regular", bold: "Medium" },
  ];
  for (const t of tries) {
    try {
      const regular: FontName = { family: t.family, style: t.regular };
      const bold: FontName = { family: t.family, style: t.bold };
      await figma.loadFontAsync(regular);
      await figma.loadFontAsync(bold);
      return { regular, bold };
    } catch {
      /* try the next family */
    }
  }
  const fonts = await figma.listAvailableFontsAsync();
  const f = fonts[0]!.fontName;
  await figma.loadFontAsync(f);
  return { regular: f, bold: f };
}

export async function insertTables(options: {
  collectionIds: string[];
  includeScopes: boolean;
  format: NameFormat;
}): Promise<InsertResult> {
  const { format } = options;
  const warnings: string[] = [];
  const { regular, bold } = await loadFonts();

  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const colById = new Map(collections.map((c) => [c.id, c] as const));
  const colDefaultMode = new Map(collections.map((c) => [c.id, c.defaultModeId] as const));
  const allVars = await figma.variables.getLocalVariablesAsync();
  const varById = new Map(allVars.map((v) => [v.id, v] as const));

  // ── Theme paints (bind to the user's semantic tokens where present) ──────────
  const semCol = collections.find((c) => c.name === "Semantic");
  const findVar = (name: string): Variable | undefined =>
    semCol ? allVars.find((v) => v.variableCollectionId === semCol.id && v.name === name) : undefined;
  const baseVar = findVar("surface/base");
  const primaryVar = findVar("surface/primary") ?? findVar("surface/raised") ?? baseVar;
  const textVar = findVar("text/primary");
  const mutedVar = findVar("text/secondary");
  const borderVar = findVar("border/secondary") ?? findVar("border/primary");
  const dividerVar = findVar("border/primary") ?? borderVar;

  const paint = (variable: Variable | undefined, fallbackHex: string): SolidPaint => {
    const base: SolidPaint = { type: "SOLID", color: hexRgb(fallbackHex) };
    return variable ? figma.variables.setBoundVariableForPaint(base, "color", variable) : base;
  };
  const basePaint = () => paint(baseVar, FALLBACK.base); // heading rows
  const primaryPaint = () => paint(primaryVar, FALLBACK.primary); // variable rows
  const textPaint = () => paint(textVar, FALLBACK.text);
  const mutedPaint = () => paint(mutedVar, FALLBACK.textMuted);
  const borderPaint = (): SolidPaint => paint(borderVar, FALLBACK.border);
  const dividerPaint = (): SolidPaint => paint(dividerVar, FALLBACK.border);

  // ── Value resolution (follow aliases) ────────────────────────────────────────
  const isAlias = (v: VariableValue): v is VariableAlias =>
    typeof v === "object" && v !== null && (v as { type?: string }).type === "VARIABLE_ALIAS";
  const isRgba = (v: VariableValue): v is RGBA =>
    typeof v === "object" && v !== null && "r" in v && "g" in v && "b" in v;
  const follow = (v: VariableValue | undefined, depth = 0): VariableValue | undefined => {
    if (v === undefined || depth > 4) return v;
    if (isAlias(v)) {
      const t = varById.get(v.id);
      if (!t) return undefined;
      const m = colDefaultMode.get(t.variableCollectionId);
      return follow(m ? t.valuesByMode[m] : undefined, depth + 1);
    }
    return v;
  };
  const valueText = (variable: Variable, modeId: string): string => {
    const raw = variable.valuesByMode[modeId];
    if (raw === undefined) return "—";
    // A reference to another variable shows that variable's name, not its value.
    if (isAlias(raw)) {
      const target = varById.get(raw.id);
      return target ? formatRef(target.name, format) : "—";
    }
    if (variable.resolvedType === "COLOR" && isRgba(raw)) return rgbaToCss(raw);
    if (typeof raw === "number") return Number.isInteger(raw) ? String(raw) : String(Math.round(raw * 1000) / 1000);
    if (typeof raw === "string") return raw;
    return "—";
  };

  // ── Node builders ────────────────────────────────────────────────────────────
  const makeText = (chars: string, font: FontName, fill: SolidPaint, size = 12): TextNode => {
    const t = figma.createText();
    t.fontName = font;
    t.characters = chars || "—";
    t.fontSize = size;
    t.fills = [fill];
    return t;
  };

  /** A fixed-width cell (horizontal auto-layout) with a bottom border. */
  const makeCell = (width: number): FrameNode => {
    const cell = figma.createFrame();
    cell.name = "Cell";
    cell.layoutMode = "HORIZONTAL";
    cell.primaryAxisSizingMode = "FIXED";
    cell.counterAxisSizingMode = "AUTO";
    cell.counterAxisAlignItems = "CENTER";
    cell.itemSpacing = 6;
    cell.paddingLeft = 12;
    cell.paddingRight = 12;
    cell.paddingTop = 8;
    cell.paddingBottom = 8;
    cell.fills = [];
    // resize() forces BOTH axes to FIXED — set the fixed width, then restore the
    // vertical axis to hug so the cell grows to its text height.
    cell.resize(width, 1);
    cell.counterAxisSizingMode = "AUTO";
    return cell;
  };

  /** Fill a cell with a text node that wraps within the fixed width. */
  const fillText = (cell: FrameNode, node: TextNode) => {
    cell.appendChild(node);
    node.layoutSizingHorizontal = "FILL";
    node.textAutoResize = "HEIGHT";
  };

  const swatchFor = (variable: Variable, collection: VariableCollection, modeId: string): FrameNode => {
    const sw = figma.createFrame();
    sw.name = "Swatch";
    sw.resize(SWATCH, SWATCH);
    sw.cornerRadius = 4;
    sw.strokes = [{ type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.12 }];
    sw.strokeWeight = 1;
    const resolved = follow(variable.valuesByMode[modeId]);
    const fallback: RGB = resolved && isRgba(resolved) ? { r: resolved.r, g: resolved.g, b: resolved.b } : { r: 0.5, g: 0.5, b: 0.5 };
    try {
      // Pin this swatch to the column's mode, then bind its fill to the variable
      // so it renders that mode's colour live.
      sw.setExplicitVariableModeForCollection(collection, modeId);
      sw.fills = [figma.variables.setBoundVariableForPaint({ type: "SOLID", color: fallback }, "color", variable)];
    } catch {
      sw.fills = [{ type: "SOLID", color: fallback }];
    }
    return sw;
  };

  // ── Build one table per selected collection ──────────────────────────────────
  const created: FrameNode[] = [];
  for (const id of options.collectionIds) {
    const collection = colById.get(id);
    if (!collection) {
      warnings.push(`Collection ${id} no longer exists; skipped.`);
      continue;
    }
    const modes = collection.modes;
    const columns = [NAME_W, ...modes.map(() => MODE_W), ...(options.includeScopes ? [SCOPE_W] : [])];

    const table = figma.createFrame();
    table.name = collection.name;
    table.layoutMode = "VERTICAL";
    table.primaryAxisSizingMode = "AUTO";
    table.counterAxisSizingMode = "AUTO";
    table.itemSpacing = 0;
    table.fills = [primaryPaint()];
    table.cornerRadius = 8;
    table.strokes = [borderPaint()];
    table.strokeWeight = 1;
    table.clipsContent = true;

    const makeRow = (): FrameNode => {
      const row = figma.createFrame();
      row.name = "Row";
      row.layoutMode = "HORIZONTAL";
      row.primaryAxisSizingMode = "AUTO";
      row.counterAxisSizingMode = "AUTO";
      row.counterAxisAlignItems = "CENTER";
      row.itemSpacing = 0;
      row.fills = [];
      row.strokes = [dividerPaint()];
      row.strokeTopWeight = 0;
      row.strokeLeftWeight = 0;
      row.strokeRightWeight = 0;
      row.strokeBottomWeight = 1;
      return row;
    };

    const totalWidth = columns.reduce((sum, w) => sum + w, 0);

    // Header row.
    const header = makeRow();
    header.fills = [basePaint()];
    const headerLabels = ["Name", ...modes.map((m) => m.name), ...(options.includeScopes ? ["Scopes"] : [])];
    headerLabels.forEach((label, i) => {
      const cell = makeCell(columns[i]!);
      header.appendChild(cell);
      fillText(cell, makeText(label, bold, textPaint()));
    });
    table.appendChild(header);

    // Data rows, grouped by the variable's first path segment (its Figma group).
    const vars = allVars
      .filter((v) => v.variableCollectionId === collection.id)
      .sort((a, b) => compareNatural(a.name, b.name));
    let currentGroup: string | null = null;
    for (const variable of vars) {
      const slash = variable.name.indexOf("/");
      const group = slash >= 0 ? variable.name.slice(0, slash) : variable.name;
      const label = slash >= 0 ? variable.name.slice(slash + 1) : variable.name;

      // A full-width group header whenever the group changes.
      if (slash >= 0 && group !== currentGroup) {
        currentGroup = group;
        const groupRow = makeRow();
        groupRow.name = "Group";
        groupRow.fills = [basePaint()];
        const groupCell = makeCell(totalWidth);
        groupRow.appendChild(groupCell);
        fillText(groupCell, makeText(group.charAt(0).toUpperCase() + group.slice(1), bold, mutedPaint(), 11));
        table.appendChild(groupRow);
      }

      const row = makeRow();
      row.fills = [primaryPaint()];

      const nameCell = makeCell(NAME_W);
      row.appendChild(nameCell);
      fillText(nameCell, makeText(formatName(variable.name, label, format), regular, textPaint()));

      modes.forEach((m, i) => {
        const cell = makeCell(columns[i + 1]!);
        row.appendChild(cell);
        if (variable.resolvedType === "COLOR") cell.appendChild(swatchFor(variable, collection, m.modeId));
        fillText(cell, makeText(valueText(variable, m.modeId), regular, mutedPaint()));
      });

      if (options.includeScopes) {
        const scopeCell = makeCell(SCOPE_W);
        row.appendChild(scopeCell);
        fillText(scopeCell, makeText(formatScopes(variable.scopes), regular, mutedPaint()));
      }

      table.appendChild(row);
    }
    // Last row shouldn't carry a divider.
    const lastRow = table.children[table.children.length - 1] as FrameNode | undefined;
    if (lastRow && lastRow !== header) lastRow.strokeBottomWeight = 0;

    // Wrap with a title so multiple tables read clearly.
    const wrapper = figma.createFrame();
    wrapper.name = `${collection.name} — Variables`;
    wrapper.layoutMode = "VERTICAL";
    wrapper.primaryAxisSizingMode = "AUTO";
    wrapper.counterAxisSizingMode = "AUTO";
    wrapper.itemSpacing = 12;
    wrapper.fills = [];
    const title = makeText(collection.name, bold, textPaint(), 18);
    wrapper.appendChild(title);
    wrapper.appendChild(table);

    created.push(wrapper);
  }

  // ── Lay the tables out side by side near the viewport ────────────────────────
  let x = figma.viewport.center.x - 300;
  const y = figma.viewport.center.y - 200;
  for (const wrapper of created) {
    wrapper.x = x;
    wrapper.y = y;
    figma.currentPage.appendChild(wrapper);
    x += wrapper.width + 80;
  }
  if (created.length > 0) {
    figma.currentPage.selection = created;
    figma.viewport.scrollAndZoomIntoView(created);
  }

  return { inserted: created.length, warnings };
}
