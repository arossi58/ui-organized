import { Listbox } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const frame = { width: 240 };

const CHANNELS = [
  { value: "email", label: "Email" },
  { value: "push", label: "Push notification" },
  { value: "sms", label: "Text message" },
];

const MIXED = [
  { value: "draft", label: "Drafts" },
  { value: "mine", label: "Created by me" },
  { value: "week", label: "This week" },
  { value: "shared", label: "Shared with me" },
  { value: "month", label: "This month" },
];

const GROUPED = [
  { value: "mine", label: "Created by me", group: "Owner" },
  { value: "shared", label: "Shared with me", group: "Owner" },
  { value: "week", label: "This week", group: "Last edited" },
  { value: "month", label: "This month", group: "Last edited" },
];

export const listboxExamples: UsageExampleSet = {
  labelled: {
    Do: () => (
      <div style={frame}>
        <Listbox label="Notification channel" options={CHANNELS} defaultValue={["email"]} variant="bordered" />
      </div>
    ),
    // Nothing names the list, so it is announced as a bare set of options.
    Dont: () => (
      <div style={frame}>
        <Listbox options={CHANNELS} defaultValue={["email"]} variant="bordered" />
      </div>
    ),
  },

  grouped: {
    Do: () => (
      <div style={frame}>
        <Listbox label="Show files" options={GROUPED} variant="bordered" size="sm" />
      </div>
    ),
    // Owners and dates interleaved: the reader has to work out which is which.
    Dont: () => (
      <div style={frame}>
        <Listbox label="Show files" options={MIXED} variant="bordered" size="sm" />
      </div>
    ),
  },

  "empty-message": {
    Do: () => (
      <div style={frame}>
        <Listbox
          label="Saved views"
          options={[]}
          emptyMessage="No saved views yet. Save one from the toolbar."
          variant="bordered"
        />
      </div>
    ),
    // The default reads like a fault: no hint that this is simply empty.
    Dont: () => (
      <div style={frame}>
        <Listbox label="Saved views" options={[]} variant="bordered" />
      </div>
    ),
  },
};
