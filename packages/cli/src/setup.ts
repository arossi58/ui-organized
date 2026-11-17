/**
 * Each library's setup, as `uiorg theme` prints it after applying a theme.
 *
 * Get started (`apps/marketing/src/docs/pages/getStartedSnippets.ts`) is the
 * source: its snippets are checked against real builds, and this is the part
 * of them the CLI repeats. The stylesheets in the order the entry imports them,
 * with the same numbered comments, and the icon package for each set a library
 * has an adapter for. `apps/marketing/scripts/cli-setup.test.ts` fails when the
 * two disagree, so change them together.
 *
 * Deliberately import-free, so that test can load it without the CLI's
 * Node-only modules.
 */

/** The icon sets the Theme Builder offers, by the name `icons.ts` gives them. */
export type IconLibrary = "lucide" | "tabler" | "heroicons";

export interface LibrarySetup {
  /** Stylesheets that load before the theme, in order, each with its import comment. */
  stylesheets: { path: string; note: string }[];
  /**
   * The icon package for each set this library has an adapter for, in the
   * order Get started lists them. A set that's missing has none.
   */
  iconPackages: Partial<Record<IconLibrary, string>>;
}

const TOKENS = { path: "@ui-organized/tokens/variables.css", note: "token baseline" };

/** The theme's own import comment, numbered after the stylesheets. */
export const THEME_NOTE = "your theme, last so it wins";

export const SETUP: Record<"react" | "svelte" | "vue" | "angular", LibrarySetup> = {
  react: {
    stylesheets: [TOKENS, { path: "@ui-organized/react/styles", note: "component styles" }],
    iconPackages: {
      lucide: "lucide-react",
      tabler: "@tabler/icons-react",
      heroicons: "@heroicons/react",
    },
  },
  svelte: {
    stylesheets: [TOKENS, { path: "@ui-organized/svelte/styles.css", note: "component styles" }],
    // No Heroicons: the library's icon exports are lucide and tabler only.
    iconPackages: { lucide: "@lucide/svelte", tabler: "@tabler/icons-svelte" },
  },
  vue: {
    stylesheets: [TOKENS, { path: "@ui-organized/vue/styles.css", note: "component styles" }],
    iconPackages: {
      lucide: "@lucide/vue",
      tabler: "@tabler/icons-vue",
      heroicons: "@heroicons/vue",
    },
  },
  // As imports on Vite (Get started's ANGULAR_VITE_ENTRY); the Angular CLI
  // takes the same list, in the same order, in angular.json's "styles".
  angular: {
    stylesheets: [
      TOKENS,
      { path: "@angular/cdk/overlay-prebuilt.css", note: "the CDK's overlay pane" },
      { path: "@ui-organized/angular/styles.css", note: "component styles" },
      { path: "@ui-organized/angular/overlay.css", note: "overlay stacking" },
    ],
    iconPackages: {
      lucide: "@ng-icons/lucide",
      tabler: "@ng-icons/tabler-icons",
      heroicons: "@ng-icons/heroicons",
    },
  },
};
