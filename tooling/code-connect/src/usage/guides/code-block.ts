import type { UsageGuide } from "../types.js";

export const codeBlockUsage: UsageGuide = {
  slug: "code-block",
  codeName: "CodeBlock",
  summary:
    "Code for a reader to read and copy, with its language, an optional title and a copy button. Highlighting is yours to supply, so the block shows plain text until you pass a highlighter.",
  useWhen: [
    "A page shows a command or a snippet the reader will paste somewhere else.",
    "A guide walks through a file and needs its name, its lines numbered, or a few lines marked.",
    "A change is easier to follow as a diff, with added and removed lines.",
  ],
  avoid: [
    {
      text: "For a short name or value inside a sentence, which reads better as inline code.",
    },
    {
      text: "For a value the reader copies but does not read as code, such as a link or a key.",
      instead: ["clipboard"],
    },
  ],
  guidance: [
    {
      do: "Give a snippet its language, and a title when it is a file the reader will open.",
      dont: "Leave a long snippet unlabelled, so the reader has to guess where it goes.",
      example: "labels",
    },
    {
      do: "Show a command exactly as it is pasted, and use the terminal variant to say it runs in a shell.",
      dont: "Start commands with a prompt character, which fails when the reader pastes it.",
      example: "commands",
    },
    {
      do: "Mark only the lines the reader should look at.",
      dont: "Mark most of the block, so nothing stands out.",
      example: "marked-lines",
    },
  ],
  accessibility: [
    "The code is a real pre element and takes focus, so a keyboard can scroll code wider or taller than the block.",
    "The copy button says when it has copied; change its words with copyLabel and copiedLabel.",
    "Line numbers are drawn rather than written, so neither a screen reader nor a copy includes them.",
    "Diff lines keep their plus and minus characters, so a change never relies on colour alone.",
  ],
  content: [
    "Keep a snippet to what the reader needs, and link to the full file for the rest.",
    "Label the language the way its files are named, such as tsx, css or sh.",
    "Use real names and values in examples, not foo and bar.",
  ],
  related: [
    { slug: "clipboard", when: "the reader copies a value that is not code." },
    { slug: "kbd", when: "the text is a keyboard shortcut, not code." },
  ],
};
