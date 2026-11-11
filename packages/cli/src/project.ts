import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";

/**
 * What we can learn about the target project without being told.
 *
 * Every field here exists because assuming it would be wrong somewhere:
 * `src/styles/theme.css` is one project's convention rather than a standard,
 * `npm` is not the only package manager, and overwriting files in a dirty tree
 * removes the user's ability to undo.
 */

export interface Project {
  root: string;
  /** Where an existing theme.css already lives, if one does. */
  existingThemeCss?: string;
  /** Where the app's entry module is, for the import-order advice. */
  entry?: string;
  packageManager: "npm" | "pnpm" | "yarn" | "bun";
  /** The installed @ui-organized/react, when resolvable. */
  reactPackageDir?: string;
  /** Undefined when not a git repo at all. */
  gitClean?: boolean;
}

/** Directories never worth walking. */
const IGNORED = new Set(["node_modules", ".git", "dist", "build", "out", ".next", "coverage", ".turbo"]);

export interface InspectOptions {
  /**
   * A directory to pretend isn't there — the unzipped bundle, when it lives
   * inside the project.
   *
   * Unzipping into the project is a normal thing to do, and the bundle's own
   * `theme.css` is usually *shallower* than the app's. Without this, detection
   * picks the bundle's copy as the destination: the file is copied onto itself,
   * the run reports success, and the real stylesheet is never touched.
   */
  ignore?: string;
}

export function inspectProject(root: string, options: InspectOptions = {}): Project {
  const ignore = options.ignore ? resolve(options.ignore) : undefined;
  const outside = (path: string): boolean =>
    !ignore || relative(ignore, path).startsWith("..") || relative(ignore, path) === "";

  const project: Project = {
    root,
    packageManager: detectPackageManager(root),
  };

  const existing = findFile(root, (name) => name === "theme.css", outside);
  if (existing) project.existingThemeCss = existing;

  const entry = findEntry(root);
  if (entry) project.entry = entry;

  const reactDir = findReactPackage(root);
  if (reactDir) project.reactPackageDir = reactDir;

  const clean = gitClean(root);
  if (clean !== undefined) project.gitClean = clean;

  return project;
}

function detectPackageManager(root: string): Project["packageManager"] {
  if (existsSync(join(root, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(root, "bun.lockb")) || existsSync(join(root, "bun.lock"))) return "bun";
  if (existsSync(join(root, "yarn.lock"))) return "yarn";
  return "npm";
}

/** The install command this project's package manager would use. */
export function installCommand(project: Project, pkg: string): string {
  switch (project.packageManager) {
    case "pnpm":
      return `pnpm add ${pkg}`;
    case "yarn":
      return `yarn add ${pkg}`;
    case "bun":
      return `bun add ${pkg}`;
    default:
      return `npm install ${pkg}`;
  }
}

/** First matching file, breadth-first, shallowest wins. `accept` can veto a path. */
export function findFile(
  root: string,
  match: (name: string) => boolean,
  accept: (path: string) => boolean = () => true,
): string | undefined {
  const queue: string[] = [root];
  while (queue.length) {
    const dir = queue.shift()!;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    const subdirs: string[] = [];
    for (const name of entries) {
      const path = join(dir, name);
      let stats;
      try {
        stats = statSync(path);
      } catch {
        continue;
      }
      if (stats.isDirectory()) {
        if (!IGNORED.has(name) && !name.startsWith(".") && accept(path)) subdirs.push(path);
      } else if (match(name) && accept(path)) {
        return path;
      }
    }
    queue.push(...subdirs);
  }
  return undefined;
}

/**
 * The workspace packages under `root`, as forward-slash paths relative to it.
 *
 * In a monorepo the root package.json usually installs nothing, and the library
 * lives in `apps/web` or `packages/editor`. The globs come from package.json
 * `workspaces` (npm, Yarn, Bun) and `pnpm-workspace.yaml`; `!` excludes.
 */
export function workspacePackages(root: string): string[] {
  const globs: string[] = [];
  try {
    const { workspaces } = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
      workspaces?: string[] | { packages?: string[] };
    };
    globs.push(...(Array.isArray(workspaces) ? workspaces : (workspaces?.packages ?? [])));
  } catch {
    // No package.json, or one we can't read: there are no npm workspaces to find.
  }
  const pnpm = join(root, "pnpm-workspace.yaml");
  if (existsSync(pnpm)) globs.push(...pnpmWorkspaceGlobs(readFileSync(pnpm, "utf8")));

  const include = globs.filter((g) => !g.startsWith("!")).map(globToRegExp);
  const exclude = globs.filter((g) => g.startsWith("!")).map((g) => globToRegExp(g.slice(1)));
  if (!include.length) return [];
  // Without `**`, nothing deeper than the longest glob can match, so stop walking there.
  const depth = globs.some((g) => g.includes("**"))
    ? Infinity
    : Math.max(...globs.map((g) => normalizeGlob(g).split("/").length));

  const found: string[] = [];
  const walk = (dir: string, rel: string, level: number): void => {
    if (level > depth) return;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }
    if (rel && entries.includes("package.json") && include.some((r) => r.test(rel)) && !exclude.some((r) => r.test(rel))) {
      found.push(rel);
    }
    for (const name of entries) {
      if (IGNORED.has(name) || name.startsWith(".")) continue;
      const path = join(dir, name);
      try {
        if (statSync(path).isDirectory()) walk(path, rel ? `${rel}/${name}` : name, level + 1);
      } catch {
        continue;
      }
    }
  };
  walk(root, "", 0);
  return found.sort();
}

/** The `packages:` list of a pnpm-workspace.yaml — the one key we need, without a YAML parser. */
export function pnpmWorkspaceGlobs(yaml: string): string[] {
  const unquote = (s: string) => s.trim().replace(/^(['"])(.*)\1$/, "$2");
  const lines = yaml.split(/\r?\n/);
  const start = lines.findIndex((line) => /^packages:/.test(line));
  if (start < 0) return [];
  const inline = /^packages:\s*\[(.*)\]/.exec(lines[start]!);
  if (inline) return inline[1]!.split(",").map(unquote).filter(Boolean);

  const globs: string[] = [];
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break; // the next top-level key
    const item = /^\s+-\s*(.+)$/.exec(line);
    if (item) globs.push(unquote(item[1]!.replace(/\s+#.*$/, "")));
  }
  return globs;
}

function normalizeGlob(glob: string): string {
  return glob.replace(/^!/, "").replace(/^\.\//, "").replace(/\/+$/, "");
}

/** `*` within one path segment, `**` across any number of them. */
function globToRegExp(glob: string): RegExp {
  const source = normalizeGlob(glob)
    .split("/")
    .map((segment) =>
      segment === "**"
        ? "\0"
        : segment
            .split("*")
            .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
            .join("[^/]*"),
    )
    .join("/")
    .replace(/\0\//g, "(?:[^/]+/)*")
    .replace(/\/\0/g, "(?:/[^/]+)*")
    .replace(/\0/g, ".*");
  return new RegExp(`^${source}$`);
}

/** The app entry — where the stylesheet imports belong. */
function findEntry(root: string): string | undefined {
  const candidates = [
    "src/main.tsx", "src/main.ts", "src/main.jsx", "src/main.js",
    "src/index.tsx", "src/index.ts", "src/index.jsx", "src/index.js",
    "app/layout.tsx", "src/app/layout.tsx",
  ];
  for (const rel of candidates) {
    if (existsSync(join(root, rel))) return join(root, rel);
  }
  return undefined;
}

function findReactPackage(root: string): string | undefined {
  const dir = join(root, "node_modules", "@ui-organized", "react");
  return existsSync(join(dir, "package.json")) ? dir : undefined;
}

/**
 * Whether the working tree is clean, or undefined if this isn't a git repo.
 *
 * Used to decide whether overwriting is safe: with a clean tree the user can
 * always `git diff` what we did and throw it away.
 */
function gitClean(root: string): boolean | undefined {
  try {
    const out = execFileSync("git", ["status", "--porcelain"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.trim().length === 0;
  } catch {
    return undefined;
  }
}

/** A path shown relative to the project root, with forward slashes. */
export function display(project: Project, path: string): string {
  const rel = relative(project.root, path);
  return (rel.startsWith("..") ? path : rel).split(sep).join("/");
}

/** The version of @ui-organized/react the project has installed, if any. */
export function reactVersion(project: Project): string | undefined {
  if (!project.reactPackageDir) return undefined;
  try {
    const pkg = JSON.parse(
      readFileSync(join(project.reactPackageDir, "package.json"), "utf8"),
    ) as { version?: string };
    return pkg.version;
  } catch {
    return undefined;
  }
}
