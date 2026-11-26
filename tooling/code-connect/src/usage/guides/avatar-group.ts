import type { UsageGuide } from "../types.js";

export const avatarGroupUsage: UsageGuide = {
  slug: "avatar-group",
  codeName: "AvatarGroup",
  summary:
    "A row of overlapping avatars for the people on something, folding the rest into a count. It says who is involved at a glance, without listing anyone by name.",
  useWhen: [
    "Several people share a project, a document or a thread, and seeing who matters more than reading names.",
    "A card or a row has room for a few faces but not a list.",
  ],
  avoid: [
    {
      text: "When the names themselves matter, where a list of people reads better than faces.",
      instead: ["avatar-label"],
    },
    {
      text: "For a single person, where one avatar says it plainly.",
      instead: ["avatar"],
    },
    {
      text: "As the only way to reach the people it shows, since the overlapping faces are not controls.",
    },
  ],
  guidance: [
    {
      do: "Set `max` so the row stays short, and let the count say how many more there are.",
      dont: "Show every avatar until the row overlaps into a smear.",
      example: "max",
    },
    {
      do: "Give the group a `label` naming who it shows: Project members.",
      dont: "Leave it unnamed, so a screen reader hears a list of initials with no context.",
      example: "label",
    },
  ],
  accessibility: [
    "The group is announced by its `label`, and each avatar by its name.",
    "The count is an image named by `moreLabel`, which defaults to N more.",
  ],
  related: [
    { slug: "avatar", when: "one person stands alone." },
    { slug: "avatar-label", when: "each person needs a name and a line beside them." },
  ],
};
