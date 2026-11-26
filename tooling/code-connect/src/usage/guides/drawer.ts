import type { UsageGuide } from "../types.js";

export const drawerUsage: UsageGuide = {
  slug: "drawer",
  codeName: "Drawer",
  summary:
    "A panel that slides up from the bottom edge and closes when swiped back down. It suits a short task on a phone, within reach of the thumb, without leaving the page under it.",
  useWhen: [
    "A short task on a phone, such as sharing or choosing an option, should keep the page in view.",
    "One item has a set of actions that are too many, or too small to tap, for a menu.",
    "A reader glances at details and dismisses them, such as the address behind a map pin.",
  ],
  avoid: [
    {
      text: "For a long form or a task that needs the room of a page.",
      instead: ["sheet"],
    },
    {
      text: "For a question the reader must answer before going on, which needs a dialog.",
      instead: ["alert-dialog", "dialog"],
    },
  ],
  guidance: [
    {
      do: "Keep the close button as well as the grabber, so a reader who cannot swipe still has a way out.",
      dont: "Rely on the swipe alone, which a keyboard, a switch device or a mouse may never find.",
      example: "close",
    },
    {
      do: "Keep the content short enough to fit, so the drawer opens fully and nothing hides below its edge.",
      dont: "Fill it with a long list, so the reader scrolls inside a panel that also moves when dragged.",
      example: "length",
    },
  ],
  accessibility: [
    "It is a dialog: focus moves inside it on open, stays there while it is modal, and returns to the trigger on close.",
    "Escape, the backdrop and the close button close it as well as a swipe, so nothing depends on a gesture.",
    "Give it a title, which names the dialog for a screen reader.",
    "Under reduced motion it fades in and out rather than sliding.",
  ],
  content: [
    "Title the drawer with what it is for, such as Share or Sort by.",
    "Keep to one task, with at most two actions in the footer.",
  ],
  related: [
    { slug: "sheet", when: "the content needs more room, or the side of a wide screen." },
    { slug: "dialog", when: "the reader must respond before going on." },
    { slug: "menu", when: "a few actions fit a list beside the trigger." },
  ],
};
