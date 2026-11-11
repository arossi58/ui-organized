/**
 * The parts of Figma's REST responses this package reads. Written from Figma's API
 * documentation; the test fixtures are hand-made to match, and neither has been
 * checked against a live file yet.
 */

export interface FigmaAlias {
  type?: string;
  id: string;
}

export interface FigmaPaint {
  type?: string;
  visible?: boolean;
  boundVariables?: { color?: FigmaAlias };
  color?: { r: number; g: number; b: number; a?: number };
}

export interface FigmaComponentProperty {
  type: "VARIANT" | "BOOLEAN" | "TEXT" | "INSTANCE_SWAP";
  value: string | boolean;
}

export interface FigmaPropertyDefinition {
  type: FigmaComponentProperty["type"];
  variantOptions?: string[];
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  visible?: boolean;
  children?: FigmaNode[];
  characters?: string;
  componentId?: string;
  componentProperties?: Record<string, FigmaComponentProperty>;
  componentPropertyDefinitions?: Record<string, FigmaPropertyDefinition>;
  layoutMode?: "NONE" | "HORIZONTAL" | "VERTICAL";
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  cornerRadius?: number;
  fills?: FigmaPaint[];
  strokes?: FigmaPaint[];
  style?: { fontSize?: number };
  boundVariables?: Record<string, FigmaAlias | FigmaAlias[] | undefined>;
}

export interface FigmaComponentMeta {
  key: string;
  name: string;
  componentSetId?: string;
}

/** One entry of `GET /v1/files/:key/nodes`, or the whole of `GET /v1/files/:key`. */
export interface FigmaDocument {
  document: FigmaNode;
  components?: Record<string, FigmaComponentMeta>;
  componentSets?: Record<string, { key: string; name: string }>;
}

/** `manifest/figma-variables.json`: variable key or full id → its name. */
export type FigmaVariableNames = Record<string, string>;
