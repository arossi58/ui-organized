#!/usr/bin/env node
/**
 * Roadmap sync (SITE.md §7.2) — queries the org's GitHub Projects v2 board and
 * writes the public roadmap.json the site consumes. Run by
 * .github/workflows/roadmap-sync.yml; the site never touches the GitHub API.
 *
 * The site only ever reads the §7.3 contract, so all the Projects-specific
 * mapping lives here:
 *   - items with no Status  → Backlog
 *   - closed issues/PRs     → Done (regardless of the Status field)
 *   - draft items           → url: null  (rendered without a link)
 *   - Done                  → most recent 12, with a doneOverflowUrl
 *   - board order preserved (items come back in the admin's curated order)
 *
 * Idempotent: `syncedAt` is the only field that would change every run, so we
 * hash the payload WITHOUT it and rewrite the file only when the real content
 * changed — no timestamp-only churn, no noisy commits/redeploys.
 *
 * Env:
 *   ROADMAP_TOKEN           fine-grained PAT with read access to Projects
 *   ROADMAP_OWNER           account login that owns the project (a username
 *                           for a personal project; an org login for an org one)
 *   ROADMAP_PROJECT_NUMBER  project number (e.g. "1")
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(HERE, "../public/roadmap.json");
const DONE_LIMIT = 12;

const TOKEN = requireEnv("ROADMAP_TOKEN");
const OWNER = requireEnv("ROADMAP_OWNER");
const NUMBER = Number.parseInt(requireEnv("ROADMAP_PROJECT_NUMBER"), 10);

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return v;
}

const QUERY = `
  query ($login: String!, $number: Int!) {
    user(login: $login) {
      projectV2(number: $number) {
        url
        items(first: 100) {
          nodes {
            id
            status: fieldValueByName(name: "Status") {
              ... on ProjectV2ItemFieldSingleSelectValue { name }
            }
            itemType: fieldValueByName(name: "Type") {
              ... on ProjectV2ItemFieldSingleSelectValue { name }
            }
            content {
              __typename
              ... on DraftIssue { title }
              ... on Issue {
                title
                url
                state
                labels(first: 10) { nodes { name } }
              }
              ... on PullRequest {
                title
                url
                state
                labels(first: 10) { nodes { name } }
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Map a Status single-select name to a contract column id, or null to omit it.
 * The GitHub board carries more columns than the site publishes (e.g. "Ideas",
 * "In preview"); only these three are public. Anything else — including items
 * with no Status set — returns null and is dropped from roadmap.json.
 */
function columnForStatus(name) {
  switch ((name ?? "").toLowerCase()) {
    case "backlog":
      return "backlog";
    case "in progress":
      return "in-progress";
    case "done":
      return "done";
    default:
      return null; // Ideas, In preview, No Status, etc. → not shown on the site
  }
}

/** Map a Type single-select name to a contract type (default development). */
function typeForName(name) {
  const t = (name ?? "").toLowerCase();
  if (t === "design" || t === "development" || t === "docs" || t === "community") {
    return t;
  }
  return "development";
}

async function fetchProject() {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "ui-organized-roadmap-sync",
    },
    body: JSON.stringify({ query: QUERY, variables: { login: OWNER, number: NUMBER } }),
  });
  if (!res.ok) {
    throw new Error(`GitHub GraphQL HTTP ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (json.errors) {
    throw new Error(`GitHub GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  const project = json.data?.user?.projectV2;
  if (!project) {
    throw new Error(`Project not found: owner=${OWNER} number=${NUMBER}`);
  }
  return project;
}

/** Build the §7.3 payload (without syncedAt — added only when content changes). */
function buildPayload(project) {
  const columns = {
    backlog: [],
    "in-progress": [],
    done: [],
  };

  for (const node of project.items.nodes) {
    const content = node.content;
    if (!content) continue; // redacted / inaccessible item
    const isDraft = content.__typename === "DraftIssue";
    const closed = content.state === "CLOSED" || content.state === "MERGED";

    const columnId = closed ? "done" : columnForStatus(node.status?.name);
    if (!columnId) continue; // status isn't one the site publishes — drop it
    const item = {
      id: node.id,
      title: content.title ?? "Untitled",
      type: typeForName(node.itemType?.name),
      url: isDraft ? null : (content.url ?? null),
      labels: (content.labels?.nodes ?? []).map((l) => l.name),
    };
    columns[columnId].push(item); // push order = board order
  }

  const projectUrl = project.url;
  const doneOverflowUrl = `${projectUrl}/views/1?filterQuery=${encodeURIComponent("status:Done")}`;

  return {
    projectUrl,
    doneOverflowUrl,
    columns: [
      { id: "backlog", title: "Backlog", items: columns.backlog },
      { id: "in-progress", title: "In progress", items: columns["in-progress"] },
      { id: "done", title: "Done", items: columns.done.slice(0, DONE_LIMIT) },
    ],
  };
}

/** Stable hash of everything except syncedAt, for change detection. */
function contentHash(payloadWithoutSyncedAt) {
  return createHash("sha256").update(JSON.stringify(payloadWithoutSyncedAt)).digest("hex");
}

function existingContentHash() {
  try {
    const prev = JSON.parse(readFileSync(OUT_PATH, "utf8"));
    const { syncedAt, ...rest } = prev;
    void syncedAt;
    return contentHash(rest);
  } catch {
    return null; // no/!invalid existing file → treat as changed
  }
}

async function main() {
  const project = await fetchProject();
  const payload = buildPayload(project);

  if (existingContentHash() === contentHash(payload)) {
    console.log("Roadmap unchanged — leaving roadmap.json as-is.");
    return;
  }

  const out = { syncedAt: new Date().toISOString(), ...payload };
  writeFileSync(OUT_PATH, `${JSON.stringify(out, null, 2)}\n`);
  const total = payload.columns.reduce((n, c) => n + c.items.length, 0);
  console.log(`Wrote ${OUT_PATH} — ${total} cards across ${payload.columns.length} columns.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
