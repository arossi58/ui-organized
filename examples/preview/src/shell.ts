/**
 * The page furniture every framework page shares, and the catalogue it renders.
 *
 * The catalogue is not written here. It comes from the parity harness's case
 * modules, which already hold one fixture per framework and a curated set of
 * props for every component in the library — the same fixtures the gates render.
 * Reusing them is the whole reason this app is a few hundred lines instead of
 * 268 hand-written examples, and it means the preview cannot drift: a component
 * added to a library arrives here the moment its case file does, and one whose
 * props change shows the new ones.
 *
 * The tradeoff, stated plainly: these are gate fixtures, not idiomatic consumer
 * code. They show what a component *renders*, not how you would best write it.
 * The docs site is where usage lives.
 */
import { SPECS, type ParitySpec } from "@ui-organized/parity/cases";

export type Framework = "react" | "svelte" | "vue" | "angular";

export interface CatalogueEntry {
  /** Component name, e.g. `"Accordion"`. */
  name: string;
  /** The state being shown — the first case's name, e.g. `"default"`. */
  state: string;
  /** Props for that state, passed to whichever framework is rendering. */
  props: Record<string, unknown>;
  spec: ParitySpec;
}

/**
 * Every component, in the order the gates list them, showing one state each.
 *
 * Not simply `cases[0]`. The first case is a component's plainest state by
 * convention, which for a field means no label — and an unlabelled `Input` next
 * to an unlabelled `TextArea` next to an unlabelled `Combobox` reads as three
 * broken components rather than three bare ones. A case that names itself is
 * both more representative and more obviously working, so a labelled case wins
 * when the component has one.
 *
 * Still one case per component rather than all of them: 67 components across
 * every state is a test report, not a preview.
 */
/**
 * Props a component needs to survive an actual render, where its gate case does
 * not need them.
 *
 * The gate renders once and statically, so a machine that only validates its
 * config when it starts never gets the chance to complain. `Tour` is exactly
 * that: zag rejects a step with neither `target` nor `type` at construction, and
 * every case in `cases/Tour.tsx` but one uses bare steps — correct there,
 * because the SSR gate is testing that nothing escapes the portal, and fatal
 * here, where the machine really runs.
 *
 * Overriding rather than changing the case: the case is right for what it
 * asserts, and this page is the one that renders for real.
 */
const LIVE_PROPS: Record<string, Record<string, unknown>> = {
  Tour: {
    steps: [
      { id: "one", title: "One", description: "First step", type: "dialog" },
      { id: "two", title: "Two", description: "Second step", type: "dialog" },
    ],
    // Closed. An open tour is modal: it dims the whole document with a backdrop
    // and floats its card over everything, so a preview that opened one would
    // show a tour and hide the other sixty-six components behind it.
    stepId: null,
  },
};

export const CATALOGUE: CatalogueEntry[] = SPECS.map((spec) => {
  const labelled = spec.cases.find(
    (c) => c.props && typeof (c.props as Record<string, unknown>).label === "string",
  );
  const chosen = labelled ?? spec.cases[0];
  const override = LIVE_PROPS[spec.component];
  return {
    name: spec.component,
    state: override ? "live" : (chosen?.name ?? "default"),
    props: override ?? ((chosen?.props ?? {}) as Record<string, unknown>),
    spec,
  };
});

/**
 * Components the catalogue cannot reach, and why.
 *
 * The catalogue is built from the parity case files, and a component with no
 * case file simply is not in it — which would mean this page silently omitting
 * something the library ships, the exact failure the "not implemented" cards
 * exist to prevent. So they are listed here instead, with the reason.
 *
 * Self-correcting: anything that later gains a case file is dropped from this
 * list automatically below, so a stale entry cannot produce a duplicate card.
 */
const NO_CASE: Record<string, string> = {
  Toast: "renders nothing until one is fired — see the browser gate",
};

export const UNPREVIEWABLE = Object.entries(NO_CASE)
  .filter(([name]) => !SPECS.some((s) => s.component === name))
  .map(([name, reason]) => ({ name, reason }));

/**
 * Cards where the *harness* is what you are looking at, not the component.
 *
 * The catalogue renders the parity fixtures, and one of them deliberately does
 * not render a real component: Angular's `Icon` fixture provides the gate's stub
 * icon set through `UIO_ICON_CONFIG`, which takes precedence over the registry
 * this app fills with Lucide. That is right for the gate — it compares the size
 * and stroke our adapters compute rather than Lucide's artwork — and it means
 * this one card draws an empty `<svg>`.
 *
 * Said out loud rather than left looking broken. Every other icon on the Angular
 * page is real Lucide, which is the actual evidence that the component works.
 */
const HARNESS_ARTIFACT: Record<string, string> = {
  "angular:Icon":
    "the gate's stub icon set is pinned into this fixture, so it draws no artwork — " +
    "every other icon on this page is real",
};

const LABELS: Record<Framework, string> = {
  react: "React",
  svelte: "Svelte",
  vue: "Vue",
  angular: "Angular",
};

/**
 * The viewer's theme, remembered.
 *
 * The token set's `:root` is the *dark* palette — `--color-content-primary` is
 * `--grey-100`, `#fcfcfc` — and `[data-theme="light"]` is the override. A
 * component catalogue is read light far more often than dark, so light is the
 * default here and the stamp is explicit either way rather than left to
 * whatever `:root` happens to be.
 */
function applyTheme(theme: "light" | "dark"): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  try {
    localStorage.setItem("pv-theme", theme);
  } catch {
    // A private window or blocked site data. The page works without persistence,
    // so a failed write must not take the preview down with it.
  }
}

function storedTheme(): "light" | "dark" {
  try {
    return localStorage.getItem("pv-theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

/**
 * Builds the masthead and the empty grid, and returns the grid.
 *
 * `shipped` is passed in rather than derived, because only the entry knows which
 * of its fixtures exist — and Angular's live somewhere else entirely.
 */
export function renderShell(framework: Framework, shipped: number): HTMLElement {
  document.title = `${LABELS[framework]} — ui-organized preview`;
  document.body.className = "pv-page";

  let theme = storedTheme();
  applyTheme(theme);

  const masthead = document.createElement("header");
  masthead.className = "pv-masthead";

  const h1 = document.createElement("h1");
  h1.textContent = LABELS[framework];

  const count = document.createElement("span");
  count.className = "pv-count";
  count.textContent = `${shipped} of ${CATALOGUE.length + UNPREVIEWABLE.length}`;

  const nav = document.createElement("nav");
  nav.className = "pv-nav";
  for (const fw of ["react", "svelte", "vue", "angular"] as const) {
    const a = document.createElement("a");
    a.href = `/${fw}.html`;
    a.textContent = LABELS[fw];
    if (fw === framework) a.setAttribute("aria-current", "page");
    nav.append(a);
  }

  const tools = document.createElement("div");
  tools.className = "pv-tools";

  // 67 cards is more than fits on a screen, and the thing you usually want is
  // one of them.
  const filter = document.createElement("input");
  filter.className = "pv-filter";
  filter.type = "search";
  filter.placeholder = "Filter components";
  filter.setAttribute("aria-label", "Filter components");

  const themeButton = document.createElement("button");
  themeButton.className = "pv-theme";
  themeButton.type = "button";
  const paintThemeButton = () => {
    themeButton.textContent = theme === "light" ? "Dark" : "Light";
    themeButton.setAttribute("aria-label", `Switch to ${theme === "light" ? "dark" : "light"} theme`);
  };
  paintThemeButton();
  themeButton.addEventListener("click", () => {
    theme = theme === "light" ? "dark" : "light";
    applyTheme(theme);
    paintThemeButton();
  });

  tools.append(filter, themeButton);
  masthead.append(h1, count, nav, tools);

  const note = document.createElement("p");
  note.className = "pv-note";
  note.textContent =
    "Every component this library ships, styled only by @ui-organized/core. " +
    "The components are live — open a Select, type in a field. This page is for " +
    "looking at; the parity gates are what prove the four libraries render the " +
    "same DOM.";

  const grid = document.createElement("main");
  grid.className = "pv-grid";

  const empty = document.createElement("p");
  empty.className = "pv-empty";
  empty.hidden = true;
  empty.textContent = "Nothing matches that.";

  filter.addEventListener("input", () => {
    const q = filter.value.trim().toLowerCase();
    let shown = 0;
    for (const el of grid.querySelectorAll<HTMLElement>(".pv-card")) {
      const name = el.querySelector(".pv-card__name")?.textContent ?? "";
      const match = !q || name.toLowerCase().includes(q);
      el.hidden = !match;
      if (match) shown += 1;
    }
    empty.hidden = shown > 0;
  });

  document.body.append(masthead, note, grid, empty);
  return grid;
}

/** A note for a card whose fixture cannot show the real component, or null. */
export function harnessNote(framework: Framework, name: string): string | null {
  return HARNESS_ARTIFACT[`${framework}:${name}`] ?? null;
}

/** One card, with its header already filled in. Returns the body to render into. */
export function card(grid: HTMLElement, entry: CatalogueEntry): HTMLElement {
  const el = document.createElement("section");
  el.className = "pv-card";

  const head = document.createElement("div");
  head.className = "pv-card__head";

  const name = document.createElement("span");
  name.className = "pv-card__name";
  name.textContent = entry.name;

  const state = document.createElement("span");
  state.className = "pv-card__state";
  state.textContent = entry.state;

  head.append(name, state);

  const body = document.createElement("div");
  body.className = "pv-card__body";

  el.append(head, body);
  grid.append(el);
  return body;
}

/** A component this library does not ship. Shown in place, never omitted. */
export function missing(grid: HTMLElement, entry: CatalogueEntry, framework: Framework): void {
  const body = card(grid, entry);
  (body.parentElement as HTMLElement).classList.add("pv-card--missing");
  body.textContent = `not implemented in ${LABELS[framework]}`;
}

/**
 * A component that threw.
 *
 * Caught per card so one failure does not take the page down — with 67 of them
 * the odds of that are not academic, and "the whole page is blank" tells you
 * much less than "this one threw, here is what it said".
 */
export function failed(body: HTMLElement, error: unknown): void {
  (body.parentElement as HTMLElement).classList.add("pv-card--error");
  body.textContent = error instanceof Error ? error.message : String(error);
}

/**
 * A component that ships but has no previewable state.
 *
 * Distinct from `missing`: that one means "this library does not have it", this
 * one means "every library has it and none of them renders anything you could
 * put in a card".
 */
export function unpreviewable(grid: HTMLElement, name: string, reason: string): void {
  const body = card(grid, { name, state: "no preview", props: {}, spec: null as never });
  (body.parentElement as HTMLElement).classList.add("pv-card--missing");
  body.textContent = reason;
}
