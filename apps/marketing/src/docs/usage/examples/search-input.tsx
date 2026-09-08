import { SearchInput } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const searchInputExamples: UsageExampleSet = {
  scope: {
    layout: "padded",
    Do: () => <SearchInput label="Search records" placeholder="Name or reference" />,
    Dont: () => <SearchInput label="Search" placeholder="Search…" />,
  },

  feedback: {
    layout: "padded",
    Do: () => (
      <SearchInput
        label="Search records"
        defaultValue="zzz"
        helperText="No matches. Try a shorter term."
      />
    ),
    // The query stands, the list is empty, and nothing says which of the two
    // explains what the reader is looking at.
    Dont: () => <SearchInput label="Search records" defaultValue="zzz" />,
  },
};
