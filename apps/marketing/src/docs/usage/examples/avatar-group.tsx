import { AvatarGroup } from "@ui-organized/react";
import type { UsageExampleSet } from "./types";

const MEMBERS = [
  { name: "Ada Lovelace" },
  { name: "Grace Hopper" },
  { name: "Alan Turing" },
  { name: "Katherine Johnson" },
  { name: "Edsger Dijkstra" },
  { name: "Barbara Liskov" },
  { name: "Margaret Hamilton" },
  { name: "Donald Knuth" },
];

export const avatarGroupExamples: UsageExampleSet = {
  max: {
    Do: () => <AvatarGroup items={MEMBERS} max={4} size="sm" label="Project members" />,
    Dont: () => <AvatarGroup items={MEMBERS} size="sm" label="Project members" />,
  },

  label: {
    Do: () => <AvatarGroup items={MEMBERS.slice(0, 3)} label="Reviewers" />,
    // Labelled for this page's own audit; the failure shown is that nothing on
    // screen or in the markup says who these people are to the thing they sit on.
    Dont: () => <AvatarGroup items={MEMBERS.slice(0, 3)} label="Avatars" />,
  },
};
