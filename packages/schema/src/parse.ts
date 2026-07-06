import type { z } from "zod";
import { ProjectDocumentSchema, type ProjectDocument, SCHEMA_VERSION } from "./project.js";

/**
 * Typed result of a fallible operation. The editor must never crash on a
 * malformed document — it surfaces a typed error instead (typed misses over
 * guesses).
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * Validates an unknown value as a {@link ProjectDocument} without throwing.
 * Returns a typed `Result`. Accepts a document with no `packs`/`recipes`/
 * `overrides` (the plain-DTCG baseline).
 */
export function parseProjectDocument(input: unknown): Result<ProjectDocument, z.ZodError> {
  const result = ProjectDocumentSchema.safeParse(input);
  return result.success
    ? { ok: true, value: result.data }
    : { ok: false, error: result.error };
}

/**
 * Throwing variant of {@link parseProjectDocument}, for call sites that prefer
 * exceptions (e.g. tests and trusted internal construction).
 */
export function assertProjectDocument(input: unknown): ProjectDocument {
  return ProjectDocumentSchema.parse(input);
}

/**
 * A migration upgrades a document from one schema version to the next. Keyed by
 * the version it upgrades *from*. The registry is stubbed at v1 so future
 * versions have a home.
 */
type Migration = (doc: Record<string, unknown>) => Record<string, unknown>;
const MIGRATIONS: Record<string, Migration> = {
  // "0.9.0": (doc) => ({ ...doc, meta: { ...doc.meta, schemaVersion: "1.0.0" } }),
};

/**
 * Applies any registered migrations to bring a document up to
 * {@link SCHEMA_VERSION}, then validates it. Documents already at the current
 * version pass straight through to {@link parseProjectDocument}.
 */
export function migrateProjectDocument(
  input: unknown,
): Result<ProjectDocument, z.ZodError | Error> {
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: new Error("Project document must be an object") };
  }

  let doc = input as Record<string, unknown>;
  const seen = new Set<string>();
  let version = readSchemaVersion(doc) ?? "0.0.0";

  while (version !== SCHEMA_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) break; // no path forward; let validation report the mismatch
    if (seen.has(version)) {
      return { ok: false, error: new Error(`Migration cycle at version ${version}`) };
    }
    seen.add(version);
    doc = migrate(doc);
    version = readSchemaVersion(doc) ?? version;
  }

  return parseProjectDocument(doc);
}

function readSchemaVersion(doc: Record<string, unknown>): string | undefined {
  const meta = doc.meta;
  if (meta && typeof meta === "object" && "schemaVersion" in meta) {
    const value = (meta as { schemaVersion: unknown }).schemaVersion;
    return typeof value === "string" ? value : undefined;
  }
  return undefined;
}
