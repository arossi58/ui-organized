import { createRoot } from "react-dom/client";
import { CopyEditor } from "./CopyEditor";
import "./copy-editor.css";

const host = document.createElement("div");
host.className = "copy-editor";
document.body.appendChild(host);
createRoot(host).render(<CopyEditor />);
