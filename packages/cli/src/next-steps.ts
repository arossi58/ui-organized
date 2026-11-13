import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import type { BundleFont, IconSettings } from "./bundle.js";
import {
  display,
  installCommand,
  LIBRARIES,
  versionOf,
  type Framework,
  type Project,
} from "./project.js";
import { SETUP, THEME_NOTE, type IconLibrary } from "./setup.js";

/**
 * What the CLI can't do for you, per library.
 *
 * Import sites differ by framework and the head is not ours to edit, so this
 * prints the lines rather than guessing where they go. They follow Get started
 * (see `setup.ts`): the token baseline first, each library's own stylesheet,
 * the Angular CLI's `angular.json` instead of imports, and each library's own
 * icon provider. They used to be React's whatever the project was.
 */

export interface StepsInput {
  project: Project;
  framework: Framework;
  themeCssPath: string;
  /** Where icons.ts was written. React only. */
  iconsTsPath?: string;
  icons?: IconSettings;
  fonts: BundleFont[];
}

/** One string per step: a sentence, then code indented six spaces. */
export function nextSteps(input: StepsInput): string[] {
  const { project, framework, icons, fonts } = input;
  const steps = [stylesheetStep(input)];

  const pkg = icons ? SETUP[framework].iconPackages[icons.library as IconLibrary] : undefined;
  // No adapter for the theme's set: a warning above says so, and a step here
  // would name a subpath that doesn't exist.
  if (icons && pkg) {
    const where =
      framework === "angular" && project.angularJson
        ? ` (${entryName(project) ?? "src/main.ts"})`
        : "";
    steps.push(
      `Install the icon set, and register it at your app entry${where}. ${LIBRARIES[framework]} imports none itself:\n` +
        code([
          ...(project.dependencies[pkg]
            ? []
            : [installCommand(project, `${pkg}${ngIconsPin(project, framework)}`)]),
          `import '${LIBRARIES[framework]}/icons/${icons.library}'`,
        ]),
    );
    steps.push(providerStep(input, icons));
  }

  if (fonts.length > 0) {
    steps.push(
      `Add the font links to your document head — a stylesheet can name a\n` +
        `    typeface but not efficiently load one:\n` +
        code([
          `<link rel="preconnect" href="https://fonts.googleapis.com">`,
          `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`,
          ...fonts.map((f) => `<link rel="stylesheet" href="${f.href}">`),
        ]),
    );
  }
  return steps;
}

const ORDER =
  "    Order matters: theme.css and @ui-organized/tokens/variables.css both declare on :root,\n" +
  "    and that tie goes to whichever loads last.";

function stylesheetStep({ project, framework, themeCssPath }: StepsInput): string {
  const { stylesheets } = SETUP[framework];
  const tokens = project.dependencies["@ui-organized/tokens"]
    ? ""
    : `\n    The baseline is its own package: ${installCommand(project, "@ui-organized/tokens")}`;

  // The Angular CLI takes global stylesheets in angular.json, not as imports.
  if (framework === "angular" && project.angularJson) {
    const { app, own } = angularStyles(project.angularJson);
    const theme = display(project, themeCssPath);
    const styles = [...stylesheets.map((s) => s.path), theme, ...own.filter((s) => s !== theme)];
    return (
      `Add the stylesheets to angular.json, under projects › ${app ?? "your app"} › architect › build › options, in this order:\n` +
      code([
        '"styles": [',
        ...styles.map((s, i) => `  ${JSON.stringify(s)}${i < styles.length - 1 ? "," : ""}`),
        "]",
      ]) +
      `\n${ORDER}${tokens}`
    );
  }

  const lines = [
    ...stylesheets.map((s) => [`import '${s.path}'`, s.note]),
    [`import '${importSpecifier(project, themeCssPath)}'`, THEME_NOTE],
  ];
  const width = Math.max(...lines.map(([line]) => line!.length)) + 2;
  return (
    `Import the stylesheets at your app entry${project.entry ? ` (${display(project, project.entry)})` : ""}, in this order:\n` +
    code(lines.map(([line, note], i) => `${line!.padEnd(width)}// ${i + 1}. ${note}`)) +
    `\n${ORDER}${tokens}`
  );
}

/** The theme's icon settings, as this library's provider takes them. */
function providerStep(
  { project, framework, iconsTsPath }: StepsInput,
  icons: IconSettings,
): string {
  switch (framework) {
    case "react":
      return iconsTsPath
        ? `Wrap your app in IconProvider, with the settings icons.ts exports:\n` +
            code([
              `import { IconProvider } from '@ui-organized/react'`,
              `import { iconConfig } from '${importSpecifier(project, iconsTsPath).replace(/\.ts$/, "")}'`,
              "",
              "<IconProvider {...iconConfig}>",
              "  <App />",
              "</IconProvider>",
            ])
        : `Wrap your app in IconProvider, with the theme's icon settings:\n` +
            code([
              `import { IconProvider } from '@ui-organized/react'`,
              "",
              ...jsxProvider(icons, "<App />"),
            ]);
    case "svelte":
      return (
        `Wrap your app in IconProvider, with the theme's icon settings:\n` +
        code([
          `<script lang="ts">`,
          `  import { IconProvider } from '@ui-organized/svelte'`,
          `</script>`,
          "",
          ...jsxProvider(icons, "<!-- the rest of your app -->"),
        ])
      );
    case "vue": {
      // icon-style, not style: Vue reserves `style` for inline CSS.
      const props = [
        `library="${icons.library}"`,
        ...(icons.style !== undefined ? [`icon-style="${icons.style}"`] : []),
        ...(icons.strokeAdjustment ? ["stroke-adjustment"] : []),
        ...(icons.baseSize !== undefined ? [`:base-size="${icons.baseSize}"`] : []),
        ...(icons.baseStroke !== undefined ? [`:base-stroke="${icons.baseStroke}"`] : []),
      ];
      return (
        `Wrap your app in IconProvider, with the theme's icon settings:\n` +
        code([
          `<script setup lang="ts">`,
          `import { IconProvider } from '@ui-organized/vue'`,
          `</script>`,
          "",
          "<template>",
          "  <IconProvider",
          ...props.map((p) => `    ${p}`),
          "  >",
          "    <!-- the rest of your app -->",
          "  </IconProvider>",
          "</template>",
        ])
      );
    }
    case "angular": {
      const config = join(project.root, "src", "app", "app.config.ts");
      const where = project.angularJson
        ? `the providers in ${existsSync(config) ? display(project, config) : "your app config"}`
        : "bootstrapApplication's providers";
      return (
        `Provide the theme's icon settings, in ${where}:\n` +
        code([
          `import { provideIconConfig } from '@ui-organized/angular'`,
          "",
          "provideIconConfig({",
          `  library: '${icons.library}',`,
          ...(icons.style !== undefined ? [`  style: '${icons.style}',`] : []),
          ...(icons.strokeAdjustment !== undefined
            ? [`  strokeAdjustment: ${icons.strokeAdjustment},`]
            : []),
          ...(icons.baseSize !== undefined ? [`  baseSize: ${icons.baseSize},`] : []),
          ...(icons.baseStroke !== undefined ? [`  baseStroke: ${icons.baseStroke},`] : []),
          "}),",
        ])
      );
    }
  }
}

/** `<IconProvider …>` in JSX attribute syntax, which React and Svelte share. */
function jsxProvider(icons: IconSettings, child: string): string[] {
  const props = [
    `library="${icons.library}"`,
    ...(icons.style !== undefined ? [`style="${icons.style}"`] : []),
    // Off is the default, and a bare attribute means on.
    ...(icons.strokeAdjustment ? ["strokeAdjustment"] : []),
    ...(icons.baseSize !== undefined ? [`baseSize={${icons.baseSize}}`] : []),
    ...(icons.baseStroke !== undefined ? [`baseStroke={${icons.baseStroke}}`] : []),
  ];
  return ["<IconProvider", ...props.map((p) => `  ${p}`), ">", `  ${child}`, "</IconProvider>"];
}

/**
 * The project's own global stylesheets from angular.json, to keep after the
 * theme, and the app's name for the path to them. Without a readable file,
 * the `ng new` default.
 */
function angularStyles(path: string): { app?: string; own: string[] } {
  try {
    const workspace = JSON.parse(readFileSync(path, "utf8")) as {
      projects?: Record<string, { architect?: { build?: { options?: { styles?: unknown } } } }>;
    };
    for (const [app, config] of Object.entries(workspace.projects ?? {})) {
      const styles = config.architect?.build?.options?.styles;
      if (!Array.isArray(styles)) continue;
      const ours = new Set(SETUP.angular.stylesheets.map((s) => s.path));
      // An object entry ({ input, bundleName }) is somebody's deliberate setup; name its input.
      const own = styles
        .map((s: unknown) => (typeof s === "string" ? s : (s as { input?: unknown })?.input))
        .filter((s): s is string => typeof s === "string" && !ours.has(s));
      return { app, own };
    }
  } catch {
    // Unreadable: fall through to the default.
  }
  return { own: ["src/styles.css"] };
}

/**
 * `@34` on Angular 21. @ng-icons 35 and later need Angular 22, so on 21 an
 * unpinned install stops with ERESOLVE (Get started says the same).
 */
function ngIconsPin(project: Project, framework: Framework): string {
  if (framework !== "angular") return "";
  const major = /\d+/.exec(versionOf(project, "@angular/core") ?? "")?.[0];
  return major === "21" ? "@34" : "";
}

function entryName(project: Project): string | undefined {
  return project.entry ? display(project, project.entry) : undefined;
}

/** Lines of code, indented under the step's sentence. */
function code(lines: string[]): string {
  return lines.map((line) => (line ? `      ${line}` : "")).join("\n");
}

/** How the entry module would import a file we just wrote. */
function importSpecifier(project: Project, path: string): string {
  if (!project.entry) return `./${display(project, path)}`;
  const rel = relative(project.entry.replace(/[^/\\]+$/, ""), path)
    .split(/[\\/]/)
    .join("/");
  return rel.startsWith(".") ? rel : `./${rel}`;
}
