import type { UsageGuide } from "../types.js";

export const contextMenuUsage: UsageGuide = {
  slug: "context-menu",
  codeName: "ContextMenu",
  summary:
    "The menu that opens where the pointer is, on right-click or long-press. It is a shortcut for people who know it is there, never the only way to reach an action.",
  useWhen: [
    "The actions belong to a specific object the reader has pointed at.",
    "The same actions are also reachable from a visible control.",
    "The surface is one where a right-click is a reasonable expectation, like a list or a canvas.",
  ],
  avoid: [
    {
      text: "As the only route to an action, since nothing on screen advertises it.",
      instead: ["menu"],
    },
    {
      text: "On a surface where a right-click would more usefully do what the browser does.",
    },
    {
      text: "For actions that apply to the page rather than to the thing under the pointer.",
      instead: ["menubar", "toolbar"],
    },
  ],
  guidance: [
    {
      do: "Mirror the object's visible actions, so the shortcut and the button agree.",
      dont: "Hide extra abilities in the context menu that appear nowhere else.",
      example: "mirrors-visible",
    },
    {
      do: "Scope the items to the thing that was clicked.",
      dont: "Show one menu for everything, half of it irrelevant to what is under the pointer.",
      example: "scoped",
    },
    {
      do: "Keep the list short: a shortcut people use without reading has to be predictable.",
      dont: "Reproduce a whole menu bar at the cursor.",
    },
  ],
  accessibility: [
    "There is no keyboard equivalent of a right-click, so every item must exist somewhere reachable.",
    "Long-press stands in on touch, which makes a short, forgiving list matter more.",
    "Once open the menu is fully keyboard operable, and closing returns focus where it started.",
  ],
  content: [
    "Use the same wording as the visible action, so the two are recognisably the same thing.",
    "Order items by how often they are used, with anything destructive last.",
  ],
  related: [
    { slug: "menu", when: "the actions need a visible trigger." },
    { slug: "toolbar", when: "the actions deserve permanent space." },
  ],
};
