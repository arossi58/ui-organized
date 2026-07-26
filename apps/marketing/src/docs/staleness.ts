/**
 * Is a manifest entry still in step with the code it describes?
 *
 * The scanner publishes `manifest/latest-hashes.json` on every run; comparing an
 * entry's stored `propSignatureHash` against it is the cheap drift signal
 * (Connect.md §8). We use `computeStalenessCore` — the same function the MCP
 * server and the Storybook Inspector use — so all three agree on what "stale"
 * means, down to the list of changed prop names.
 */
import {
  computeStalenessCore,
  entryId,
  type ComponentManifestEntry,
  type LatestHashes,
  type Staleness,
} from "@ui-organized/code-connect/browser";
import latestHashesJson from "../../../../manifest/latest-hashes.json";

const latest = latestHashesJson as unknown as LatestHashes;

export function stalenessFor(entry: ComponentManifestEntry | undefined): Staleness | undefined {
  if (!entry) return undefined;
  const id = entryId(entry.codePath, entry.codeName);
  return computeStalenessCore(entry, latest.hashes?.[id], latest.props?.[id]);
}
