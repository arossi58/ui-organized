import React from "react";
import ReactDOM from "react-dom/client";
// Design system: token CSS variables, then component styles. Order matters —
// components reference the token variables defined here.
import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles";
// Site layers: the one home for site-only values, then shared layout primitives.
import "./styles/site-tokens.css";
import "./styles/layout.css";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
