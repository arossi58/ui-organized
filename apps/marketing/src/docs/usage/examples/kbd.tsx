import { Kbd } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const kbdExamples: UsageExampleSet = {
  mod: {
    layout: "centered",
    // `mod` follows the reader: ⌘ on a Mac, Ctrl elsewhere.
    Do: () => (
      <p className="text-default-body-medium" style={{ margin: 0 }}>
        Search with <Kbd keys={["mod", "k"]} size="sm" />
      </p>
    ),
    // Ctrl is right on one platform and a different key on the other.
    Dont: () => (
      <p className="text-default-body-medium" style={{ margin: 0 }}>
        Search with <Kbd keys={["ctrl", "k"]} size="sm" />
      </p>
    ),
  },

  sizes: {
    layout: "centered",
    Do: () => (
      <p className="text-default-body-medium" style={{ margin: 0, maxWidth: 260 }}>
        Press <Kbd keys={["mod", "s"]} size="sm" /> to save, or <Kbd keys={["esc"]} size="sm" /> to
        discard your changes.
      </p>
    ),
    Dont: () => (
      <p className="text-default-body-medium" style={{ margin: 0, maxWidth: 260 }}>
        Press <Kbd keys={["mod", "s"]} /> to save, or <Kbd keys={["esc"]} /> to discard your
        changes.
      </p>
    ),
  },
};
