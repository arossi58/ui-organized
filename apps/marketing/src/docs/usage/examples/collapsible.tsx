import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const body = {
  padding: "var(--spacing-space-03) 0",
  color: "var(--color-content-secondary)",
  fontSize: "var(--type-size-body-small)",
  maxWidth: "18rem",
};

export const collapsibleExamples: UsageExampleSet = {
  "named-trigger": {
    layout: "padded",
    Do: () => (
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="btn btn--ghost btn--sm">Delivery options</CollapsibleTrigger>
        <CollapsibleContent>
          <p style={body}>Standard arrives in three to five days. Express arrives tomorrow.</p>
        </CollapsibleContent>
      </Collapsible>
    ),
    Dont: () => (
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="btn btn--ghost btn--sm">Show more</CollapsibleTrigger>
        <CollapsibleContent>
          <p style={body}>Standard arrives in three to five days. Express arrives tomorrow.</p>
        </CollapsibleContent>
      </Collapsible>
    ),
  },

  "stable-trigger": {
    layout: "padded",
    Do: () => (
      <Collapsible>
        <CollapsibleTrigger className="btn btn--ghost btn--sm">Delivery options</CollapsibleTrigger>
        <CollapsibleContent>
          <p style={body}>Standard arrives in three to five days.</p>
        </CollapsibleContent>
      </Collapsible>
    ),
    // Closed, this reads as a promise to hide something already hidden.
    Dont: () => (
      <Collapsible>
        <CollapsibleTrigger className="btn btn--ghost btn--sm">
          Hide delivery options
        </CollapsibleTrigger>
        <CollapsibleContent>
          <p style={body}>Standard arrives in three to five days.</p>
        </CollapsibleContent>
      </Collapsible>
    ),
  },
};
