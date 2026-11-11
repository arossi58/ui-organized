import { createRoot } from "react-dom/client";
import { Alert, Icon, IconProvider, registerLibraryIcons } from "@ui-organized/react";
import "@ui-organized/react/styles";
// The documented registration line, bare and side-effect only. This single
// import is what the gate exists to protect: `@ui-organized/react@5.0.0` shipped
// with a `sideEffects` field that let bundlers delete it, so icons rendered in
// `vite dev` and vanished in `vite build` with no warning and a green build. An
// app that names no icons of its own still needs exactly this line, for the
// components' glyphs, so it stays bare: a named import from the same module
// would keep it alive and stop the gate measuring that case.
import "@ui-organized/react/icons/lucide";
import { Check, Mail, Minus, Plus, Search, Settings, Trash2, User } from "lucide-react";

// The icons the app names, under Lucide's own names. `Trash2` is `trash-2`.
registerLibraryIcons("lucide", { Search, Settings, User, Mail, Check, Plus, Minus, Trash2 });

const NAMES = ["search", "settings", "user", "mail", "check", "plus", "minus", "trash-2"];

createRoot(document.getElementById("root")).render(
  <IconProvider library="lucide" style="outline" strokeAdjustment={false} baseSize={24} baseStroke={2}>
    <main>
      {NAMES.map((name) => (
        <Icon key={name} name={name} label={name} />
      ))}
      {/* The components' own glyphs, which need no registration: info + dismiss. */}
      <Alert variant="info" title="Saved" onDismiss={() => {}} />
    </main>
  </IconProvider>,
);
