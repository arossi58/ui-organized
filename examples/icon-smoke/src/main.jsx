import { createRoot } from "react-dom/client";
import { Icon, IconProvider } from "@ui-organized/react";
import "@ui-organized/react/styles";
// The documented registration line, bare and side-effect only. This single
// import is what the gate exists to protect: `@ui-organized/react@5.0.0` shipped
// with a `sideEffects` field that let bundlers delete it, so icons rendered in
// `vite dev` and vanished in `vite build` with no warning and a green build.
import "@ui-organized/react/icons/lucide";

/** One of each shape the component resolves differently. */
const NAMES = ["search", "settings", "user", "mail", "check", "plus", "minus", "trash"];

createRoot(document.getElementById("root")).render(
  <IconProvider library="lucide" style="outline" strokeAdjustment={false} baseSize={24} baseStroke={2}>
    <main>
      {NAMES.map((name) => (
        <Icon key={name} name={name} label={name} />
      ))}
    </main>
  </IconProvider>,
);
