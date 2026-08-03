import type { UsageGuide } from "../types.js";

export const alertDialogUsage: UsageGuide = {
  slug: "alert-dialog",
  codeName: "AlertDialog",
  summary:
    "A dialog for one decision with two answers. It cannot be dismissed by accident, because the point is that the reader chooses rather than escapes.",
  useWhen: [
    "An action is destructive, expensive or hard to reverse.",
    "The consequence isn't obvious from the control that started it.",
    "Continuing by mistake would cost more than the interruption does.",
  ],
  avoid: [
    {
      text: "For an action that is easy to undo, where an undo beats a question.",
      instead: ["toast"],
    },
    {
      text: "For a task with fields to fill in rather than a decision to make.",
      instead: ["dialog"],
    },
    {
      text: "As a habit on every delete, which trains people to confirm without reading.",
    },
    {
      text: "For information that needs acknowledging but has no alternative.",
      instead: ["alert"],
    },
  ],
  guidance: [
    {
      do: "Say what will happen and what cannot be undone, in the description.",
      dont: "Ask Are you sure, which tells the reader nothing they didn't already know.",
      example: "consequence",
    },
    {
      do: "Label the confirming action with the action itself, and mark a destructive one as such.",
      dont: "Offer OK and Cancel, where the risky answer is the one that reads as agreement.",
      example: "named-actions",
    },
    {
      do: "Reserve it for the decisions that earn an interruption.",
      dont: "Confirm every routine action until confirming becomes reflex.",
    },
  ],
  accessibility: [
    "Focus lands inside the dialog and stays there, so both answers are reachable without a pointer.",
    "It is announced as requiring a response, which is why it must not be used for ordinary content.",
    "Keep the cancel path first in the markup, so the safe answer is the easy one to reach.",
  ],
  content: [
    "Title with the decision: Delete three files?, not Confirm.",
    "Name the consequence in the description, including anything that cannot be recovered.",
  ],
  related: [
    { slug: "dialog", when: "the reader has work to do rather than a choice to make." },
    { slug: "toast", when: "the action can simply be undone afterwards." },
  ],
};
