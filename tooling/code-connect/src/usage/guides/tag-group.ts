import type { UsageGuide } from "../types.js";

export const tagGroupUsage: UsageGuide = {
  slug: "tag-group",
  codeName: "TagGroup",
  summary:
    "One pill holding a short tag and a message, such as New beside the name of a feature. It announces something worth a click, usually above a heading or at the top of a page, and the whole pill is one link.",
  useWhen: [
    "A release, a change or an event deserves a pointer above the heading that introduces it.",
    "A short label frames a one-line message, such as Beta beside the name of a feature.",
  ],
  avoid: [
    {
      text: "For a set of labels on one item. Despite the name it is one pill, not a list of tags.",
      instead: ["tag", "tags-input"],
    },
    {
      text: "For a message that needs reading in full, or that the reader must act on.",
      instead: ["alert"],
    },
    {
      text: "Several on one surface, where every announcement competes with the rest.",
    },
  ],
  guidance: [
    {
      do: "Keep the tag to one word and the message to one short line.",
      dont: "Fit a sentence into the pill, where it truncates before it says anything.",
      example: "short-message",
    },
    {
      do: "Give it an `href` when there is more to read, so the whole pill is one link.",
      dont: "Show the chevron on a pill that goes nowhere, which promises a page that isn't there.",
      example: "link",
    },
  ],
  accessibility: [
    "As a link the whole pill is one target, read as the tag followed by the message.",
    "The chevron is decorative; the message has to say where the link goes.",
  ],
  related: [
    { slug: "tag", when: "the label stands alone, without a message." },
    { slug: "alert", when: "the message needs a sentence and a place of its own." },
  ],
};
