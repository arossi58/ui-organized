/**
 * Links a Figma library to the manifest. Pure; `scripts/figma-sync.ts` does the I/O.
 *
 * Names match exactly or not at all. `FIGMA-PARITY.md` makes a component set's name
 * its export name, so anything else is either a real exception, recorded in
 * `manifest/figma-overrides.json` where it can be reviewed, or a mistake worth
 * reporting. A fuzzy match would turn that mistake into a wrong component in
 * someone's generated code.
 */

import { parseEnumValues } from "../controls-core.js";
import type { ComponentManifest, ComponentManifestEntry } from "../schema.js";
import { propertyName } from "./resolve.js";
import type { FigmaNode, FigmaPropertyDefinition } from "./types.js";

export interface FigmaLibraryComponent {
  key: string;
  name: string;
  properties: Record<string, FigmaPropertyDefinition>;
}

export interface FigmaOverrides {
  /** Figma name → code name, where the two legitimately differ. */
  components?: Record<string, string>;
  /** Figma names with no code component on purpose (`Toast`, §7.1). */
  figmaOnly?: string[];
  /** Figma-only properties on one component, by code name. */
  ignoreProperties?: Record<string, string[]>;
}

/** Axes §7.1 folds across every component, handled by the resolver. */
const FOLDED_PROPERTIES = new Set(["state", "icon-leading", "icon-trailing"]);

/** Published-or-not component sets and standalone components, in document order. */
export function libraryComponents(document: FigmaNode, keyOf: (node: FigmaNode) => string | undefined): FigmaLibraryComponent[] {
  const found: FigmaLibraryComponent[] = [];
  const walk = (node: FigmaNode): void => {
    if (node.type === "COMPONENT_SET" || node.type === "COMPONENT") {
      const key = keyOf(node);
      if (key && !node.name.startsWith("_")) {
        found.push({ key, name: node.name, properties: node.componentPropertyDefinitions ?? {} });
      }
      return; // A set's variants aren't components of their own.
    }
    node.children?.forEach(walk);
  };
  walk(document);
  return found;
}

export interface SyncReport {
  linked: string[];
  /** Links that this run added or changed. */
  changed: string[];
  /** In Figma, with no code component. */
  figmaOnly: string[];
  /** Live in code, not in Figma. */
  codeOnly: string[];
  /** Was linked; its Figma component has gone. The stale key stays until someone decides. */
  linkGone: string[];
  drift: string[];
}

export function planSync(
  manifest: ComponentManifest,
  library: FigmaLibraryComponent[],
  overrides: FigmaOverrides = {},
): { manifest: ComponentManifest; report: SyncReport } {
  const report: SyncReport = { linked: [], changed: [], figmaOnly: [], codeOnly: [], linkGone: [], drift: [] };
  const live = new Map(
    manifest.components.filter((e) => e.status !== "deprecated").map((e) => [e.codeName, e]),
  );
  const links = new Map<string, FigmaLibraryComponent>();

  for (const component of library) {
    if (overrides.figmaOnly?.includes(component.name)) continue;
    const codeName = overrides.components?.[component.name] ?? component.name;
    if (!live.has(codeName)) {
      report.figmaOnly.push(component.name);
      continue;
    }
    links.set(codeName, component);
  }

  const keys = new Set(library.map((component) => component.key));
  const components = manifest.components.map((entry): ComponentManifestEntry => {
    const link = links.get(entry.codeName);
    if (entry.status === "deprecated" || !link) {
      if (entry.status === "deprecated") return entry;
      if (entry.figmaComponentKey && !keys.has(entry.figmaComponentKey)) report.linkGone.push(entry.codeName);
      else if (!entry.figmaComponentKey) report.codeOnly.push(entry.codeName);
      return entry;
    }

    report.linked.push(entry.codeName);
    if (entry.figmaComponentKey !== link.key || entry.figmaComponentName !== link.name) {
      report.changed.push(entry.codeName);
    }
    report.drift.push(...driftOf(entry, link, overrides.ignoreProperties?.[entry.codeName] ?? []));

    const properties = new Set(Object.keys(link.properties).map(propertyName));
    return {
      ...entry,
      figmaComponentKey: link.key,
      figmaComponentName: link.name,
      // The rule `reconcile` applies on the next scan: mapped means active.
      status: "active",
      props: entry.props.map((prop) => {
        const { figmaVariantMapping: _old, ...rest } = prop;
        return properties.has(prop.name) ? { ...rest, figmaVariantMapping: prop.name } : rest;
      }),
    };
  });

  for (const list of Object.values(report)) list.sort();
  return { manifest: { ...manifest, components }, report };
}

function driftOf(entry: ComponentManifestEntry, link: FigmaLibraryComponent, ignored: string[]): string[] {
  const props = new Map(entry.props.map((prop) => [prop.name, prop]));
  const drift: string[] = [];

  for (const [raw, definition] of Object.entries(link.properties)) {
    const name = propertyName(raw);
    if (FOLDED_PROPERTIES.has(name) || ignored.includes(name)) continue;
    const prop = props.get(name);
    // Inherited attributes like `children` aren't in `props`, and TEXT is how Figma carries them.
    if (!prop) {
      if (definition.type !== "TEXT") drift.push(`${entry.codeName}: Figma property "${name}" has no prop`);
      continue;
    }
    const allowed = parseEnumValues(prop.type);
    if (!allowed || definition.type !== "VARIANT") continue;
    for (const option of definition.variantOptions ?? []) {
      if (!allowed.includes(option)) drift.push(`${entry.codeName}.${name}: Figma value "${option}" isn't in the code`);
    }
    for (const value of allowed) {
      if (!definition.variantOptions?.includes(value)) {
        drift.push(`${entry.codeName}.${name}: code value "${value}" isn't in Figma`);
      }
    }
  }
  return drift;
}
