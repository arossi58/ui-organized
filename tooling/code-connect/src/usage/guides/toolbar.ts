import type { UsageGuide } from "../types.js";

export const toolbarUsage: UsageGuide = {
  slug: "toolbar",
  codeName: "Toolbar",
  summary:
    "A strip that gathers the controls acting on the content beside it: formatting, view modes, filters, the small frequent actions that would otherwise scatter across a surface.",
  useWhen: [
    "Several controls act on the same content and should sit in one place.",
    "Those controls are used often enough to deserve permanent space.",
    "Two groups of related controls need separating without a heading between them.",
  ],
  avoid: [
    {
      text: "For a single action, which reads perfectly well on its own.",
      instead: ["button"],
    },
    {
      text: "For actions used rarely, which crowd a surface when they are always on show.",
      instead: ["menu"],
    },
    {
      text: "For moving between views or pages, which is navigation rather than action.",
      instead: ["tabs", "navigation"],
    },
    {
      text: "As a general layout box for content that isn't a set of controls.",
      instead: ["card"],
    },
  ],
  guidance: [
    {
      do: "Match `size` across every control so the strip has one height and one baseline.",
      dont: "Mix control sizes, leaving the row ragged and the alignment accidental.",
      example: "matched-size",
    },
    {
      do: "Separate groups of related controls with a vertical `Divider`.",
      dont: "Run every control together, where nothing says which ones belong to each other.",
      example: "grouping",
    },
    {
      do: "Keep toolbar buttons in the ghost intent, so the strip reads as one surface.",
      dont: "Fill the strip with primary buttons that each claim to be the next step.",
      example: "ghost",
    },
  ],
  accessibility: [
    "Icon-only controls need an `aria-label`: inside a dense strip the glyph is the only thing naming the action.",
    "Keep the markup order the same as the visual order, since focus follows the DOM rather than the layout.",
    "The strip is a container, so each control inside it still owns its own label, state and keyboard behaviour.",
  ],
  content: [
    "Label a toolbar action with a verb, even when the label only appears in a tooltip.",
    "Keep related controls adjacent, so the grouping does the explaining that labels would.",
  ],
  related: [
    { slug: "menu", when: "the actions are numerous or rare enough to fold behind one trigger." },
    { slug: "menubar", when: "the surface needs a persistent bar of grouped command menus." },
    { slug: "segmented-control", when: "the strip is really one choice between views." },
  ],
};
