import { z } from "zod";

/**
 * Generator provenance, stored under `$extensions.<packId>` on a token.
 *
 * Provenance is **optional and inert**: it powers non-destructive regeneration
 * and UI affordances, but the token is fully valid and owned by the user without
 * it. Removing provenance only disables regeneration — it never breaks a token,
 * and `locked` is a hint, never enforced as immutability.
 *
 * This schema is neutral: the `packId` is supplied by the caller, never
 * hardcoded to `uiorganized`.
 */
export const ProvenanceSchema = z
  .object({
    /** Recipe/generator id that produced this token. */
    generatedBy: z.string().optional(),
    /** Input token paths or config keys the value was derived from. */
    generatedFrom: z.array(z.string()).optional(),
    /** UI hint only — never enforced as a hard lock. */
    locked: z.boolean().optional(),
    /** Palette ramp position, e.g. `{ family: "brand", step: 500 }`. */
    ramp: z.object({ family: z.string(), step: z.number() }).optional(),
  })
  .passthrough();
export type Provenance = z.infer<typeof ProvenanceSchema>;

/**
 * Reads provenance for `packId` out of a token's `$extensions`, returning a
 * typed value or `undefined` (a typed miss — never a guess). Malformed
 * provenance is treated as absent rather than throwing.
 */
export function getProvenance(
  extensions: Record<string, unknown> | undefined,
  packId: string,
): Provenance | undefined {
  if (!extensions) return undefined;
  const raw = extensions[packId];
  if (raw === undefined) return undefined;
  const result = ProvenanceSchema.safeParse(raw);
  return result.success ? result.data : undefined;
}
