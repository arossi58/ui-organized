import React from "react";
import ReactDOM from "react-dom/client";
// Self-hosted @font-face declarations (Inter + EB Garamond). Imported first so
// the families are registered before any styles reference them. Replaces the
// former Google Fonts CDN link — see styles/fonts.ts.
import "./styles/fonts";
// Design system: token CSS variables, then component styles. Order matters —
// components reference the token variables defined here.
import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles";
// All three icon sets. The library imports none of them itself — that is what
// makes the optional peers genuinely optional — so each has to be registered
// explicitly. This site needs all three because the Theme Builder preview and
// the icon scaler switch library at runtime; a normal app imports just one.
import "@ui-organized/react/icons/lucide";
import "@ui-organized/react/icons/tabler";
import "@ui-organized/react/icons/heroicons";
// Site layers: the one home for site-only values, then shared layout primitives.
import "./styles/site-tokens.css";
import "./styles/layout.css";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// UI Inspect — the design-system inspector, dev only. Click the launcher it
// mounts in the page, then click an element to resolve its properties against
// this site's own :root custom properties, which is exactly the token set
// @ui-organized/tokens ships. It binds no keyboard shortcuts.
//
// The dynamic import() inside the guard is what keeps it out of the production
// bundle: Vite statically replaces import.meta.env.DEV with false for a build,
// so the branch, and the chunk it would have pulled in, is dropped entirely.
if (import.meta.env.DEV) {
  void import("@ui-organized/ui-inspect").then(({ mountInspector }) => {
    mountInspector();
  });
}
