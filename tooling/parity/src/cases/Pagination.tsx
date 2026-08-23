import type { ComponentType } from "react";
import { Pagination as RPagination } from "@ui-organized/react";
import VuePaginationFixture from "../fixtures/vue/PaginationFixture.vue";
import type { ParitySpec } from "./spec.js";

/**
 * The window arithmetic is shared code in @ui-organized/core, so what this
 * compares is that both libraries *call* it the same way and render what comes
 * back the same way — including where the gaps land, which is the part each
 * library would otherwise re-derive and get subtly wrong at the ends.
 */
const spec: ParitySpec = {
  component: "Pagination",
  // React takes an `onPageChange` callback; Vue emits. Neither reaches the DOM,
  // so the case supplies React's and says nothing to Vue. `page` and `count`
  // are *not* defaulted here: both libraries are handed the same props object,
  // so a default applied on this side only would leave the other computing its
  // window from `undefined`.
  react: ({ page, count, ...p }) => (
    <RPagination page={page} count={count} onPageChange={() => {}} {...p} />
  ),
  vue: VuePaginationFixture as unknown as ComponentType<any>,
  // Each ellipsis is a real jump menu, and a portalled menu is not comparable
  // under static rendering — see Menu.tsx.
  exclude: '[data-scope="menu"][data-part="positioner"]',
  cases: [
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
    { name: "single page", props: { page: 1, count: 1 } },
  ],
};

export default spec;
