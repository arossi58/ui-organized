import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, realpathSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";

/**
 * What we can learn about the target project without being told.
 *
 * Every field here exists because assuming it would be wrong somewhere:
 * `src/styles/theme.css` is one project's convention rather than a standard,
 * `npm` is not the only package manager, React is not the only library, and
 * overwriting files in a dirty tree removes the user's ability to undo.
 */

/** The four libraries, and the package each is installed as. */
export const LIBRARIES = {
  react: "@ui-organized/react",
  svelte: "@ui-organized/svelte",
  vue: "@ui-organized/vue",
  angular: "@ui-organized/angular",
} as const;
export type Framework = keyof typeof LIBRARIES;

export const FRAMEWORKS = Object.keys(LIBRARIES) as Framework[];

export const LABELS: Record<Framework, string> = { react: "React", svelte: "Svelte", vue: "Vue", angular: "Angular" };

export interface Project {
  root: string;
  /** Where an existing theme.css already lives, if one does. */
  existingThemeCss?: string;
  /** Where the app's entry module is, for the import-order advice. */
  entry?: string;
  packageManager: "npm" | "pnpm" | "yarn" | "bun";
  /** package.json's dependencies and devDependencies; empty when there's none to read. */
  dependencies: Record<string, string>;
  /** The UI Organized libraries package.json lists, in `LIBRARIES` order. */
  libraries: Framework[];
  /** An Angular CLI workspace's angular.json, which takes the global stylesheets. */
  angularJson?: string;
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

  const dependencies = readDependencies(join(root, "package.json")) ?? {};
  const project: Project = {
    root,
    packageManager: detectPackageManager(root),
    dependencies,
    libraries: librariesIn(dependencies),
  };

  const existing = findFile(root, (name) => name === "theme.css", outside);
  if (existing) project.existingThemeCss = existing;

  const entry = findEntry(root);
  if (entry) project.entry = entry;

  if (existsSync(join(root, "angular.json"))) project.angularJson = join(root, "angular.json");

  const clean = gitClean(root);
  if (clean !== undefined) project.gitClean = clean;

  return project;
}

/**
 * A package.json's dependencies and devDependencies, or undefined when there's
 * no manifest or it doesn't parse. Never throws: `theme` only reads this to
 * tailor its advice, so an unreadable manifest means less tailoring, not a
 * failed apply. (`init` reads its own way, because it must refuse instead.)
 */
export function readDependencies(manifest: string): Record<string, string> | undefined {
  try {
    const pkg = JSON.parse(readFileSync(manifest, "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    return { ...pkg.dependencies, ...pkg.devDependencies };
  } catch {
    return undefined;
  }
}

/** The UI Organized libraries a dependency list names, in `LIBRARIES` order. */
export function librariesIn(dependencies: Record<string, string>): Framework[] {
  return FRAMEWORKS.filter((fw) => dependencies[LIBRARIES[fw]] !== undefined);
}

/**
 * Workspace packages that declare a UI Organized library, for when `root` is a
 * monorepo root that declares none itself. A theme applied there lands in the
 * root's `src/`, beside no app, so the useful answer is which `--cwd` to use.
 */
export function workspaceLibraries(root: string): { dir: string; libraries: Framework[] }[] {
  return workspacePackages(root)
    .map((dir) => ({ dir, libraries: librariesIn(readDependencies(join(root, dir, "package.json")) ?? {}) }))
    .filter((pkg) => pkg.libraries.length > 0);
}

/**
 * The real directory of `node_modules/<name>`, from `root` or any directory
 * above it: where Node would look, so a hoisted install in a monorepo's root
 * counts. Real, because pnpm and workspaces install through symlinks, and only
 * from the real path does resolution find the package's own dependencies.
 */
export function findInstalled(root: string, name: string): string | undefined {
  for (let dir = resolve(root); ; dir = dirname(dir)) {
    const candidate = join(dir, "node_modules", name);
    if (existsSync(join(candidate, "package.json"))) {
      try {
        return realpathSync(candidate);
      } catch {
        return candidate;
      }
    }
    if (dirname(dir) === dir) return undefined;
  }
}

/** The installed version of `name`, else the range package.json asks for. */
export function versionOf(project: Project, name: string): string | undefined {
  const installed = findInstalled(project.root, name);
  if (installed) {
    try {
      const { version } = JSON.parse(readFileSync(join(installed, "package.json"), "utf8")) as { version?: string };
      if (version) return version;
    } catch {
      // Fall through to the declared range.
    }
  }
  return project.dependencies[name];
}

/**
 * The token contract the installed library was built against.
 *
 * `@ui-organized/core` ships it and all four libraries depend on core, so it is
 * looked up *through* the library: walking up from the library's real path the
 * way Node resolves its imports finds the core that library uses, wherever the
 * package manager put it. Looking from the project root instead misses it
 * under pnpm, which doesn't hoist a dependency's dependencies next to the app.
 * React 5.x predates core and ships its own copy, so that is the fallback.
 *
 * Walked by hand rather than with `createRequire().resolve()`, which also
 * searches NODE_PATH and the global folders: pnpm sets NODE_PATH for every bin
 * it runs, so a React 5 install with no core of its own "resolved" to whatever
 * core the virtual store held.
 */
export function findTokenContract(root: string, framework: Framework): string | undefined {
  const library = findInstalled(root, LIBRARIES[framework]);
  if (!library) return undefined;
  const core = findInstalled(library, "@ui-organized/core");
  for (const path of [core && join(core, "token-contract.json"), join(library, "token-contract.json")]) {
    if (path && existsSync(path)) return path;
  }
  return undefined;
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
