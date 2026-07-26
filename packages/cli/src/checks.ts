import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { declaredTokens, namedFontFamilies, type Bundle, type BundleFont } from "./bundle.js";
import { display, type Project } from "./project.js";

/**
 * The checks are the reason this command exists.
 *
 * Copying four files is `unzip && cp`; it does not need a package. What needs a
 * package is *validating at the moment of application*, which only the design
 * system can do because it is the only thing that knows its own contract. Every
 * failure below was silent at apply time in the investigation that prompted
 * this: the build stayed green and the app looked plausible while rendering the
 * wrong thing.
 */

export type Severity = "error" | "warning" | "info";

export interface Finding {
  severity: Severity;
  title: string;
  /** What it means and what to do, in prose. */
  detail: string;
}

// ─── 1. Token coverage ───────────────────────────────────────────────────────

/**
 * Does the theme define everything the components read?
 *
 * `token-contract.json` ships with `@ui-organized/react` and is generated from
 * the component CSS, so it is the authoritative answer and cannot drift from the
 * installed version. A theme that misses an entry renders subtly wrong with
 * nothing thrown — the original report had a sidebar silently collapse and every
 * portalled overlay lose its stacking order.
 */
export function checkTokenCoverage(bundle: Bundle, project: Project): Finding[] {
  const contract = readContract(project);
  if (!contract) {
    return [
      {
        severity: "info",
        title: "Token coverage not checked",
        detail:
          "@ui-organized/react isn't installed here, so there's no token-contract.json to check the theme against. " +
          "Install it and re-run to verify the theme is complete.",
      },
    ];
  }

  const declared = declaredTokens(bundle.files.get("theme.css")!);
  const missing = contract.tokens.filter((token) => !declared.has(token));
  if (missing.length === 0) {
    return [
      {
        severity: "info",
        title: `Theme covers all ${contract.tokens.length} required tokens`,
        detail: "",
      },
    ];
  }

  return [
    {
      severity: "error",
      title: `Theme is missing ${missing.length} custom ${missing.length === 1 ? "property" : "properties"} the components read`,
      detail:
        `${missing.join(", ")}\n\n` +
        "Components reference these, so they will fall back to whatever the cascade provides — " +
        "usually nothing. Re-export the theme from a current Theme Builder, or add them by hand.",
    },
  ];
}

interface Contract {
  tokens: string[];
}

function readContract(project: Project): Contract | undefined {
  if (!project.reactPackageDir) return undefined;
  try {
    return JSON.parse(
      readFileSync(join(project.reactPackageDir, "token-contract.json"), "utf8"),
    ) as Contract;
  } catch {
    return undefined;
  }
}

// ─── 2. Fonts named but not loadable ─────────────────────────────────────────

/**
 * Every family the CSS names should have an entry in `fonts.ts`.
 *
 * This is the "copied theme.css, forgot fonts.ts" case, and it is invisible:
 * the head keeps loading the *previous* theme's typefaces (or none at all), the
 * new theme's metrics apply, and the result looks like a deliberate choice
 * rather than a missing file.
 */
export function checkFontsPresent(bundle: Bundle, fonts: BundleFont[]): Finding[] {
  const named = namedFontFamilies(bundle.files.get("theme.css")!);
  if (named.length === 0) return [];

  const covered = new Set(fonts.map((f) => f.family));
  const uncovered = named.filter((family) => !covered.has(family));

  if (uncovered.length === 0) {
    return [
      {
        severity: "info",
        title: `Fonts declared for ${named.join(" and ")}`,
        detail: "",
      },
    ];
  }

  return [
    {
      severity: "warning",
      title: `No stylesheet link for ${uncovered.join(", ")}`,
      detail:
        `theme.css sets ${uncovered.length === 1 ? "this family" : "these families"} but the bundle has no fonts.ts entry to load ${uncovered.length === 1 ? "it" : "them"}. ` +
        "The theme's sizes and weights will apply over a fallback typeface, which reads as intentional rather than broken. " +
        "Re-export from a current Theme Builder to get fonts.ts.",
    },
  ];
}

// ─── 3. Weights a family doesn't actually ship ───────────────────────────────

/**
 * Ask Google what each stylesheet really serves.
 *
 * The endpoint answers **200** for a weight a family does not have and simply
 * omits the `@font-face` rule, so a status check proves nothing — the only way
 * to know is to read the CSS back and compare. The browser then synthesises the
 * missing weight, which reads heavier and looser than a real cut.
 *
 * Network-dependent, so a failure here is reported as unknown rather than as a
 * problem with the theme.
 */
export async function checkFontWeights(
  fonts: BundleFont[],
  options: { offline: boolean },
): Promise<Finding[]> {
  if (options.offline || fonts.length === 0) return [];

  const findings: Finding[] = [];
  for (const font of fonts) {
    let served: Set<number>;
    try {
      const response = await fetch(font.href, {
        // Google serves woff2 @font-face rules only to browsers it recognises;
        // the default Node user-agent gets the older truetype payload, which
        // still lists the same weights.
        headers: { "user-agent": "Mozilla/5.0 (uiorg-cli)" },
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) {
        findings.push({
          severity: "warning",
          title: `Couldn't verify ${font.family}`,
          detail: `${font.href} returned HTTP ${response.status}. The link in your document head will fail the same way.`,
        });
        continue;
      }
      const css = await response.text();
      served = new Set(
        [...css.matchAll(/font-weight:\s*(\d+)/g)].map((m) => Number(m[1])),
      );
    } catch (error) {
      findings.push({
        severity: "info",
        title: `Couldn't reach Google Fonts to verify ${font.family}`,
        detail: `${error instanceof Error ? error.message : String(error)}. Re-run with a connection, or --offline to skip.`,
      });
      continue;
    }

    const missing = font.weights.filter((w) => !served.has(w));
    if (missing.length === 0) continue;

    findings.push({
      severity: "warning",
      title: `${font.family} doesn't ship weight${missing.length > 1 ? "s" : ""} ${missing.join(", ")}`,
      detail:
        `The theme asks for ${font.weights.join(", ")}; Google serves ${[...served].sort((a, b) => a - b).join(", ") || "none"}. ` +
        `The browser will synthesise the rest rather than load a real face, which usually reads heavier and looser than the genuine cut. ` +
        `Pick a family with the full range, or reduce the theme's weights.`,
    });
  }
  return findings;
}

// ─── 4. Overrides later in the cascade ───────────────────────────────────────

/**
 * A `--type-font-*` declaration in the project's own CSS silently beats the
 * theme's, and loading the font does not fix it. Worth naming, because the
 * symptom — "my typeface didn't change" — points at the theme rather than at the
 * file that overrode it.
 */
export function checkCascade(project: Project, themeCssPath: string, bundleSource?: string): Finding[] {
  const offenders: string[] = [];
  // An unzipped bundle inside the project would otherwise report its own
  // theme.css as a conflicting override of itself.
  const bundleDir = bundleSource ? resolve(bundleSource) : undefined;

  for (const file of cssFilesIn(project)) {
    if (file === themeCssPath) continue;
    if (bundleDir && !relative(bundleDir, file).startsWith("..")) continue;
    let content: string;
    try {
      content = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (/(?:^|[;{])\s*--type-font-[\w-]+\s*:/m.test(content)) offenders.push(display(project, file));
  }

  if (offenders.length === 0) return [];

  return [
    {
      severity: "warning",
      title: "Another stylesheet sets --type-font-*",
      detail:
        `${offenders.join(", ")}\n\n` +
        "If any of these is imported after the theme it wins silently, and the typeface won't change no matter what the theme says. " +
        "Check your import order before assuming the theme is wrong.",
    },
  ];
}

const IGNORED_DIRS = new Set([
  "node_modules", ".git", "dist", "build", "out", ".next", "coverage", ".turbo",
]);

/** Project-owned CSS files, excluding dependencies and build output. */
function cssFilesIn(project: Project): string[] {
  const out: string[] = [];

  const walk = (dir: string): void => {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    for (const name of entries) {
      if (IGNORED_DIRS.has(name) || name.startsWith(".")) continue;
      const path = join(dir, name);
      let stats;
      try {
        stats = statSync(path);
      } catch {
        continue;
      }
      if (stats.isDirectory()) walk(path);
      else if (name.endsWith(".css")) out.push(path);
    }
  };
  walk(project.root);
  return out;
}
