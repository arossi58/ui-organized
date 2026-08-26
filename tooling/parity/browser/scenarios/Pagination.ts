import { openViaTrigger, part, staticScenarios, type BrowserScenario } from "./scenario.js";

/**
 * The window arithmetic is shared code in `@ui-organized/core`, so what these
 * compare is that every library *calls* it the same way and renders what comes
 * back the same way — including where the gaps land, which is the part each
 * library would otherwise re-derive and get subtly wrong at the ends.
 *
 * There is deliberately no "click a page" case. React's `Pagination` is
 * controlled and the harness hands it a no-op `onPageChange`, so a click moves
 * nothing on that side while Svelte, Vue and Angular all own the page
 * internally — the comparison would report the harness's choice as a port's
 * divergence. What a click *can* reach without that problem is the jump menu,
 * which is the interactive case below.
 */
const scenarios: BrowserScenario[] = [
  ...staticScenarios("Pagination", [
    // Pinned at the start: one trailing gap, and a disabled previous control.
    { name: "first page", props: { page: 1, count: 10 } },
    // The middle, where both gaps exist at once.
    { name: "middle", props: { page: 5, count: 10 } },
    { name: "last page", props: { page: 10, count: 10 } },
    // Short enough that no page is collapsed at all.
    { name: "no gaps", props: { page: 2, count: 3 } },
    // A gap exactly one page wide, which the algorithm renders as the page
    // itself rather than an ellipsis hiding a single number.
    { name: "gap of one", props: { page: 1, count: 5, siblingCount: 1, boundaryCount: 1 } },
    { name: "sibling count", props: { page: 6, count: 20, siblingCount: 2 } },
    { name: "boundary count", props: { page: 10, count: 20, boundaryCount: 3 } },
    { name: "without prev/next", props: { page: 5, count: 10, showPrevNext: false } },
    // One page: both arrows disabled at once, and no gap to collapse.
    { name: "single page", props: { page: 1, count: 1 } },
  ]),
  {
    component: "Pagination",
    name: "jump menu open",
    props: { page: 5, count: 10 },
    /**
     * A gap is not decoration — it is the only way to reach the pages it hides —
     * and the menu behind it is portalled, so nothing static has ever compared
     * it. The first trigger on the page is the first ellipsis, which is the one
     * that opens.
     */
    steps: openViaTrigger("menu"),
    regions: [part("menu", "positioner"), "#mount"],
  },
];

export default scenarios;
