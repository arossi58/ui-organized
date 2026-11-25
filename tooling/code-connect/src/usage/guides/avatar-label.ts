import type { UsageGuide } from "../types.js";

export const avatarLabelUsage: UsageGuide = {
  slug: "avatar-label",
  codeName: "AvatarLabel",
  summary:
    "An avatar with the person's name and one line about them beside it: an email, a role, a handle. It is the row a member list, an author byline or an account menu is built from.",
  useWhen: [
    "A person needs naming wherever they appear: in a list of members, a byline or an account menu.",
    "A line of context, such as a role or an email, helps tell two people with similar names apart.",
  ],
  avoid: [
    {
      text: "When the face alone is enough and space is tight.",
      instead: ["avatar"],
    },
    {
      text: "For several people on one item, where overlapping faces say it more compactly.",
      instead: ["avatar-group"],
    },
    {
      text: "With more than one line of supporting text, which belongs in a card or a list row.",
      instead: ["card"],
    },
  ],
  guidance: [
    {
      do: "Keep the supporting line to one short fact, so the row scans.",
      dont: "Pack a role, a team and an email into the description, where it truncates mid-word.",
      example: "one-line",
    },
    {
      do: "Match the size to the list: `sm` in dense tables, `md` in menus, `lg` and `xl` in profile headers.",
      dont: "Mix sizes within one list, which implies a ranking between people.",
      example: "one-size",
    },
  ],
  accessibility: [
    "The avatar is hidden from assistive technology, since the name beside it says the same thing.",
    "A status or verified badge is repeated as text after the name, so it is still announced.",
  ],
  related: [
    { slug: "avatar", when: "the face stands alone, without the name." },
    { slug: "avatar-group", when: "several people share one thing." },
  ],
};
