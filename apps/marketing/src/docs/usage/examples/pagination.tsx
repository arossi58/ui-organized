import { Button, Pagination } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const noop = () => {};

const row = { display: "flex", gap: "var(--spacing-space-02)", alignItems: "center" };

const caption = {
  margin: "0 0 var(--spacing-space-03)",
  color: "var(--color-content-secondary)",
  fontSize: "var(--type-size-body-small)",
};

export const paginationExamples: UsageExampleSet = {
  position: {
    layout: "padded",
    Do: () => (
      <div>
        <p style={caption}>Page 3 of 12</p>
        <Pagination page={3} count={12} onPageChange={noop} />
      </div>
    ),
    // Two arrows and no idea how far this goes.
    Dont: () => (
      <div style={row}>
        <Button intent="secondary" size="sm" icon="chevron-left" aria-label="Previous page" />
        <Button intent="secondary" size="sm" icon="chevron-right" aria-label="Next page" />
      </div>
    ),
  },

  "stable-placement": {
    layout: "padded",
    Do: () => (
      <div>
        <p style={caption}>Page 3 of 12</p>
        <Pagination page={3} count={12} onPageChange={noop} />
      </div>
    ),
    // The same list on its last page, with the controls thinned out: the reader
    // reaches for something that has moved.
    Dont: () => (
      <div>
        <p style={caption}>Page 12 of 12</p>
        <Pagination page={12} count={12} onPageChange={noop} showPrevNext={false} siblingCount={0} boundaryCount={0} />
      </div>
    ),
  },
};
