import {
  parseProjectDocument,
  SCHEMA_VERSION,
  type DtcgGroup,
  type ProjectDocument,
  type Result,
} from "@ui-organized/schema";

/**
 * Importing **arbitrary DTCG** — a plain token tree with zero provenance — into a
 * valid {@link ProjectDocument} with **no pack** (neutrality acceptance test 1).
 * The result has no `packs`/`recipes`/`overrides`, and re-exporting it adds no
 * `$extensions.uiorganized`: UI Organized is a door, never a tax.
 */
export interface ImportOptions {
  /** Set name for the imported tree. Defaults to "tokens". */
  name?: string;
  /** ISO timestamps (the editor passes real ones; pure callers may omit). */
  createdAt?: string;
  updatedAt?: string;
}

export function importDtcg(
  tree: DtcgGroup,
  options: ImportOptions = {},
): Result<ProjectDocument, Error> {
  const name = options.name ?? "tokens";
  const created = options.createdAt ?? "";
  const candidate = {
    version: SCHEMA_VERSION,
    meta: { name, createdAt: created, updatedAt: options.updatedAt ?? created, schemaVersion: SCHEMA_VERSION },
    sets: [{ name, tokens: tree }],
    themes: [{ name: "Default", selectedTokenSets: { [name]: "enabled" } }],
    modes: {},
  };
  const parsed = parseProjectDocument(candidate);
  return parsed.ok ? { ok: true, value: parsed.value } : { ok: false, error: parsed.error };
}
