import React from "react";
import ReactDOM from "react-dom/client";
import { IconProvider, TooltipProvider, ToastProvider } from "@ui-organized/react";

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
