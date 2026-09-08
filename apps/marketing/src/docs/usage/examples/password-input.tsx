import { PasswordInput } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

export const passwordInputExamples: UsageExampleSet = {
  "rules-first": {
    layout: "padded",
    Do: () => (
      <PasswordInput
        label="Create password"
        placeholder="At least 12 characters"
        helperText="At least 12 characters, including a number."
      />
    ),
    Dont: () => (
      <PasswordInput label="Create password" defaultValue="short" error="Invalid password." />
    ),
  },

  reveal: {
    layout: "padded",
    Do: () => <PasswordInput label="Password" defaultValue="correct horse battery" />,
    // No way to check what was typed, so a typo can only be fixed by retyping.
    Dont: () => (
      <PasswordInput label="Password" defaultValue="correct horse battery" showToggle={false} />
    ),
  },
};
