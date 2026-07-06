/**
 * Layer 3 — structured uncertainty log (Connect.md §7.3).
 *
 * A generation run (single component or full page) emits a `mapping-warnings.json`
 * companion file: a flat list of every place the agent wasn't fully sure, so a
 * reviewer can scan risk first instead of re-reading the whole diff. A generation
 * workflow feeds a {@link MappingWarningsCollector} as it resolves each node, then
 * serializes it alongside the generated code. Pure — no Node deps.
 */

export type WarningResolution =
  | "used_anyway"
  | "asked_user"
  | "skipped"
  | "used_search_fallback";

export interface MappingWarning {
  figmaNodeId: string;
  figmaNodeName: string;
  confidence: "fuzzy" | "none";
  resolution: WarningResolution;
  /** Present when the agent used a component despite the uncertainty. */
  matchedComponentKey?: string;
  warningText: string;
}

export interface StaleMappingUsed {
  componentKey: string;
  changedProps: string[];
}

export interface MappingWarningsLog {
  generatedAt: string;
  figmaSourceUrl: string;
  warnings: MappingWarning[];
  staleMappingsUsed: StaleMappingUsed[];
}

export class MappingWarningsCollector {
  private readonly warnings: MappingWarning[] = [];
  private readonly stale = new Map<string, StaleMappingUsed>();

  constructor(private readonly figmaSourceUrl: string) {}

  addWarning(w: MappingWarning): void {
    this.warnings.push(w);
  }

  /** Record a stale mapping that was used anyway (deduped by component key). */
  addStaleUsed(componentKey: string, changedProps: string[]): void {
    this.stale.set(componentKey, { componentKey, changedProps });
  }

  /** True when there's nothing uncertain to report — a clean run. */
  isClean(): boolean {
    return this.warnings.length === 0 && this.stale.size === 0;
  }

  build(generatedAt: string): MappingWarningsLog {
    return {
      generatedAt,
      figmaSourceUrl: this.figmaSourceUrl,
      warnings: [...this.warnings],
      staleMappingsUsed: [...this.stale.values()],
    };
  }

  serialize(generatedAt: string): string {
    return JSON.stringify(this.build(generatedAt), null, 2) + "\n";
  }
}
