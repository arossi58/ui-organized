import { RatingGroup } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const ratingGroupExamples: UsageExampleSet = {
  "scale-meaning": {
    Do: () => (
      <RatingGroup
        label="How useful was this answer?"
        helperText="1 is not useful, 5 is very useful."
        defaultValue={4}
      />
    ),
    // Four stars out of five, but four of what, and is five good?
    Dont: () => <RatingGroup label="Rating" defaultValue={4} />,
  },

  "five-stars": {
    Do: () => <RatingGroup label="How useful was this answer?" defaultValue={4} />,
    // Ten stars: seven or eight is a count, not a glance.
    Dont: () => <RatingGroup label="How useful was this answer?" count={10} defaultValue={7} />,
  },
};
