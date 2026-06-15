import React from "react";
import ReactDOM from "react-dom/client";
import "@ui-organized/tokens/variables.css";
import "@ui-organized/react/styles";
import "./builder.css";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
