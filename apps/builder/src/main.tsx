import React from "react";
import ReactDOM from "react-dom/client";
import "@ds/tokens/variables.css";
import "@ds/react/styles";
import "./builder.css";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
