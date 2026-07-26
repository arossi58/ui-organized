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
