/**
 * Map a test result back to the component it belongs to.
 *
 * Every gate produces per-component results without carrying any extra metadata,
 * because a Storybook story id already encodes its title, and a title already
 * determines the docs slug. That join is what lets a screenshot, an axe scan and
 * a keyboard assertion all land on the same docs page.
 *
 * `kebab` and `parseTitle` are ports of the ones in
 * `apps/marketing/src/docs/registry.ts`. They are duplicated rather than
 * imported because this is plain Node and the registry is app TypeScript that
 * eagerly globs every story module. The duplication is held honest by a test in
 * `apps/marketing/src/docs/registry.test.ts`, which asserts that every slug this
 * file produces resolves to a real DocsComponent — so the two drifting apart is
 * a test failure, not a silently blank docs panel.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const INDEX = resolve(root, "apps/storybook/storybook-static/index.json");

/** `"ColorPicker"` → `"color-picker"`, `"Segmented Control"` → `"segmented-control"`. */
export function kebab(name) {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

/** `"Components/Actions/Button"` → `{ category: "Actions", name: "Button" }`. */
export function parseTitle(title) {
  const parts = title
    .split("/")
    .map((p) => p.trim())
    .filter(Boolean);
  const name = parts[parts.length - 1] ?? title;
  if (parts.length >= 3 && parts[0] === "Components") return { category: parts[1], name };
  return { category: parts.length > 1 ? parts[0] : "Other", name };
}

let indexCache = null;

/** Every story in the build, keyed by id. */
export function storyIndex() {
  if (indexCache) return indexCache;
  if (!existsSync(INDEX)) {
    throw new Error(
      `No Storybook build at ${INDEX}. The aggregator maps story ids to components ` +
        `through the built index, so Storybook must be built first.`,
    );
  }
  indexCache = JSON.parse(readFileSync(INDEX, "utf8")).entries;
  return indexCache;
}

/** All component slugs that have at least one story, with their display name. */
export function knownComponents() {
  const out = new Map();
  for (const entry of Object.values(storyIndex())) {
    if (entry.type !== "story") continue;
    const { category, name } = parseTitle(entry.title);
    out.set(kebab(name), { name, category, title: entry.title });
  }
  return out;
}

/** `"components-forms-colorpicker--open"` → `"color-picker"`. */
export function slugForStoryId(storyId) {
  const entry = storyIndex()[storyId];
  if (!entry) return undefined;
  return kebab(parseTitle(entry.title).name);
}

/**
 * Pull a component out of a Playwright test title.
 *
 * Every gate names its tests with the story id first — the visual, a11y and
 * smoke gates use the bare id, and interaction tests use `<storyId> › what it
 * does` (see `storyTest` in apps/storybook/shared/interaction.ts). One rule
 * therefore covers all four gates.
 */
export function slugForTestTitle(title) {
  const id = title.trim().split(/\s|›/)[0];
  return slugForStoryId(id);
}

/**
 * `"packages/react/src/components/ColorPicker/ColorPicker.css"` → `"color-picker"`.
 * Used to attribute lint and unit results. Returns undefined for files that are
 * not inside a component directory — those roll up into the repo-wide gate
 * rather than being attributed to an arbitrary component.
 */
export function slugForFilePath(filePath) {
  const match = filePath.replace(/\\/g, "/").match(/packages\/react\/src\/components\/([^/]+)\//);
  return match ? kebab(match[1]) : undefined;
}

/**
 * The human name of the story a test title starts with — "All intents" rather
 * than "components-actions-button--all-intents". Used by the docs dashboard's
 * expandable rows to say what was actually checked.
 */
export function storyNameForTitle(title) {
  const id = title.trim().split(/\s|›/)[0];
  return storyIndex()[id]?.name;
}
