import React from "react";
import ReactDOM from "react-dom/client";
import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles";
// All three: the preview switches library at runtime. A normal app imports one.
import "@ui-organized/react/icons/lucide";
import "@ui-organized/react/icons/tabler";
import "@ui-organized/react/icons/heroicons";
import "./builder.css";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
