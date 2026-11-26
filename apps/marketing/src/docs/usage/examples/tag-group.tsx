import { TagGroup } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const tagGroupExamples: UsageExampleSet = {
  "short-message": {
    Do: () => (
      <TagGroup tag="New" href="#">
        Dark mode is here
      </TagGroup>
    ),
    Dont: () => (
      <div style={{ maxWidth: 260 }}>
        <TagGroup tag="New feature announcement" href="#">
          We have just released dark mode for every workspace, with a toggle in settings
        </TagGroup>
      </div>
    ),
  },

  link: {
    Do: () => (
      <TagGroup tag="Beta" href="#">
        Try the new editor
      </TagGroup>
    ),
    Dont: () => (
      <TagGroup tag="Beta" icon="chevron-right">
        Try the new editor
      </TagGroup>
    ),
  },
};
