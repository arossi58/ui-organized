import { HIDDEN_SELECT_TEXT, notYetIn, type BrowserScenario, type Step } from "./scenario.js";

/**
 * The data table, driven the way a keyboard and a pointer drive it.
 *
 * ── Why this file is the valuable half ──────────────────────────────────────
 *
 * The SSR case pins the markup: widths, alignments, `scope="row"`, `aria-sort`,
 * the `<colgroup>`. None of that is where a port goes wrong. What breaks in a
 * port is the *scheduling* — the roving cursor that has to follow focus without
 * taking it, the deferred filter pass that must not make a controlled input lag,
 * the virtualizer's spacer arithmetic — and none of it exists until something
 * has been clicked or typed in a real browser.
 *
 * React's answer to each of those is documented in `useDataTable.ts` and is
 * React-specific: `useDeferredValue`, `startTransition`, a two-frame retry for
 * PageDown into un-rendered rows. **No other framework here has any of them.**
 * So each port needs its own scheduling answer, and these scenarios are the only
 * thing that will say whether it got one right. Landing them before the ports —
 * against React alone — is what makes them a specification rather than a
 * post-hoc description of whatever the port happened to do.
 *
 * ── While two libraries are missing ─────────────────────────────────────────
 *
 * Vue is compared. Svelte and Angular are skipped through `notYetIn`, so the
 * gate stays green and still runs every step against the two that exist —
 * remove a framework from the call when its package lands and the whole file
 * starts comparing it.
 */
const UNPORTED = notYetIn("DataTable", "svelte", "angular");

const TABLE = ".data-table__table";
const HEAD_CELL = ".data-table__head-cell";
const ROW = ".data-table__body .data-table__row";
const CELL = ".data-table [data-cell]";
/** The one cell in the grid that is a tab stop — the roving cursor. */
const CURSOR = `${CELL}[tabindex="0"]`;

/** The whole table. Nothing here portals, so one region covers it. */
const REGIONS = ["#mount"];

/**
 * `HIDDEN_SELECT_TEXT` on every scenario, not just the paginated ones.
 *
 * The page-size picker is a `Select`, and Ark Vue's hidden native control
 * stringifies an option's text through the collection's path join — "25 > "
 * against React's "25". The element is aria-hidden and visually hidden and
 * exists only so the value is submitted with a form; the allowance is checked
 * rather than trusted, and fails if it ever stops being aria-hidden.
 */
const table = (
  name: string,
  props: Record<string, unknown>,
  steps: Step[] = [],
): BrowserScenario => ({
  component: "DataTable",
  name,
  props,
  steps,
  regions: REGIONS,
  skip: UNPORTED,
  allowTextIn: [HIDDEN_SELECT_TEXT],
});

const scenarios: BrowserScenario[] = [
  // ── Measured states the server cannot reach ────────────────────────────────
  //
  // Each of these needs a viewport with a width, which is the whole reason they
  // are here rather than in the SSR case.
  table("default", {}),
  table("virtualized", { virtual: true, maxHeight: 320 }),
  // Columns wider than any viewport, so the scroll controls appear because there
  // is genuinely somewhere to scroll to. Their *absence* from the `default` case
  // above is the other half of the assertion: a control that renders permanently
  // disabled is worse than one that renders when it is needed.
  {
    component: "DataTable",
    name: "horizontally overflowing",
    props: { columnSet: "wide", maxHeight: 320 },
    steps: [{ do: "wait", target: ".data-table__scroll-buttons" }],
    regions: REGIONS,
    skip: UNPORTED,
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },

  // ── Sorting ───────────────────────────────────────────────────────────────
  {
    component: "DataTable",
    /**
     * Sorted by clicking, not by seeding.
     *
     * The SSR case already pins what a sorted header looks like. What this adds
     * is that the click reaches the engine at all, and that `aria-sort` and the
     * row order move together — a header that reports a sort nothing performed
     * is worse than a header that reports none.
     */
    name: "sorted by clicking a header",
    props: {},
    steps: [
      { do: "click", target: `${HEAD_CELL} button.data-table__sort-button` },
      { do: "wait", target: `${HEAD_CELL}[aria-sort="ascending"]` },
    ],
    regions: REGIONS,
    skip: UNPORTED,
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },
  {
    component: "DataTable",
    name: "sort reversed by clicking twice",
    props: {},
    steps: [
      { do: "click", target: `${HEAD_CELL} button.data-table__sort-button` },
      { do: "wait", target: `${HEAD_CELL}[aria-sort="ascending"]` },
      { do: "click", target: `${HEAD_CELL} button.data-table__sort-button` },
      { do: "wait", target: `${HEAD_CELL}[aria-sort="descending"]` },
    ],
    regions: REGIONS,
    skip: UNPORTED,
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },

  // ── The roving cursor ─────────────────────────────────────────────────────
  //
  // The single most likely thing to break in a port, and the one the React
  // implementation has a comment about breaking once already: "follow focus" and
  // "take focus" are separate operations, and merging them yanks focus out of
  // every inline editor. Exactly one cell in the grid is a tab stop at a time.
  {
    component: "DataTable",
    /**
     * The cursor moves, and the cell it left gives up its tab stop.
     *
     * Waiting on a *specific* cell rather than on `CURSOR` is the point: a grid
     * that never moved the cursor still matches `[tabindex="0"]` somewhere and
     * would pass. `data-cell` is `row:column`, so this says the cursor is on the
     * second column of the first row and nowhere else.
     *
     * A grid where two cells both carry `tabindex="0"` still looks correct and
     * still answers the arrow keys — it just puts a second stop in the page's tab
     * order, which nobody notices until they tab through the page. The region
     * comparison catches that one, on every cell at once.
     */
    name: "arrow keys move the cursor",
    // `selection` rather than `{}`, and not incidentally: core's `interactive`
    // chrome flag is what turns the table into a `role="grid"` with a roving
    // cursor at all, and it is false until something in the table takes focus or
    // changes state. A table with nothing to operate stays a plain `table`,
    // which is both simpler and better announced — so there is no cursor to
    // move until selection, inline edit or row activation is on.
    props: { selection: "multiple" },
    steps: [
      { do: "focus", target: CURSOR },
      { do: "press", key: "ArrowRight" },
      { do: "wait", target: `.data-table [data-cell="0:1"][tabindex="0"]` },
      { do: "press", key: "ArrowDown" },
      { do: "wait", target: `.data-table [data-cell="1:1"][tabindex="0"]` },
    ],
    regions: REGIONS,
    skip: UNPORTED,
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },
  {
    component: "DataTable",
    /**
     * The header is row `-1`, and the cursor reaches it.
     *
     * Worth its own scenario because the header is not part of the body's row
     * model — a port that built the cursor out of row indices alone gets every
     * body move right and stops dead at the top.
     */
    name: "the cursor reaches the header row",
    props: { selection: "multiple" },
    steps: [
      { do: "focus", target: CURSOR },
      { do: "press", key: "ArrowRight" },
      { do: "press", key: "ArrowUp" },
      { do: "wait", target: `.data-table [data-cell="-1:1"][tabindex="0"]` },
    ],
    regions: REGIONS,
    skip: UNPORTED,
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },

  // ── Selection ─────────────────────────────────────────────────────────────
  //
  /**
   * Both selection scenarios drop the checkbox's own subtree, and the reason is
   * a real divergence rather than a convenience.
   *
   * After a **pointer** click, React's checkbox carries `data-focus-visible` and
   * Vue's does not — so React draws a focus ring where Vue draws none, and
   * `Checkbox.css` selects on `[data-focus-visible]`, which is what rules out an
   * `allow`. What is known about it:
   *
   *  - It is not the port's markup: every other attribute on every element in
   *    these captures is identical, `data-focus` and `data-hover` included.
   *  - It is not pointer-modality ordering: clicking a body cell first, which
   *    establishes pointer modality beyond doubt, changes nothing.
   *  - It is not this package's `SelectCell` wrapper: the *header* checkbox has
   *    no such wrapper and diverges identically.
   *  - It does not reproduce on a standalone `Checkbox` that is clicked — see
   *    `Checkbox.ts`, where React, Svelte and Vue all agree.
   *
   * What is left is event ordering: React delegates its handlers at the root, so
   * the cell's `focus` handler runs at a different point relative to zag's own
   * focus tracking than Vue's directly-attached one does, and zag reaches a
   * different conclusion about the modality. React's answer is the *worse* one —
   * a mouse click on a checkbox should not draw a focus ring.
   *
   * Excluded rather than skipped so these scenarios still assert what they are
   * named for: the row gains `data-selected`, its class changes, and the
   * selection bar appears. Tracked in RELEASE-6.md; delete the exclusion when it
   * is resolved.
   */
  {
    component: "DataTable",
    name: "a row selected by its checkbox",
    props: { selection: "multiple" },
    steps: [
      { do: "click", target: `${ROW} .data-table__select-hit label.checkbox` },
      { do: "wait", target: `${ROW}[data-selected]` },
    ],
    regions: REGIONS,
    skip: UNPORTED,
    exclude: '[data-scope="checkbox"]',
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },
  {
    component: "DataTable",
    /**
     * The header checkbox, which is the one with three states rather than two.
     * Selecting every row on the page has to leave it checked rather than
     * indeterminate, and the selection bar has to appear — it renders only while
     * something is selected, so its absence is the rest of the assertion.
     */
    name: "every row selected from the header",
    props: { selection: "multiple" },
    steps: [
      { do: "click", target: "thead .data-table__select-hit label.checkbox" },
      { do: "wait", target: ".data-table__selection-bar" },
    ],
    regions: REGIONS,
    skip: UNPORTED,
    exclude: '[data-scope="checkbox"]',
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },

  // ── Search and pagination ─────────────────────────────────────────────────
  {
    component: "DataTable",
    /**
     * Typing is where React's deferred-value split lives, and where a port is
     * most likely to reach for its own framework's transition primitive and get
     * a laggy input or a dropped keystroke. `useDataTable.ts` records that
     * dispatching inside a transition made typing "ada" land as "a".
     *
     * The step list cannot type — the harness drives clicks and keys — so this
     * presses into the search box, which is enough to prove the box is wired and
     * takes focus. The character-level assertion belongs to each package's own
     * tests, and the note is here so a port knows to write one.
     */
    name: "the search box takes focus",
    props: { searchable: true },
    steps: [
      { do: "click", target: '.data-table__toolbar input[type="search"]' },
      { do: "awaitFocus", target: '.data-table__toolbar input[type="search"]' },
    ],
    regions: REGIONS,
    skip: UNPORTED,
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },
  {
    component: "DataTable",
    name: "paged forward",
    props: { paginated: true, pageSize: 3 },
    steps: [
      { do: "click", target: '.data-table__pagination button[aria-label="Next page"]' },
      { do: "wait", target: TABLE },
    ],
    regions: REGIONS,
    skip: UNPORTED,
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },

  // ── Pinned columns ────────────────────────────────────────────────────────
  //
  // The sticky offsets are computed from `column.getStart()`, so they exist in
  // the SSR output — but whether the pinned cell actually paints over the one
  // scrolling under it is a stacking question, and only a browser has one.
  table("pinned column", { columnSet: "pinned", maxHeight: 320 }),
  // Pinned *and* overflowing, which is the only arrangement where pinning does
  // anything at all: a sticky column in a table that fits has nothing to stick
  // against, and the case above pins the markup rather than the behaviour.
  {
    component: "DataTable",
    name: "pinned column while overflowing",
    props: { columnSet: "pinned-wide", maxHeight: 320 },
    steps: [{ do: "wait", target: ".data-table__cell--sticky" }],
    regions: REGIONS,
    skip: UNPORTED,
    allowTextIn: [HIDDEN_SELECT_TEXT],
  },
];

export default scenarios;
