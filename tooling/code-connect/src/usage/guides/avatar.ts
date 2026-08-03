import type { UsageGuide } from "../types.js";

export const avatarUsage: UsageGuide = {
  slug: "avatar",
  codeName: "Avatar",
  summary:
    "A small image standing in for a person or an entity, falling back to initials when there is no picture. It aids recognition, and it never carries information on its own.",
  useWhen: [
    "A person or entity appears repeatedly and recognising them at a glance helps.",
    "The name is also present, or is one hover or click away.",
    "A list of people benefits from a visual anchor per row.",
  ],
  avoid: [
    {
      text: "As the only identification, since a face or two letters names nobody reliably.",
    },
    {
      text: "For a status or a category, which is a label rather than an identity.",
      instead: ["tag"],
    },
    {
      text: "As a button in its own right, without a control around it that says so.",
      instead: ["button"],
    },
    {
      text: "As decoration on a surface with no people on it.",
    },
  ],
  guidance: [
    {
      do: "Show the name beside the avatar wherever the layout can take it.",
      dont: "Leave a column of faces and initials as the only identification in a list.",
      example: "with-name",
    },
    {
      do: "Pass `name` so the fallback initials are right when an image is missing.",
      dont: "Let a missing image collapse to a blank circle that identifies nobody.",
      example: "fallback",
    },
    {
      do: "Keep one size and shape within a given context.",
      dont: "Mix circles and squares in one list, implying a difference that isn't there.",
    },
  ],
  accessibility: [
    "The image is decorative when the name is already beside it, and needs `alt` when it stands alone.",
    "Initials are not a name: anything identifying has to exist as text somewhere reachable.",
    "Never encode a state in the avatar's shape or colour alone.",
  ],
  content: [
    "Use the person's own display name, so the initials match how they are addressed.",
    "Keep the fallback to two characters, since more stops being legible at small sizes.",
  ],
  related: [
    { slug: "tag", when: "the thing is a label rather than an identity." },
    { slug: "hover-card", when: "a name deserves a richer preview." },
  ],
};
