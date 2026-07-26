import React from "react";
import ReactDOM from "react-dom/client";
import { IconProvider, TooltipProvider, ToastProvider } from "@ui-organized/react";
// Registers the Lucide set. The library imports no icon package itself, so the
// one you use has to be pulled in explicitly — that's what keeps the other two
// out of the bundle.
import "@ui-organized/react/icons/lucide";

// Order matters: token CSS custom properties first, then the design-system
// component styles (which reference them), then app layout.
import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles";
import "./styles/app.css";

import { App } from "./App.js";
import { SelectionProvider } from "./state/SelectionContext.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <IconProvider library="lucide" style="outline" strokeAdjustment={false}>
      <TooltipProvider>
        <ToastProvider>
          <SelectionProvider>
            <App />
          </SelectionProvider>
        </ToastProvider>
      </TooltipProvider>
    </IconProvider>
  </React.StrictMode>,
);
