import {
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Preview } from "@storybook/react-vite";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import { DocsContainer } from "@storybook/addon-docs/blocks";
import { addons } from "storybook/preview-api";
import { GLOBALS_UPDATED, SET_GLOBALS } from "storybook/internal/core-events";
import { IconProvider } from "@ui-organized/react";
import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles";
import "../src/preview.css";
import {
  BRAND_TOKEN_KEYS,
  makeManagerTheme,
  readSiteTheme,
  resolveVars,
  type ThemeMode,
} from "./theme";

// Match the canvas to the visitor's brand chosen on the marketing site (shared
// via localStorage on the same origin). Only the brand-derived tokens are
// overridden — the same subset the site's ThemeProvider sets — so the shipped
// `[data-theme]` cascade keeps owning the neutrals and the translucent control
// surfaces. The brand hex is mode-independent, so applying it once is enough;
// light/dark is handled by the themes toolbar below. Falls back to the default
// brand in local dev where storage isn't shared.
const site = readSiteTheme();
if (typeof document !== "undefined") {
  const vars = resolveVars(site.mode, site.brand);
  for (const key of BRAND_TOKEN_KEYS) {
    const value = vars[key];
    if (value) document.documentElement.style.setProperty(key, value);
  }
}

// Live light/dark for the DOCS pages. The themes toolbar only sets `data-theme`
// on the canvas via a decorator — docs pages render outside it, so they wouldn't
// flip. Instead we track the `theme` global (toolbar toggle → GLOBALS_UPDATED;
// initial value mirrors `defaultTheme` = the site's mode, so the site nav's
// picker drives it too after the embed reloads).
function useThemeMode(initial: ThemeMode): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>(initial);
  useEffect(() => {
    const channel = addons.getChannel();
    const apply = (payload: { globals?: Record<string, unknown> }) => {
      const t = payload?.globals?.theme;
      if (t === "light" || t === "dark") setMode(t);
    };
    channel.on(GLOBALS_UPDATED, apply);
    channel.on(SET_GLOBALS, apply);
    return () => {
      channel.off(GLOBALS_UPDATED, apply);
      channel.off(SET_GLOBALS, apply);
    };
  }, []);
  return mode;
}

/**
 * Docs wrapper that re-themes the whole page (background, text, code, sidebar
 * chrome) to the active mode + the site's brand, and exposes `data-theme` +
 * brand vars so any DS `var(--color-*)` inside the docs resolves correctly.
 */
function ThemedDocsContainer({
  context,
  children,
}: {
  context: ComponentProps<typeof DocsContainer>["context"];
  children: ReactNode;
}) {
  const { brand } = useMemo(readSiteTheme, []);
  const mode = useThemeMode(site.mode);
  const theme = useMemo(() => makeManagerTheme(mode, brand), [mode, brand]);
  const style = useMemo(() => {
    const vars = resolveVars(mode, brand);
    // `display: contents` so this carrier of data-theme + brand vars never
    // affects the docs layout — custom properties and the attribute still
    // cascade to descendants by DOM ancestry.
    const s: Record<string, string> = { display: "contents" };
    for (const key of BRAND_TOKEN_KEYS) {
      const value = vars[key];
      if (value) s[key] = value;
    }
    return s as CSSProperties;
  }, [mode, brand]);

  return (
    <DocsContainer context={context} theme={theme}>
      <div data-theme={mode} style={style}>
        {children}
      </div>
    </DocsContainer>
  );
}

const preview: Preview = {
  // Generate an Autodocs page for every component meta. Each page pulls its prop
  // table from the component's `.types.ts` JSDoc and its intro from the
  // `docs.description.component` set per meta.
  // https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  decorators: [
    withThemeByDataAttribute({
      themes: {
        light: "light",
        dark: "dark",
      },
      defaultTheme: site.mode,
      attributeName: "data-theme",
    }),
    (Story) => (
      <IconProvider library="lucide" style="outline" strokeAdjustment={true}>
        <Story />
      </IconProvider>
    ),
  ],
  parameters: {
    backgrounds: { disabled: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /date$/i,
      },
    },
    // Sidebar order: the docs pages first (Introduction, then Foundations),
    // then the component stories; anything else falls in after.
    options: {
      storySort: {
        order: ["Introduction", "Foundations", ["Color"], "Components", "*"],
      },
    },
    layout: "padded",
    // Show the "Code" panel (story source with args applied) for every story.
    // https://storybook.js.org/docs/writing-docs/code-panel
    docs: {
      codePanel: true,
      // Re-theme docs pages live with the toolbar / site theme (see above).
      container: ThemedDocsContainer,
      source: {
        // Keep the preview-only decorators (theme wrapper, IconProvider, and
        // per-story layout decorators like Navigation's NavSurface) out of the
        // Code panel / Autodocs snippets — they're scaffolding, not usage.
        // Multi-component "render" stories additionally pin a hand-curated
        // `source.code` snippet so the panel shows real component usage rather
        // than the demo layout wrappers.
        excludeDecorators: true,
      },
    },
  },
};

export default preview;
